from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    api_key: str = "your-groq-api-key-here"
    ai_model: str = "llama-3.1-8b-instant"
    max_tokens: int = 1024

    class Config:
        env_file = ".env"

settings = Settings()