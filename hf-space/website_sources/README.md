# Bundled website sources for Hugging Face Space ingestion

The Gradio Space package includes the key website content modules so the chatbot can
build a complete knowledge base **without Selenium** and without relying on incomplete
SPA HTML crawls.

When website content changes, copy the updated files from the monorepo `src/` directory
into `website_sources/src/` before deploying the Space.
