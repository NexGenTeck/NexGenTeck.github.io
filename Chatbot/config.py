"""
Configuration module for the NexGenTeck AI Chatbot.
Loads environment variables and provides centralized configuration.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Centralized configuration for the chatbot backend."""
    
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    
    WEBSITE_URL: str = os.getenv("WEBSITE_URL", "https://nexgenteck.com")
    USE_TRANSLATION_EXTRACTOR: bool = os.getenv("USE_TRANSLATION_EXTRACTOR", "false").lower() == "true"

    CORS_ORIGINS: list = os.getenv(
        "CORS_ORIGINS", 
        "https://nexgenteck.github.io,https://muhammadhasaan82.github.io,https://nexgenteck.com,http://localhost:5173,http://localhost:3000"
    ).split(",")

    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "BAAI/bge-m3")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")

    MAX_CONTEXT_DOCS: int = int(os.getenv("MAX_CONTEXT_DOCS", "5"))
    RELEVANCE_THRESHOLD: float = float(os.getenv("RELEVANCE_THRESHOLD", "1.5"))
    ENABLE_RERANKING: bool = os.getenv("ENABLE_RERANKING", "true").lower() == "true"
    RERANK_MODEL: str = os.getenv("RERANK_MODEL", "cross-encoder/ms-marco-MiniLM-L-6-v2")
    RERANK_CANDIDATE_DOCS: int = int(os.getenv("RERANK_CANDIDATE_DOCS", "25"))

    LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.7"))
    LLM_MAX_TOKENS: int = int(os.getenv("LLM_MAX_TOKENS", "1024"))
    
    QDRANT_URL: str = os.getenv("QDRANT_URL", ":memory:")
    COLLECTION_NAME: str = os.getenv("COLLECTION_NAME", "nexgenteck_knowledge")
    
    @classmethod
    def validate(cls) -> bool:
        """Validate that required configuration is present."""
        if not cls.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY environment variable is required")
        return True


config = Config()
