from groq import Groq
from typing import AsyncGenerator, List
from app.core.config import settings
from app.schemas.chat import Message

# Create Groq client once, reused across requests
client = Groq(api_key=settings.api_key)

async def stream_chat_response(
    messages: List[Message],
    system_prompt: str = "You are a helpful AI assistant.",
) -> AsyncGenerator[str, None]:
    """
    Streams AI response token by token using Groq SDK.
    The FastAPI route and React frontend don't change at all —
    they just receive the same SSE chunks as before.
    """

    # Convert our Message objects to Groq's expected format
    groq_messages = [
        {"role": "system", "content": system_prompt},  # system goes first
        *[{"role": msg.role, "content": msg.content} for msg in messages]
    ]

    # Open a streaming connection to Groq
    stream = client.chat.completions.create(
        model=settings.ai_model,
        messages=groq_messages,
        max_tokens=settings.max_tokens,
        stream=True,   # ← this is what enables token-by-token streaming
    )

    # Yield each text chunk as it arrives
    for chunk in stream:
        text = chunk.choices[0].delta.content
        if text:  # delta can be None on the last chunk
            yield text


async def get_full_response(
    messages: List[Message],
    system_prompt: str = "You are a helpful AI assistant.",
) -> str:
    """
    Non-streaming version — returns full response at once.
    Used by the /api/chat/simple endpoint.
    """
    groq_messages = [
        {"role": "system", "content": system_prompt},
        *[{"role": msg.role, "content": msg.content} for msg in messages]
    ]

    response = client.chat.completions.create(
        model=settings.ai_model,
        messages=groq_messages,
        max_tokens=settings.max_tokens,
        stream=False,
    )

    return response.choices[0].message.content