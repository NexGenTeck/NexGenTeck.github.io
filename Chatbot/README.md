# NexGenTeck AI Chatbot Backend

RAG chatbot grounded in **current NexGenTeck website content**.

## Source-of-truth strategy

| Priority | Source | When used |
|----------|--------|-----------|
| 1 | Structured extraction from monorepo `src/` or bundled `website_sources/src/` | Default (`USE_SOURCE_EXTRACTOR=true`) |
| 2 | Live-site crawl (Selenium JS render) | When source extraction unavailable and `ALLOW_LIVE_SCRAPE=true` |
| 3 | Minimal emergency fallback | Only if both fail; **cannot replace a working index** |

Authoritative website modules include:

- `src/pages/Portfolio.tsx` — portfolio projects
- `src/pages/About.tsx` — team hierarchy + partners
- `src/pages/Services.tsx` + routes — service catalogue (9 services including AI)
- `src/pages/Home.tsx` — public metrics
- `src/components/Footer.tsx` — contact details
- `src/contexts/LanguageContext.tsx` — pricing, company copy, and language-specific page documents
- `src/translations/serviceTranslations.ts` — service depth (features/FAQ/packages)

### Document types

`company_overview`, `company_metric`, `service`, `service_faq`, `portfolio_project`,
`team_member`, `partner`, `pricing`, `contact`, `process`, `cta`, `navigation`, `page`

Each document carries metadata: `document_type`, `entity_id`, `source`, `source_url`,
`content_version`, `updated_at`, `language`, `page`.

English remains the default response language for the FastAPI assistant, while current
non-English public translations are indexed as separate `page` documents with a
`language` metadata value for grounded retrieval and future language-aware responses.

## Architecture

```
Website sources (TS/TSX)
        ↓
content_extractor.py  → structured knowledge documents + fingerprint
        ↓
knowledge_manager.py  → validate → stage → swap (safe reindex)
        ↓
Qdrant vector store + embeddings
        ↓
retrieve → rerank → Groq Llama 3.3 response
```

## Freshness and safe reindex

1. Compute a deterministic SHA-256 **content fingerprint** over authoritative source files.
2. Store the fingerprint with the active collection.
3. On startup (`AUTO_REFRESH_ON_STARTUP=true`), reindex only when the fingerprint changed or the store is empty.
4. Reindex writes to a **staging collection**, validates it is non-empty and queryable, then swaps the active pointer.
5. Failures **retain** the previous working collection.
6. Emergency fallback is **blocked** from overwriting a working knowledge base.

### Force reindex (deployed environment only)

```bash
# CLI (run inside the chatbot container / host — not during local static audits)
cd Chatbot
python reindex.py --force

# HTTP (requires REINDEX_SECRET / ADMIN_TOKEN in production)
curl -X POST "$CHATBOT_URL/reindex" \
  -H "Authorization: Bearer $REINDEX_SECRET"
```

### Status

```bash
curl -fsS "$CHATBOT_URL/health"
curl -fsS "$CHATBOT_URL/knowledge/status"
```

## Security

- `POST /reindex` requires `REINDEX_SECRET` or `ADMIN_TOKEN` via:
  - `Authorization: Bearer <secret>` or
  - `X-Reindex-Secret: <secret>`
- If no secret is configured, only loopback callers may reindex.
- Secrets are never logged or returned in error bodies.
- Public `/chat` remains unauthenticated.

## Environment variables

See `.env.example` for the full list. Key variables:

| Variable | Purpose |
|----------|---------|
| `GROQ_API_KEY` | Required LLM key |
| `REINDEX_SECRET` / `ADMIN_TOKEN` | Protects reindex |
| `USE_SOURCE_EXTRACTOR` | Prefer TSX source extraction |
| `ALLOW_LIVE_SCRAPE` | Opt-in secondary live crawl (default `false`) |
| `AUTO_REFRESH_ON_STARTUP` | Fingerprint-based refresh |
| `WEBSITE_URL` | Canonical site URL |
| `QDRANT_URL` | `:memory:` or external Qdrant |
| `COLLECTION_NAME` | Base collection name |
| `MODEL_CACHE_DIR` / `HF_HOME` | Writable model cache paths |

## Hugging Face Spaces

The Gradio deployment lives in `../hf-space/`. It uses the same source-extraction approach
with an in-memory vector index (no Qdrant / Selenium). See `../hf-space/DEPLOYMENT.md`.

**Runtime validation of embeddings, indexing, and chat must be performed inside the Space.**
This repository audit intentionally does not run those steps locally.

## Adding content (developer workflow)

### New service
1. Add route + page under `src/pages/services/`
2. Add card in `src/pages/Services.tsx`
3. Add translations / pricing keys as needed
4. Copy updated sources into `Chatbot/website_sources/src/` and `hf-space/website_sources/src/`
5. Deploy website + reindex chatbot (startup auto-refresh or secure reindex)

### New portfolio project
1. Add object to `projects` in `src/pages/Portfolio.tsx`
2. Sync bundled `website_sources`
3. Reindex chatbot

### Team / partner updates
1. Edit arrays in `src/pages/About.tsx`
2. Sync bundled sources
3. Reindex chatbot

## Tests

```bash
# Extraction / consistency (no models) — run in CI or Space, not required locally
cd Chatbot
python -m unittest discover -s tests -v
```

Evaluation questions: `tests/evaluation_dataset.json`

> Runtime tests, builds, model loading, scraping, embedding generation, Qdrant indexing,
> reindexing, API calls, and chatbot evaluation were intentionally **not** executed in the
> local static audit environment. Verify them after deployment.

## Local development note

Do not run the full stack during static content audits if your process forbids runtime
execution. When allowed in a normal development environment:

```bash
cd Chatbot
cp .env.example .env
# set GROQ_API_KEY and REINDEX_SECRET
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
