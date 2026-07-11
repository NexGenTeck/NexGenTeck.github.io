"""
Configuration module for the NexGenTeck AI Chatbot.
Loads environment variables and provides centralized configuration.
"""

import os
from dotenv import load_dotenv

load_dotenv()


def _env_bool(name: str, default: str = "false") -> bool:
    return os.getenv(name, default).lower() in {"1", "true", "yes", "on"}


class Config:
    """Centralized configuration for the chatbot backend."""

    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")

    # Admin secret for mutating endpoints (/reindex). Never hardcode.
    REINDEX_SECRET: str = os.getenv("REINDEX_SECRET", "") or os.getenv("ADMIN_TOKEN", "")

    WEBSITE_URL: str = os.getenv("WEBSITE_URL", "https://nexgenteck.com").rstrip("/")

    # Preferred: extract from repository / bundled website sources (authoritative).
    # USE_TRANSLATION_EXTRACTOR retained for backward compatibility.
    USE_SOURCE_EXTRACTOR: bool = _env_bool(
        "USE_SOURCE_EXTRACTOR",
        os.getenv("USE_TRANSLATION_EXTRACTOR", "true"),
    )
    USE_TRANSLATION_EXTRACTOR: bool = USE_SOURCE_EXTRACTOR

    # Allow live crawl as secondary source when source extraction is unavailable.
    ALLOW_LIVE_SCRAPE: bool = _env_bool("ALLOW_LIVE_SCRAPE", "false")
    MAX_SCRAPE_PAGES: int = int(os.getenv("MAX_SCRAPE_PAGES", "100"))

    # Auto-refresh knowledge base on startup when content fingerprint changes.
    AUTO_REFRESH_ON_STARTUP: bool = _env_bool("AUTO_REFRESH_ON_STARTUP", "true")

    CORS_ORIGINS: list = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "https://nexgenteck.github.io,https://muhammadhasaan82.github.io,"
            "https://nexgenteck.com,http://localhost:5173,http://localhost:3000",
        ).split(",")
        if origin.strip()
    ]

    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "BAAI/bge-m3")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")

    MAX_CONTEXT_DOCS: int = int(os.getenv("MAX_CONTEXT_DOCS", "8"))
    RELEVANCE_THRESHOLD: float = float(os.getenv("RELEVANCE_THRESHOLD", "1.5"))
    ENABLE_RERANKING: bool = _env_bool("ENABLE_RERANKING", "true")
    RERANK_MODEL: str = os.getenv("RERANK_MODEL", "cross-encoder/ms-marco-MiniLM-L-6-v2")
    RERANK_CANDIDATE_DOCS: int = int(os.getenv("RERANK_CANDIDATE_DOCS", "30"))

    LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.4"))
    LLM_MAX_TOKENS: int = int(os.getenv("LLM_MAX_TOKENS", "1024"))

    QDRANT_URL: str = os.getenv("QDRANT_URL", ":memory:")
    COLLECTION_NAME: str = os.getenv("COLLECTION_NAME", "nexgenteck_knowledge")

    # Writable paths for HF / containers
    MODEL_CACHE_DIR: str = os.getenv("MODEL_CACHE_DIR", "")
    HF_HOME: str = os.getenv("HF_HOME", "")

    @classmethod
    def validate(cls) -> bool:
        """Validate that required configuration is present."""
        if not cls.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY environment variable is required")
        return True


config = Config()
