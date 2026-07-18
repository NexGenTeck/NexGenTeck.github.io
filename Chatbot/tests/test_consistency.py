"""
Frontend ↔ chatbot consistency tests using source files only.
"""

from __future__ import annotations

import os
import re
import sys
import unittest

CHATBOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
REPO_ROOT = os.path.abspath(os.path.join(CHATBOT_DIR, ".."))
if CHATBOT_DIR not in sys.path:
    sys.path.insert(0, CHATBOT_DIR)

from content_extractor import CONTENT_VERSION_FILES, ContentExtractor  # noqa: E402


def _read(path: str) -> str:
    with open(path, "r", encoding="utf-8") as handle:
        return handle.read()


class ConsistencyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.extractor = ContentExtractor(project_root=REPO_ROOT)
        cls.inventory = cls.extractor.extract_inventory()
        cls.docs = cls.inventory["documents"]
        cls.by_type = {}
        for doc in cls.docs:
            dtype = (doc.get("metadata") or {}).get("document_type", "unknown")
            cls.by_type.setdefault(dtype, []).append(doc)

    def test_services_count_matches_services_page(self):
        services_path = os.path.join(REPO_ROOT, "src", "pages", "Services.tsx")
        text = _read(services_path)
        slugs = re.findall(r"slug:\s*'([^']+)'", text)
        self.assertEqual(len(slugs), 9)
        self.assertIn("artificial-intelligence", slugs)
        service_docs = self.by_type.get("service", [])
        self.assertEqual(len(service_docs), 9)

    def test_routes_include_ai_service(self):
        routes = _read(os.path.join(REPO_ROOT, "src", "utils", "routes.ts"))
        self.assertIn("services/artificial-intelligence", routes)

    def test_portfolio_matches_portfolio_page(self):
        portfolio = _read(os.path.join(REPO_ROOT, "src", "data", "portfolioData.ts"))
        ids = re.findall(r"id:\s*'([^']+)'", portfolio)
        expected = {
            "trackit",
            "swift-translate-pro",
            "tiktok-downloader",
            "t-downloader-app",
            "ai-property-booking-concierge",
            "digital-campaign",
        }
        self.assertTrue(expected.issubset(set(ids)))
        project_entities = {
            (d.get("metadata") or {}).get("entity_id")
            for d in self.by_type.get("portfolio_project", [])
        }
        for project_id in expected:
            self.assertIn(f"portfolio-{project_id}", project_entities)

    def test_team_matches_about_page(self):
        about = _read(os.path.join(REPO_ROOT, "src", "pages", "About.tsx"))
        for name in [
            "Muhammad Kaleem",
            "Muhammad Hasaan",
            "Kashif Khan",
            "Asma Masood",
            "Waiz Hussain",
            "Subhana Zaki",
            "Irfan Iqbal",
            "Sana Arif",
            "Anum Ejaz",
        ]:
            self.assertIn(name, about)
            self.assertIn(name, "\n".join(d["content"] for d in self.by_type["team_member"]))

    def test_partners_match_about_page(self):
        about = _read(os.path.join(REPO_ROOT, "src", "pages", "About.tsx"))
        for partner in ["Medicare Pharma", "Saifee Labs", "Urban Healthcare"]:
            self.assertIn(partner, about)
            self.assertIn(partner, "\n".join(d["content"] for d in self.by_type["partner"]))

    def test_no_stale_service_count_claim_in_docs(self):
        joined = "\n".join(d["content"] for d in self.docs)
        self.assertNotIn("EXACTLY 8 SERVICES", joined)
        self.assertNotIn("Basic Package: $1,499", joined)

    def test_home_metrics_match(self):
        home = _read(os.path.join(REPO_ROOT, "src", "pages", "Home.tsx"))
        self.assertIn("15+", home)
        self.assertIn("10+", home)
        self.assertIn("9+", home)
        self.assertIn("3+", home)
        metric_text = "\n".join(d["content"] for d in self.by_type["company_metric"])
        self.assertIn("15+", metric_text)
        self.assertIn("10+", metric_text)

    def test_bundled_sources_match_authoritative_website_sources(self):
        """A standalone deployment must not silently ship an older TSX snapshot."""
        bundled_root = os.path.join(CHATBOT_DIR, "website_sources", "src")
        for relative in CONTENT_VERSION_FILES:
            authoritative = os.path.join(REPO_ROOT, "src", *relative.split("/"))
            bundled = os.path.join(bundled_root, *relative.split("/"))
            self.assertTrue(os.path.isfile(bundled), relative)
            with open(authoritative, "rb") as source, open(bundled, "rb") as snapshot:
                self.assertEqual(source.read().strip(), snapshot.read().strip(), relative)


if __name__ == "__main__":
    unittest.main()
