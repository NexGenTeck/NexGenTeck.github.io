"""
Website scraper for comprehensive data ingestion.
Crawls the entire NexGenTeck website and extracts ALL content for the knowledge base.
This is the ONLY source of information for the chatbot.
"""

from bs4 import BeautifulSoup
from typing import List, Dict, Set
from urllib.parse import urljoin, urlparse
import logging
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager

from config import config
from utils import clean_text, chunk_text

logger = logging.getLogger(__name__)


class WebsiteScraper:
    """
    Comprehensive website scraper for building the chatbot's knowledge base.
    Extracts ALL content from the website - this is the source of truth.
    """
    
    def __init__(self, base_url: str = None):
        """
        Initialize the scraper.
        
        Args:
            base_url: Base URL to scrape (defaults to config.WEBSITE_URL)
        """
        self.base_url = base_url or config.WEBSITE_URL
        self.visited_urls: Set[str] = set()
        self.documents: List[Dict[str, str]] = []
        
    def scrape(self, max_pages: int = 100) -> List[Dict[str, str]]:
        """
        Scrape the ENTIRE website and extract ALL content.
        For local development, uses translation files directly.
        For production, scrapes the live website.
        
        Args:
            max_pages: Maximum number of pages to scrape
            
        Returns:
            List of documents with 'content' and 'metadata' keys
        """
        logger.info(f"Starting comprehensive scrape of {self.base_url}")
        
        # If frontend sources are present locally, use translation extractor to get ACTUAL content
        # (works in production containers when repo root is included in the build context).
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
        lang_context = os.path.join(project_root, 'src', 'contexts', 'LanguageContext.tsx')
        if os.path.exists(lang_context):
            logger.info("Frontend sources detected - using translation extractor")
            try:
                from translation_extractor import get_translation_based_content
                self.documents = get_translation_based_content()
                logger.info(f"Loaded {len(self.documents)} documents from translations")
                return self.documents
            except Exception as e:
                logger.warning(f"Translation extractor failed: {e}, falling back to source scraping")

        # For local development without sources, fallback to translation extractor if possible
        if 'localhost' in self.base_url or '127.0.0.1' in self.base_url:
            logger.info("Local development detected - attempting translation extractor")
            try:
                from translation_extractor import get_translation_based_content
                self.documents = get_translation_based_content()
                logger.info(f"Loaded {len(self.documents)} documents from translations")
                return self.documents
            except Exception as e:
                logger.warning(f"Translation extractor failed: {e}, falling back to source scraping")
        
        # Crawl with a JS-capable browser so SPA content is rendered
        try:
            self._crawl_site(max_pages=max_pages)
        except Exception as e:
            logger.error(f"Rendered scraping failed: {e}")

        # If scraping produced nothing, provide a fallback so the bot still works.
        if not self.documents:
            logger.warning("No documents extracted from scraping; falling back to translation/fallback content")
            try:
                from translation_extractor import get_translation_based_content

                self.documents = get_translation_based_content()
                logger.info(f"Loaded {len(self.documents)} documents from translations fallback")
            except Exception as e:
                logger.warning(f"Translation fallback failed: {e}")

            if not self.documents:
                self.documents = self._get_fallback_content()
                
        logger.info(f"Scraped {len(self.visited_urls)} pages, created {len(self.documents)} documents")
        return self.documents
    
    def _crawl_site(self, max_pages: int) -> None:
        """
        Crawl the site with a JS-capable browser to fully render SPA content.
        """
        base_domain = urlparse(self.base_url).netloc
        queue: List[str] = [self.base_url]

        chrome_options = ChromeOptions()
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")

        driver = webdriver.Chrome(
            service=ChromeService(ChromeDriverManager().install()),
            options=chrome_options
        )

        try:
            while queue and len(self.visited_urls) < max_pages:
                url = queue.pop(0)
                if url in self.visited_urls:
                    continue

                self.visited_urls.add(url)
                logger.info(f"Processing: {url}")

                try:
                    driver.get(url)
                    WebDriverWait(driver, 30).until(
                        lambda d: d.execute_script("return document.readyState") == "complete"
                    )
                    html = driver.page_source
                except Exception as e:
                    logger.warning(f"Failed to load {url}: {e}")
                    continue

                soup = BeautifulSoup(html, 'lxml')
                self._extract_all_content(soup, url)

                # Discover new links dynamically from rendered HTML
                for link in soup.find_all('a', href=True):
                    href = link.get('href', '').strip()
                    if not href or href.startswith('mailto:') or href.startswith('tel:'):
                        continue

                    # Preserve GitHub Pages subpaths like "/NGT/" when joining.
                    if href.startswith('http://') or href.startswith('https://'):
                        next_url = href
                    else:
                        next_url = urljoin(self.base_url.rstrip('/') + '/', href.lstrip('/'))
                    parsed = urlparse(next_url)
                    if parsed.netloc != base_domain:
                        continue

                    # Remove fragment to avoid duplicates
                    normalized = parsed._replace(fragment="").geturl()
                    if normalized not in self.visited_urls:
                        queue.append(normalized)
        finally:
            driver.quit()
    
    def _extract_all_content(self, soup: BeautifulSoup, url: str):
        """
        Extract ALL relevant content from a page.
        This is comprehensive - we want all the website information.
        
        Args:
            soup: BeautifulSoup object
            url: URL of the page
        """
        # Remove elements that don't contain useful content
        for element in soup(['script', 'style', 'noscript', 'iframe']):
            element.decompose()
        
        # Extract page title
        title = soup.find('title')
        title_text = clean_text(title.get_text()) if title else ""
        
        # Extract meta description
        meta_desc = soup.find('meta', {'name': 'description'})
        meta_desc_text = meta_desc.get('content', '') if meta_desc else ''
        
        # Extract all headings
        headings = []
        for h in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
            text = clean_text(h.get_text())
            if text and len(text) > 2:
                level = h.name  # h1, h2, etc.
                headings.append(f"[{level.upper()}] {text}")
        
        # Extract all paragraphs
        paragraphs = []
        for p in soup.find_all('p'):
            text = clean_text(p.get_text())
            if text and len(text) > 15:  # Skip very short paragraphs
                paragraphs.append(text)
        
        # Extract list items (services, features, benefits, etc.)
        list_items = []
        for li in soup.find_all('li'):
            text = clean_text(li.get_text())
            if text and len(text) > 10:
                list_items.append(f"• {text}")
        
        # Extract spans and divs with substantial text (for modern websites)
        other_content = []
        for elem in soup.find_all(['span', 'div', 'section', 'article']):
            # Only direct text, not nested
            direct_text = elem.find(string=True, recursive=False)
            if direct_text:
                text = clean_text(str(direct_text))
                if text and len(text) > 30:
                    other_content.append(text)
        
        # Extract table content
        tables = []
        for table in soup.find_all('table'):
            rows = []
            for tr in table.find_all('tr'):
                cells = [clean_text(td.get_text()) for td in tr.find_all(['td', 'th'])]
                if cells:
                    rows.append(' | '.join(cells))
            if rows:
                tables.append('\n'.join(rows))
        
        # Build comprehensive document for this page
        content_parts = []
        
        # Page identification
        content_parts.append(f"PAGE: {title_text}")
        content_parts.append(f"URL: {url}")
        
        if meta_desc_text:
            content_parts.append(f"DESCRIPTION: {meta_desc_text}")
        
        # All headings provide structure
        if headings:
            content_parts.append("SECTIONS:")
            content_parts.extend(headings)
        
        # Main content
        if paragraphs:
            content_parts.append("CONTENT:")
            content_parts.extend(paragraphs)
        
        # Lists contain important features/services
        if list_items:
            content_parts.append("FEATURES/ITEMS:")
            content_parts.extend(list_items[:30])  # Limit to prevent too much
        
        # Other content
        if other_content:
            unique_other = list(set(other_content))[:20]
            content_parts.extend(unique_other)
        
        # Tables
        if tables:
            content_parts.append("TABLE DATA:")
            content_parts.extend(tables[:5])
        
        # Combine all content
        full_content = "\n\n".join(content_parts)
        
        if full_content and len(full_content) > 50:
            # Chunk the content for better retrieval
            chunks = chunk_text(full_content, chunk_size=800, overlap=100)
            
            for i, chunk in enumerate(chunks):
                self.documents.append({
                    'content': chunk,
                    'metadata': {
                        'source': url,
                        'title': title_text,
                        'chunk_index': i,
                        'total_chunks': len(chunks)
                    }
                })
    
    def _get_fallback_content(self) -> List[Dict[str, str]]:
        """
        Return fallback content if scraping fails completely.
        This ensures the chatbot has basic knowledge.
        """
        fallback = [
            {
                'content': """PAGE: NexGenTeck - Digital Solutions Company
URL: https://nexgenteck.com

NexGenTeck is a leading technology company specializing in comprehensive digital solutions. 
We help businesses transform and grow through innovative technology.

OUR COMPLETE SERVICES LIST (8 SERVICES):
1. Web Development - Custom websites, web applications, responsive design
2. Mobile App Development - iOS and Android apps, cross-platform solutions
3. E-commerce Solutions - Online stores, payment integration, inventory management
4. SEO Services - Search engine optimization, content strategy, analytics
5. Social Media Marketing - Brand management, content creation, advertising
6. Software Development - Custom software, enterprise solutions, SaaS platforms
7. 3D Graphics Designing - 3D modeling, animation, product visualization, architectural renders
8. Video Editing - Professional video editing, motion graphics, promotional videos

We use modern technologies including React, Next.js, TypeScript, Node.js, Python, and more.

Contact us for a free consultation to discuss your project requirements.""",
                'metadata': {'source': 'fallback', 'title': 'About NexGenTeck'}
            },
            {
                'content': """PAGE: Our Services
URL: https://nexgenteck.com/services

WEB DEVELOPMENT
We build modern, responsive websites using the latest technologies:
• Custom website design and development
• React and Next.js applications
• E-commerce platforms, Content management systems
• Progressive web apps, Website maintenance and support

MOBILE APP DEVELOPMENT
Native and cross-platform mobile applications for iOS and Android:
• React Native and Flutter development
• Native iOS (Swift) and Android (Kotlin)
• App store optimization, Mobile UI/UX design

E-COMMERCE SOLUTIONS
Complete online store solutions:
• Shopify and WooCommerce development
• Custom e-commerce platforms
• Payment gateway integration, Inventory management

SEO SERVICES
Search engine optimization to boost your online visibility:
• On-page and off-page SEO
• Keyword research and content optimization
• Technical SEO audits, Analytics and reporting

SOCIAL MEDIA MARKETING
Grow your brand presence across social platforms:
• Social media strategy and management
• Content creation and scheduling
• Paid advertising campaigns, Analytics

SOFTWARE DEVELOPMENT
Custom software solutions for your business:
• Enterprise software development
• SaaS platforms and applications
• API development and integration
• Cloud solutions and deployment

3D GRAPHICS DESIGNING
Professional 3D visualization and design:
• 3D modeling and animation
• Product visualization and renders
• Architectural visualization
• Character design and animation

VIDEO EDITING
Professional video production services:
• Video editing and post-production
• Motion graphics and animations
• Promotional and marketing videos
• Social media video content""",
                'metadata': {'source': 'fallback', 'title': 'Services Overview'}
            },
            {
                'content': """PAGE: Contact NexGenTeck
URL: https://nexgenteck.com/contact

Get in touch with our team for your digital transformation needs.

CONTACT INFORMATION:
• Email: info@nexgenteck.com
• Phone: Available on request
• Location: Serving clients globally

HOW WE WORK:
1. Initial Consultation - We discuss your requirements and goals
2. Proposal & Planning - Detailed project plan and timeline
3. Development - Agile development with regular updates
4. Testing & QA - Thorough testing before launch
5. Launch & Support - Deployment and ongoing maintenance

We offer competitive pricing and flexible engagement models.
Contact us today for a free consultation!""",
                'metadata': {'source': 'fallback', 'title': 'Contact Information'}
            }
        ]
        
        logger.info("Using fallback content")
        return fallback
