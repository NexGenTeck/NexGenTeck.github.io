"""
HF Space content extraction tests (no embeddings / network).
Not executed during the local static audit.
"""

from __future__ import annotations

import os
import sys
import unittest

HF_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if HF_ROOT not in sys.path:
    sys.path.insert(0, HF_ROOT)

from chatbot_core.content_extractor import (  # noqa: E402
    CONTENT_VERSION_FILES,
    ContentExtractor,
    resolve_src_root,
)


class HFContentExtractionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.extractor = ContentExtractor(project_root=HF_ROOT)
        cls.inventory = cls.extractor.extract_inventory()
        cls.entity_ids = {
            (d.get("metadata") or {}).get("entity_id")
            for d in cls.inventory["documents"]
        }

    def test_sources_available(self):
        self.assertIsNotNone(self.extractor.src_root)

    def test_direct_source_root_is_supported(self):
        direct_src_root = os.path.join(HF_ROOT, "website_sources", "src")
        self.assertEqual(resolve_src_root(direct_src_root), direct_src_root)

    def test_core_entities(self):
        for entity in [
            "service-artificial-intelligence",
            "portfolio-trackit",
            "team-muhammad-kaleem",
            "partner-medicare-pharma",
            "contact-nexgenteck",
        ]:
            self.assertIn(entity, self.entity_ids)

    def test_validation(self):
        result = self.extractor.validate_documents(self.inventory["documents"])
        self.assertTrue(result["ok"], result.get("errors"))

    def test_non_english_translation_documents_are_present(self):
        docs = self.inventory["documents"]
        languages = {
            (doc.get("metadata") or {}).get("language")
            for doc in docs
            if (doc.get("metadata") or {}).get("translation_group")
        }
        self.assertIn("ur", languages)
        self.assertIn("ar", languages)

    def test_snapshot_matches_monorepo_when_checked_out_together(self):
        """CI catches a stale Space source bundle without requiring model loading."""
        repo_root = os.path.abspath(os.path.join(HF_ROOT, ".."))
        source_root = os.path.join(repo_root, "src")
        if not os.path.isdir(source_root):
            self.skipTest("Standalone Space checkout has no monorepo source directory")
        bundled_root = os.path.join(HF_ROOT, "website_sources", "src")
        for relative in CONTENT_VERSION_FILES:
            with open(os.path.join(source_root, *relative.split("/")), "rb") as source, open(
                os.path.join(bundled_root, *relative.split("/")), "rb"
            ) as snapshot:
                self.assertEqual(
                    source.read().replace(b"\r\n", b"\n").strip(),
                    snapshot.read().replace(b"\r\n", b"\n").strip(),
                    relative,
                )


if __name__ == "__main__":
    unittest.main()
