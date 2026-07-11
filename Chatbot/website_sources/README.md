# Bundled website sources for chatbot ingestion

These files are a **deployment snapshot** of the public website content modules used by
`content_extractor.py` when the full monorepo `src/` tree is not available
(for example inside a Chatbot-only container).

## Source of truth

1. Live monorepo paths under `../src/` (preferred when present)
2. This bundled snapshot (`website_sources/src/`)
3. Optional live-site crawl
4. Minimal emergency fallback

When website content changes in the monorepo, **update these bundled files** in the same
PR by copying the corresponding files from `src/`:

- `pages/Portfolio.tsx`
- `pages/About.tsx`
- `pages/Services.tsx`
- `pages/Home.tsx`
- `pages/Contact.tsx`
- `pages/Pricing.tsx`
- `components/Footer.tsx`
- `components/Header.tsx`
- `utils/routes.ts`
- `contexts/LanguageContext.tsx`
- `translations/serviceTranslations.ts`

No local preprocessing command is required at deploy time: the chatbot extracts structured
knowledge from these sources automatically on startup / reindex.
