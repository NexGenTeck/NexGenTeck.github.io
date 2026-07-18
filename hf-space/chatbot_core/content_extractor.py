"""
Authoritative website content extractor for chatbot knowledge ingestion.

Source-of-truth priority:
1. Structured extraction from current repository website sources (TS/TSX)
2. Bundled website_sources snapshot (Hugging Face / standalone deploys)
3. Caller may merge live-site crawl results separately
4. Minimal emergency fallback only when all authoritative extraction fails

This module does not download models, scrape the network, or embed text.
"""

from __future__ import annotations

import hashlib
import json
import logging
import os
import re
from datetime import datetime, timezone
from typing import Any, Dict, Iterable, List, Optional, Sequence, Tuple

logger = logging.getLogger(__name__)

BASE_SITE_URL = "https://nexgenteck.com"
CONTENT_VERSION_FILES = (
    "pages/Portfolio.tsx",
    "data/portfolioData.ts",
    "pages/About.tsx",
    "pages/Services.tsx",
    "pages/Home.tsx",
    "pages/Contact.tsx",
    "pages/Pricing.tsx",
    "components/Footer.tsx",
    "components/Header.tsx",
    "utils/routes.ts",
    "contexts/LanguageContext.tsx",
    "translations/serviceTranslations.ts",
)

def _utcnow_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _normalize_ws(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def _unescape_js_string(value: str) -> str:
    value = value.replace("\\'", "'").replace('\\"', '"').replace("\\n", "\n")
    value = value.replace("\\t", "\t").replace("\\r", "\r")
    return value


def _slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "item"


def resolve_project_root(project_root: Optional[str] = None) -> str:
    """Resolve project / Space root or explicit override."""
    if project_root:
        return os.path.abspath(project_root)
    env_root = os.getenv("CONTENT_SOURCE_ROOT") or os.getenv("PROJECT_ROOT")
    if env_root:
        return os.path.abspath(env_root)
    # chatbot_core/ -> hf-space/ (or Chatbot/ when mirrored)
    return os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def resolve_src_root(project_root: Optional[str] = None) -> Optional[str]:
    """
    Locate website src directory.

    Search order:
    1. CONTENT_SOURCE_ROOT / PROJECT_ROOT / src
    2. monorepo ../src from Space folder
    3. bundled website_sources/src (Hugging Face deploy package)
    4. Chatbot/website_sources/src in monorepo checkouts
    """
    root = resolve_project_root(project_root)
    here = os.path.dirname(__file__)
    candidates = [
        root,
        os.path.join(root, "src"),
        os.path.join(root, "website_sources", "src"),
        os.path.join(here, "website_sources", "src"),
        os.path.join(os.path.dirname(here), "website_sources", "src"),
        os.path.join(root, "Chatbot", "website_sources", "src"),
        # monorepo: hf-space -> repo root src
        os.path.abspath(os.path.join(root, "..", "src")),
    ]
    for path in candidates:
        if os.path.isdir(path) and os.path.isfile(
            os.path.join(path, "pages", "Services.tsx")
        ):
            logger.info("Website source root resolved: %s", path)
            return path
    logger.error(
        "No website source root found. Checked: %s",
        ", ".join(os.path.abspath(path) for path in candidates),
    )
    return None


class ContentExtractor:
    """Extract structured knowledge documents from website source files."""

    def __init__(self, project_root: Optional[str] = None, base_url: str = BASE_SITE_URL):
        self.project_root = resolve_project_root(project_root)
        self.src_root = resolve_src_root(self.project_root)
        self.base_url = (base_url or BASE_SITE_URL).rstrip("/")
        self.translations: Dict[str, str] = {}
        self.translation_maps: Dict[str, Dict[str, str]] = {}
        self.warnings: List[str] = []
        self.sources_used: List[str] = []
        self.content_version: str = ""
        self.updated_at: str = _utcnow_iso()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def extract_all_documents(self) -> List[Dict[str, Any]]:
        """Extract structured knowledge documents from source files."""
        if not self.src_root:
            self.warnings.append("No website src directory found for source extraction")
            logger.warning("No website src directory found")
            return []

        logger.info("Starting source extraction from %s", self.src_root)
        self.translations = self._load_english_translations()
        self.content_version = self.compute_content_fingerprint()
        self.updated_at = _utcnow_iso()

        documents: List[Dict[str, Any]] = []
        documents.extend(self._docs_company_overview())
        documents.extend(self._docs_company_metrics())
        documents.extend(self._docs_services())
        documents.extend(self._docs_portfolio())
        documents.extend(self._docs_team())
        documents.extend(self._docs_partners())
        documents.extend(self._docs_pricing())
        documents.extend(self._docs_contact())
        documents.extend(self._docs_process_and_cta())
        documents.extend(self._docs_navigation())
        documents.extend(self._docs_localized_content())

        counts: Dict[str, int] = {}
        for doc in documents:
            dtype = (doc.get("metadata") or {}).get("document_type", "unknown")
            counts[dtype] = counts.get(dtype, 0) + 1
        logger.info(
            "Source extraction produced %s documents (version=%s, types=%s, sources=%s)",
            len(documents),
            self.content_version[:12],
            counts,
            self.sources_used,
        )
        return documents

    def extract_inventory(self) -> Dict[str, Any]:
        """Return structured entity inventory for validation and tests."""
        docs = self.extract_all_documents()
        by_type: Dict[str, List[Dict[str, Any]]] = {}
        for doc in docs:
            meta = doc.get("metadata") or {}
            dtype = meta.get("document_type", "unknown")
            by_type.setdefault(dtype, []).append(meta)

        return {
            "content_version": self.content_version,
            "updated_at": self.updated_at,
            "sources_used": list(self.sources_used),
            "warnings": list(self.warnings),
            "document_count": len(docs),
            "document_counts_by_type": {k: len(v) for k, v in by_type.items()},
            "services": [
                m.get("entity_id")
                for m in by_type.get("service", [])
                if m.get("entity_id")
            ],
            "portfolio_projects": [
                m.get("entity_id")
                for m in by_type.get("portfolio_project", [])
                if m.get("entity_id")
            ],
            "team_members": [
                m.get("entity_id")
                for m in by_type.get("team_member", [])
                if m.get("entity_id")
            ],
            "partners": [
                m.get("entity_id") for m in by_type.get("partner", []) if m.get("entity_id")
            ],
            "documents": docs,
        }

    def compute_content_fingerprint(self) -> str:
        """Deterministic SHA-256 fingerprint of authoritative public content sources."""
        if not self.src_root:
            return hashlib.sha256(b"missing-src").hexdigest()

        hasher = hashlib.sha256()
        for rel in sorted(CONTENT_VERSION_FILES):
            path = os.path.join(self.src_root, rel.replace("/", os.sep))
            if not os.path.isfile(path):
                hasher.update(f"MISSING:{rel}\n".encode("utf-8"))
                continue
            with open(path, "rb") as handle:
                data = handle.read()
            # Ignore checkout newline, indentation, and blank-line-only changes
            # while preserving meaningful public string content.
            data = data.replace(b"\r\n", b"\n").replace(b"\r", b"\n")
            data = b"\n".join(
                line.strip() for line in data.split(b"\n") if line.strip()
            )
            hasher.update(rel.encode("utf-8"))
            hasher.update(b"\0")
            hasher.update(data)
            hasher.update(b"\0")
        return hasher.hexdigest()

    def validate_documents(self, documents: Sequence[Dict[str, Any]]) -> Dict[str, Any]:
        """Validate extraction quality before indexing."""
        warnings: List[str] = []
        errors: List[str] = []

        if not documents:
            errors.append("No documents extracted")
            logger.error("Source document validation failed: %s", errors)
            return {"ok": False, "errors": errors, "warnings": warnings}

        by_type: Dict[str, int] = {}
        entity_ids: List[str] = []
        for doc in documents:
            meta = doc.get("metadata") or {}
            content = (doc.get("content") or "").strip()
            dtype = meta.get("document_type", "unknown")
            by_type[dtype] = by_type.get(dtype, 0) + 1
            if not content or len(content) < 20:
                warnings.append(f"Short document: {meta.get('entity_id', dtype)}")
            if meta.get("entity_id"):
                entity_ids.append(str(meta["entity_id"]))

        required_types = {
            "service",
            "portfolio_project",
            "team_member",
            "partner",
            "contact",
            "company_overview",
            "pricing",
        }
        for required in required_types:
            if by_type.get(required, 0) < 1:
                errors.append(f"Missing required document type: {required}")

        required_entities = {
            *(f"service-{service['slug']}" for service in self.extract_service_catalogue()),
            *(f"portfolio-{project['id']}" for project in self.extract_portfolio_projects()),
            *(f"team-{_slugify(member['name'])}" for member in self.extract_team_members()),
            *(f"partner-{_slugify(partner['name'])}" for partner in self.extract_partners()),
        }
        missing = sorted(required_entities - set(entity_ids))
        if missing:
            errors.append(f"Missing required entities: {', '.join(missing)}")

        ok = not errors
        log_fn = logger.info if ok else logger.error
        log_fn(
            "Source document validation %s: documents=%s types=%s errors=%s warnings=%s",
            "passed" if ok else "failed",
            len(documents),
            by_type,
            errors,
            warnings + self.warnings,
        )
        return {
            "ok": ok,
            "errors": errors,
            "warnings": warnings + self.warnings,
            "document_count": len(documents),
            "document_counts_by_type": by_type,
            "entity_ids": sorted(set(entity_ids)),
        }

    # ------------------------------------------------------------------
    # File helpers
    # ------------------------------------------------------------------

    def _read_src(self, *parts: str) -> Optional[str]:
        if not self.src_root:
            return None
        path = os.path.join(self.src_root, *parts)
        if not os.path.isfile(path):
            self.warnings.append(f"Missing source file: {os.path.join(*parts)}")
            return None
        with open(path, "r", encoding="utf-8") as handle:
            text = handle.read()
        rel = "/".join(parts)
        if rel not in self.sources_used:
            self.sources_used.append(rel)
        return text

    def _t(self, key: str, default: str = "") -> str:
        return self.translations.get(key, default)

    def _meta(
        self,
        *,
        document_type: str,
        entity_id: str,
        title: str,
        source: str,
        source_url: str,
        page: str,
        language: str = "en",
        **extra: Any,
    ) -> Dict[str, Any]:
        meta: Dict[str, Any] = {
            "document_type": document_type,
            "entity_id": entity_id,
            "title": title,
            "source": source,
            "source_url": source_url,
            "page": page,
            "language": language,
            "content_version": self.content_version,
            "updated_at": self.updated_at,
            "extraction_method": "source_tsx",
        }
        for key, value in extra.items():
            if value is not None:
                meta[key] = value
        return meta

    def _doc(
        self,
        content: str,
        metadata: Dict[str, Any],
    ) -> Dict[str, Any]:
        return {"content": content.strip(), "metadata": metadata}

    # ------------------------------------------------------------------
    # Translation loading (improved string parsing)
    # ------------------------------------------------------------------

    def _load_english_translations(self) -> Dict[str, str]:
        translations: Dict[str, str] = {}
        lang_text = self._read_src("contexts", "LanguageContext.tsx")
        if lang_text:
            for match in re.finditer(r"(?m)^\s{2}([a-z]{2})\s*:\s*\{", lang_text):
                language = match.group(1)
                section = self._extract_balanced_braces(lang_text, match.end() - 1)
                self.translation_maps[language] = self._parse_key_value_strings(section)
            section = self._extract_language_object(lang_text, prefer_en=True)
            translations.update(self._parse_key_value_strings(section))

        service_text = self._read_src("translations", "serviceTranslations.ts")
        if service_text:
            # serviceTranslations may be nested by language or flat English map
            if re.search(r"\ben\s*:\s*\{", service_text):
                section = self._extract_braced_section_after(service_text, r"\ben\s*:\s*\{")
            else:
                section = service_text
            translations.update(self._parse_key_value_strings(section))

        logger.info("Loaded %s English translation keys", len(translations))
        self.translation_maps["en"] = dict(translations)
        return translations

    def _extract_language_object(self, content: str, prefer_en: bool = True) -> str:
        if prefer_en:
            match = re.search(r"\ben\s*:\s*\{", content)
            if match:
                return self._extract_balanced_braces(content, match.end() - 1)
        match = re.search(r"const\s+translations\s*[:=]\s*\{", content)
        if match:
            return self._extract_balanced_braces(content, match.end() - 1)
        return content

    def _extract_braced_section_after(self, content: str, pattern: str) -> str:
        match = re.search(pattern, content)
        if not match:
            return ""
        return self._extract_balanced_braces(content, match.end() - 1)

    def _extract_balanced_braces(self, content: str, open_brace_index: int) -> str:
        if open_brace_index < 0 or open_brace_index >= len(content) or content[open_brace_index] != "{":
            return ""
        depth = 0
        in_string = False
        string_char = ""
        escape = False
        for i in range(open_brace_index, len(content)):
            ch = content[i]
            if in_string:
                if escape:
                    escape = False
                elif ch == "\\":
                    escape = True
                elif ch == string_char:
                    in_string = False
                continue
            if ch in ("'", '"', "`"):
                in_string = True
                string_char = ch
                continue
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    return content[open_brace_index + 1 : i]
        return content[open_brace_index + 1 :]

    def _parse_key_value_strings(self, text: str) -> Dict[str, str]:
        """Parse 'key': 'value' pairs including multiline and escaped quotes."""
        results: Dict[str, str] = {}
        if not text:
            return results

        # Matches 'key' or "key" followed by : and a quoted string (single/double).
        pattern = re.compile(
            r"""['"]([a-zA-Z0-9_.-]+)['"]\s*:\s*(['"])((?:\\.|(?!\2).)*)\2""",
            re.DOTALL,
        )
        for match in pattern.finditer(text):
            key = match.group(1)
            raw_value = match.group(3)
            value = _normalize_ws(_unescape_js_string(raw_value))
            if key and value:
                results[key] = value
        return results

    # ------------------------------------------------------------------
    # Structured TSX parsers
    # ------------------------------------------------------------------

    def _extract_array_literal(self, text: str, array_name: str) -> str:
        """Extract the body of `const arrayName = [ ... ]` or an arrow function returning `[ ... ]`."""
        pattern = rf"(?:const|let|var)\s+{re.escape(array_name)}\s*=\s*\["
        match = re.search(pattern, text)
        if not match:
            # object property style: projects = [
            pattern2 = rf"\b{re.escape(array_name)}\s*=\s*\["
            match = re.search(pattern2, text)
        if not match:
            # array-returning function style: getProjects = (...) => [
            pattern3 = rf"\b{re.escape(array_name)}\s*=\s*.*?=>\s*\["
            match = re.search(pattern3, text, re.DOTALL)
            if not match:
                return ""
        start = match.end() - 1
        depth = 0
        in_string = False
        string_char = ""
        escape = False
        for i in range(start, len(text)):
            ch = text[i]
            if in_string:
                if escape:
                    escape = False
                elif ch == "\\":
                    escape = True
                elif ch == string_char:
                    in_string = False
                continue
            if ch in ("'", '"', "`"):
                in_string = True
                string_char = ch
                continue
            if ch == "[":
                depth += 1
            elif ch == "]":
                depth -= 1
                if depth == 0:
                    return text[start + 1 : i]
        return ""

    def _split_top_level_objects(self, array_body: str) -> List[str]:
        objects: List[str] = []
        depth = 0
        in_string = False
        string_char = ""
        escape = False
        start = None
        for i, ch in enumerate(array_body):
            if in_string:
                if escape:
                    escape = False
                elif ch == "\\":
                    escape = True
                elif ch == string_char:
                    in_string = False
                continue
            if ch in ("'", '"', "`"):
                in_string = True
                string_char = ch
                continue
            if ch == "{":
                if depth == 0:
                    start = i
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0 and start is not None:
                    objects.append(array_body[start : i + 1])
                    start = None
        return objects

    def _parse_object_fields(self, object_text: str) -> Dict[str, Any]:
        """Parse simple TS object literal fields used in content arrays."""
        body = object_text.strip()
        if body.startswith("{") and body.endswith("}"):
            body = body[1:-1]

        fields: Dict[str, Any] = {}
        # string fields
        for match in re.finditer(
            r"""(\w+)\s*:\s*(['"`])((?:\\.|(?!\2).)*)\2""",
            body,
            re.DOTALL,
        ):
            key = match.group(1)
            value = _normalize_ws(_unescape_js_string(match.group(3)))
            fields[key] = value

        # t('key') fields
        for match in re.finditer(
            r"""(\w+)\s*:\s*t\(\s*(['"])([^'"]+)\2\s*\)""",
            body,
        ):
            key = match.group(1)
            t_key = match.group(3)
            fields[key] = self._t(t_key, t_key)
            fields[f"{key}__translation_key"] = t_key

        # string arrays: tags: ['A', 'B'] or tags: [ t('x'), ... ]
        for match in re.finditer(r"(\w+)\s*:\s*\[(.*?)\]", body, re.DOTALL):
            key = match.group(1)
            inner = match.group(2)
            items: List[str] = []
            for sm in re.finditer(r"""(['"`])((?:\\.|(?!\1).)*)\1""", inner, re.DOTALL):
                items.append(_normalize_ws(_unescape_js_string(sm.group(2))))
            for tm in re.finditer(r"""t\(\s*(['"])([^'"]+)\1\s*\)""", inner):
                items.append(self._t(tm.group(2), tm.group(2)))
            if items:
                fields[key] = items

        # numeric fields
        for match in re.finditer(r"(\w+)\s*:\s*(-?\d+(?:\.\d+)?)\s*([,}])", body):
            key = match.group(1)
            if key not in fields:
                num = match.group(2)
                fields[key] = float(num) if "." in num else int(num)

        return fields

    def extract_portfolio_projects(self) -> List[Dict[str, Any]]:
        text = self._read_src("pages", "Portfolio.tsx")
        if not text:
            return []
        body = self._extract_array_literal(text, "projects")
        source_file = "pages/Portfolio.tsx"
        if not body:
            data_text = self._read_src("data", "portfolioData.ts") or ""
            body = self._extract_array_literal(data_text, "getProjects")
            source_file = "data/portfolioData.ts"
        projects: List[Dict[str, Any]] = []
        for obj in self._split_top_level_objects(body):
            fields = self._parse_object_fields(obj)
            project_id = fields.get("id") or _slugify(str(fields.get("title", "project")))
            title = fields.get("title") or project_id
            # Resolve translation-key leftovers if any remain
            if title.startswith("portfolio."):
                title = self._t(title, title)
            description = fields.get("description") or ""
            if description.startswith("portfolio."):
                description = self._t(description, description)
            tags = fields.get("tags") or []
            if isinstance(tags, str):
                tags = [tags]
            projects.append(
                {
                    "id": project_id,
                    "title": title,
                    "category": fields.get("category", ""),
                    "type": fields.get("type", ""),
                    "description": description,
                    "tags": tags,
                    "image": fields.get("image", ""),
                    "source_file": source_file,
                }
            )
        logger.info(
            "Extracted %s portfolio projects from %s",
            len(projects),
            source_file,
        )
        return projects

    def extract_team_members(self) -> List[Dict[str, Any]]:
        text = self._read_src("pages", "About.tsx")
        if not text:
            return []
        body = self._extract_array_literal(text, "teamMembers")
        members: List[Dict[str, Any]] = []
        for obj in self._split_top_level_objects(body):
            fields = self._parse_object_fields(obj)
            name = fields.get("name")
            if not name:
                continue
            members.append(
                {
                    "name": name,
                    "role": fields.get("role", ""),
                    "image": fields.get("image", ""),
                }
            )

        # Derive the hierarchy exclusively from About.tsx declarations; never
        # maintain a second team roster in the chatbot.
        hierarchy = {"ceo": "", "department_heads": [], "department_members": []}
        heads_body = self._extract_array_literal(text, "departmentHeads")
        members_body = self._extract_array_literal(text, "departmentMembers")
        if "const ceo" in text or "ceo =" in text:
            # Extract departmentHeads names from getTeamMember('Name')
            head_names = re.findall(
                r"getTeamMember\(\s*['\"]([^'\"]+)['\"]\s*\)",
                heads_body or "",
            )
            member_names = re.findall(
                r"getTeamMember\(\s*['\"]([^'\"]+)['\"]\s*\)",
                members_body or "",
            )
            if head_names:
                hierarchy["department_heads"] = head_names
            if member_names:
                hierarchy["department_members"] = member_names
            # CEO from first getTeamMember after const ceo
            ceo_block = re.search(
                r"const\s+ceo\s*=\s*getTeamMember\(\s*['\"]([^'\"]+)['\"]\s*\)",
                text,
            )
            if ceo_block:
                hierarchy["ceo"] = ceo_block.group(1)

        for member in members:
            name = member["name"]
            if name == hierarchy["ceo"]:
                member["hierarchy"] = "ceo"
            elif name in hierarchy["department_heads"]:
                member["hierarchy"] = "department_head"
            elif name in hierarchy["department_members"]:
                member["hierarchy"] = "department_member"
            else:
                member["hierarchy"] = "team_member"
        return members

    def extract_partners(self) -> List[Dict[str, Any]]:
        text = self._read_src("pages", "About.tsx")
        if not text:
            return []
        body = self._extract_array_literal(text, "partners")
        partners: List[Dict[str, Any]] = []
        for obj in self._split_top_level_objects(body):
            fields = self._parse_object_fields(obj)
            name = fields.get("name")
            if not name:
                continue
            partners.append(
                {
                    "name": name,
                    "logo": fields.get("logo", ""),
                }
            )
        return partners

    def extract_services_from_page(self) -> List[Dict[str, Any]]:
        text = self._read_src("pages", "Services.tsx")
        if not text:
            return []
        body = self._extract_array_literal(text, "services")
        services: List[Dict[str, Any]] = []
        for obj in self._split_top_level_objects(body):
            fields = self._parse_object_fields(obj)
            title = fields.get("title")
            slug = fields.get("slug")
            if not title or not slug:
                continue
            features = fields.get("features") or []
            if isinstance(features, str):
                features = [features]
            services.append(
                {
                    "title": title,
                    "slug": slug,
                    "description": fields.get("description", ""),
                    "features": features,
                }
            )
        return services

    def extract_service_catalogue(self) -> List[Dict[str, Any]]:
        """Join active service cards, routes, and detail-page translation keys."""
        services = self.extract_services_from_page()
        routes_text = self._read_src("utils", "routes.ts") or ""
        route_components = dict(
            re.findall(
                r"path:\s*['\"]services/([^'\"]+)['\"]\s*,\s*Component:\s*(\w+)",
                routes_text,
            )
        )
        component_files = dict(
            re.findall(
                r"import\s+\{\s*(\w+)\s*\}\s+from\s+['\"]\.\./pages/services/([^'\"]+)['\"]",
                routes_text,
            )
        )
        detail_prefixes: Dict[str, str] = {
            slug: f"services.{prefix}"
            for prefix, slug in re.findall(
                r"name:\s*['\"]services\.([a-zA-Z0-9_-]+)['\"]\s*,\s*path:\s*['\"]/services/([^'\"]+)",
                self._read_src("components", "Header.tsx") or "",
            )
        }
        for slug, component in route_components.items():
            filename = component_files.get(component)
            if not filename:
                continue
            detail = self._read_src("pages", "services", f"{filename}.tsx") or ""
            match = re.search(r"t\(\s*['\"](services\.[a-zA-Z0-9_-]+)\.title['\"]", detail)
            if match:
                detail_prefixes[slug] = match.group(1)

        catalogue: List[Dict[str, Any]] = []
        for service in services:
            slug = service["slug"]
            if slug not in route_components:
                self.warnings.append(f"Service card has no active route: {slug}")
                continue
            prefix = detail_prefixes.get(slug, "")
            catalogue.append(
                {
                    **service,
                    "id": prefix.rsplit(".", 1)[-1] if prefix else _slugify(slug),
                    "entity_id": f"service-{slug}",
                    "translation_prefix": prefix,
                }
            )
        return catalogue

    def extract_contact_info(self) -> Dict[str, str]:
        footer = self._read_src("components", "Footer.tsx") or ""
        email_match = re.search(
            r"([A-Za-z0-9._%+-]+@nexgenteck\.com)", footer
        )
        phone_match = re.search(r"(\+\d{1,3}[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{4})", footer)
        # Address appears next to MapPin as a span
        address_match = re.search(
            r"<MapPin[\s\S]{0,200}?<span>([^<]+)</span>",
            footer,
        )
        if not address_match:
            address_match = re.search(
                r"(Shahra-e-Faisal,\s*Karachi,\s*Pakistan)",
                footer,
            )
        return {
            "email": email_match.group(1) if email_match else "",
            "phone": phone_match.group(1) if phone_match else "",
            "address": address_match.group(1).strip() if address_match else "",
            "website": self.base_url,
            "contact_page": f"{self.base_url}/contact",
        }

    def extract_metrics(self) -> List[Dict[str, str]]:
        text = self._read_src("pages", "Home.tsx") or ""
        body = self._extract_array_literal(text, "stats")
        metrics: List[Dict[str, str]] = []
        for obj in self._split_top_level_objects(body):
            fields = self._parse_object_fields(obj)
            number = str(fields.get("number", "")).strip()
            label_key = fields.get("labelKey") or fields.get("label") or ""
            if label_key.startswith("stats."):
                label = self._t(label_key, label_key.replace("stats.", "").title())
            else:
                label = str(label_key)
            if number:
                metrics.append({"number": number, "label": label, "label_key": str(label_key)})
        return metrics

    # ------------------------------------------------------------------
    # Document builders
    # ------------------------------------------------------------------

    def _docs_company_overview(self) -> List[Dict[str, Any]]:
        about = self._t(
            "about.description",
            "NexGenTeck is a technology company providing comprehensive digital solutions.",
        )
        story = " ".join(
            filter(
                None,
                [
                    self._t("about.story.p1"),
                    self._t("about.story.p2"),
                    self._t("about.story.p3"),
                ],
            )
        )
        mission = self._t("about.mission", "")
        why_points = [
            self._t(f"whyus.point{i}")
            for i in range(1, 7)
            if self._t(f"whyus.point{i}")
        ]
        content = "\n".join(
            [
                "DOCUMENT TYPE: company_overview",
                "COMPANY: NexGenTeck",
                f"URL: {self.base_url}/about",
                "",
                f"OVERVIEW: {about or 'NexGenTeck delivers digital products and services for modern businesses.'}",
                f"MISSION: {mission}" if mission else "",
                f"STORY: {story}" if story else "",
                "",
                "WHY CHOOSE NEXGENTECK:",
                *[f"• {p}" for p in why_points],
            ]
        )
        return [
            self._doc(
                content,
                self._meta(
                    document_type="company_overview",
                    entity_id="company-nexgenteck",
                    title="About NexGenTeck",
                    source="src/pages/About.tsx + LanguageContext.tsx",
                    source_url=f"{self.base_url}/about",
                    page="about",
                ),
            )
        ]

    def _docs_company_metrics(self) -> List[Dict[str, Any]]:
        metrics = self.extract_metrics()
        lines = [
            "DOCUMENT TYPE: company_metric",
            "NexGenTeck public success metrics (from the Home page):",
        ]
        for metric in metrics:
            lines.append(f"• {metric['number']} {metric['label']}")
        return [
            self._doc(
                "\n".join(lines),
                self._meta(
                    document_type="company_metric",
                    entity_id="company-metrics-home",
                    title="Company Metrics",
                    source="src/pages/Home.tsx",
                    source_url=f"{self.base_url}/",
                    page="home",
                ),
            )
        ]

    def _docs_services(self) -> List[Dict[str, Any]]:
        services = self.extract_service_catalogue()
        documents: List[Dict[str, Any]] = []

        if not services:
            return documents

        # Overview document
        overview_lines = [
            "DOCUMENT TYPE: page",
            "PAGE: Services",
            f"URL: {self.base_url}/services",
            "",
            f"NexGenTeck currently offers {len(services)} services:",
        ]
        for index, svc in enumerate(services, start=1):
            overview_lines.append(f"{index}. {svc['title']} (/services/{svc['slug']})")
        overview_lines.append(
            "\nService catalogue is defined by the live website Services page and routes. "
            "Do not invent additional services."
        )
        documents.append(
            self._doc(
                "\n".join(overview_lines),
                self._meta(
                    document_type="page",
                    entity_id="page-services-overview",
                    title="Services Overview",
                    source="src/pages/Services.tsx",
                    source_url=f"{self.base_url}/services",
                    page="services",
                ),
            )
        )

        for svc in services:
            prefix = svc.get("translation_prefix", "")
            title = svc["title"]
            subtitle = self._t(f"{prefix}.subtitle", "") if prefix else ""
            description = svc.get("description", "")
            if prefix:
                description = self._t(f"{prefix}.description", description)
            features = list(svc.get("features") or [])
            if not features and prefix:
                for i in range(1, 13):
                    feat = self._t(f"{prefix}.feature{i}")
                    if feat:
                        features.append(feat)

            benefits = [
                self._t(f"{prefix}.benefit{i}")
                for i in range(1, 7)
                if prefix and self._t(f"{prefix}.benefit{i}")
            ]
            process_steps = []
            for i in range(1, 7):
                st = self._t(f"{prefix}.process{i}.title") if prefix else ""
                sd = self._t(f"{prefix}.process{i}.desc") if prefix else ""
                if st:
                    process_steps.append(f"{i}. {st}: {sd}".rstrip(": "))

            packages = []
            for i in range(1, 4):
                pname = self._t(f"{prefix}.package{i}.name") if prefix else ""
                pfeat = self._t(f"{prefix}.package{i}.features") if prefix else ""
                if pname:
                    packages.append(f"{pname}: {pfeat}")

            content_parts = [
                "DOCUMENT TYPE: service",
                f"SERVICE: {title}",
                f"URL: {self.base_url}/services/{svc['slug']}",
                f"SERVICE ID: {svc['id']}",
                "",
                f"OVERVIEW: {subtitle or description}",
                "",
                description,
            ]
            if features:
                content_parts.append("\nKEY FEATURES:")
                content_parts.extend([f"• {f}" for f in features])
            if benefits:
                content_parts.append("\nBENEFITS:")
                content_parts.extend([f"• {b}" for b in benefits])
            if process_steps:
                content_parts.append("\nPROCESS:")
                content_parts.extend(process_steps)
            if packages:
                content_parts.append("\nPACKAGES:")
                content_parts.extend(packages)

            documents.append(
                self._doc(
                    "\n".join(content_parts),
                    self._meta(
                        document_type="service",
                        entity_id=svc["entity_id"],
                        title=title,
                        source="src/pages/Services.tsx + translations",
                        source_url=f"{self.base_url}/services/{svc['slug']}",
                        page="services",
                        category=svc["id"],
                        slug=svc["slug"],
                    ),
                )
            )

            # FAQ documents
            for i in range(1, 6):
                q = self._t(f"{prefix}.faq{i}.q")
                a = self._t(f"{prefix}.faq{i}.a")
                if q and a:
                    documents.append(
                        self._doc(
                            f"DOCUMENT TYPE: service_faq\nSERVICE: {title}\nQ: {q}\nA: {a}",
                            self._meta(
                                document_type="service_faq",
                                entity_id=f"{svc['entity_id']}-faq-{i}",
                                title=f"{title} FAQ {i}",
                                source="service translations",
                                source_url=f"{self.base_url}/services/{svc['slug']}",
                                page="services",
                                category=svc["id"],
                            ),
                        )
                    )
        return documents

    def _docs_portfolio(self) -> List[Dict[str, Any]]:
        projects = self.extract_portfolio_projects()
        documents: List[Dict[str, Any]] = []

        if projects:
            listing = [
                "DOCUMENT TYPE: page",
                "PAGE: Portfolio",
                f"URL: {self.base_url}/portfolio",
                "",
                "NexGenTeck portfolio projects currently published on the website:",
            ]
            for project in projects:
                listing.append(
                    f"• {project['title']} "
                    f"(category: {project.get('category', 'n/a')}, "
                    f"type: {project.get('type', 'n/a')})"
                )
            documents.append(
                self._doc(
                    "\n".join(listing),
                    self._meta(
                        document_type="page",
                        entity_id="page-portfolio-overview",
                        title="Portfolio Overview",
                        source="src/pages/Portfolio.tsx",
                        source_url=f"{self.base_url}/portfolio",
                        page="portfolio",
                    ),
                )
            )

        for project in projects:
            tags = project.get("tags") or []
            tag_text = ", ".join(tags) if isinstance(tags, list) else str(tags)
            content = "\n".join(
                [
                    "DOCUMENT TYPE: portfolio_project",
                    f"PROJECT: {project['title']}",
                    f"PROJECT ID: {project['id']}",
                    f"CATEGORY: {project.get('category', '')}",
                    f"TYPE: {project.get('type', '')}",
                    f"URL: {self.base_url}/portfolio",
                    "",
                    f"DESCRIPTION: {project.get('description', '')}",
                    f"TECHNOLOGIES / TAGS: {tag_text}",
                ]
            )
            documents.append(
                self._doc(
                    content,
                    self._meta(
                        document_type="portfolio_project",
                        entity_id=f"portfolio-{project['id']}",
                        title=project["title"],
                        source="src/pages/Portfolio.tsx",
                        source_url=f"{self.base_url}/portfolio",
                        page="portfolio",
                        category=project.get("category", ""),
                        project_type=project.get("type", ""),
                    ),
                )
            )
        return documents

    def _docs_team(self) -> List[Dict[str, Any]]:
        members = self.extract_team_members()
        documents: List[Dict[str, Any]] = []
        if not members:
            return documents

        hierarchy_lines = [
            "DOCUMENT TYPE: page",
            "PAGE: Team",
            f"URL: {self.base_url}/about",
            "",
            "NexGenTeck team organization (from the About page):",
        ]
        for member in members:
            hierarchy_lines.append(
                f"• {member['name']} — {member['role']} "
                f"[{member.get('hierarchy', 'team_member')}]"
            )
        documents.append(
            self._doc(
                "\n".join(hierarchy_lines),
                self._meta(
                    document_type="page",
                    entity_id="page-team-overview",
                    title="Team Overview",
                    source="src/pages/About.tsx",
                    source_url=f"{self.base_url}/about",
                    page="about",
                ),
            )
        )

        for member in members:
            entity = f"team-{_slugify(member['name'])}"
            content = "\n".join(
                [
                    "DOCUMENT TYPE: team_member",
                    f"NAME: {member['name']}",
                    f"ROLE: {member['role']}",
                    f"ORGANIZATION LEVEL: {member.get('hierarchy', 'team_member')}",
                    f"URL: {self.base_url}/about",
                    "",
                    f"{member['name']} is {member['role']} at NexGenTeck.",
                ]
            )
            documents.append(
                self._doc(
                    content,
                    self._meta(
                        document_type="team_member",
                        entity_id=entity,
                        title=member["name"],
                        source="src/pages/About.tsx",
                        source_url=f"{self.base_url}/about",
                        page="about",
                        role=member["role"],
                        hierarchy=member.get("hierarchy", "team_member"),
                    ),
                )
            )
        return documents

    def _docs_partners(self) -> List[Dict[str, Any]]:
        partners = self.extract_partners()
        documents: List[Dict[str, Any]] = []
        if not partners:
            return documents

        listing = [
            "DOCUMENT TYPE: page",
            "PAGE: Partners",
            f"URL: {self.base_url}/about#partners",
            "",
            "NexGenTeck partners currently listed on the About page:",
        ]
        for partner in partners:
            listing.append(f"• {partner['name']}")
        listing.append(
            "\nThese partners include healthcare organizations. "
            "Partner logos and names are published in the About page partners section."
        )
        documents.append(
            self._doc(
                "\n".join(listing),
                self._meta(
                    document_type="page",
                    entity_id="page-partners-overview",
                    title="Partners Overview",
                    source="src/pages/About.tsx",
                    source_url=f"{self.base_url}/about#partners",
                    page="about",
                ),
            )
        )

        for partner in partners:
            entity = f"partner-{_slugify(partner['name'])}"
            content = "\n".join(
                [
                    "DOCUMENT TYPE: partner",
                    f"PARTNER: {partner['name']}",
                    f"URL: {self.base_url}/about#partners",
                    "",
                    f"{partner['name']} is listed as a NexGenTeck partner on the About page.",
                ]
            )
            documents.append(
                self._doc(
                    content,
                    self._meta(
                        document_type="partner",
                        entity_id=entity,
                        title=partner["name"],
                        source="src/pages/About.tsx",
                        source_url=f"{self.base_url}/about#partners",
                        page="about",
                    ),
                )
            )
        return documents

    def _docs_pricing(self) -> List[Dict[str, Any]]:
        # Pull pricing.* keys from English translations
        pricing_keys = sorted(k for k in self.translations if k.startswith("pricing."))
        if not pricing_keys:
            return []

        lines = [
            "DOCUMENT TYPE: pricing",
            "PAGE: Pricing",
            f"URL: {self.base_url}/pricing",
            "",
            self._t(
                "pricing.disclaimer.body",
                "All prices are estimates in USD. Final quotes depend on scope, features, and timelines.",
            ),
            "",
        ]
        # Group by service section for readability
        sections: Dict[str, List[str]] = {}
        for key in pricing_keys:
            if key in {
                "pricing.hero.subtitle",
                "pricing.section.title",
                "pricing.section.subtitle",
                "pricing.disclaimer.title",
                "pricing.disclaimer.body",
                "pricing.cta.title",
                "pricing.cta.subtitle",
                "pricing.cta.contactSales",
                "pricing.cta.callUs",
            }:
                continue
            parts = key.split(".")
            section = parts[2] if len(parts) > 2 else "general"
            sections.setdefault(section, []).append(f"{key}: {self.translations[key]}")

        for section, items in sections.items():
            lines.append(f"SECTION: {section}")
            lines.extend(items)
            lines.append("")

        return [
            self._doc(
                "\n".join(lines),
                self._meta(
                    document_type="pricing",
                    entity_id="pricing-overview",
                    title="Pricing Overview",
                    source="src/contexts/LanguageContext.tsx",
                    source_url=f"{self.base_url}/pricing",
                    page="pricing",
                ),
            )
        ]

    def _docs_contact(self) -> List[Dict[str, Any]]:
        contact = self.extract_contact_info()
        if not contact["email"] and not contact["phone"] and not contact["address"]:
            self.warnings.append("No contact information found in Footer.tsx")
            return []
        content = "\n".join(
            [
                "DOCUMENT TYPE: contact",
                "PAGE: Contact NexGenTeck",
                f"URL: {contact['contact_page']}",
                "",
                f"Email: {contact['email']}",
                f"Phone: {contact['phone']}",
                f"Address: {contact['address']}",
                f"Website: {contact['website']}",
                "",
                "Visitors can also use the contact form on the Contact page for a free consultation.",
            ]
        )
        return [
            self._doc(
                content,
                self._meta(
                    document_type="contact",
                    entity_id="contact-nexgenteck",
                    title="Contact Information",
                    source="src/components/Footer.tsx + Contact page",
                    source_url=contact["contact_page"],
                    page="contact",
                    email=contact["email"],
                    phone=contact["phone"],
                ),
            )
        ]

    def _docs_process_and_cta(self) -> List[Dict[str, Any]]:
        documents: List[Dict[str, Any]] = []
        process_title = self._t("process.title", "Our Process")
        steps = []
        for i in range(1, 6):
            st = self._t(f"process.step{i}.title") or self._t(f"process{i}.title")
            sd = self._t(f"process.step{i}.desc") or self._t(f"process{i}.desc")
            if st:
                steps.append(f"{i}. {st}: {sd}")
        if steps:
            documents.append(
                self._doc(
                    "\n".join(
                        [
                            "DOCUMENT TYPE: process",
                            f"TITLE: {process_title}",
                            f"URL: {self.base_url}/",
                            "",
                            *steps,
                        ]
                    ),
                    self._meta(
                        document_type="process",
                        entity_id="process-overview",
                        title=process_title,
                        source="LanguageContext.tsx",
                        source_url=f"{self.base_url}/",
                        page="home",
                    ),
                )
            )

        cta_title = self._t("cta.title")
        cta_sub = self._t("cta.subtitle")
        if cta_title:
            documents.append(
                self._doc(
                    f"DOCUMENT TYPE: cta\n{cta_title}\n{cta_sub}\nContact: {self.base_url}/contact",
                    self._meta(
                        document_type="cta",
                        entity_id="cta-main",
                        title=cta_title,
                        source="LanguageContext.tsx",
                        source_url=f"{self.base_url}/contact",
                        page="home",
                    ),
                )
            )
        return documents

    def _docs_navigation(self) -> List[Dict[str, Any]]:
        routes_text = self._read_src("utils", "routes.ts") or ""
        paths = re.findall(r"path:\s*['\"]([^'\"]+)['\"]", routes_text)
        if "services/artificial-intelligence" not in " ".join(paths):
            # index route uses Component only; collect service paths from file
            paths = re.findall(r"['\"](services/[^'\"]+)['\"]", routes_text)
        content_lines = [
            "DOCUMENT TYPE: navigation",
            "Primary public routes on nexgenteck.com:",
            "• / (Home)",
            "• /about",
            "• /services",
            "• /portfolio",
            "• /pricing",
            "• /contact",
        ]
        for path in sorted(set(paths)):
            content_lines.append(f"• /{path.lstrip('/')}")
        return [
            self._doc(
                "\n".join(content_lines),
                self._meta(
                    document_type="navigation",
                    entity_id="navigation-primary",
                    title="Site Navigation",
                    source="src/utils/routes.ts",
                    source_url=self.base_url,
                    page="site",
                ),
            )
        ]

    def _docs_localized_content(self) -> List[Dict[str, Any]]:
        """Index current non-English public translations as language-specific pages."""
        documents: List[Dict[str, Any]] = []
        groups = ("about.", "services.", "portfolio.", "pricing.", "contact.", "stats.")
        for language, values in sorted(self.translation_maps.items()):
            if language == "en":
                continue
            for group in groups:
                entries = [
                    f"{key}: {value}"
                    for key, value in sorted(values.items())
                    if key.startswith(group) and value
                ]
                if not entries:
                    continue
                group_id = group.rstrip(".")
                for part, start in enumerate(range(0, len(entries), 120), start=1):
                    documents.append(
                        self._doc(
                            "\n".join(
                                [
                                    "DOCUMENT TYPE: page",
                                    f"LANGUAGE: {language}",
                                    f"TRANSLATION GROUP: {group_id}",
                                    f"URL: {self.base_url}",
                                    "",
                                    *entries[start : start + 120],
                                ]
                            ),
                            self._meta(
                                document_type="page",
                                entity_id=f"localized-{group_id}-{language}-{part}",
                                title=f"{group_id.title()} translations ({language})",
                                source="src/contexts/LanguageContext.tsx",
                                source_url=self.base_url,
                                page=group_id,
                                language=language,
                                translation_group=group_id,
                                chunk_index=part - 1,
                            ),
                        )
                    )
        return documents


def get_source_based_content(
    project_root: Optional[str] = None,
    base_url: str = BASE_SITE_URL,
) -> List[Dict[str, Any]]:
    """Main entry point used by scrapers and reindex flows."""
    extractor = ContentExtractor(project_root=project_root, base_url=base_url)
    return extractor.extract_all_documents()


def get_content_fingerprint(project_root: Optional[str] = None) -> str:
    extractor = ContentExtractor(project_root=project_root)
    return extractor.compute_content_fingerprint()


def get_minimal_emergency_fallback(base_url: str = BASE_SITE_URL) -> List[Dict[str, Any]]:
    """
    Minimal emergency fallback used only when all authoritative extraction fails.
    Must not invent stale metrics, obsolete portfolio projects, or unsupported services.
    """
    base_url = base_url.rstrip("/")
    content = (
        "DOCUMENT TYPE: company_overview\n"
        "SOURCE: emergency_fallback\n"
        "WARNING: Authoritative website content could not be loaded. "
        "Treat this as incomplete emergency context only.\n\n"
        f"For accurate, up-to-date services, portfolio, team, partner, pricing, and contact "
        f"details, visit {base_url}."
    )
    return [
        {
            "content": content,
            "metadata": {
                "document_type": "company_overview",
                "entity_id": "emergency-fallback",
                "title": "Emergency Fallback",
                "source": "emergency_fallback",
                "source_url": base_url,
                "page": "fallback",
                "language": "en",
                "extraction_method": "emergency_fallback",
                "is_fallback": True,
            },
        }
    ]


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    inv = ContentExtractor().extract_inventory()
    print(json.dumps({k: v for k, v in inv.items() if k != "documents"}, indent=2))
    print(f"documents={inv['document_count']}")
