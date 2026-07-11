"""
Website scraper for knowledge ingestion.

Preferred order:
1. Authoritative repository / bundled source extraction
2. Live rendered-site crawl (Selenium) when allowed
3. Minimal emergency fallback only when all else fails
"""

from __future__ import annotations

from bs4 import BeautifulSoup
from typing import Dict, List, Set
from urllib.parse import urljoin, urlparse
import logging
import os

from config import config
from utils import clean_text, chunk_text

logger = logging.getLogger(__name__)


class WebsiteScraper:
    """Build chatbot knowledge documents from source files and/or live site."""

    def __init__(self, base_url: str = None):
        self.base_url = (base_url or config.WEBSITE_URL).rstrip("/")
        self.visited_urls: Set[str] = set()
        self.documents: List[Dict[str, str]] = []

    def scrape(self, max_pages: int = 100) -> List[Dict[str, str]]:
        """
        Primary ingestion entrypoint.
        Uses source extraction first when enabled / available.
        """
        logger.info("Starting knowledge ingestion for %s", self.base_url)

        if config.USE_SOURCE_EXTRACTOR or config.USE_TRANSLATION_EXTRACTOR:
            try:
                from content_extractor import ContentExtractor

                extractor = ContentExtractor(base_url=self.base_url)
                docs = extractor.extract_all_documents()
                validation = extractor.validate_documents(docs)
                if validation.get("ok") and docs:
                    self.documents = docs
                    logger.info(
                        "Loaded %s structured documents from source extraction (version=%s)",
                        len(docs),
                        (extractor.content_version or "")[:12],
                    )
                    return self.documents
                logger.warning(
                    "Source extraction incomplete: %s",
                    validation.get("errors"),
                )
            except Exception as e:
                logger.warning("Source extraction failed: %s", e)

        if config.ALLOW_LIVE_SCRAPE:
            try:
                self.documents = self.scrape_live_only(max_pages=max_pages)
            except Exception as e:
                logger.error("Rendered scraping failed: %s", e)

        if not self.documents:
            logger.warning("No documents extracted; using minimal emergency fallback")
            from content_extractor import get_minimal_emergency_fallback

            self.documents = get_minimal_emergency_fallback(self.base_url)

        logger.info(
            "Ingestion complete: %s pages visited, %s documents",
            len(self.visited_urls),
            len(self.documents),
        )
        return self.documents

    def scrape_live_only(self, max_pages: int = 100) -> List[Dict[str, str]]:
        """Crawl the live website only (no source extraction)."""
        self.documents = []
        self.visited_urls = set()
        self._crawl_site(max_pages=max_pages)
        return self.documents

    def _crawl_site(self, max_pages: int) -> None:
        """Crawl the site with a JS-capable browser to fully render SPA content."""
        from selenium import webdriver
        from selenium.webdriver.chrome.service import Service as ChromeService
        from selenium.webdriver.chrome.options import Options as ChromeOptions
        from selenium.webdriver.support.ui import WebDriverWait
        from webdriver_manager.chrome import ChromeDriverManager

        base_domain = urlparse(self.base_url).netloc
        queue: List[str] = [self.base_url]

        # Seed known public routes for SPA sites that hide links until render
        for path in (
            "/about",
            "/services",
            "/portfolio",
            "/pricing",
            "/contact",
            "/services/web-development",
            "/services/ecommerce",
            "/services/seo",
            "/services/mobile-app",
            "/services/social-media",
            "/services/software",
            "/services/3d-graphics",
            "/services/video-editing",
            "/services/artificial-intelligence",
        ):
            queue.append(f"{self.base_url}{path}")

        chrome_options = ChromeOptions()
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-extensions")
        chrome_options.add_argument("--remote-debugging-port=9222")

        chrome_bin = os.environ.get("CHROME_BIN")
        chromedriver_path = os.environ.get("CHROMEDRIVER_PATH")
        if chrome_bin:
            chrome_options.binary_location = chrome_bin

        if chromedriver_path:
            service = ChromeService(executable_path=chromedriver_path)
        else:
            service = ChromeService(ChromeDriverManager().install())

        driver = webdriver.Chrome(service=service, options=chrome_options)
        try:
            while queue and len(self.visited_urls) < max_pages:
                url = queue.pop(0)
                if url in self.visited_urls:
                    continue
                self.visited_urls.add(url)
                logger.info("Processing: %s", url)
                try:
                    driver.get(url)
                    WebDriverWait(driver, 30).until(
                        lambda d: d.execute_script("return document.readyState") == "complete"
                    )
                    html = driver.page_source
                except Exception as e:
                    logger.warning("Failed to load %s: %s", url, e)
                    continue

                soup = BeautifulSoup(html, "lxml")
                self._extract_all_content(soup, url)

                for link in soup.find_all("a", href=True):
                    href = link.get("href", "").strip()
                    if not href or href.startswith("mailto:") or href.startswith("tel:"):
                        continue
                    if href.startswith("http://") or href.startswith("https://"):
                        next_url = href
                    else:
                        next_url = urljoin(self.base_url + "/", href.lstrip("/"))
                    parsed = urlparse(next_url)
                    if parsed.netloc != base_domain:
                        continue
                    normalized = parsed._replace(fragment="").geturl()
                    if normalized not in self.visited_urls and normalized not in queue:
                        queue.append(normalized)
        finally:
            driver.quit()

    def _extract_all_content(self, soup: BeautifulSoup, url: str) -> None:
        for element in soup(["script", "style", "noscript", "iframe"]):
            element.decompose()

        title = soup.find("title")
        title_text = clean_text(title.get_text()) if title else ""

        meta_desc = soup.find("meta", {"name": "description"})
        meta_desc_text = meta_desc.get("content", "") if meta_desc else ""

        headings = []
        for h in soup.find_all(["h1", "h2", "h3", "h4", "h5", "h6"]):
            text = clean_text(h.get_text())
            if text and len(text) > 2:
                headings.append(f"[{h.name.upper()}] {text}")

        paragraphs = []
        for p in soup.find_all("p"):
            text = clean_text(p.get_text())
            if text and len(text) > 15:
                paragraphs.append(text)

        list_items = []
        for li in soup.find_all("li"):
            text = clean_text(li.get_text())
            if text and len(text) > 10:
                list_items.append(f"• {text}")

        content_parts = [f"PAGE: {title_text}", f"URL: {url}"]
        if meta_desc_text:
            content_parts.append(f"DESCRIPTION: {meta_desc_text}")
        if headings:
            content_parts.append("SECTIONS:")
            content_parts.extend(headings)
        if paragraphs:
            content_parts.append("CONTENT:")
            content_parts.extend(paragraphs)
        if list_items:
            content_parts.append("FEATURES/ITEMS:")
            content_parts.extend(list_items[:40])

        full_content = "\n\n".join(content_parts)
        if full_content and len(full_content) > 50:
            chunks = chunk_text(full_content, chunk_size=800, overlap=100)
            for i, chunk in enumerate(chunks):
                self.documents.append(
                    {
                        "content": chunk,
                        "metadata": {
                            "source": url,
                            "source_url": url,
                            "title": title_text,
                            "document_type": "page",
                            "chunk_index": i,
                            "total_chunks": len(chunks),
                            "extraction_method": "live_scrape",
                        },
                    }
                )
