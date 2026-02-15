# 028 - Dark-Only Mode & Language Dropdown Scroll

**Date:** 2026-02-14  
**Developer:** AI Assistant

## Summary
- Locked the site to dark mode only and removed light/dark toggle controls per client request.
- Made the language dropdown scrollable with a capped height so only half the list shows at once, both on desktop and mobile selectors.

## Changes
- `src/contexts/ThemeContext.tsx` — simplified to dark-only theme, removed localStorage toggle logic, and made theme switching a no-op.
- `src/components/Header.tsx` — removed theme toggle buttons/icons, added max-height with overflow scrolling to the language dropdowns (desktop and mobile).

## Notes
- Existing theme-dependent styling remains; with theme fixed to `dark`, the dark branch is always applied.
