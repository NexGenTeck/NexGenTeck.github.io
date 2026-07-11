"""
Vector store manager using Qdrant.
Supports in-memory and external Qdrant, plus safe collection swap reindexing.
"""

from __future__ import annotations

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams
from typing import Any, Dict, List, Optional, Tuple
import logging
import time
import uuid

from config import config
from embeddings import embedding_manager

logger = logging.getLogger(__name__)

META_POINT_ID = "00000000-0000-4000-8000-000000000001"
ACTIVE_POINTER_ID = "00000000-0000-4000-8000-000000000002"


class VectorStore:
    """Manages Qdrant vector storage and retrieval with safe reindex support."""

    _instance = None
    _client = None
    _collection_name = None
    _control_collection_name = None
    _initialized = False
    _content_version: Optional[str] = None
    _index_metadata: Dict[str, Any] = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if VectorStore._client is None:
            qdrant_url = config.QDRANT_URL

            if qdrant_url == ":memory:" or not qdrant_url:
                logger.info("Initializing Qdrant (in-memory mode)")
                VectorStore._client = QdrantClient(":memory:")
            else:
                logger.info("Connecting to external Qdrant server at %s", qdrant_url)
                try:
                    VectorStore._client = QdrantClient(url=qdrant_url)
                    logger.info("Connected to external Qdrant server successfully")
                except Exception as e:
                    logger.error("Failed to connect to Qdrant server: %s", e)
                    logger.info("Falling back to in-memory mode")
                    VectorStore._client = QdrantClient(":memory:")

            VectorStore._collection_name = config.COLLECTION_NAME
            VectorStore._control_collection_name = f"{config.COLLECTION_NAME}__control"
            self._ensure_collection(VectorStore._collection_name)
            self._ensure_collection(VectorStore._control_collection_name)
            self._load_active_pointer()
            self._load_index_metadata()
            logger.info("Qdrant collection '%s' ready", VectorStore._collection_name)

    @property
    def client(self):
        return VectorStore._client

    def get_active_collection_name(self) -> str:
        return VectorStore._collection_name or config.COLLECTION_NAME

    def get_content_version(self) -> Optional[str]:
        if VectorStore._content_version:
            return VectorStore._content_version
        self._load_index_metadata()
        return VectorStore._content_version

    def get_index_metadata(self) -> Dict[str, Any]:
        self._load_index_metadata()
        return dict(VectorStore._index_metadata or {})

    def _load_active_pointer(self) -> None:
        """Restore the active collection selected by the last successful swap."""
        control = VectorStore._control_collection_name
        if not control:
            return
        try:
            points = self.client.retrieve(
                collection_name=control,
                ids=[ACTIVE_POINTER_ID],
                with_payload=True,
                with_vectors=False,
            )
            if not points:
                return
            active = (points[0].payload or {}).get("active_collection")
            if not active:
                return
            collections = {item.name for item in self.client.get_collections().collections}
            if active in collections:
                VectorStore._collection_name = active
        except Exception as exc:
            logger.warning("Could not restore active collection pointer: %s", exc)

    def _write_active_pointer(self, active: str, previous: str) -> None:
        """Persist the active collection without deleting the previous index."""
        control = VectorStore._control_collection_name
        if not control:
            return
        dim = embedding_manager.get_embedding_dimension()
        self.client.upsert(
            collection_name=control,
            points=[
                PointStruct(
                    id=ACTIVE_POINTER_ID,
                    vector=[0.0] * dim,
                    payload={
                        "document_type": "active_collection_pointer",
                        "active_collection": active,
                        "previous_collection": previous,
                        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    },
                )
            ],
        )

    def _ensure_collection(self, name: str) -> None:
        try:
            collections = self.client.get_collections().collections
            existing = {c.name for c in collections}
            if name in existing:
                return
            dim = embedding_manager.get_embedding_dimension()
            self.client.create_collection(
                collection_name=name,
                vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
            )
            logger.info("Created collection %s with dimension %s", name, dim)
        except Exception as e:
            logger.debug("Collection ensure note for %s: %s", name, e)

    def _load_index_metadata(self) -> None:
        try:
            points = self.client.retrieve(
                collection_name=self.get_active_collection_name(),
                ids=[META_POINT_ID],
                with_payload=True,
                with_vectors=False,
            )
            if not points:
                return
            payload = points[0].payload or {}
            if payload.get("document_type") != "index_metadata":
                return
            VectorStore._content_version = payload.get("content_version")
            VectorStore._index_metadata = dict(payload)
            VectorStore._initialized = self.count() > 0
        except Exception:
            # Missing meta point is normal for empty/new collections
            return

    def add_documents(
        self,
        documents: List[Dict[str, Any]],
        collection_name: Optional[str] = None,
        content_version: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> int:
        if not documents:
            return 0

        target = collection_name or self.get_active_collection_name()
        self._ensure_collection(target)

        contents = [doc["content"] for doc in documents]
        metadatas = [doc.get("metadata", {}) for doc in documents]
        embeddings = embedding_manager.embed_texts(contents)

        points: List[PointStruct] = []
        for content, embedding, meta in zip(contents, embeddings, metadatas):
            payload = {"content": content, **(meta or {})}
            points.append(
                PointStruct(
                    id=str(uuid.uuid4()),
                    vector=embedding,
                    payload=payload,
                )
            )

        # Metadata sentinel point for fingerprint / freshness
        if content_version:
            dim = len(embeddings[0]) if embeddings else embedding_manager.get_embedding_dimension()
            meta_payload = {
                "document_type": "index_metadata",
                "entity_id": "index-metadata",
                "content": f"index metadata content_version={content_version}",
                "content_version": content_version,
                "indexed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "document_count": len(documents),
            }
            if metadata:
                meta_payload.update(metadata)
            points.append(
                PointStruct(
                    id=META_POINT_ID,
                    vector=[0.0] * dim,
                    payload=meta_payload,
                )
            )

        self.client.upsert(collection_name=target, points=points)

        if target == self.get_active_collection_name():
            VectorStore._initialized = True
            if content_version:
                VectorStore._content_version = content_version
                VectorStore._index_metadata = {
                    "content_version": content_version,
                    **(metadata or {}),
                }

        logger.info("Added %s documents to collection %s", len(documents), target)
        return len(documents)

    def replace_documents_safely(
        self,
        documents: List[Dict[str, Any]],
        content_version: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Write to a staging collection, verify, then swap active pointer.
        Previous active collection is retained until swap succeeds.
        """
        if not documents:
            raise ValueError("Cannot replace knowledge base with empty document set")

        active = self.get_active_collection_name()
        staging = f"{config.COLLECTION_NAME}__staging_{uuid.uuid4().hex}"

        # Create fresh staging collection
        try:
            self.client.delete_collection(staging)
        except Exception:
            pass

        try:
            dim = embedding_manager.get_embedding_dimension()
            self.client.create_collection(
                collection_name=staging,
                vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
            )

            indexed = self.add_documents(
                documents,
                collection_name=staging,
                content_version=content_version,
                metadata=metadata,
            )

            info = self.client.get_collection(staging)
            staging_count = info.points_count or 0
            if staging_count < indexed + 1:
                raise RuntimeError("Staging collection has fewer points than expected")

            sentinel = self.client.retrieve(
                collection_name=staging,
                ids=[META_POINT_ID],
                with_payload=True,
                with_vectors=False,
            )
            if not sentinel or (sentinel[0].payload or {}).get("content_version") != content_version:
                raise RuntimeError("Staging collection metadata validation failed")

            probe = documents[0]["content"][:200]
            probe_vector = embedding_manager.embed_text(probe)
            hits = self.client.search(
                collection_name=staging,
                query_vector=probe_vector,
                limit=1,
            )
            if not hits:
                raise RuntimeError("Staging collection is not queryable")
        except Exception:
            try:
                self.client.delete_collection(staging)
            except Exception:
                pass
            raise

        previous = active
        # Persist the pointer before changing process-local state. If this write
        # fails, the caller continues to use the previous active collection.
        try:
            self._write_active_pointer(staging, previous)
        except Exception:
            try:
                self.client.delete_collection(staging)
            except Exception:
                pass
            raise
        VectorStore._collection_name = staging
        VectorStore._initialized = True
        VectorStore._content_version = content_version
        VectorStore._index_metadata = {
            "content_version": content_version,
            **(metadata or {}),
        }

        # Best-effort cleanup of previous non-base collections (keep one previous)
        if previous and previous != staging:
            try:
                # Rename semantics: keep previous until next successful reindex
                # Delete only older staging collections
                collections = self.client.get_collections().collections
                for coll in collections:
                    name = coll.name
                    if (
                        name.startswith(f"{config.COLLECTION_NAME}__staging_")
                        and name not in {staging, previous}
                    ):
                        try:
                            self.client.delete_collection(name)
                        except Exception:
                            pass
            except Exception as exc:
                logger.warning("Staging cleanup warning: %s", exc)

        logger.info(
            "Safe swap complete: active=%s previous=%s indexed=%s",
            staging,
            previous,
            indexed,
        )
        return {
            "indexed_count": indexed,
            "active_collection": staging,
            "staging_collection": staging,
            "previous_collection": previous,
            "staging_points": staging_count,
        }

    def search(
        self,
        query: str,
        n_results: int = None,
        distance_threshold: float = None,
    ) -> List[Tuple[str, float, Dict]]:
        n_results = n_results or config.MAX_CONTEXT_DOCS
        distance_threshold = distance_threshold or config.RELEVANCE_THRESHOLD

        if self.count() == 0:
            logger.warning("Vector store is empty")
            return []

        query_embedding = embedding_manager.embed_text(query)
        results = self.client.search(
            collection_name=self.get_active_collection_name(),
            query_vector=query_embedding,
            limit=max(n_results * 2, n_results),
        )

        processed = []
        for hit in results:
            payload = hit.payload or {}
            if payload.get("document_type") == "index_metadata":
                continue
            distance = 1 - hit.score
            if distance <= distance_threshold:
                content = payload.get("content", "")
                metadata = {k: v for k, v in payload.items() if k != "content"}
                processed.append((content, distance, metadata))
            if len(processed) >= n_results:
                break

        logger.info("Found %s relevant documents for query", len(processed))
        return processed

    def count(self) -> int:
        try:
            info = self.client.get_collection(self.get_active_collection_name())
            total = info.points_count or 0
            # Exclude metadata sentinel when present
            meta = 1 if self.get_content_version() else 0
            return max(total - meta, 0) if total else 0
        except Exception:
            return 0

    def clear(self):
        """
        Destructive clear of the active collection.
        Prefer replace_documents_safely for production reindex.
        """
        try:
            name = self.get_active_collection_name()
            self.client.delete_collection(name)
            VectorStore._collection_name = config.COLLECTION_NAME
            self._ensure_collection(config.COLLECTION_NAME)
            self._write_active_pointer(config.COLLECTION_NAME, name)
            VectorStore._initialized = False
            VectorStore._content_version = None
            VectorStore._index_metadata = {}
            logger.info("Vector store cleared")
        except Exception as e:
            logger.error("Error clearing vector store: %s", e)

    def is_initialized(self) -> bool:
        return bool(VectorStore._initialized and self.count() > 0)


vector_store = VectorStore()
