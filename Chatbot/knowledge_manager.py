"""
Knowledge base lifecycle: extraction, validation, safe reindex, freshness.

Safe reindex strategy:
1. Extract content
2. Validate document set
3. Write to a staging collection
4. Verify staging collection
5. Atomically swap active collection pointer
6. Retain previous collection until swap succeeds; clean up old staging later
"""

from __future__ import annotations

import logging
import time
from typing import Any, Dict, List, Optional

from config import config
from content_extractor import (
    ContentExtractor,
    get_minimal_emergency_fallback,
    get_source_based_content,
)

logger = logging.getLogger(__name__)


REQUIRED_MIN_DOCS = 15


class KnowledgeManager:
    """Coordinates extraction and non-destructive knowledge base updates."""

    def __init__(self, store=None):
        # Lazy import style: accept injected vector store for tests
        if store is None:
            from vector_store import vector_store as default_store

            store = default_store
        self.store = store

    def extract_documents(self, allow_live_scrape: bool = True) -> Dict[str, Any]:
        """
        Build the document set using source-of-truth priority.
        Does not mutate the vector store.
        """
        started = time.time()
        warnings: List[str] = []
        extraction_source = "none"
        documents: List[Dict[str, Any]] = []
        fingerprint = ""
        inventory: Dict[str, Any] = {}

        extractor = ContentExtractor(base_url=config.WEBSITE_URL)
        fingerprint = extractor.compute_content_fingerprint()

        try:
            if config.USE_SOURCE_EXTRACTOR or config.USE_TRANSLATION_EXTRACTOR:
                inventory = extractor.extract_inventory()
                documents = inventory.get("documents") or []
                extraction_source = "source_tsx"
                warnings.extend(inventory.get("warnings") or [])
        except Exception as exc:
            warnings.append(f"Source extraction failed: {exc}")
            logger.exception("Source extraction failed")

        if not documents and allow_live_scrape and config.ALLOW_LIVE_SCRAPE:
            try:
                from scraper import WebsiteScraper

                scraper = WebsiteScraper()
                # Prefer live crawl path without re-entering source extractor loop
                live_docs = scraper.scrape_live_only(max_pages=config.MAX_SCRAPE_PAGES)
                if live_docs:
                    documents = live_docs
                    extraction_source = "live_scrape"
            except Exception as exc:
                warnings.append(f"Live scrape failed: {exc}")
                logger.warning("Live scrape failed: %s", exc)

        if not documents:
            documents = get_minimal_emergency_fallback(config.WEBSITE_URL)
            extraction_source = "emergency_fallback"
            warnings.append("Using minimal emergency fallback content")

        validation = extractor.validate_documents(documents)
        if extraction_source == "emergency_fallback":
            # Emergency fallback intentionally lacks full entities
            validation = {
                "ok": len(documents) > 0,
                "errors": [] if documents else ["Empty emergency fallback"],
                "warnings": warnings,
                "document_count": len(documents),
                "document_counts_by_type": self._count_types(documents),
            }
        elif extraction_source == "live_scrape":
            # Live scrape may not have structured entity IDs; require volume only
            ok = len(documents) >= REQUIRED_MIN_DOCS
            validation = {
                "ok": ok,
                "errors": [] if ok else [f"Live scrape produced only {len(documents)} docs"],
                "warnings": warnings,
                "document_count": len(documents),
                "document_counts_by_type": self._count_types(documents),
            }
        else:
            validation["warnings"] = list(validation.get("warnings") or []) + warnings

        duration = round(time.time() - started, 3)
        return {
            "documents": documents,
            "validation": validation,
            "extraction_source": extraction_source,
            "content_version": fingerprint or inventory.get("content_version", ""),
            "document_counts_by_type": validation.get("document_counts_by_type")
            or self._count_types(documents),
            "warnings": validation.get("warnings") or warnings,
            "duration_seconds": duration,
            "sources_used": inventory.get("sources_used") or [],
        }

    def safe_reindex(
        self,
        force: bool = False,
        allow_live_scrape: bool = True,
    ) -> Dict[str, Any]:
        """
        Non-destructive reindex.
        Never clears the active collection before the replacement is validated.
        """
        started = time.time()
        previous_collection = self.store.get_active_collection_name()
        previous_count = self.store.count()
        previous_version = self.store.get_content_version()

        extraction = self.extract_documents(allow_live_scrape=allow_live_scrape)
        documents = extraction["documents"]
        validation = extraction["validation"]
        content_version = extraction["content_version"]

        if not force and previous_version and content_version and previous_version == content_version:
            if previous_count > 0:
                return {
                    "status": "skipped",
                    "message": "Content fingerprint unchanged; reindex not required",
                    "content_version": content_version,
                    "previous_content_version": previous_version,
                    "documents_generated": len(documents),
                    "documents_indexed": previous_count,
                    "document_counts_by_type": extraction["document_counts_by_type"],
                    "extraction_source": extraction["extraction_source"],
                    "warnings": extraction["warnings"],
                    "failures": [],
                    "duration_seconds": round(time.time() - started, 3),
                    "previous_collection_retained": True,
                    "active_collection": previous_collection,
                    "previous_collection": previous_collection,
                }

        if not validation.get("ok"):
            return {
                "status": "failed",
                "message": "Extraction validation failed; previous knowledge base retained",
                "content_version": content_version,
                "previous_content_version": previous_version,
                "documents_generated": len(documents),
                "documents_indexed": previous_count,
                "document_counts_by_type": extraction["document_counts_by_type"],
                "extraction_source": extraction["extraction_source"],
                "warnings": extraction["warnings"],
                "failures": validation.get("errors") or ["validation failed"],
                "duration_seconds": round(time.time() - started, 3),
                "previous_collection_retained": True,
                "active_collection": previous_collection,
                "previous_collection": previous_collection,
            }

        if extraction["extraction_source"] == "emergency_fallback" and previous_count > 0:
            return {
                "status": "failed",
                "message": "Refusing to replace working knowledge base with emergency fallback",
                "content_version": content_version,
                "previous_content_version": previous_version,
                "documents_generated": len(documents),
                "documents_indexed": previous_count,
                "document_counts_by_type": extraction["document_counts_by_type"],
                "extraction_source": extraction["extraction_source"],
                "warnings": extraction["warnings"],
                "failures": ["emergency_fallback_blocked"],
                "duration_seconds": round(time.time() - started, 3),
                "previous_collection_retained": True,
                "active_collection": previous_collection,
                "previous_collection": previous_collection,
            }

        try:
            result = self.store.replace_documents_safely(
                documents=documents,
                content_version=content_version,
                metadata={
                    "extraction_source": extraction["extraction_source"],
                    "document_counts_by_type": extraction["document_counts_by_type"],
                    "sources_used": extraction.get("sources_used") or [],
                },
            )
        except Exception as exc:
            logger.exception("Safe reindex write failed")
            return {
                "status": "failed",
                "message": f"Indexing failed; previous knowledge base retained: {exc}",
                "content_version": content_version,
                "previous_content_version": previous_version,
                "documents_generated": len(documents),
                "documents_indexed": previous_count,
                "document_counts_by_type": extraction["document_counts_by_type"],
                "extraction_source": extraction["extraction_source"],
                "warnings": extraction["warnings"],
                "failures": [str(exc)],
                "duration_seconds": round(time.time() - started, 3),
                "previous_collection_retained": True,
                "active_collection": previous_collection,
                "previous_collection": previous_collection,
            }

        return {
            "status": "success",
            "message": (
                f"Re-indexed {result.get('indexed_count', 0)} documents "
                f"from {extraction['extraction_source']}"
            ),
            "content_version": content_version,
            "previous_content_version": previous_version,
            "documents_generated": len(documents),
            "documents_indexed": result.get("indexed_count", 0),
            "document_counts_by_type": extraction["document_counts_by_type"],
            "extraction_source": extraction["extraction_source"],
            "warnings": extraction["warnings"],
            "failures": [],
            "duration_seconds": round(time.time() - started, 3),
            "previous_collection_retained": False,
            "active_collection": result.get("active_collection", previous_collection),
            "previous_collection": previous_collection,
            "staging_collection": result.get("staging_collection"),
        }

    def ensure_fresh_on_startup(self) -> Dict[str, Any]:
        """
        Startup freshness check.
        - Empty store: index
        - Fingerprint mismatch: safe reindex
        - Match: skip
        """
        count = self.store.count()
        current_fp = ContentExtractor(base_url=config.WEBSITE_URL).compute_content_fingerprint()
        stored_fp = self.store.get_content_version()

        if count == 0:
            logger.info("Knowledge base empty — performing initial index")
            return self.safe_reindex(force=True)

        if not stored_fp:
            logger.info("No stored content fingerprint — refreshing knowledge base")
            return self.safe_reindex(force=True)

        if stored_fp != current_fp:
            logger.info(
                "Content fingerprint changed (%s -> %s) — refreshing",
                stored_fp[:12],
                current_fp[:12],
            )
            return self.safe_reindex(force=True)

        logger.info(
            "Knowledge base fresh (version=%s, docs=%s) — skip reindex",
            stored_fp[:12],
            count,
        )
        return {
            "status": "skipped",
            "message": "Startup freshness check: content unchanged",
            "content_version": stored_fp,
            "documents_indexed": count,
            "active_collection": self.store.get_active_collection_name(),
        }

    @staticmethod
    def _count_types(documents: List[Dict[str, Any]]) -> Dict[str, int]:
        counts: Dict[str, int] = {}
        for doc in documents:
            dtype = (doc.get("metadata") or {}).get("document_type", "unknown")
            counts[dtype] = counts.get(dtype, 0) + 1
        return counts


knowledge_manager = KnowledgeManager()
