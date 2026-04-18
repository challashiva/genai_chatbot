from pydantic import BaseModel
from typing import List


class Message(BaseModel):
    """A single chat message"""
    role: str           # "user" or "assistant"
    content: str        # The message text


class ChatRequest(BaseModel):
    """What the frontend sends to /api/chat"""
    messages: List[Message]     # Full conversation history
    system_prompt: str = "You are a helpful AI assistant."


class ChatResponse(BaseModel):
    """Non-streaming response shape (used for /api/chat/simple)"""
    reply: str
    model: str
