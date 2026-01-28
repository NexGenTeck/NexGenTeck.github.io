"""
Vector store manager using Qdrant.
Handles storage and retrieval of document embeddings.
Uses in-memory Qdrant for simplicity (no external server needed).
"""

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from typing import List, Dict, Tuple
import logging
import uuid

from config import config
from embeddings import embedding_manager

logger = logging.getLogger(__name__)


class VectorStore:
    """Manages Qdrant vector storage and retrieval."""
    
    _instance = None
    _client = None
    _collection_name = None
    _initialized = False
    
    def __new__(cls):
        """Singleton pattern for vector store."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """
        Initialize Qdrant client.
        Supports both in-memory storage and external Qdrant server.
        Set QDRANT_URL environment variable to use an external server.
        """
        if VectorStore._client is None:
            qdrant_url = config.QDRANT_URL
            
            if qdrant_url == ":memory:" or not qdrant_url:
                # Use in-memory Qdrant - no external server needed
                logger.info("Initializing Qdrant (in-memory mode)")
                VectorStore._client = QdrantClient(":memory:")
            else:
                # Connect to external Qdrant server (self-hosted open source)
                logger.info(f"Connecting to external Qdrant server at {qdrant_url}")
                try:
                    VectorStore._client = QdrantClient(url=qdrant_url)
                    logger.info("Connected to external Qdrant server successfully")
                except Exception as e:
                    logger.error(f"Failed to connect to Qdrant server: {e}")
                    logger.info("Falling back to in-memory mode")
                    VectorStore._client = QdrantClient(":memory:")
            
            VectorStore._collection_name = config.COLLECTION_NAME
            
            # Create collection if it doesn't exist
            self._create_collection()
            
            logger.info(f"Qdrant collection '{config.COLLECTION_NAME}' ready")
    
    def _create_collection(self):
        """Create the vector collection if it doesn't exist."""
        try:
            # Get embedding dimension
            dim = embedding_manager.get_embedding_dimension()
            
            # Create collection
            VectorStore._client.create_collection(
                collection_name=VectorStore._collection_name,
                vectors_config=VectorParams(
                    size=dim,
                    distance=Distance.COSINE
                )
            )
            logger.info(f"Created collection with dimension {dim}")
        except Exception as e:
            # Collection might already exist
            logger.debug(f"Collection creation note: {e}")
    
    @property
    def client(self):
        """Get the Qdrant client."""
        return VectorStore._client
    
    def add_documents(self, documents: List[Dict[str, str]]) -> int:
        """
        Add documents to the vector store.
        
        Args:
            documents: List of dicts with 'content' and 'metadata' keys
            
        Returns:
            Number of documents added
        """
        if not documents:
            return 0
        
        # Extract content and metadata
        contents = [doc['content'] for doc in documents]
        metadatas = [doc.get('metadata', {}) for doc in documents]
        
        # Generate embeddings
        embeddings = embedding_manager.embed_texts(contents)
        
        # Create points for Qdrant
        points = []
        for i, (content, embedding, metadata) in enumerate(zip(contents, embeddings, metadatas)):
            point = PointStruct(
                id=str(uuid.uuid4()),
                vector=embedding,
                payload={
                    "content": content,
                    **metadata
                }
            )
            points.append(point)
        
        # Add to collection
        self.client.upsert(
            collection_name=VectorStore._collection_name,
            points=points
        )
        
        VectorStore._initialized = True
        logger.info(f"Added {len(documents)} documents to vector store")
        return len(documents)
    
    def search(
        self, 
        query: str, 
        n_results: int = None,
        distance_threshold: float = None
    ) -> List[Tuple[str, float, Dict]]:
        """
        Search for relevant documents.
        
        Args:
            query: Search query
            n_results: Maximum number of results (defaults to config.MAX_CONTEXT_DOCS)
            distance_threshold: Maximum distance for relevance (defaults to config.RELEVANCE_THRESHOLD)
            
        Returns:
            List of tuples: (content, distance, metadata)
        """
        n_results = n_results or config.MAX_CONTEXT_DOCS
        distance_threshold = distance_threshold or config.RELEVANCE_THRESHOLD
        
        if self.count() == 0:
            logger.warning("Vector store is empty")
            return []
        
        # Generate query embedding
        query_embedding = embedding_manager.embed_text(query)
        
        # Search
        results = self.client.search(
            collection_name=VectorStore._collection_name,
            query_vector=query_embedding,
            limit=n_results
        )
        
        # Process results
        processed = []
        for hit in results:
            # Convert similarity score to distance (1 - similarity for cosine)
            distance = 1 - hit.score
            
            # Filter by relevance threshold
            if distance <= distance_threshold:
                content = hit.payload.get("content", "")
                metadata = {k: v for k, v in hit.payload.items() if k != "content"}
                processed.append((content, distance, metadata))
        
        logger.info(f"Found {len(processed)} relevant documents for query")
        return processed
    
    def count(self) -> int:
        """Get the number of documents in the store."""
        try:
            info = self.client.get_collection(VectorStore._collection_name)
            return info.points_count
        except Exception:
            return 0
    
    def clear(self):
        """Clear all documents from the store."""
        try:
            self.client.delete_collection(VectorStore._collection_name)
            self._create_collection()
            VectorStore._initialized = False
            logger.info("Vector store cleared")
        except Exception as e:
            logger.error(f"Error clearing vector store: {e}")
    
    def is_initialized(self) -> bool:
        """Check if the vector store has been populated with data."""
        return VectorStore._initialized and self.count() > 0


# Singleton instance
vector_store = VectorStore()
