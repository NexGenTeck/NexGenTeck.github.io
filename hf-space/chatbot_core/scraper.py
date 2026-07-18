"""
Live website scraper for NexGenTeck RAG knowledge base.
Uses httpx + BeautifulSoup (no Selenium) for Hugging Face CPU Spaces.

Primary knowledge path is source extraction (see content_extractor.py).
This module remains as a secondary enrichment / fallback path.
"""

from __future__ import annotations

import logging
import xml.etree.ElementTree as ET
from typing import Dict, List, Set
from urllib.parse import urljoin, urlparse, urlunparse

import httpx
from bs4 import BeautifulSoup

from chatbot_core.config import config

logger = logging.getLogger(__name__)

SKIP_EXTENSIONS = {
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".svg",
    ".ico",
    ".css",
    ".js",
    ".zip",
    ".mp4",
    ".mp3",
    ".woff",
    ".woff2",
}


def clean_text(text: str) -> str:
    return " ".join(text.split()).strip()


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 100) -> List[str]:
    if len(text) <= chunk_size:
        return [text] if text.strip() else []

    chunks: List[str] = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        if end < len(text):
            for sep in [". ", "! ", "? ", "\n\n", "\n"]:
                last_sep = text[start:end].rfind(sep)
                if last_sep != -1:
                    end = start + last_sep + len(sep)
                    break
        piece = text[start:end].strip()
        if piece:
            chunks.append(piece)
        next_start = end - overlap
        start = next_start if next_start > start else end
    return chunks


def normalize_url(url: str, base_url: str) -> str | None:
    if not url or url.startswith(("mailto:", "tel:", "javascript:", "#")):
        return None

    absolute = urljoin(base_url + "/", url.lstrip("/"))
    parsed = urlparse(absolute)
    if parsed.scheme not in ("http", "https"):
        return None

    base_host = urlparse(base_url).netloc.lower().removeprefix("www.")
    host = parsed.netloc.lower().removeprefix("www.")
    if host != base_host:
        return None

    path_lower = parsed.path.lower()
    for ext in SKIP_EXTENSIONS:
        if path_lower.endswith(ext):
            return None

    cleaned = parsed._replace(fragment="", query="")
    return urlunparse(cleaned)


class WebsiteScraper:
    """Crawl nexgenteck.com and extract text chunks for in-memory RAG."""

    def __init__(self, base_url: str | None = None):
        self.base_url = (base_url or config.WEBSITE_URL).rstrip("/")
        self.visited: Set[str] = set()
        self.documents: List[Dict] = []

    def scrape(self, max_pages: int | None = None) -> List[Dict]:
        """
        Preferred path: structured source extraction, then live scrape.
        """
        if config.USE_SOURCE_EXTRACTOR:
            try:
                from chatbot_core.content_extractor import ContentExtractor

                extractor = ContentExtractor(base_url=self.base_url)
                docs = extractor.extract_all_documents()
                validation = extractor.validate_documents(docs)
                if validation.get("ok") and docs:
                    self.documents = docs
                    logger.info(
                        "Loaded %s structured documents from source extraction",
                        len(docs),
                    )
                    return self.documents
            except Exception as exc:
                logger.warning("Source extraction failed in scraper: %s", exc)

        return self.scrape_live_only(max_pages=max_pages)

    def scrape_live_only(self, max_pages: int | None = None) -> List[Dict]:
        limit = max_pages or config.MAX_PAGES
        logger.info("Starting live scrape of %s (max_pages=%s)", self.base_url, limit)
        self.documents = []
        self.visited = set()

        seed_urls = self._discover_seed_urls()
        logger.info("Live scrape discovered %s seed URLs", len(seed_urls))
        queue: List[str] = []
        for url in seed_urls:
            normalized = normalize_url(url, self.base_url)
            if normalized and normalized not in queue:
                queue.append(normalized)

        if self.base_url not in queue:
            queue.insert(0, self.base_url)

        headers = {
            "User-Agent": "NexGenTeck-Chatbot/1.0 (+https://nexgenteck.com)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        }

        with httpx.Client(
            timeout=config.HTTP_TIMEOUT,
            follow_redirects=True,
            headers=headers,
        ) as client:
            while queue and len(self.visited) < limit:
                url = queue.pop(0)
                if url in self.visited:
                    continue
                self.visited.add(url)
                logger.info("Scraping: %s", url)

                try:
                    response = client.get(url)
                    response.raise_for_status()
                    logger.info(
                        "Fetched %s status=%s bytes=%s",
                        url,
                        response.status_code,
                        len(response.text),
                    )
                    content_type = response.headers.get("content-type", "")
                    if "html" not in content_type and "xml" not in content_type:
                        logger.info(
                            "Skipping %s because content-type is %r",
                            url,
                            content_type,
                        )
                        continue
                    soup = BeautifulSoup(response.text, "lxml")
                except Exception as exc:
                    logger.exception("Failed to fetch %s: %s", url, exc)
                    continue

                self._extract_page_content(soup, url)

                for link in soup.find_all("a", href=True):
                    next_url = normalize_url(link.get("href", "").strip(), self.base_url)
                    if next_url and next_url not in self.visited and next_url not in queue:
                        queue.append(next_url)

        if not self.documents:
            logger.warning("Live scrape produced no documents")

        logger.info(
            "Live scrape complete: %s pages visited, %s chunks",
            len(self.visited),
            len(self.documents),
        )
        return self.documents

    def _discover_seed_urls(self) -> List[str]:
        seeds = [self.base_url]
        sitemap_url = f"{self.base_url}/sitemap.xml"

        try:
            with httpx.Client(timeout=config.HTTP_TIMEOUT, follow_redirects=True) as client:
                response = client.get(sitemap_url)
                logger.info(
                    "Sitemap fetch %s status=%s bytes=%s",
                    sitemap_url,
                    response.status_code,
                    len(response.text),
                )
                if response.status_code == 200 and "<urlset" in response.text:
                    seeds.extend(self._parse_sitemap(response.text))
        except Exception as exc:
            logger.exception("No usable sitemap at %s: %s", sitemap_url, exc)

        common_paths = [
            "/services",
            "/about",
            "/contact",
            "/pricing",
            "/portfolio",
            "/services/web-development",
            "/services/ecommerce",
            "/services/seo",
            "/services/mobile-app",
            "/services/social-media",
            "/services/software",
            "/services/3d-graphics",
            "/services/video-editing",
            "/services/artificial-intelligence",
        ]
        for path in common_paths:
            seeds.append(f"{self.base_url}{path}")

        unique: List[str] = []
        seen: Set[str] = set()
        for seed in seeds:
            normalized = normalize_url(seed, self.base_url) or seed
            if normalized not in seen:
                seen.add(normalized)
                unique.append(normalized)
        logger.info("Seed URL list prepared: %s", unique)
        return unique

    def _parse_sitemap(self, xml_text: str) -> List[str]:
        urls: List[str] = []
        try:
            root = ET.fromstring(xml_text)
        except ET.ParseError:
            return urls

        ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        for loc in root.findall(".//sm:loc", ns):
            if loc.text:
                urls.append(loc.text.strip())
        if not urls:
            for loc in root.findall(".//loc"):
                if loc.text:
                    urls.append(loc.text.strip())
        return urls

    def _extract_page_content(self, soup: BeautifulSoup, url: str) -> None:
        for tag in soup(["script", "style", "noscript", "iframe", "svg"]):
            tag.decompose()

        for selector in ["nav", "footer", "header[role='banner']"]:
            for element in soup.select(selector):
                element.decompose()

        title_tag = soup.find("title")
        title = clean_text(title_tag.get_text()) if title_tag else ""

        meta_desc = soup.find("meta", attrs={"name": "description"})
        meta_description = meta_desc.get("content", "").strip() if meta_desc else ""

        headings: List[str] = []
        for level in ["h1", "h2", "h3", "h4", "h5", "h6"]:
            for heading in soup.find_all(level):
                text = clean_text(heading.get_text())
                if len(text) > 2:
                    headings.append(f"[{level.upper()}] {text}")

        paragraphs = [
            clean_text(p.get_text())
            for p in soup.find_all("p")
            if len(clean_text(p.get_text())) > 15
        ]

        list_items = [
            f"• {clean_text(li.get_text())}"
            for li in soup.find_all("li")
            if len(clean_text(li.get_text())) > 10
        ]

        parts = [f"PAGE: {title}", f"URL: {url}"]
        if meta_description:
            parts.append(f"DESCRIPTION: {meta_description}")
        if headings:
            parts.extend(["SECTIONS:"] + headings)
        if paragraphs:
            parts.extend(["CONTENT:"] + paragraphs)
        if list_items:
            parts.extend(["ITEMS:"] + list_items[:40])

        full_text = "\n\n".join(parts)
        if len(full_text) < 50:
            return

        chunks = chunk_text(full_text, config.CHUNK_SIZE, config.CHUNK_OVERLAP)
        logger.info(
            "Extracted live page content url=%s text_chars=%s chunks=%s",
            url,
            len(full_text),
            len(chunks),
        )
        for index, chunk in enumerate(chunks):
            self.documents.append(
                {
                    "content": chunk,
                    "metadata": {
                        "source": url,
                        "source_url": url,
                        "title": title or url,
                        "document_type": "page",
                        "chunk_index": index,
                        "total_chunks": len(chunks),
                        "extraction_method": "live_scrape",
                    },
                }
            )
