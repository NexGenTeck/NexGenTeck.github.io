"""
Deployment-friendly reindex entrypoint.

Usage (inside the deployed environment only — do not run during local static audits):

    python -m Chatbot.reindex
    python reindex.py
    python reindex.py --force

This module intentionally performs side effects only when executed as a script.
Importing it does not reindex.
"""

from __future__ import annotations

import argparse
import json
import logging
import sys


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Safely reindex NexGenTeck chatbot knowledge")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force reindex even when content fingerprint is unchanged",
    )
    parser.add_argument(
        "--no-live-scrape",
        action="store_true",
        help="Disable live website scrape fallback",
    )
    args = parser.parse_args(argv)

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

    from knowledge_manager import KnowledgeManager

    manager = KnowledgeManager()
    result = manager.safe_reindex(
        force=args.force,
        allow_live_scrape=not args.no_live_scrape,
    )
    print(json.dumps(result, indent=2, default=str))
    return 0 if result.get("status") in {"success", "skipped"} else 1


if __name__ == "__main__":
    sys.exit(main())
