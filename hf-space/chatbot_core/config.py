"""Configuration for NexGenTeck Hugging Face Gradio chatbot."""

import os

from dotenv import load_dotenv

load_dotenv()


def _env_bool(name: str, default: str = "false") -> bool:
    return os.getenv(name, default).lower() in {"1", "true", "yes", "on"}


class Config:
    """Centralized configuration loaded from environment variables."""

    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    ADMIN_TOKEN: str = os.getenv("ADMIN_TOKEN", "") or os.getenv("REINDEX_SECRET", "")

    WEBSITE_URL: str = os.getenv("WEBSITE_URL", "https://nexgenteck.com").rstrip("/")
    EMBEDDING_MODEL: str = os.getenv(
        "EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2"
    )

    LLM_MODEL: str = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
    LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.3"))
    LLM_MAX_TOKENS: int = int(os.getenv("LLM_MAX_TOKENS", "768"))

    MAX_PAGES: int = int(os.getenv("MAX_PAGES", "100"))
    TOP_K: int = int(os.getenv("TOP_K", "8"))
    MAX_MESSAGE_LENGTH: int = int(os.getenv("MAX_MESSAGE_LENGTH", "2000"))

    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "800"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "100"))

    HTTP_TIMEOUT: float = float(os.getenv("HTTP_TIMEOUT", "30"))
    MIN_RELEVANCE_SCORE: float = float(os.getenv("MIN_RELEVANCE_SCORE", "0.20"))

    # Source extraction is the preferred knowledge path for SPA sites on HF Spaces.
    USE_SOURCE_EXTRACTOR: bool = _env_bool("USE_SOURCE_EXTRACTOR", "true")
    ALLOW_LIVE_SCRAPE: bool = _env_bool("ALLOW_LIVE_SCRAPE", "false")
    AUTO_REFRESH_ON_STARTUP: bool = _env_bool("AUTO_REFRESH_ON_STARTUP", "true")

    # Optional writable cache location on Spaces
    MODEL_CACHE_DIR: str = os.getenv("MODEL_CACHE_DIR", "") or os.getenv("HF_HOME", "")


config = Config()
