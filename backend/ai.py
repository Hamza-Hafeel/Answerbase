"""AI Gateway client: embeddings + chat completions via OpenAI-compatible API."""

import base64
import os

import httpx

GATEWAY_BASE = "https://generativelanguage.googleapis.com/v1beta/openai"
EMBEDDING_MODEL = "gemini-embedding-2"  # 768 dims
CHAT_MODEL = "gemini-2.5-flash"


def _headers() -> dict:
    return {
        "Authorization": f"Bearer {os.environ['AI_GATEWAY_API_KEY']}",
        "Content-Type": "application/json",
    }


async def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embed a batch of texts. Returns embeddings in input order."""
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:batchEmbedContents"
    
    headers = {
        "x-goog-api-key": os.environ['AI_GATEWAY_API_KEY'],
        "Content-Type": "application/json"
    }
    
    requests = [
        {
            "model": "models/gemini-embedding-2", 
            "content": {"parts": [{"text": t}]}, 
            "outputDimensionality": 768
        } for t in texts
    ]
    
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                url,
                headers=headers,
                json={"requests": requests},
            )
            resp.raise_for_status()
            data = resp.json()
            return [d["values"] for d in data["embeddings"]]
    except httpx.HTTPStatusError:
        raise RuntimeError("Embedding service temporarily unavailable. Please try again.")
    except Exception:
        raise RuntimeError("Failed to generate embeddings. Please try again later.")


async def chat_completion(messages: list[dict], max_tokens: int = 600) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
    headers = {
        "x-goog-api-key": os.environ['AI_GATEWAY_API_KEY'],
        "Content-Type": "application/json"
    }
    
    contents = []
    system_instruction = None
    
    for m in messages:
        if m["role"] == "system":
            system_instruction = {"parts": [{"text": m["content"]}]}
        else:
            role = "model" if m["role"] == "assistant" else "user"
            contents.append({"role": role, "parts": [{"text": m["content"]}]})
            
    payload = {
        "contents": contents,
        "generationConfig": {
            "maxOutputTokens": max_tokens,
            "temperature": 0.2
        }
    }
    
    if system_instruction:
        payload["systemInstruction"] = system_instruction
        
    try:
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]
    except httpx.HTTPStatusError:
        raise RuntimeError("AI service temporarily unavailable. Please try again.")
    except Exception:
        raise RuntimeError("Failed to generate a response. Please try again later.")


def vector_literal(embedding: list[float]) -> str:
    """Format a python list as a pgvector literal string."""
    return "[" + ",".join(f"{x:.8f}" for x in embedding) + "]"


async def extract_text_from_image(image_bytes: bytes, mime_type: str) -> str:
    """Extract printed or handwritten text from an image using Gemini 2.5 Flash."""
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
    headers = {
        "x-goog-api-key": os.environ['AI_GATEWAY_API_KEY'],
        "Content-Type": "application/json"
    }
    
    encoded_image = base64.b64encode(image_bytes).decode("utf-8")
    
    payload = {
        "contents": [{
            "parts": [
                {"text": "Extract all text from this image exactly as written. If it contains handwritten notes, transcribe them carefully. Do not add any extra commentary or conversational filler."},
                {
                    "inline_data": {
                        "mime_type": mime_type,
                        "data": encoded_image
                    }
                }
            ]
        }]
    }
    
    try:
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]
    except httpx.HTTPStatusError:
        raise RuntimeError("OCR service temporarily unavailable. Please try again.")
    except Exception:
        raise RuntimeError("Failed to extract text from image. Please try again later.")
