"""
In-memory RAG pipeline for Hugging Face Gradio deployment.
Uses sentence-transformers + numpy cosine similarity (no Qdrant).

Preferred knowledge source: bundled / repository website TSX extraction.
Live scrape is secondary. Emergency fallback is last resort and cannot replace
a working index.
"""

from __future__ import annotations

import json
import logging
import os
import threading
import time
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")

from chatbot_core.config import config
from chatbot_core.content_extractor import ContentExtractor, get_minimal_emergency_fallback
from chatbot_core.guardrails import (
    FALLBACK_RESPONSE,
    MISSING_KEY_MESSAGE,
    build_system_prompt,
    fast_path_response,
    format_context_for_prompt,
)
from chatbot_core.scraper import WebsiteScraper

logger = logging.getLogger(__name__)


class InMemoryVectorIndex:
    """Lightweight in-memory vector store with cosine similarity search."""

    def __init__(self):
        self._lock = threading.RLock()
        self._embedder = None
        self._contents: List[str] = []
        self._metadata: List[Dict] = []
        self._embeddings: Optional[np.ndarray] = None
        self._pages_visited: int = 0
        self._content_version: str = ""
        self._extraction_source: str = ""
        self._document_counts_by_type: Dict[str, int] = {}

    def _load_embedder(self):
        if self._embedder is None:
            from sentence_transformers import SentenceTransformer

            logger.info("Loading embedding model: %s", config.EMBEDDING_MODEL)
            kwargs = {"device": "cpu"}
            if config.MODEL_CACHE_DIR:
                kwargs["cache_folder"] = config.MODEL_CACHE_DIR
            self._embedder = SentenceTransformer(config.EMBEDDING_MODEL, **kwargs)

    def build_from_documents(
        self,
        documents: List[Dict],
        pages_visited: int = 0,
        content_version: str = "",
        extraction_source: str = "",
    ) -> int:
        """Replace the index with new documents only after embeddings succeed."""
        with self._lock:
            if not documents:
                return 0

            self._load_embedder()
            contents = [doc["content"] for doc in documents]
            metadata = [doc.get("metadata", {}) for doc in documents]

            logger.info("Embedding %s chunks", len(contents))
            vectors = self._embedder.encode(
                contents,
                normalize_embeddings=True,
                show_progress_bar=len(contents) > 20,
            )
            self._contents = contents
            self._metadata = metadata
            self._embeddings = np.asarray(vectors, dtype=np.float32)
            self._pages_visited = pages_visited
            self._content_version = content_version
            self._extraction_source = extraction_source
            counts: Dict[str, int] = {}
            for meta in metadata:
                dtype = meta.get("document_type", "unknown")
                counts[dtype] = counts.get(dtype, 0) + 1
            self._document_counts_by_type = counts
            return len(contents)

    def available_document_types(self) -> List[str]:
        """Return the document types actually present in the current index."""
        with self._lock:
            return sorted(
                {
                    str(metadata.get("document_type")).strip()
                    for metadata in self._metadata
                    if metadata.get("document_type")
                }
            )

    def documents_by_type(
        self,
        document_type: str,
    ) -> List[Tuple[str, float, Dict]]:
        """Return every unique entity of one indexed document type in source order."""
        requested_type = (document_type or "").strip()
        if not requested_type:
            return []

        with self._lock:
            results: List[Tuple[str, float, Dict]] = []
            seen: set[str] = set()
            for content, metadata in zip(self._contents, self._metadata):
                if metadata.get("document_type") != requested_type:
                    continue

                entity_id = str(metadata.get("entity_id") or "").strip()
                title = " ".join(
                    str(metadata.get("title") or "").lower().split()
                )
                dedupe_key = entity_id or title
                if dedupe_key and dedupe_key in seen:
                    continue
                if dedupe_key:
                    seen.add(dedupe_key)
                results.append((content, 1.0, dict(metadata)))
            return results

    def search(
        self,
        query: str,
        top_k: int | None = None,
        document_type: str | None = None,
    ) -> List[Tuple[str, float, Dict]]:
        """Semantic search, optionally limited to one metadata document type."""
        k = config.TOP_K if top_k is None else max(1, top_k)
        with self._lock:
            if self._embeddings is None or not self._contents:
                return []

            candidate_indices = [
                index
                for index, metadata in enumerate(self._metadata)
                if not document_type
                or metadata.get("document_type") == document_type
            ]
            if not candidate_indices:
                return []

            self._load_embedder()
            query_vec = self._embedder.encode(query, normalize_embeddings=True)
            query_vec = np.asarray(query_vec, dtype=np.float32)
            scores = self._embeddings[candidate_indices] @ query_vec

            ranked_candidates = np.argsort(scores)[::-1][:k]
            results: List[Tuple[str, float, Dict]] = []
            for candidate_index in ranked_candidates:
                idx = candidate_indices[int(candidate_index)]
                score = float(scores[int(candidate_index)])
                if score < config.MIN_RELEVANCE_SCORE:
                    continue
                results.append((self._contents[idx], score, dict(self._metadata[idx])))
            return results

    def chunk_count(self) -> int:
        with self._lock:
            return len(self._contents)

    def page_count(self) -> int:
        with self._lock:
            return self._pages_visited

    def content_version(self) -> str:
        with self._lock:
            return self._content_version

    def extraction_source(self) -> str:
        with self._lock:
            return self._extraction_source

    def document_counts_by_type(self) -> Dict[str, int]:
        with self._lock:
            return dict(self._document_counts_by_type)

    def snapshot(self) -> Dict[str, Any]:
        with self._lock:
            return {
                "contents": list(self._contents),
                "metadata": list(self._metadata),
                "embeddings": None if self._embeddings is None else self._embeddings.copy(),
                "pages_visited": self._pages_visited,
                "content_version": self._content_version,
                "extraction_source": self._extraction_source,
                "document_counts_by_type": dict(self._document_counts_by_type),
            }

    def restore(self, snap: Dict[str, Any]) -> None:
        with self._lock:
            self._contents = list(snap.get("contents") or [])
            self._metadata = list(snap.get("metadata") or [])
            emb = snap.get("embeddings")
            self._embeddings = None if emb is None else np.asarray(emb, dtype=np.float32)
            self._pages_visited = int(snap.get("pages_visited") or 0)
            self._content_version = str(snap.get("content_version") or "")
            self._extraction_source = str(snap.get("extraction_source") or "")
            self._document_counts_by_type = dict(snap.get("document_counts_by_type") or {})


class ChatbotEngine:
    """Coordinates extraction, retrieval, and Groq generation."""

    def __init__(self):
        self.index = InMemoryVectorIndex()
        self._index_lock = threading.Lock()
        self._is_indexing = False
        self._last_index_error: Optional[str] = None
        self._last_index_result: Dict[str, Any] = {}
        self._groq_client = None

    def _get_groq_client(self):
        if not config.GROQ_API_KEY:
            return None
        if self._groq_client is None:
            from groq import Groq

            self._groq_client = Groq(api_key=config.GROQ_API_KEY)
        return self._groq_client

    @staticmethod
    def _parse_query_plan(
        raw_plan: str,
        available_document_types: List[str],
    ) -> Optional[Dict[str, Optional[str]]]:
        """Validate planner JSON against the live index schema."""
        try:
            payload = json.loads(raw_plan.strip())
        except (TypeError, json.JSONDecodeError):
            return None

        if not isinstance(payload, dict):
            return None
        if set(payload) != {"operation", "document_type", "entity_query"}:
            return None

        operation = str(payload.get("operation") or "").strip().lower()
        if operation not in {"list", "search", "general"}:
            return None

        document_type_value = payload.get("document_type")
        document_type = (
            str(document_type_value).strip()
            if document_type_value is not None
            else None
        )
        if document_type and document_type not in available_document_types:
            return None
        if operation == "list" and not document_type:
            return None

        entity_query_value = payload.get("entity_query")
        entity_query = (
            str(entity_query_value).strip()
            if entity_query_value is not None
            else None
        )
        if entity_query == "":
            entity_query = None

        return {
            "operation": operation,
            "document_type": document_type,
            "entity_query": entity_query,
        }

    def _plan_query(
        self,
        message: str,
    ) -> Optional[Dict[str, Optional[str]]]:
        """Ask Groq for a schema-constrained retrieval plan.

        The only document-type vocabulary supplied to the model is read from
        the current index, so new structured entity types require no Python
        changes. Any malformed or unsupported response is ignored safely.
        """
        available_document_types = self.index.available_document_types()
        if not available_document_types:
            return None

        client = self._get_groq_client()
        if client is None:
            return None

        planner_prompt = (
            "Classify the user's retrieval need for a website knowledge index. "
            "Return JSON only, with exactly these keys: operation, document_type, "
            "entity_query. operation must be one of list, search, general. "
            "Use list only when the user asks for every entity in one type. "
            "Use search for a specific entity or a type-focused question. "
            "Use general when no type-specific retrieval is appropriate. "
            "document_type must be null or one of the provided values. "
            "entity_query must be a short user-derived phrase or null.\n\n"
            f"Available document types: {json.dumps(available_document_types)}\n"
            f"User message: {json.dumps(message.strip())}"
        )

        try:
            completion = client.chat.completions.create(
                model=config.LLM_MODEL,
                temperature=0,
                max_tokens=96,
                timeout=20,
                response_format={"type": "json_object"},
                messages=[
                    {
                        "role": "system",
                        "content": "You are a strict JSON retrieval planner.",
                    },
                    {"role": "user", "content": planner_prompt},
                ],
            )
            content = completion.choices[0].message.content
            plan = self._parse_query_plan(
                content or "",
                available_document_types,
            )
            if plan is None:
                logger.warning("Ignoring invalid retrieval planner output")
            return plan
        except Exception as exc:
            logger.warning(
                "Retrieval planner failed; using semantic retrieval: %s",
                type(exc).__name__,
            )
            return None

    def _retrieve_documents(
        self,
        message: str,
        plan: Optional[Dict[str, Optional[str]]],
    ) -> List[Tuple[str, float, Dict]]:
        """Run a generic metadata-driven retrieval operation."""
        if plan and plan["operation"] == "list" and plan["document_type"]:
            return self.index.documents_by_type(plan["document_type"])

        if plan and plan["operation"] == "search":
            return self.index.search(
                plan["entity_query"] or message,
                top_k=config.TOP_K,
                document_type=plan["document_type"],
            )

        return self.index.search(message, top_k=config.TOP_K)

    def _extract_documents(self) -> Dict[str, Any]:
        warnings: List[str] = []
        documents: List[Dict] = []
        extraction_source = "none"
        content_version = ""
        pages_visited = 0
        sources_used: List[str] = []

        extractor = ContentExtractor(base_url=config.WEBSITE_URL)
        content_version = extractor.compute_content_fingerprint()

        if config.USE_SOURCE_EXTRACTOR:
            try:
                inventory = extractor.extract_inventory()
                documents = inventory.get("documents") or []
                content_version = inventory.get("content_version") or content_version
                sources_used = inventory.get("sources_used") or []
                warnings.extend(inventory.get("warnings") or [])
                validation = extractor.validate_documents(documents)
                if validation.get("ok"):
                    extraction_source = "source_tsx"
                else:
                    warnings.extend(validation.get("errors") or [])
                    documents = []
            except Exception as exc:
                warnings.append(f"Source extraction failed: {exc}")
                logger.exception("Source extraction failed")
                documents = []

        if not documents and config.ALLOW_LIVE_SCRAPE:
            try:
                scraper = WebsiteScraper()
                live_docs = scraper.scrape_live_only(max_pages=config.MAX_PAGES)
                if live_docs:
                    documents = live_docs
                    extraction_source = "live_scrape"
                    pages_visited = len(scraper.visited)
            except Exception as exc:
                warnings.append(f"Live scrape failed: {exc}")
                logger.warning("Live scrape failed: %s", exc)

        if not documents:
            documents = get_minimal_emergency_fallback(config.WEBSITE_URL)
            extraction_source = "emergency_fallback"
            warnings.append("Using minimal emergency fallback")

        counts: Dict[str, int] = {}
        for doc in documents:
            dtype = (doc.get("metadata") or {}).get("document_type", "unknown")
            counts[dtype] = counts.get(dtype, 0) + 1

        return {
            "documents": documents,
            "extraction_source": extraction_source,
            "content_version": content_version,
            "pages_visited": pages_visited,
            "warnings": warnings,
            "sources_used": sources_used,
            "document_counts_by_type": counts,
        }

    def build_index(self, force: bool = True) -> Dict[str, object]:
        """Extract content and rebuild in-memory index without destroying old data on failure."""
        with self._index_lock:
            if self._is_indexing:
                return {
                    "ok": False,
                    "status": "busy",
                    "message": "Indexing already in progress.",
                    "chunks": self.index.chunk_count(),
                    "pages": self.index.page_count(),
                    "content_version": self.index.content_version(),
                }
            self._is_indexing = True

        started = time.time()
        previous = self.index.snapshot()
        try:
            extraction = self._extract_documents()
            documents = extraction["documents"]
            content_version = extraction["content_version"]

            if (
                not force
                and previous.get("content_version")
                and content_version
                and previous.get("content_version") == content_version
                and previous.get("contents")
            ):
                result = {
                    "ok": True,
                    "status": "skipped",
                    "message": "Content fingerprint unchanged; index retained.",
                    "chunks": self.index.chunk_count(),
                    "pages": self.index.page_count(),
                    "content_version": content_version,
                    "extraction_source": extraction["extraction_source"],
                    "document_counts_by_type": extraction["document_counts_by_type"],
                    "warnings": extraction["warnings"],
                    "duration_seconds": round(time.time() - started, 3),
                    "previous_collection_retained": True,
                }
                self._last_index_result = result
                self._last_index_error = None
                return result

            if (
                extraction["extraction_source"] == "emergency_fallback"
                and previous.get("contents")
            ):
                result = {
                    "ok": False,
                    "status": "failed",
                    "message": "Refusing to replace working index with emergency fallback.",
                    "chunks": self.index.chunk_count(),
                    "pages": self.index.page_count(),
                    "content_version": previous.get("content_version") or "",
                    "extraction_source": extraction["extraction_source"],
                    "document_counts_by_type": extraction["document_counts_by_type"],
                    "warnings": extraction["warnings"],
                    "duration_seconds": round(time.time() - started, 3),
                    "previous_collection_retained": True,
                }
                self._last_index_result = result
                self._last_index_error = result["message"]
                return result

            # Build into a temporary index first
            staging = InMemoryVectorIndex()
            count = staging.build_from_documents(
                documents,
                pages_visited=extraction["pages_visited"],
                content_version=content_version,
                extraction_source=extraction["extraction_source"],
            )
            if count < 1:
                raise RuntimeError("Staging index empty after embedding")

            # Smoke-test search
            probe = documents[0]["content"][:120]
            if not staging.search(probe, top_k=1) and count > 0:
                # Low similarity on short probe is acceptable; require vectors present
                if staging.chunk_count() < 1:
                    raise RuntimeError("Staging index not queryable")

            # Swap only after success
            self.index = staging
            self._last_index_error = None
            result = {
                "ok": True,
                "status": "success",
                "message": (
                    f"Indexed {count} documents via {extraction['extraction_source']}."
                ),
                "chunks": count,
                "pages": extraction["pages_visited"],
                "content_version": content_version,
                "extraction_source": extraction["extraction_source"],
                "document_counts_by_type": extraction["document_counts_by_type"],
                "sources_used": extraction.get("sources_used") or [],
                "warnings": extraction["warnings"],
                "duration_seconds": round(time.time() - started, 3),
                "previous_collection_retained": False,
            }
            self._last_index_result = result
            return result
        except Exception as exc:
            logger.exception("Index build failed")
            self.index.restore(previous)
            self._last_index_error = "Indexing failed. Previous knowledge retained."
            result = {
                "ok": False,
                "status": "failed",
                "message": self._last_index_error,
                "error": str(exc),
                "chunks": self.index.chunk_count(),
                "pages": self.index.page_count(),
                "content_version": self.index.content_version(),
                "duration_seconds": round(time.time() - started, 3),
                "previous_collection_retained": True,
            }
            self._last_index_result = result
            return result
        finally:
            with self._index_lock:
                self._is_indexing = False

    def ensure_fresh_on_startup(self) -> Dict[str, object]:
        if not config.AUTO_REFRESH_ON_STARTUP:
            if self.index.chunk_count() == 0:
                return self.build_index(force=True)
            return {
                "ok": True,
                "status": "skipped",
                "message": "AUTO_REFRESH_ON_STARTUP disabled",
                "chunks": self.index.chunk_count(),
            }

        current_fp = ContentExtractor(base_url=config.WEBSITE_URL).compute_content_fingerprint()
        stored = self.index.content_version()
        if self.index.chunk_count() == 0 or not stored or stored != current_fp:
            return self.build_index(force=True)
        return {
            "ok": True,
            "status": "skipped",
            "message": "Startup freshness check: content unchanged",
            "chunks": self.index.chunk_count(),
            "content_version": stored,
        }

    def status_text(self) -> str:
        if self._is_indexing:
            return "Indexing website content..."
        if self.index.chunk_count() == 0:
            if self._last_index_error:
                return f"Index not ready. {self._last_index_error}"
            return "Index not ready yet."
        counts = self.index.document_counts_by_type()
        count_summary = ", ".join(f"{k}={v}" for k, v in sorted(counts.items())[:8])
        version = self.index.content_version()
        return (
            f"Index ready — {self.index.chunk_count()} docs "
            f"via {self.index.extraction_source() or 'unknown'}. "
            f"version={(version[:12] + '…') if version else 'n/a'}. "
            f"types: {count_summary}"
        )

    def chat(self, message: str, history: List) -> str:
        fast = fast_path_response(message)
        if fast:
            return fast

        if not config.GROQ_API_KEY:
            return MISSING_KEY_MESSAGE

        if self.index.chunk_count() == 0:
            return (
                "The knowledge base is still loading. Please wait a moment and try again, "
                "or use the website contact page for immediate help."
            )

        plan = self._plan_query(message.strip())
        results = self._retrieve_documents(message.strip(), plan)
        context_chunks = format_context_for_prompt(results)
        system_prompt = build_system_prompt(
            context_chunks,
            retrieval_operation=(plan or {}).get("operation", "general"),
        )
        client = self._get_groq_client()
        if client is None:
            return MISSING_KEY_MESSAGE

        try:
            completion = client.chat.completions.create(
                model=config.LLM_MODEL,
                temperature=config.LLM_TEMPERATURE,
                max_tokens=config.LLM_MAX_TOKENS,
                timeout=60,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message.strip()},
                ],
            )
            content = completion.choices[0].message.content
            return content.strip() if content else FALLBACK_RESPONSE
        except Exception as exc:
            logger.error("Groq API error: %s", type(exc).__name__)
            return FALLBACK_RESPONSE


engine = ChatbotEngine()
