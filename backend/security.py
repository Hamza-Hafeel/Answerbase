"""Password hashing, JWT issuing/verification, API key generation."""

import datetime
import hashlib
import os
import secrets

import bcrypt
import jwt

# Deterministic secret derived from the database URL so tokens survive restarts
# without requiring an extra env var. Override with JWT_SECRET if provided.
_JWT_SECRET = os.environ.get("JWT_SECRET") or hashlib.sha256(
    ("answerbase-jwt::" + os.environ.get("DATABASE_URL", "dev")).encode()
).hexdigest()

TOKEN_TTL_HOURS = 24 * 7


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), password_hash.encode())
    except ValueError:
        return False


def create_token(user_id: int, org_id: int | None, role: str) -> str:
    now = datetime.datetime.now(datetime.timezone.utc)
    payload = {
        "sub": str(user_id),
        "org": org_id,
        "role": role,
        "iat": now,
        "exp": now + datetime.timedelta(hours=TOKEN_TTL_HOURS),
    }
    return jwt.encode(payload, _JWT_SECRET, algorithm="HS256")


def decode_token(token: str) -> dict:
    return jwt.decode(token, _JWT_SECRET, algorithms=["HS256"])


def generate_api_key() -> tuple[str, str, str]:
    """Returns (raw_key, key_hash, key_prefix)."""
    raw = "ab_" + secrets.token_urlsafe(32)
    key_hash = hashlib.sha256(raw.encode()).hexdigest()
    return raw, key_hash, raw[:11]


def hash_api_key(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()
