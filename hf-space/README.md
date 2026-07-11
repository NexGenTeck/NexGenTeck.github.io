---
title: NexGenTeck
emoji: 🤖
colorFrom: blue
colorTo: indigo
sdk: gradio
sdk_version: 5.0.0
app_file: app.py
pinned: false
license: apache-2.0
short_description: AI chatbot for NexGenTeck using RAG and Groq Llama 3.3 70B.
---

# NexGenTeck AI Chatbot

AI business assistant for [NexGenTeck](https://nexgenteck.com). It answers visitor questions about services, portfolio projects, team, partners, pricing, and how to contact the team.

## How it works

1. **Primary knowledge source:** structured extraction from bundled `website_sources/`
   (Portfolio, About/team/partners, Services, pricing, contact, metrics).
2. **Secondary:** live website crawl of `WEBSITE_URL` when source extraction is unavailable.
3. Content is embedded with `sentence-transformers/all-MiniLM-L6-v2`.
4. Retrieval uses an **in-memory vector index** (no Qdrant).
5. Before retrieval, Groq creates a validated JSON plan from the document types
   currently present in index metadata. An exhaustive `list` plan retrieves every
   unique entity of that type instead of relying on semantic top-k ranking.
6. Responses are generated with **Groq** `llama-3.3-70b-versatile`.
7. Guardrails keep answers grounded in retrieved website content.
8. A **content fingerprint** skips re-embedding when website sources are unchanged.
9. Index rebuild is **non-destructive**: failures keep the previous working index.
10. Public non-English translations are indexed as language-specific documents; the
   current assistant response policy remains English-only.

## Required Secrets

Set these in **Space Settings → Secrets** (never commit them):

| Secret | Required | Purpose |
|--------|----------|---------|
| `GROQ_API_KEY` | Yes (for chat) | Groq API access for Llama 3.3 70B |
| `ADMIN_TOKEN` | Recommended | Protects the "Refresh Website Index" admin action |

If `GROQ_API_KEY` is missing, the Space still starts and the UI shows a clear configuration message.

## Recommended Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `WEBSITE_URL` | `https://nexgenteck.com` | Canonical site URL |
| `USE_SOURCE_EXTRACTOR` | `true` | Prefer bundled TSX extraction |
| `ALLOW_LIVE_SCRAPE` | `false` | Opt-in secondary live crawl |
| `AUTO_REFRESH_ON_STARTUP` | `true` | Fingerprint-based refresh |
| `EMBEDDING_MODEL` | `sentence-transformers/all-MiniLM-L6-v2` | Embeddings |
| `TOP_K` | `8` | Retrieval depth |
| `LLM_MODEL` | `llama-3.3-70b-versatile` | Chat model |

See `DEPLOYMENT.md` for full setup, verification checklist, and content-sync workflow.

## Content synchronization

The website repository's `.github/workflows/sync-hugging-face.yml` refreshes
`hf-space/website_sources/src` from the authoritative root `src/` tree and then
synchronizes the deployment package to the configured Space after pushes to `main`.
It requires a GitHub Actions secret named `HF_TOKEN`; it does not copy Space secrets.

## Runtime verification

Model downloads, embeddings, reindex, and chat evaluation must be performed **inside the Hugging Face Space**. They are not executed during local static repository audits.
