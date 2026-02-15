# 027 - Footer & Contact Info Refresh

**Date:** 2026-02-14  
**Developer:** AI Assistant

## Summary
- Updated the footer tagline to “Your Digital Backbone” and copyright to “© 2026 NexGenTeck | All rights reserved.” across all languages.
- Refreshed contact details to the Karachi office: Shahra-e-Faisal, Karachi, Pakistan, phone +92 300 927 0131, email info@nexgenteck.com (footer, contact page, pricing CTA, and placeholders).
- Hid the Blog and legal footer links while keeping the code intact; disabled Blog routing so the section stays unavailable without deletion.
- Confirmed the hero “Watch a Quick Intro” keeps the provided YouTube link and only appears for English; footer socials now surface the X icon and current Facebook/Instagram/YouTube links.

## Changes
- `src/components/Footer.tsx` — updated contact email, unhid X icon with link, confirmed social URLs, and hid legal links.
- `src/pages/Contact.tsx` — single official email/phone, conditional address rendering to avoid blank lines.
- `src/pages/Pricing.tsx` — CTA phone number switched to +92 300 927 0131.
- `src/utils/routes.ts` — blog routes gated behind `BLOG_ENABLED = false` to hide the section without removing code.
- `src/contexts/LanguageContext.tsx` — synchronized footer tagline/rights, contact address lines, and phone placeholder in every language.
