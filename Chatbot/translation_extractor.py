"""
Backward-compatible entry point for website content extraction.

Historically this module used brittle regex over translation files and
hardcoded incomplete service catalogues. It now delegates to
`content_extractor.ContentExtractor`, which:

* Parses portfolio / team / partners / services from current TSX sources
* Loads English translations with improved string parsing
* Emits structured knowledge documents with metadata
* Avoids stale hardcoded business facts as the normal knowledge source
"""

from __future__ import annotations

import logging
from typing import Dict, List, Optional

from content_extractor import ContentExtractor, get_source_based_content

logger = logging.getLogger(__name__)


class TranslationExtractor:
    """Compatibility wrapper around ContentExtractor."""

    def __init__(self, project_root: Optional[str] = None):
        self._extractor = ContentExtractor(project_root=project_root)

    def extract_all_content(self) -> List[Dict[str, str]]:
        documents = self._extractor.extract_all_documents()
        logger.info("Created %s knowledge documents via ContentExtractor", len(documents))
        return documents


def get_translation_based_content() -> List[Dict[str, str]]:
    """
    Main function used by scraper fallback paths.
    Returns structured documents from authoritative website sources.
    """
    return get_source_based_content()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    docs = get_translation_based_content()
    print(f"\nExtracted {len(docs)} documents")
    for doc in docs[:5]:
        meta = doc.get("metadata") or {}
        print(
            f"- {meta.get('document_type')} | {meta.get('entity_id')} | {meta.get('title')}"
        )
