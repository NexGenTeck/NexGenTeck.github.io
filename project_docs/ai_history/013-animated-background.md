# 013 — Animated Particle Network Canvas

Date: 2026-01-24

Summary
-------
Added a site-wide animated particle network canvas background used across all pages. The theme supports both light and dark modes and follows the NexGenTeck orange/gold accent.

Files changed / added
---------------------
- Added: `src/components/AnimatedBackground.tsx` — React component implementing the canvas particle animation with mouse interaction and responsive particle counts.
- Modified: `src/components/Layout.tsx` — integrated the `AnimatedBackground` so the canvas renders behind all pages.
- Modified: `src/styles/globals.css` — added layering CSS rules for `.site-shell`, `.site-background`, and `.site-content` plus theme-aware variables exist in the file.

Implementation notes
--------------------
- The animation uses an HTML canvas and `requestAnimationFrame` for smooth rendering.
- Particle density is responsive (desktop/tablet/mobile thresholds) to mitigate performance impact:
  - >1200px: 660 particles
  - 768–1200px: 400 particles
  - <=768px: 170 particles
- Mouse move causes nearby particles to attract toward the cursor (subtle force), and lines are drawn between nearby particles with a brand-colored stroke.
- The canvas respects `ThemeContext` (`theme === 'dark'` or otherwise) and adjusts the background color and line opacity accordingly.

How to use / verify
-------------------
1. Start the dev server:

```bash
cd Startup
npm install   # if not already installed
npm run dev
```

2. Open the site (usually at `http://localhost:5173`) and toggle light/dark theme via the site controls to verify:
   - Dark mode: black background, stronger orange/gold lines.
   - Light mode: white background, lighter-line opacity so content remains readable.

Customization
-------------
- Color and opacity: edit `strokeColor` and `backgroundColor` inside `src/components/AnimatedBackground.tsx`.
- Particle count thresholds: modify the `getPointCount` function in the same component.
- Line distance and physics: the `dist < 120` checks control connection distance; the `force` constant controls mouse influence.

Performance tips
----------------
- Lower particle counts for lower-end devices.
- Debounce expensive calculations if adding more features.
- Consider switching to WebGL for extremely dense particle systems.

Notes for reviewers
-------------------
- The background is `position: fixed` and `pointer-events: none` to allow normal interaction.
- All site content is layered above the canvas via `.site-content { z-index: 1 }`.

If you want I can:
- Expose a site setting to control particle intensity (UI toggle).
- Add an option to disable the animated canvas per-user (to reduce CPU/battery use).

Signed-off-by: Automated update
