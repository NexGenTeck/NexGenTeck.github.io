"""
Translation-aware website content extractor.
Parses the actual translation files to build a comprehensive knowledge base
with REAL content instead of translation keys.
"""

import os
import re
import logging
from typing import Dict, List, Tuple

logger = logging.getLogger(__name__)


class TranslationExtractor:
    """
    Extracts actual translated content from the translation files.
    This ensures the chatbot has real text, not translation keys.
    """
    
    def __init__(self, project_root: str = None):
        """
        Initialize the extractor.
        
        Args:
            project_root: Root directory of the project (defaults to parent of Chatbot/)
        """
        if project_root is None:
            project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
        self.project_root = project_root
        self.translations: Dict[str, str] = {}
        
    def extract_all_content(self) -> List[Dict[str, str]]:
        """
        Extract all website content from translation files.
        Returns documents ready for the vector store.
        """
        documents = []
        
        self._load_language_context_translations()
        self._load_service_translations()
        
        logger.info(f"Loaded {len(self.translations)} translation keys")
        
        documents.extend(self._create_service_documents())
        documents.extend(self._create_general_documents())
        documents.extend(self._create_company_documents())
        
        logger.info(f"Created {len(documents)} knowledge documents")
        return documents
    
    def _load_language_context_translations(self):
        """Load translations from LanguageContext.tsx (English section)."""
        lang_context_path = os.path.join(
            self.project_root, 'src', 'contexts', 'LanguageContext.tsx'
        )
        
        if not os.path.exists(lang_context_path):
            logger.warning(f"LanguageContext.tsx not found at {lang_context_path}")
            return
            
        try:
            with open(lang_context_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            pattern = r"['\"]([a-zA-Z0-9_.]+)['\"]:\s*['\"]([^'\"]+)['\"]"
            
            english_section = self._extract_english_section(content)
            
            matches = re.findall(pattern, english_section)
            for key, value in matches:
                if key and value and not key.startswith('//'):
                    self.translations[key] = value
                    
            logger.info(f"Loaded {len(matches)} translations from LanguageContext.tsx")
            
        except Exception as e:
            logger.error(f"Error loading LanguageContext.tsx: {e}")
    
    def _extract_english_section(self, content: str) -> str:
        """Extract the English translations section from the file."""

        start_patterns = [
            r"const\s+translations\s*[=:]\s*{",
            r"translations\s*=\s*{",
            r"en:\s*{"
        ]
        
        start_idx = 0
        for pattern in start_patterns:
            match = re.search(pattern, content)
            if match:
                start_idx = match.end()
                break
        
        end_patterns = [
            r"\n\s*ur:\s*{",
            r"\n\s*ko:\s*{", 
            r"\n\s*zh:\s*{",
            r"\n\s*ar:\s*{",
            r"}\s*,\s*\n\s*[a-z]{2}:\s*{"
        ]
        
        end_idx = len(content)
        for pattern in end_patterns:
            match = re.search(pattern, content[start_idx:])
            if match:
                end_idx = start_idx + match.start()
                break
        
        return content[start_idx:end_idx]
    
    def _load_service_translations(self):
        """Load translations from serviceTranslations.ts."""
        service_trans_path = os.path.join(
            self.project_root, 'src', 'translations', 'serviceTranslations.ts'
        )
        
        if not os.path.exists(service_trans_path):
            logger.warning(f"serviceTranslations.ts not found")
            return
            
        try:
            with open(service_trans_path, 'r', encoding='utf-8') as f:
                content = f.read()
            

            pattern = r"['\"]([a-zA-Z0-9_.]+)['\"]:\s*['\"]([^'\"]+)['\"]"

            if 'en:' in content or 'en :' in content:
                section = self._extract_section_by_lang(content, 'en')
            else:

                pass
                
        except Exception as e:
            logger.error(f"Error loading serviceTranslations.ts: {e}")
    
    def _extract_section_by_lang(self, content: str, lang: str) -> str:
        """Extract a specific language section."""
        pattern = rf"\b{lang}\s*:\s*{{"
        match = re.search(pattern, content)
        if not match:
            return ""
        
        start = match.end()
        brace_count = 1
        end = start
        
        while end < len(content) and brace_count > 0:
            if content[end] == '{':
                brace_count += 1
            elif content[end] == '}':
                brace_count -= 1
            end += 1
            
        return content[start:end-1]
    
    def _get_translation(self, key: str, default: str = "") -> str:
        """Get a translation value by key."""
        return self.translations.get(key, default)
    
    def _create_service_documents(self) -> List[Dict[str, str]]:
        """Create comprehensive documents for each service."""
        documents = []
        
        services = [
            {
                'id': 'web',
                'name': 'Web Development',
                'slug': 'web-development',
                'description': 'Custom websites that engage visitors and drive business growth'
            },
            {
                'id': 'ecommerce',
                'name': 'E-commerce Solutions',
                'slug': 'ecommerce',
                'description': 'Complete online store solutions to sell products worldwide'
            },
            {
                'id': 'seo',
                'name': 'Search Engine Optimization (SEO)',
                'slug': 'seo',
                'description': 'Rank higher and attract more organic traffic'
            },
            {
                'id': 'mobile',
                'name': 'Mobile App Development',
                'slug': 'mobile-app',
                'description': 'Native and cross-platform apps for iOS and Android'
            },
            {
                'id': 'social',
                'name': 'Social Media Marketing',
                'slug': 'social-media',
                'description': 'SEO, PPC, and social media strategies that deliver results'
            },
            {
                'id': 'software',
                'name': 'Software Development',
                'slug': 'software',
                'description': 'Custom software solutions for your business needs'
            },
            {
                'id': '3dgraphics',
                'name': '3D Graphics Designing',
                'slug': '3d-graphics',
                'description': 'Transform ideas into stunning 3D visuals'
            },
            {
                'id': 'videoediting',
                'name': 'Video Editing',
                'slug': 'video-editing',
                'description': 'Professional video editing that captivates audiences'
            }
        ]
        
        for service in services:
            doc = self._build_service_document(service)
            if doc:
                documents.append(doc)
                
        return documents
    
    def _build_service_document(self, service: Dict) -> Dict[str, str]:
        """Build a comprehensive document for a single service."""
        service_id = service['id']
        prefix = f"services.{service_id}"
        
        title = self._get_translation(f'{prefix}.title', service['name'])
        subtitle = self._get_translation(f'{prefix}.subtitle', service['description'])
        description = self._get_translation(f'{prefix}.description', '')
        
        features = []
        for i in range(1, 13):
            feat = self._get_translation(f'{prefix}.feature{i}', '')
            if feat:
                features.append(f"• {feat}")
        
        benefits = []
        for i in range(1, 7):
            ben = self._get_translation(f'{prefix}.benefit{i}', '')
            if ben:
                benefits.append(f"• {ben}")
        
        packages = []
        for i in range(1, 4):
            pkg_name = self._get_translation(f'{prefix}.package{i}.name', '')
            pkg_features = self._get_translation(f'{prefix}.package{i}.features', '')
            if pkg_name:
                packages.append(f"{pkg_name}: {pkg_features}")
        
        faqs = []
        for i in range(1, 6):
            q = self._get_translation(f'{prefix}.faq{i}.q', '')
            a = self._get_translation(f'{prefix}.faq{i}.a', '')
            if q and a:
                faqs.append(f"Q: {q}\nA: {a}")
        
        process_steps = []
        for i in range(1, 5):
            step_title = self._get_translation(f'{prefix}.process{i}.title', '')
            step_desc = self._get_translation(f'{prefix}.process{i}.desc', '')
            if step_title:
                process_steps.append(f"{i}. {step_title}: {step_desc}")
        
        content_parts = [
            f"SERVICE: {title}",
            f"URL: https://nexgenteck.com/services/{service['slug']}",
            "",
            f"OVERVIEW: {subtitle}",
            "",
            description if description else f"NexGenTeck offers professional {title.lower()} services.",
        ]
        
        if features:
            content_parts.append("\nKEY FEATURES:")
            content_parts.extend(features)
        
        if benefits:
            content_parts.append("\nBENEFITS:")
            content_parts.extend(benefits)
        
        if packages:
            content_parts.append("\nPRICING PACKAGES:")
            content_parts.extend(packages)
        
        if process_steps:
            content_parts.append("\nOUR PROCESS:")
            content_parts.extend(process_steps)
        
        if faqs:
            content_parts.append("\nFREQUENTLY ASKED QUESTIONS:")
            content_parts.extend(faqs)
        
        content = "\n".join(content_parts)
        
        return {
            'content': content,
            'metadata': {
                'source': f"service_{service_id}",
                'title': title,
                'type': 'service',
                'url': f"/services/{service['slug']}"
            }
        }
    
    def _create_general_documents(self) -> List[Dict[str, str]]:
        """Create documents for general website content."""
        documents = []
        
        services_overview = """
PAGE: Our Services - NexGenTeck
URL: https://nexgenteck.com/services

NexGenTeck provides a comprehensive range of digital services to help businesses grow and succeed in the digital age.

OUR SERVICES INCLUDE (EXACTLY 8 SERVICES - NO OTHERS):

1. WEB DEVELOPMENT
   Custom websites that engage visitors and drive business growth. We build responsive, fast, and SEO-friendly websites using modern technologies like React, Next.js, and TypeScript.

2. E-COMMERCE SOLUTIONS
   Complete online store solutions including product catalogs, shopping carts, payment integration, inventory management, and order processing.

3. MOBILE APP DEVELOPMENT
   Native and cross-platform mobile applications for iOS and Android using React Native, Flutter, and native development.

4. SEARCH ENGINE OPTIMIZATION (SEO)
   Comprehensive SEO services including keyword research, on-page optimization, link building, and content strategy.

5. SOCIAL MEDIA MARKETING
   Strategic social media management, content creation, paid advertising, and community engagement across all major platforms.

6. SOFTWARE DEVELOPMENT
   Custom software solutions including enterprise applications, APIs, cloud solutions, and legacy system modernization.

7. 3D GRAPHICS DESIGNING
   Professional 3D modeling, rendering, animation, and visualization services for products, architecture, and marketing.

8. VIDEO EDITING
   Professional video editing services including color grading, motion graphics, sound design, and social media optimization.

IMPORTANT: NexGenTeck does NOT offer Blockchain Development, Outdoor Media, Billboards,
Digital Displays, Transit Advertising, NFT Marketplaces, DeFi Platforms, Cybersecurity,
IT Consulting, Data Analytics, AR/VR, or any other service not in the list above.

Contact us today for a free consultation!
"""
        documents.append({
            'content': services_overview,
            'metadata': {'source': 'services_page', 'title': 'Our Services', 'type': 'page'}
        })
        
        return documents
    
    def _create_company_documents(self) -> List[Dict[str, str]]:
        """Create documents about the company."""
        documents = []
        
        about_content = f"""
PAGE: About NexGenTeck
URL: https://nexgenteck.com/about

ABOUT NEXGENTECK:
{self._get_translation('about.description', 'NexGenTeck is a leading technology company specializing in comprehensive digital solutions.')}

{self._get_translation('about.mission', 'Our mission is to transform businesses through innovative technology solutions.')}

WHY CHOOSE NEXGENTECK:
• {self._get_translation('whyus.point1', 'Expert team with 15+ years of industry experience')}
• {self._get_translation('whyus.point2', 'Cutting-edge technologies and best practices')}
• {self._get_translation('whyus.point3', '24/7 support and maintenance services')}
• {self._get_translation('whyus.point4', 'Transparent communication and project management')}
• {self._get_translation('whyus.point5', 'Proven track record with 500+ successful projects')}
• {self._get_translation('whyus.point6', 'Competitive pricing with no hidden costs')}

OUR STATS:
• 500+ Projects Completed
• 200+ Happy Clients
• 15+ Team Members
• Available in 17 Languages

TECHNOLOGIES WE USE:
React, Next.js, TypeScript, Node.js, Python, PostgreSQL, MongoDB, AWS, Google Cloud, Docker, Kubernetes, and more.
"""
        documents.append({
            'content': about_content,
            'metadata': {'source': 'about_page', 'title': 'About NexGenTeck', 'type': 'page'}
        })
        
        contact_content = f"""
PAGE: Contact NexGenTeck
URL: https://nexgenteck.com/contact

HOW TO CONTACT US:
{self._get_translation('contact.description', 'Get in touch with our team for your digital transformation needs.')}

CONTACT OPTIONS:
• Email: info@nexgenteck.com
• Website: https://nexgenteck.com/contact
• Fill out our contact form for a free consultation

WHAT HAPPENS WHEN YOU CONTACT US:
1. Initial Response - We respond within 24 hours
2. Free Consultation - We discuss your project requirements
3. Custom Proposal - We provide a detailed quote and timeline
4. Project Kickoff - We start building your solution

WE WORK WITH:
• Startups and small businesses
• Medium and large enterprises
• Government organizations
• Non-profit organizations
• Individual entrepreneurs

GLOBAL REACH:
We serve clients worldwide and our website is available in 17 languages including English, Urdu, Korean, Chinese, Arabic, German, Spanish, French, Portuguese, Turkish, Dutch, Polish, Japanese, Bengali, Italian, Persian, and Swedish.
"""
        documents.append({
            'content': contact_content,
            'metadata': {'source': 'contact_page', 'title': 'Contact Us', 'type': 'page'}
        })
        
        pricing_content = """
PAGE: Pricing - NexGenTeck
URL: https://nexgenteck.com/pricing

OUR PRICING APPROACH:
We offer flexible pricing options tailored to your project needs. All our packages include:
• Free initial consultation
• Dedicated project manager
• Regular progress updates
• Post-launch support

TYPICAL PRICING RANGES:

WEB DEVELOPMENT:
• Basic Package: $1,499 - Up to 5 pages, responsive design, basic SEO
• Business Package: $2,999 - Up to 15 pages, CMS integration, advanced SEO
• Premium Package: $5,999 - Unlimited pages, custom features, e-commerce

MOBILE APP DEVELOPMENT:
• Starter: $4,999 - Single platform, basic features
• Professional: $9,999 - Cross-platform, advanced features
• Enterprise: $19,999+ - Full-featured, scalable solution

E-COMMERCE:
• Starter Store: $2,499 - Up to 50 products
• Business Store: $4,999 - Up to 500 products
• Enterprise: Custom pricing for large catalogs

All prices are starting points. Contact us for a custom quote based on your specific requirements.
"""
        documents.append({
            'content': pricing_content,
            'metadata': {'source': 'pricing_page', 'title': 'Pricing', 'type': 'page'}
        })
        
        return documents


def get_translation_based_content() -> List[Dict[str, str]]:
    """
    Main function to get all content from translations.
    Use this instead of scraping for local development.
    """
    extractor = TranslationExtractor()
    return extractor.extract_all_content()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    docs = get_translation_based_content()
    print(f"\nExtracted {len(docs)} documents")
    for doc in docs[:3]:
        print(f"\n--- {doc['metadata'].get('title', 'Unknown')} ---")
        print(doc['content'][:500] + "...")
