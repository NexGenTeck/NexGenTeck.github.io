"""
Embedding manager for the NexGenTeck AI Chatbot.
Uses BGE-M3 for multilingual embeddings.
"""

import os
# Disable tokenizers parallelism to avoid multiprocessing issues on Windows
os.environ["TOKENIZERS_PARALLELISM"] = "false"

from sentence_transformers import SentenceTransformer
from typing import List
import logging
import numpy as np

from config import config

logger = logging.getLogger(__name__)


class EmbeddingManager:
    """Manages text embeddings using BGE-M3 model."""
    
    _instance = None
    _model = None
    
    def __new__(cls):
        """Singleton pattern to avoid loading model multiple times."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize the embedding model if not already loaded."""
        if EmbeddingManager._model is None:
            logger.info(f"Loading embedding model: {config.EMBEDDING_MODEL}")
            try:
                # Force clean download with cache_folder to avoid corruption
                EmbeddingManager._model = SentenceTransformer(
                    config.EMBEDDING_MODEL,
                    trust_remote_code=True,
                    device='cpu'
                )
                logger.info("Embedding model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load embedding model: {e}")
                raise RuntimeError(f"BAAI/bge-m3 is required. Error: {e}")
    
    @property
    def model(self) -> SentenceTransformer:
        """Get the loaded model."""
        return EmbeddingManager._model
    
    def embed_text(self, text: str) -> List[float]:
        """
        Generate embedding for a single text.
        
        Args:
            text: Text to embed
            
        Returns:
            Embedding vector as list of floats
        """
        embedding = self.model.encode(text, normalize_embeddings=True)
        return embedding.tolist()
    
    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts.
        
        Args:
            texts: List of texts to embed
            
        Returns:
            List of embedding vectors
        """
        if not texts:
            return []
        
        logger.info(f"Generating embeddings for {len(texts)} texts")
        embeddings = self.model.encode(
            texts, 
            normalize_embeddings=True,
            show_progress_bar=len(texts) > 10
        )
        return embeddings.tolist()
    
    def get_embedding_dimension(self) -> int:
        """Get the dimension of embeddings produced by the model."""
        # Generate a test embedding to get dimension
        test_embedding = self.embed_text("test")
        return len(test_embedding)


# Singleton instance
embedding_manager = EmbeddingManager()
