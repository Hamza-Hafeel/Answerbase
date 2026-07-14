"""Answerbase — multi-tenant AI support chatbot SaaS (FastAPI backend)."""

import datetime
import io
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import asyncpg
import fastapi
import stripe as stripe_lib
from fastapi import BackgroundTasks, Depends, HTTPException, Request, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field

import ai
import db
import security

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

stripe_lib.api_key = os.environ.get("STRIPE_SECRET_KEY", "")

app = fastapi.FastAPI(title="Answerbase API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Plans (server-side source of truth)
# ---------------------------------------------------------------------------

PLANS = {
    "free": {"name": "Free", "price_cents": 0, "limit": 50},
    "pro": {"name": "Pro", "price_cents": 2900, "limit": 2000},
    "business": {"name": "Business", "price_cents": 9900, "limit": 10000},
}

# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------


@app.on_event("startup")
async def startup() -> None:
    await db.ensure_schema()
    admin_password = os.environ.get("SUPERADMIN_PASSWORD", "admin1234")
    await db.seed_superadmin(security.hash_password(admin_password))


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------


class RegisterBody(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)
    name: str = Field(min_length=1, max_length=100)
    company: str = Field(min_length=1, max_length=100)


class LoginBody(BaseModel):
    email: EmailStr
    password: str = Field(max_length=100)


class GoogleAuthBody(BaseModel):
    credential: str


def _slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") or "org"
    return slug


@app.post("/auth/register")
async def register(body: RegisterBody):
    p = await db.get_pool()
    slug = _slugify(body.company)
    async with p.acquire() as conn:
        async with conn.transaction():
            existing = await conn.fetchval(
                "SELECT 1 FROM users WHERE email = $1", body.email.lower()
            )
            if existing:
                raise HTTPException(409, "An account with this email already exists")
            # ensure unique slug
            n = 0
            final_slug = slug
            while await conn.fetchval(
                "SELECT 1 FROM organizations WHERE slug = $1", final_slug
            ):
                n += 1
                final_slug = f"{slug}-{n}"
            org = await conn.fetchrow(
                """
                INSERT INTO organizations (name, slug, monthly_message_limit)
                VALUES ($1, $2, $3) RETURNING id
                """,
                body.company,
                final_slug,
                PLANS["free"]["limit"],
            )
            pw_hash = await run_in_threadpool(security.hash_password, body.password)
            user = await conn.fetchrow(
                """
                INSERT INTO users (org_id, email, password_hash, name, role)
                VALUES ($1, $2, $3, $4, 'owner') RETURNING id, role
                """,
                org["id"],
                body.email.lower(),
                pw_hash,
                body.name,
            )
    token = security.create_token(user["id"], org["id"], user["role"])
    return {"token": token}


@app.post("/auth/login")
async def login(body: LoginBody):
    p = await db.get_pool()
    user = await p.fetchrow(
        "SELECT id, org_id, password_hash, role FROM users WHERE email = $1",
        body.email.lower(),
    )
    if not user:
        raise HTTPException(401, "Invalid email or password")
    ok = await run_in_threadpool(
        security.verify_password, body.password, user["password_hash"]
    )
    if not ok:
        raise HTTPException(401, "Invalid email or password")
    token = security.create_token(user["id"], user["org_id"], user["role"])
    return {"token": token}


@app.post("/auth/google")
async def google_auth(body: GoogleAuthBody):
    client_id = os.environ.get("GOOGLE_CLIENT_ID")
    if not client_id:
        raise HTTPException(500, "Google Login is not configured")
    try:
        idinfo = await run_in_threadpool(
            id_token.verify_oauth2_token,
            body.credential,
            google_requests.Request(),
            client_id
        )
    except ValueError:
        raise HTTPException(401, "Invalid Google token")

    email = idinfo["email"].lower()
    name = idinfo.get("name", "User")
    p = await db.get_pool()
    
    async with p.acquire() as conn:
        async with conn.transaction():
            user = await conn.fetchrow(
                "SELECT id, org_id, role FROM users WHERE email = $1", email
            )
            if user:
                token = security.create_token(user["id"], user["org_id"], user["role"])
                return {"token": token}
            
            slug = _slugify(name)
            n = 0
            final_slug = slug
            while await conn.fetchval(
                "SELECT 1 FROM organizations WHERE slug = $1", final_slug
            ):
                n += 1
                final_slug = f"{slug}-{n}"
            org = await conn.fetchrow(
                """
                INSERT INTO organizations (name, slug, monthly_message_limit)
                VALUES ($1, $2, $3) RETURNING id
                """,
                name + "'s Organization",
                final_slug,
                PLANS["free"]["limit"],
            )
            user = await conn.fetchrow(
                """
                INSERT INTO users (org_id, email, password_hash, name, role)
                VALUES ($1, $2, '', $3, 'owner') RETURNING id, role
                """,
                org["id"],
                email,
                name,
            )
    token = security.create_token(user["id"], org["id"], user["role"])
    return {"token": token}


async def current_user(request: Request) -> dict:
    auth = request.headers.get("authorization", "")
    if not auth.lower().startswith("bearer "):
        raise HTTPException(401, "Missing bearer token")
    try:
        payload = security.decode_token(auth[7:])
    except Exception:
        raise HTTPException(401, "Invalid or expired token")
    return {
        "user_id": int(payload["sub"]),
        "org_id": payload.get("org"),
        "role": payload.get("role"),
    }


async def org_user(user: dict = Depends(current_user)) -> dict:
    if user["org_id"] is None:
        raise HTTPException(403, "This account is not attached to an organization")
    return user


async def superadmin(user: dict = Depends(current_user)) -> dict:
    if user["role"] != "superadmin":
        raise HTTPException(403, "Superadmin access required")
    return user


@app.get("/auth/me")
async def me(user: dict = Depends(current_user)):
    p = await db.get_pool()
    row = await p.fetchrow(
        """
        SELECT u.id, u.email, u.name, u.role, u.org_id,
               o.name AS org_name, o.slug, o.plan, o.monthly_message_limit,
               o.subscription_status, o.widget_name, o.widget_welcome
        FROM users u LEFT JOIN organizations o ON o.id = u.org_id
        WHERE u.id = $1
        """,
        user["user_id"],
    )
    if not row:
        raise HTTPException(401, "User not found")
    usage = 0
    if row["org_id"]:
        usage = await _messages_used(row["org_id"])
    return {**dict(row), "messages_used": usage}


# ---------------------------------------------------------------------------
# Usage helpers
# ---------------------------------------------------------------------------


def _period() -> str:
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m")


async def _messages_used(org_id: int) -> int:
    p = await db.get_pool()
    used = await p.fetchval(
        "SELECT messages_used FROM usage_counters WHERE org_id = $1 AND period = $2",
        org_id,
        _period(),
    )
    return used or 0


async def _check_and_increment_usage(org_id: int) -> None:
    p = await db.get_pool()
    limit = await p.fetchval(
        "SELECT monthly_message_limit FROM organizations WHERE id = $1", org_id
    )
    used = await _messages_used(org_id)
    if used >= (limit or 0):
        raise HTTPException(
            429, "Monthly message limit reached. Upgrade your plan to continue."
        )
    await p.execute(
        """
        INSERT INTO usage_counters (org_id, period, messages_used)
        VALUES ($1, $2, 1)
        ON CONFLICT (org_id, period) DO UPDATE
        SET messages_used = usage_counters.messages_used + 1
        """,
        org_id,
        _period(),
    )


# ---------------------------------------------------------------------------
# Documents: upload -> chunk -> embed -> store
# ---------------------------------------------------------------------------

CHUNK_SIZE = 3200  # ~800 tokens
CHUNK_OVERLAP = 400


def _chunk_text(text: str) -> list[str]:
    text = re.sub(r"\r\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    if not text:
        return []
    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = min(start + CHUNK_SIZE, len(text))
        # try to break at a paragraph or sentence boundary
        if end < len(text):
            window = text[start:end]
            brk = max(window.rfind("\n\n"), window.rfind(". "))
            if brk > CHUNK_SIZE // 2:
                end = start + brk + 1
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= len(text):
            break
        start = max(end - CHUNK_OVERLAP, start + 1)
    return chunks


def _extract_text(filename: str, data: bytes) -> str:
    lower = filename.lower()
    if lower.endswith(".pdf"):
        from pypdf import PdfReader

        reader = PdfReader(io.BytesIO(data))
        return "\n\n".join((page.extract_text() or "") for page in reader.pages)
    # txt / md / csv — treat as utf-8 text
    return data.decode("utf-8", errors="replace")


async def _process_document(doc_id: int, org_id: int, filename: str, data: bytes):
    p = await db.get_pool()
    try:
        text = await run_in_threadpool(_extract_text, filename, data)
        chunks = _chunk_text(text)
        if not chunks:
            raise ValueError("No text could be extracted from this file")
        total = 0
        for i in range(0, len(chunks), 32):
            batch = chunks[i : i + 32]
            embeddings = await ai.embed_texts(batch)
            async with p.acquire() as conn:
                await conn.executemany(
                    """
                    INSERT INTO chunks (document_id, org_id, content, embedding)
                    VALUES ($1, $2, $3, $4::vector)
                    """,
                    [
                        (doc_id, org_id, c, ai.vector_literal(e))
                        for c, e in zip(batch, embeddings)
                    ],
                )
            total += len(batch)
        await p.execute(
            "UPDATE documents SET status = 'ready', chunk_count = $2 WHERE id = $1",
            doc_id,
            total,
        )
    except Exception as exc:  # noqa: BLE001
        await p.execute(
            "UPDATE documents SET status = 'failed', error = $2 WHERE id = $1",
            doc_id,
            str(exc)[:500],
        )


ALLOWED_EXTENSIONS = (".pdf", ".txt", ".md", ".csv")
MAX_UPLOAD_BYTES = 10 * 1024 * 1024


@app.post("/documents")
async def upload_document(
    background: BackgroundTasks,
    file: UploadFile,
    user: dict = Depends(org_user),
):
    filename = file.filename or "document"
    if not filename.lower().endswith(ALLOWED_EXTENSIONS):
        raise HTTPException(400, "Supported file types: PDF, TXT, MD, CSV")
    data = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "File too large (max 10 MB)")
    p = await db.get_pool()
    doc = await p.fetchrow(
        """
        INSERT INTO documents (org_id, filename) VALUES ($1, $2)
        RETURNING id, filename, status, chunk_count, created_at
        """,
        user["org_id"],
        filename,
    )
    background.add_task(_process_document, doc["id"], user["org_id"], filename, data)
    return dict(doc)


@app.get("/documents")
async def list_documents(user: dict = Depends(org_user)):
    p = await db.get_pool()
    rows = await p.fetch(
        """
        SELECT id, filename, status, error, chunk_count, created_at
        FROM documents WHERE org_id = $1 ORDER BY created_at DESC
        """,
        user["org_id"],
    )
    return [dict(r) for r in rows]


@app.delete("/documents/{doc_id}")
async def delete_document(doc_id: int, user: dict = Depends(org_user)):
    p = await db.get_pool()
    deleted = await p.fetchval(
        "DELETE FROM documents WHERE id = $1 AND org_id = $2 RETURNING id",
        doc_id,
        user["org_id"],
    )
    if not deleted:
        raise HTTPException(404, "Document not found")
    return {"ok": True}


# ---------------------------------------------------------------------------
# RAG chat core
# ---------------------------------------------------------------------------


async def _rag_answer(org_id: int, question: str, history: list[dict]) -> str:
    p = await db.get_pool()
    q_embedding = (await ai.embed_texts([question]))[0]
    rows = await p.fetch(
        """
        SELECT content FROM chunks
        WHERE org_id = $1
        ORDER BY embedding <=> $2::vector
        LIMIT 5
        """,
        org_id,
        ai.vector_literal(q_embedding),
    )
    org = await p.fetchrow(
        "SELECT name, widget_name FROM organizations WHERE id = $1", org_id
    )
    context = "\n\n---\n\n".join(r["content"] for r in rows)
    system = (
        f"You are {org['widget_name']}, the AI support assistant for {org['name']}. "
        "Answer customer questions using ONLY the reference documentation below. "
        "Be concise and helpful. If the documentation does not contain the answer, "
        "say you don't have that information and suggest contacting support. "
        "Never make up facts, prices, or policies.\n\n"
        f"REFERENCE DOCUMENTATION:\n{context if context else '(no documents uploaded yet)'}"
    )
    messages = [{"role": "system", "content": system}]
    for m in history[-6:]:
        if m.get("role") in ("user", "assistant") and m.get("content"):
            messages.append({"role": m["role"], "content": str(m["content"])[:4000]})
    messages.append({"role": "user", "content": question})
    return await ai.chat_completion(messages)


class ChatBody(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    conversation_id: int | None = None


async def _run_chat(org_id: int, body: ChatBody, source: str, visitor_id: str | None):
    p = await db.get_pool()
    await _check_and_increment_usage(org_id)

    conv_id = body.conversation_id
    history: list[dict] = []
    if conv_id:
        owner = await p.fetchval(
            "SELECT org_id FROM conversations WHERE id = $1", conv_id
        )
        if owner != org_id:
            raise HTTPException(404, "Conversation not found")
        rows = await p.fetch(
            """
            SELECT role, content FROM messages
            WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT 6
            """,
            conv_id,
        )
        history = [dict(r) for r in reversed(rows)]
    else:
        conv = await p.fetchrow(
            """
            INSERT INTO conversations (org_id, source, visitor_id)
            VALUES ($1, $2, $3) RETURNING id
            """,
            org_id,
            source,
            visitor_id,
        )
        conv_id = conv["id"]

    answer = await _rag_answer(org_id, body.message, history)

    async with p.acquire() as conn:
        await conn.execute(
            "INSERT INTO messages (conversation_id, org_id, role, content) VALUES ($1, $2, 'user', $3)",
            conv_id,
            org_id,
            body.message,
        )
        await conn.execute(
            "INSERT INTO messages (conversation_id, org_id, role, content) VALUES ($1, $2, 'assistant', $3)",
            conv_id,
            org_id,
            answer,
        )
    return {"conversation_id": conv_id, "answer": answer}


@app.post("/chat")
async def playground_chat(body: ChatBody, user: dict = Depends(org_user)):
    return await _run_chat(user["org_id"], body, "playground", None)


# ---------------------------------------------------------------------------
# API keys + public widget endpoints
# ---------------------------------------------------------------------------


class CreateKeyBody(BaseModel):
    name: str = Field(min_length=1, max_length=100)


@app.post("/keys")
async def create_key(body: CreateKeyBody, user: dict = Depends(org_user)):
    raw, key_hash, prefix = security.generate_api_key()
    p = await db.get_pool()
    row = await p.fetchrow(
        """
        INSERT INTO api_keys (org_id, key_hash, key_prefix, name)
        VALUES ($1, $2, $3, $4) RETURNING id, key_prefix, name, active, created_at
        """,
        user["org_id"],
        key_hash,
        prefix,
        body.name,
    )
    return {**dict(row), "key": raw}  # raw key returned exactly once


@app.get("/keys")
async def list_keys(user: dict = Depends(org_user)):
    p = await db.get_pool()
    rows = await p.fetch(
        """
        SELECT id, key_prefix, name, active, created_at
        FROM api_keys WHERE org_id = $1 ORDER BY created_at DESC
        """,
        user["org_id"],
    )
    return [dict(r) for r in rows]


@app.delete("/keys/{key_id}")
async def revoke_key(key_id: int, user: dict = Depends(org_user)):
    p = await db.get_pool()
    updated = await p.fetchval(
        "UPDATE api_keys SET active = FALSE WHERE id = $1 AND org_id = $2 RETURNING id",
        key_id,
        user["org_id"],
    )
    if not updated:
        raise HTTPException(404, "API key not found")
    return {"ok": True}


async def org_from_api_key(request: Request) -> int:
    raw = request.headers.get("x-api-key", "")
    if not raw:
        raise HTTPException(401, "Missing X-API-Key header")
    p = await db.get_pool()
    org_id = await p.fetchval(
        "SELECT org_id FROM api_keys WHERE key_hash = $1 AND active = TRUE",
        security.hash_api_key(raw),
    )
    if not org_id:
        raise HTTPException(401, "Invalid API key")
    return org_id


@app.get("/widget/config")
async def widget_config(org_id: int = Depends(org_from_api_key)):
    p = await db.get_pool()
    row = await p.fetchrow(
        "SELECT name, widget_name, widget_welcome FROM organizations WHERE id = $1",
        org_id,
    )
    return dict(row)


class WidgetChatBody(ChatBody):
    visitor_id: str | None = Field(default=None, max_length=100)


@app.post("/widget/chat")
async def widget_chat(
    body: WidgetChatBody, org_id: int = Depends(org_from_api_key)
):
    return await _run_chat(org_id, body, "widget", body.visitor_id)


class WidgetSettingsBody(BaseModel):
    widget_name: str = Field(min_length=1, max_length=60)
    widget_welcome: str = Field(min_length=1, max_length=300)


@app.patch("/widget/settings")
async def update_widget_settings(
    body: WidgetSettingsBody, user: dict = Depends(org_user)
):
    p = await db.get_pool()
    await p.execute(
        "UPDATE organizations SET widget_name = $2, widget_welcome = $3 WHERE id = $1",
        user["org_id"],
        body.widget_name,
        body.widget_welcome,
    )
    return {"ok": True}


# ---------------------------------------------------------------------------
# Conversations + analytics
# ---------------------------------------------------------------------------


@app.get("/conversations")
async def list_conversations(user: dict = Depends(org_user)):
    p = await db.get_pool()
    rows = await p.fetch(
        """
        SELECT c.id, c.source, c.visitor_id, c.created_at,
               count(m.id) AS message_count,
               (SELECT content FROM messages
                WHERE conversation_id = c.id AND role = 'user'
                ORDER BY created_at ASC LIMIT 1) AS first_question
        FROM conversations c
        LEFT JOIN messages m ON m.conversation_id = c.id
        WHERE c.org_id = $1
        GROUP BY c.id
        ORDER BY c.created_at DESC
        LIMIT 100
        """,
        user["org_id"],
    )
    return [dict(r) for r in rows]


@app.get("/conversations/{conv_id}")
async def conversation_detail(conv_id: int, user: dict = Depends(org_user)):
    p = await db.get_pool()
    conv = await p.fetchrow(
        "SELECT id, source, visitor_id, created_at FROM conversations WHERE id = $1 AND org_id = $2",
        conv_id,
        user["org_id"],
    )
    if not conv:
        raise HTTPException(404, "Conversation not found")
    msgs = await p.fetch(
        "SELECT role, content, created_at FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC",
        conv_id,
    )
    return {**dict(conv), "messages": [dict(m) for m in msgs]}


@app.get("/analytics")
async def analytics(user: dict = Depends(org_user)):
    p = await db.get_pool()
    org_id = user["org_id"]
    daily = await p.fetch(
        """
        SELECT to_char(d.day, 'YYYY-MM-DD') AS day, count(m.id) AS messages
        FROM generate_series(
            (now() - interval '13 days')::date, now()::date, '1 day'
        ) AS d(day)
        LEFT JOIN messages m
            ON m.org_id = $1 AND m.role = 'user' AND m.created_at::date = d.day
        GROUP BY d.day ORDER BY d.day
        """,
        org_id,
    )
    totals = await p.fetchrow(
        """
        SELECT
            (SELECT count(*) FROM documents WHERE org_id = $1 AND status = 'ready') AS documents,
            (SELECT count(*) FROM conversations WHERE org_id = $1) AS conversations,
            (SELECT count(*) FROM messages WHERE org_id = $1 AND role = 'user') AS total_messages
        """,
        org_id,
    )
    top = await p.fetch(
        """
        SELECT content, count(*) AS times
        FROM messages WHERE org_id = $1 AND role = 'user'
        GROUP BY content ORDER BY times DESC, max(created_at) DESC LIMIT 5
        """,
        org_id,
    )
    org = await p.fetchrow(
        "SELECT plan, monthly_message_limit FROM organizations WHERE id = $1", org_id
    )
    return {
        "daily": [dict(r) for r in daily],
        "totals": dict(totals),
        "top_questions": [dict(r) for r in top],
        "plan": org["plan"],
        "limit": org["monthly_message_limit"],
        "used": await _messages_used(org_id),
    }


# ---------------------------------------------------------------------------
# Billing (Stripe subscriptions)
# ---------------------------------------------------------------------------


class CheckoutBody(BaseModel):
    plan: str
    return_url: str = Field(max_length=500)


@app.get("/billing/plans")
async def billing_plans():
    return PLANS


@app.post("/billing/checkout")
async def create_checkout(body: CheckoutBody, user: dict = Depends(org_user)):
    if body.plan not in PLANS or body.plan == "free":
        raise HTTPException(400, "Invalid plan")
    plan = PLANS[body.plan]
    p = await db.get_pool()
    org = await p.fetchrow(
        "SELECT id, name, stripe_customer_id FROM organizations WHERE id = $1",
        user["org_id"],
    )

    def _create_session():
        params = {
            "mode": "payment",
            "line_items": [
                {
                    "price_data": {
                        "currency": "inr",
                        "product_data": {"name": f"Answerbase {plan['name']}"},
                        "unit_amount": plan["price_cents"] * 80,
                    },
                    "quantity": 1,
                }
            ],
            "success_url": body.return_url
            + "?session_id={CHECKOUT_SESSION_ID}&plan="
            + body.plan,
            "cancel_url": body.return_url + "?canceled=1",
            "metadata": {"org_id": str(org["id"]), "plan": body.plan},
        }
        if org["stripe_customer_id"]:
            params["customer"] = org["stripe_customer_id"]
        return stripe_lib.checkout.Session.create(**params)

    session = await run_in_threadpool(_create_session)
    return {"url": session.url}


async def _apply_plan(org_id: int, plan_key: str, customer_id, subscription_id, status):
    p = await db.get_pool()
    plan = PLANS.get(plan_key, PLANS["free"])
    await p.execute(
        """
        UPDATE organizations
        SET plan = $2, monthly_message_limit = $3,
            stripe_customer_id = COALESCE($4, stripe_customer_id),
            stripe_subscription_id = COALESCE($5, stripe_subscription_id),
            subscription_status = $6
        WHERE id = $1
        """,
        org_id,
        plan_key,
        plan["limit"],
        customer_id,
        subscription_id,
        status,
    )


@app.post("/billing/confirm")
async def confirm_checkout(request: Request, user: dict = Depends(org_user)):
    """Fallback confirmation after redirect: verifies the session with Stripe."""
    data = await request.json()
    session_id = data.get("session_id", "")
    if not session_id:
        raise HTTPException(400, "Missing session_id")

    session = await run_in_threadpool(
        lambda: stripe_lib.checkout.Session.retrieve(session_id)
    )
    metadata = getattr(session, "metadata", None)
    org_id = getattr(metadata, "org_id", None) if metadata else None
    if org_id != str(user["org_id"]):
        raise HTTPException(403, "Session does not belong to this organization")
    if getattr(session, "payment_status", "") not in ("paid", "no_payment_required"):
        raise HTTPException(402, "Payment not completed")
    plan_key = getattr(metadata, "plan", "free") if metadata else "free"
    await _apply_plan(
        user["org_id"],
        plan_key,
        getattr(session, "customer", None),
        getattr(session, "subscription", None),
        "active",
    )
    return {"ok": True, "plan": plan_key}


@app.post("/billing/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    secret = os.environ.get("STRIPE_WEBHOOK_SECRET")
    try:
        if secret:
            event = stripe_lib.Webhook.construct_event(payload, sig, secret)
        else:
            # No signing secret configured: verify by re-fetching from Stripe.
            import json

            unverified = json.loads(payload)
            event = await run_in_threadpool(
                lambda: stripe_lib.Event.retrieve(unverified["id"])
            )
    except Exception:
        raise HTTPException(400, "Invalid webhook payload")

    etype = event["type"]
    obj = event["data"]["object"]

    if etype == "checkout.session.completed":
        meta = obj.get("metadata") or {}
        if meta.get("org_id"):
            await _apply_plan(
                int(meta["org_id"]),
                meta.get("plan", "free"),
                obj.get("customer"),
                obj.get("subscription"),
                "active",
            )
    elif etype in ("customer.subscription.updated", "customer.subscription.deleted"):
        meta = obj.get("metadata") or {}
        if meta.get("org_id"):
            status = obj.get("status", "canceled")
            plan_key = (
                meta.get("plan", "free")
                if etype == "customer.subscription.updated"
                and status in ("active", "trialing")
                else "free"
            )
            await _apply_plan(
                int(meta["org_id"]), plan_key, obj.get("customer"), obj.get("id"), status
            )
    return {"received": True}


# ---------------------------------------------------------------------------
# Platform admin (superadmin only)
# ---------------------------------------------------------------------------


@app.get("/admin/orgs")
async def admin_orgs(user: dict = Depends(superadmin)):
    p = await db.get_pool()
    rows = await p.fetch(
        """
        SELECT o.id, o.name, o.slug, o.plan, o.subscription_status,
               o.monthly_message_limit, o.created_at,
               (SELECT count(*) FROM users u WHERE u.org_id = o.id) AS user_count,
               (SELECT count(*) FROM documents d WHERE d.org_id = o.id) AS doc_count,
               COALESCE((SELECT messages_used FROM usage_counters uc
                         WHERE uc.org_id = o.id AND uc.period = $1), 0) AS messages_used
        FROM organizations o
        ORDER BY o.created_at DESC
        """,
        _period(),
    )
    return [dict(r) for r in rows]


@app.get("/admin/stats")
async def admin_stats(user: dict = Depends(superadmin)):
    p = await db.get_pool()
    row = await p.fetchrow(
        """
        SELECT
            (SELECT count(*) FROM organizations) AS orgs,
            (SELECT count(*) FROM users WHERE role != 'superadmin') AS users,
            (SELECT count(*) FROM documents) AS documents,
            (SELECT count(*) FROM messages WHERE role = 'user') AS messages,
            (SELECT count(*) FROM organizations WHERE plan != 'free') AS paying_orgs
        """
    )
    mrr = await p.fetchval(
        """
        SELECT COALESCE(SUM(CASE plan WHEN 'pro' THEN 2900 WHEN 'business' THEN 9900 ELSE 0 END), 0)
        FROM organizations WHERE subscription_status = 'active'
        """
    )
    daily = await p.fetch(
        """
        SELECT to_char(d.day, 'YYYY-MM-DD') AS day, count(m.id) AS messages
        FROM generate_series(
            (now() - interval '13 days')::date, now()::date, '1 day'
        ) AS d(day)
        LEFT JOIN messages m ON m.role = 'user' AND m.created_at::date = d.day
        GROUP BY d.day ORDER BY d.day
        """
    )
    return {**dict(row), "mrr_cents": mrr, "daily": [dict(r) for r in daily]}
