# NexGenTeck Chatbot — Hugging Face Gradio Deployment Guide

This guide deploys the chatbot from the `hf-space/` folder to a **Hugging Face Space**
using the free **Gradio SDK** (CPU Basic).

## What changed in knowledge ingestion

The Space no longer depends solely on incomplete SPA HTML crawls.

1. **Primary:** structured extraction from bundled `website_sources/src/`
   (portfolio, team, partners, services, pricing, contact, metrics)
2. **Secondary:** live `httpx` crawl of `WEBSITE_URL` when source extraction fails
3. **Emergency fallback:** minimal text only; cannot replace a working index

On startup the Space compares a **content fingerprint** of bundled website sources and
reindexes only when content changed (or the index is empty).

Retrieval is schema-driven: the query planner receives the document types that exist in
the current index and returns validated JSON (`list`, `search`, or `general`). A `list`
operation retrieves all unique metadata entities of the requested type, so complete
catalogue answers are not silently truncated by semantic top-k ranking.

## 1. Create the Hugging Face Space

1. Go to [huggingface.co/new-space](https://huggingface.co/new-space)
2. Configure:
   - **Owner**: your account (e.g. `muhammadhasaan82`)
   - **Space name**: `NexGenTeck`
   - **SDK**: Gradio
   - **Template**: Blank
   - **Hardware**: CPU basic (free)
   - **Visibility**: Public
3. **Short description**:
   ```
   AI chatbot for NexGenTeck using RAG and Groq Llama 3.3 70B.
   ```

## 2. Prepare the Space repository

Publish the versioned contents of this repository's `hf-space/` directory to the
Space repository. Keep the `website_sources/src/` snapshot in the same release as
the website sources it represents; it is a deployment artifact, not a second
business-content authoring location.

Expected layout:

```
app.py
requirements.txt
README.md
DEPLOYMENT.md
.gitignore
.env.example
chatbot_core/
  config.py
  content_extractor.py
  scraper.py
  rag.py
  guardrails.py
website_sources/
  src/
    pages/...
    components/...
    contexts/...
    translations/...
    utils/...
tests/
```

## 4. Configure Hugging Face Secrets

Space → **Settings** → **Secrets**:

| Name | Value |
|------|-------|
| `GROQ_API_KEY` | Your Groq API key |
| `ADMIN_TOKEN` | Strong random token for index refresh |

## 5. Configure Hugging Face Variables

Space → **Settings** → **Variables**:

| Name | Value |
|------|-------|
| `LLM_MODEL` | `llama-3.3-70b-versatile` |
| `WEBSITE_URL` | `https://nexgenteck.com` |
| `EMBEDDING_MODEL` | `sentence-transformers/all-MiniLM-L6-v2` |
| `USE_SOURCE_EXTRACTOR` | `true` |
| `ALLOW_LIVE_SCRAPE` | `false` |
| `AUTO_REFRESH_ON_STARTUP` | `true` |
| `MAX_PAGES` | `100` |
| `TOP_K` | `8` |
| `LLM_TEMPERATURE` | `0.3` |
| `LLM_MAX_TOKENS` | `768` |

Optional:

| Name | Value |
|------|-------|
| `MODEL_CACHE_DIR` | writable path if persistent storage is configured |

## 6. Commit and push to Hugging Face

```bash
git add .
git commit -m "Deploy NexGenTeck Gradio chatbot with synchronized website knowledge"
git push
```

First startup may take several minutes while the embedding model downloads and the
knowledge base is built from bundled sources.

## Updating knowledge after website changes

1. Update the website source files under root `src/` and push to `main`.
2. GitHub Actions workflow `.github/workflows/sync-hugging-face.yml` replaces
   `hf-space/website_sources/src` with that authoritative tree, validates the required
   source files, and synchronizes the deployment package to the configured Space.
3. Configure the repository secret `HF_TOKEN` so the workflow can push without
   committing credentials. The workflow does not force-push.
4. The Space rebuilds; its changed source fingerprint triggers reindexing on startup.
5. Or use **Admin: Refresh Website Index** with `ADMIN_TOKEN` for an explicit refresh.

Do not edit `website_sources` as an independent content database. A release check
should verify that it matches the website source files before publishing.

## Verification checklist (run in the Space only)

- [ ] Space build succeeds
- [ ] Startup logs show source extraction (not only emergency fallback)
- [ ] Status box shows document count and content version
- [ ] Admin refresh with wrong token is denied
- [ ] Admin refresh with correct token succeeds and reports document types
- [ ] Ask: portfolio projects (TrackIT, Swift Translate Pro, …)
- [ ] Ask: team / CEO / department roles
- [ ] Ask: partners (Medicare Pharma, Saifee Labs, Urban Healthcare)
- [ ] Ask: services including Artificial Intelligence
- [ ] Ask: contact email / phone
- [ ] Ask: pricing ranges
- [ ] Confirm obsolete 8-service / $1,499 package claims are not returned
- [ ] Confirm Home metrics are 15+ / 10+ / 9+ / 3+ (not 500+/200+)

## Frontend integration

Share the Space URL or embed:

```html
<iframe
  src="https://muhammadhasaan82-nexgenteck.hf.space"
  width="100%"
  height="600"
  frameborder="0"
></iframe>
```

## Notes

- No developer local preprocessing command is required before Space deploy.
- Do not commit `.env` files with real secrets.
- Persistent Qdrant is not used in this Gradio package; the index is in-memory and
  rebuilt from bundled sources / live scrape on startup when needed.
