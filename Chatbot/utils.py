"""
Utility functions for the NexGenTeck AI Chatbot.
Fully softcoded - no hardcoded patterns or regex.
"""

import logging
from typing import List

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """
    Split text into overlapping chunks for better context retrieval.
    
    Args:
        text: Text to split
        chunk_size: Maximum characters per chunk
        overlap: Number of characters to overlap between chunks
        
    Returns:
        List of text chunks
    """
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        
        if end < len(text):
            for sep in ['. ', '! ', '? ', '\n\n', '\n']:
                last_sep = text[start:end].rfind(sep)
                if last_sep != -1:
                    end = start + last_sep + len(sep)
                    break
        
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        next_start = end - overlap
        if next_start <= start:
            next_start = end
        start = next_start
    
    return chunks


def clean_text(text: str) -> str:
    """
    Clean and normalize text for processing.
    Uses simple string operations, no regex.
    
    Args:
        text: Raw text to clean
        
    Returns:
        Cleaned text
    """
    words = text.split()
    text = ' '.join(words)
    
    return text.strip()
