"""
Reindex safety and authorization tests using mocks (no models / Qdrant / network).
"""

from __future__ import annotations

import os
import sys
import unittest
from unittest.mock import patch

CHATBOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if CHATBOT_DIR not in sys.path:
    sys.path.insert(0, CHATBOT_DIR)


class FakeStore:
    def __init__(self):
        self._count = 5
        self._version = "abc"
        self._collection = "nexgenteck_knowledge"
        self.replaced = None

    def count(self):
        return self._count

    def get_content_version(self):
        return self._version

    def get_active_collection_name(self):
        return self._collection

    def replace_documents_safely(self, documents, content_version, metadata=None):
        self.replaced = {
            "documents": documents,
            "content_version": content_version,
            "metadata": metadata,
        }
        self._count = len(documents)
        self._version = content_version
        self._collection = "nexgenteck_knowledge__staging_1"
        return {
            "indexed_count": len(documents),
            "active_collection": self._collection,
            "staging_collection": self._collection,
            "previous_collection": "nexgenteck_knowledge",
        }


class ReindexBehaviorTests(unittest.TestCase):
    def test_skips_when_fingerprint_unchanged(self):
        from knowledge_manager import KnowledgeManager

        store = FakeStore()
        manager = KnowledgeManager(store=store)

        sample_docs = [
            {
                "content": "x" * 50,
                "metadata": {
                    "document_type": "service",
                    "entity_id": "service-web-development",
                },
            }
        ]
        with patch.object(
            manager,
            "extract_documents",
            return_value={
                "documents": sample_docs,
                "validation": {"ok": True, "errors": [], "warnings": []},
                "extraction_source": "source_tsx",
                "content_version": "abc",
                "document_counts_by_type": {"service": 1},
                "warnings": [],
                "sources_used": [],
                "duration_seconds": 0.1,
            },
        ):
            result = manager.safe_reindex(force=False)
        self.assertEqual(result["status"], "skipped")
        self.assertTrue(result["previous_collection_retained"])
        self.assertIsNone(store.replaced)

    def test_retains_previous_on_validation_failure(self):
        from knowledge_manager import KnowledgeManager

        store = FakeStore()
        manager = KnowledgeManager(store=store)
        with patch.object(
            manager,
            "extract_documents",
            return_value={
                "documents": [],
                "validation": {"ok": False, "errors": ["empty"], "warnings": []},
                "extraction_source": "source_tsx",
                "content_version": "new",
                "document_counts_by_type": {},
                "warnings": [],
                "sources_used": [],
                "duration_seconds": 0.1,
            },
        ):
            result = manager.safe_reindex(force=True)
        self.assertEqual(result["status"], "failed")
        self.assertTrue(result["previous_collection_retained"])
        self.assertIsNone(store.replaced)

    def test_blocks_emergency_fallback_override(self):
        from knowledge_manager import KnowledgeManager

        store = FakeStore()
        manager = KnowledgeManager(store=store)
        with patch.object(
            manager,
            "extract_documents",
            return_value={
                "documents": [
                    {
                        "content": "fallback",
                        "metadata": {"document_type": "company_overview"},
                    }
                ],
                "validation": {"ok": True, "errors": [], "warnings": []},
                "extraction_source": "emergency_fallback",
                "content_version": "new",
                "document_counts_by_type": {"company_overview": 1},
                "warnings": [],
                "sources_used": [],
                "duration_seconds": 0.1,
            },
        ):
            result = manager.safe_reindex(force=True)
        self.assertEqual(result["status"], "failed")
        self.assertIn("emergency", result["message"].lower())
        self.assertTrue(result["previous_collection_retained"])

    def test_successful_reindex_swaps(self):
        from knowledge_manager import KnowledgeManager

        store = FakeStore()
        manager = KnowledgeManager(store=store)
        docs = [
            {
                "content": "y" * 50,
                "metadata": {
                    "document_type": "service",
                    "entity_id": "service-ai",
                },
            }
        ]
        with patch.object(
            manager,
            "extract_documents",
            return_value={
                "documents": docs,
                "validation": {"ok": True, "errors": [], "warnings": []},
                "extraction_source": "source_tsx",
                "content_version": "new-version",
                "document_counts_by_type": {"service": 1},
                "warnings": [],
                "sources_used": ["pages/Services.tsx"],
                "duration_seconds": 0.1,
            },
        ):
            result = manager.safe_reindex(force=True)
        self.assertEqual(result["status"], "success")
        self.assertEqual(store.replaced["content_version"], "new-version")
        self.assertFalse(result["previous_collection_retained"])

    def test_retains_previous_on_vector_write_failure(self):
        from knowledge_manager import KnowledgeManager

        class FailingStore(FakeStore):
            def replace_documents_safely(self, documents, content_version, metadata=None):
                raise RuntimeError("Qdrant write failed")

        store = FailingStore()
        manager = KnowledgeManager(store=store)
        with patch.object(
            manager,
            "extract_documents",
            return_value={
                "documents": [{"content": "z" * 50, "metadata": {"document_type": "service"}}],
                "validation": {"ok": True, "errors": [], "warnings": []},
                "extraction_source": "source_tsx",
                "content_version": "new-version",
                "document_counts_by_type": {"service": 1},
                "warnings": [],
                "sources_used": [],
                "duration_seconds": 0.1,
            },
        ):
            result = manager.safe_reindex(force=True)
        self.assertEqual(result["status"], "failed")
        self.assertTrue(result["previous_collection_retained"])
        self.assertEqual(store.get_active_collection_name(), "nexgenteck_knowledge")

    def test_changed_fingerprint_replaces_active_collection(self):
        from knowledge_manager import KnowledgeManager

        store = FakeStore()
        manager = KnowledgeManager(store=store)
        with patch.object(
            manager,
            "extract_documents",
            return_value={
                "documents": [{"content": "z" * 50, "metadata": {"document_type": "service"}}],
                "validation": {"ok": True, "errors": [], "warnings": []},
                "extraction_source": "source_tsx",
                "content_version": "changed-version",
                "document_counts_by_type": {"service": 1},
                "warnings": [],
                "sources_used": [],
                "duration_seconds": 0.1,
            },
        ):
            result = manager.safe_reindex(force=False)
        self.assertEqual(result["status"], "success")
        self.assertEqual(store.get_content_version(), "changed-version")


class ReindexAuthTests(unittest.TestCase):
    def test_authorize_rejects_wrong_secret(self):
        from auth_utils import authorize_reindex

        ok, code, _ = authorize_reindex(
            expected_secret="expected-secret",
            authorization=None,
            x_reindex_secret="wrong",
            client_host="1.2.3.4",
        )
        self.assertFalse(ok)
        self.assertEqual(code, 401)

    def test_authorize_accepts_matching_secret(self):
        from auth_utils import authorize_reindex

        ok, code, _ = authorize_reindex(
            expected_secret="expected-secret",
            authorization="Bearer expected-secret",
            x_reindex_secret=None,
            client_host="1.2.3.4",
        )
        self.assertTrue(ok)
        self.assertEqual(code, 200)

    def test_authorize_blocks_remote_without_secret(self):
        from auth_utils import authorize_reindex

        ok, code, _ = authorize_reindex(
            expected_secret="",
            authorization=None,
            x_reindex_secret=None,
            client_host="8.8.8.8",
        )
        self.assertFalse(ok)
        self.assertEqual(code, 403)

    def test_authorize_allows_local_without_secret(self):
        from auth_utils import authorize_reindex

        ok, code, _ = authorize_reindex(
            expected_secret="",
            authorization=None,
            x_reindex_secret=None,
            client_host="127.0.0.1",
        )
        self.assertTrue(ok)
        self.assertEqual(code, 200)


if __name__ == "__main__":
    unittest.main()
