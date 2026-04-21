from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.ai_service import get_available_models, stream_chat_response, get_full_response
from app.core.config import settings
import logging
import groq

router = APIRouter()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """
    MAIN ENDPOINT — Streams AI response as Server-Sent Events (SSE).

    SSE Format: each chunk is sent as:
        data: hello\n\n
        data:  world\n\n
        data: [DONE]\n\n

    React reads these with EventSource or fetch + ReadableStream.

    Why SSE over WebSockets?
    - Simpler: one-direction (server → client), no handshake
    - Works with regular HTTP/HTTPS
    - Auto-reconnects on disconnect
    - Perfect for AI streaming (you never need to stream *to* the server)
    """
    max_message_length =100

    async def generate():
        try:
            if not request.messages:
                raise Exception("Messages cannot be empty")

            #log the number of messages and total character count at the start of each request
            total_chars = sum(len(m.content) for m in request.messages)
            logger.info(f"AI request — messages: {len(request.messages)}, total chars: {total_chars}")

            if len(request.messages) > max_message_length:
                raise Exception("Messages cannot be greater than 2000 characters")
            
            async for chunk in stream_chat_response(
                messages=request.messages,
                system_prompt=request.system_prompt,
            ):
                # SSE format: "data: <content>\n\n"
                # We escape newlines so each SSE message is one line
                escaped = chunk.replace("\n", "\\n")
                yield f"data: {escaped}\n\n"

            # Signal to the frontend that streaming is complete
            yield "data: [DONE]\n\n"

        except Exception as e:
            # Send the error as an SSE event so React can handle it
            yield f"data: [ERROR] {str(e)}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            # Prevent any proxy/browser from buffering the stream
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/chat/simple", response_model=ChatResponse)
async def chat_simple(request: ChatRequest):
    """
    NON-STREAMING endpoint — returns the full response at once.
    Good for testing or when you don't need real-time streaming.
    """
    try:
        reply = await get_full_response(
            messages=request.messages,
            system_prompt=request.system_prompt,
        )
        return ChatResponse(reply=reply, model=settings.ai_model)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/models")
async def get_models():
    try:
        names = await get_available_models()
        return {"models": names}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
