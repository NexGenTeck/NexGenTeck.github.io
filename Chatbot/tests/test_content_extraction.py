"""
Content extraction tests (no embeddings, no network, no servers).

Run inside CI / Hugging Face environments only when explicitly invoked.
These tests were intentionally not executed during the local static audit.
"""

from __future__ import annotations

import os
import sys
import unittest

CHATBOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if CHATBOT_DIR not in sys.path:
    sys.path.insert(0, CHATBOT_DIR)

from content_extractor import (  # noqa: E402
    ContentExtractor,
    get_minimal_emergency_fallback,
)


class ContentExtractionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.extractor = ContentExtractor()
        cls.inventory = cls.extractor.extract_inventory()
        cls.docs = cls.inventory["documents"]
        cls.entity_ids = {
            (d.get("metadata") or {}).get("entity_id")
            for d in cls.docs
            if (d.get("metadata") or {}).get("entity_id")
        }

    def test_src_root_discovered(self):
        self.assertIsNotNone(self.extractor.src_root)

    def test_fingerprint_is_stable(self):
        fp1 = self.extractor.compute_content_fingerprint()
        fp2 = ContentExtractor().compute_content_fingerprint()
        self.assertEqual(fp1, fp2)
        self.assertEqual(len(fp1), 64)

    def test_required_document_types_present(self):
        types = {(d.get("metadata") or {}).get("document_type") for d in self.docs}
        for required in {
            "service",
            "portfolio_project",
            "team_member",
            "partner",
            "pricing",
            "contact",
            "company_overview",
            "company_metric",
        }:
            self.assertIn(required, types)

    def test_nine_services_including_ai(self):
        service_ids = {
            (d.get("metadata") or {}).get("entity_id")
            for d in self.docs
            if (d.get("metadata") or {}).get("document_type") == "service"
        }
        self.assertEqual(len(service_ids), 9)
        self.assertIn("service-artificial-intelligence", service_ids)
        self.assertEqual(
            service_ids,
            {f"service-{service['slug']}" for service in self.extractor.extract_service_catalogue()},
        )

    def test_portfolio_projects(self):
        expected = {
            "portfolio-trackit",
            "portfolio-swift-translate-pro",
            "portfolio-tiktok-downloader",
            "portfolio-t-downloader-app",
            "portfolio-ai-property-booking-concierge",
            "portfolio-digital-campaign",
        }
        self.assertTrue(expected.issubset(self.entity_ids))
        # Stale home-preview projects must not appear as portfolio_project entities
        stale = {
            "portfolio-global-ecommerce",
            "portfolio-corporate-redesign",
            "portfolio-fitness-app",
            "portfolio-food-delivery",
        }
        self.assertFalse(stale & self.entity_ids)

    def test_team_members_and_roles(self):
        expected_names = {
            "Muhammad Kaleem",
            "Muhammad Hasaan",
            "Kashif Khan",
            "Asma Masood",
            "Waiz Hussain",
            "Subhana Zaki",
            "Irfan Iqbal",
            "Sana Arif",
            "Anum Ejaz",
        }
        team_docs = [
            d
            for d in self.docs
            if (d.get("metadata") or {}).get("document_type") == "team_member"
        ]
        names = {(d.get("metadata") or {}).get("title") for d in team_docs}
        self.assertEqual(expected_names, names)
        ceo = next(d for d in team_docs if d["metadata"]["title"] == "Muhammad Kaleem")
        self.assertIn("Founder & CEO", ceo["content"])
        self.assertEqual(ceo["metadata"].get("hierarchy"), "ceo")

    def test_partners(self):
        expected = {
            "partner-medicare-pharma",
            "partner-saifee-labs",
            "partner-urban-healthcare",
        }
        self.assertTrue(expected.issubset(self.entity_ids))

    def test_contact_information(self):
        contact = next(
            d
            for d in self.docs
            if (d.get("metadata") or {}).get("document_type") == "contact"
        )
        self.assertIn("info@nexgenteck.com", contact["content"])
        self.assertIn("+92 300 927 0131", contact["content"])
        self.assertIn("Karachi", contact["content"])

    def test_current_metrics_not_stale(self):
        metric = next(
            d
            for d in self.docs
            if (d.get("metadata") or {}).get("document_type") == "company_metric"
        )
        self.assertIn("15+", metric["content"])
        self.assertIn("10+", metric["content"])
        self.assertIn("9+", metric["content"])
        self.assertIn("3+", metric["content"])
        self.assertNotIn("500+ Projects Completed", metric["content"])
        self.assertNotIn("200+ Happy Clients", metric["content"])

    def test_pricing_present(self):
        pricing = [
            d
            for d in self.docs
            if (d.get("metadata") or {}).get("document_type") == "pricing"
        ]
        self.assertTrue(pricing)
        joined = "\n".join(d["content"] for d in pricing)
        self.assertIn("USD", joined)
        # Stale chatbot pricing must not appear
        self.assertNotIn("Basic Package: $1,499", joined)

    def test_public_translation_groups_are_language_specific(self):
        localized = [
            d for d in self.docs if (d.get("metadata") or {}).get("translation_group")
        ]
        languages = {(d.get("metadata") or {}).get("language") for d in localized}
        # The website currently publishes these non-English translations.
        for language in {"ur", "ar", "de", "es", "fr", "ja", "bn"}:
            self.assertIn(language, languages)
        self.assertTrue(all((d.get("metadata") or {}).get("entity_id", "").startswith("localized-") for d in localized))

    def test_validation_passes(self):
        result = self.extractor.validate_documents(self.docs)
        self.assertTrue(result["ok"], result.get("errors"))

    def test_emergency_fallback_is_minimal(self):
        docs = get_minimal_emergency_fallback()
        self.assertEqual(len(docs), 1)
        self.assertTrue((docs[0].get("metadata") or {}).get("is_fallback"))
        self.assertNotIn("TrackIT", docs[0]["content"])
        self.assertNotIn("Muhammad Kaleem", docs[0]["content"])


if __name__ == "__main__":
    unittest.main()
