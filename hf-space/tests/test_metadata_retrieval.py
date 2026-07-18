"""Metadata-driven retrieval tests that do not load models or call Groq."""

from __future__ import annotations

import os
import sys
import unittest
import json
import types
from unittest.mock import Mock


HF_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if HF_ROOT not in sys.path:
    sys.path.insert(0, HF_ROOT)

# Metadata tests do not need the Space runtime dependency used only to load
# optional environment files.
if "dotenv" not in sys.modules:
    dotenv = types.ModuleType("dotenv")
    dotenv.load_dotenv = lambda: False
    sys.modules["dotenv"] = dotenv

if "numpy" not in sys.modules:
    numpy = types.ModuleType("numpy")
    numpy.ndarray = object
    numpy.float32 = object()
    sys.modules["numpy"] = numpy

from chatbot_core.content_extractor import ContentExtractor  # noqa: E402
from chatbot_core.config import config  # noqa: E402
from chatbot_core.rag import ChatbotEngine, InMemoryVectorIndex  # noqa: E402


class MetadataRetrievalTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        inventory = ContentExtractor(project_root=HF_ROOT).extract_inventory()
        cls.documents = inventory["documents"]
        cls.service_documents = [
            document
            for document in cls.documents
            if (document.get("metadata") or {}).get("document_type") == "service"
        ]

    @staticmethod
    def _index_from_documents(documents):
        """Populate metadata only; list retrieval must not need embeddings."""
        index = InMemoryVectorIndex()
        index._contents = [document["content"] for document in documents]
        index._metadata = [dict(document.get("metadata") or {}) for document in documents]
        return index

    def test_document_types_are_discovered_from_index_metadata(self):
        index = self._index_from_documents(self.documents)
        expected = sorted(
            {
                document["metadata"]["document_type"]
                for document in self.documents
                if document.get("metadata", {}).get("document_type")
            }
        )
        self.assertEqual(index.available_document_types(), expected)

    def test_list_retrieval_returns_every_current_service_without_top_k(self):
        index = self._index_from_documents(self.documents)
        results = index.documents_by_type("service")
        expected_ids = [
            document["metadata"]["entity_id"]
            for document in self.service_documents
        ]
        returned_ids = [metadata["entity_id"] for _, _, metadata in results]
        self.assertEqual(returned_ids, expected_ids)

    def test_list_retrieval_deduplicates_by_entity_id_in_source_order(self):
        duplicate = dict(self.service_documents[0])
        duplicate["metadata"] = dict(duplicate["metadata"])
        index = self._index_from_documents([*self.service_documents, duplicate])
        results = index.documents_by_type("service")
        self.assertEqual(len(results), len(self.service_documents))

    def test_extracted_service_records_drive_complete_list_coverage(self):
        index = self._index_from_documents(self.documents)
        source_entities = {
            document["metadata"]["entity_id"] for document in self.service_documents
        }
        listed_entities = {
            metadata["entity_id"]
            for _, _, metadata in index.documents_by_type("service")
        }
        self.assertEqual(listed_entities, source_entities)

    def test_planner_rejects_unknown_document_type(self):
        available = self._index_from_documents(self.documents).available_document_types()
        plan = ChatbotEngine._parse_query_plan(
            '{"operation":"list","document_type":"unknown_type","entity_query":null}',
            available,
        )
        self.assertIsNone(plan)

    def test_planner_rejects_unexpected_schema_keys(self):
        available = self._index_from_documents(self.documents).available_document_types()
        plan = ChatbotEngine._parse_query_plan(
            json.dumps(
                {
                    "operation": "general",
                    "document_type": None,
                    "entity_query": None,
                    "unsupported": True,
                }
            ),
            available,
        )
        self.assertIsNone(plan)

    def test_planner_accepts_only_live_document_types(self):
        available = self._index_from_documents(self.documents).available_document_types()
        plan = ChatbotEngine._parse_query_plan(
            json.dumps(
                {
                    "operation": "list",
                    "document_type": available[0],
                    "entity_query": None,
                }
            ),
            available,
        )
        self.assertEqual(plan["document_type"], available[0])
        self.assertEqual(plan["operation"], "list")

    def test_invalid_plan_uses_general_semantic_retrieval(self):
        engine = ChatbotEngine()
        engine.index.search = Mock(return_value=[])
        engine._retrieve_documents("current offerings", None)
        engine.index.search.assert_called_once_with(
            "current offerings",
            top_k=config.TOP_K,
        )

    def test_type_focused_search_passes_metadata_filter(self):
        engine = ChatbotEngine()
        engine.index.search = Mock(return_value=[])
        document_type = self._index_from_documents(self.documents).available_document_types()[0]
        engine._retrieve_documents(
            "an entity",
            {
                "operation": "search",
                "document_type": document_type,
                "entity_query": "an entity",
            },
        )
        engine.index.search.assert_called_once_with(
            "an entity",
            top_k=config.TOP_K,
            document_type=document_type,
        )

    def test_build_index_refuses_emergency_fallback_on_cold_start(self):
        engine = ChatbotEngine()
        fallback_doc = {
            "content": "WARNING: Authoritative website content could not be loaded.",
            "metadata": {
                "document_type": "company_overview",
                "entity_id": "emergency-fallback",
                "is_fallback": True,
            },
        }
        engine._extract_documents = Mock(
            return_value={
                "documents": [fallback_doc],
                "extraction_source": "emergency_fallback",
                "content_version": "missing-src",
                "pages_visited": 0,
                "warnings": ["Using minimal emergency fallback"],
                "sources_used": [],
                "document_counts_by_type": {"company_overview": 1},
            }
        )

        result = engine.build_index(force=True)

        self.assertFalse(result["ok"])
        self.assertEqual(result["status"], "failed")
        self.assertIn("refusing to index emergency fallback", result["message"])
        self.assertEqual(engine.index.chunk_count(), 0)
        self.assertFalse(engine.index.has_authoritative_content())


if __name__ == "__main__":
    unittest.main()
