# NexGenTeck.github.io

NexGenTeck.github.io is a multi-page agency site built with [React](https://react.dev/), [Vite](https://vite.dev/guide/), TypeScript, and a shared component layer in [src/components](src/components). The app is routed with [React Router](https://reactrouter.com/), rendered through [src/App.tsx](src/App.tsx), and composed from page modules in [src/pages](src/pages) and service-specific pages in [src/pages/services](src/pages/services).

The frontend is organized around a few reusable patterns:

- [src/components/Layout.tsx](src/components/Layout.tsx) provides the shared shell, route-aware page behavior, the animated background, header, footer, and chatbot mount point.
- [src/components/ServiceDetail.tsx](src/components/ServiceDetail.tsx) drives every service detail page from structured data objects instead of page-specific markup.
- [src/contexts/LanguageContext.tsx](src/contexts/LanguageContext.tsx) and [src/translations/serviceTranslations.ts](src/translations/serviceTranslations.ts) implement a large static translation layer with English fallback.
- [src/styles/globals.css](src/styles/globals.css) and [src/index.css](src/index.css) hold theme tokens, dark-mode overrides, utility tuning, and component-specific CSS that sits alongside Tailwind output.
- [Chatbot](Chatbot) contains the Python chatbot service, while [cloudflare](cloudflare), [nginx](nginx), and [Database](Database) show the deployment and backend support pieces that sit around the frontend.

## Interesting techniques in the code

- Route configuration is centralized in [src/utils/routes.ts](src/utils/routes.ts) with `createBrowserRouter` and a `basename` derived from `import.meta.env.BASE_URL`. That keeps the app portable across static hosting setups without rewriting route definitions.
- The shared layout in [src/components/Layout.tsx](src/components/Layout.tsx) resets scroll on route change with [`window.scrollTo()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollTo), while section-level navigation in pages such as [src/pages/About.tsx](src/pages/About.tsx) uses [`Element.scrollIntoView()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView) for anchor-based scrolling.
- The animated site background in [src/components/AnimatedBackground.tsx](src/components/AnimatedBackground.tsx) uses the [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API), [`window.requestAnimationFrame()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame), [`window.matchMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia), and [`window.devicePixelRatio`](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio) to scale cleanly across displays and honor reduced-motion preferences.
- Theme state is intentionally simple: [src/contexts/ThemeContext.tsx](src/contexts/ThemeContext.tsx) forces a dark-only mode by applying a root `dark` class, and [src/styles/globals.css](src/styles/globals.css) maps that into design tokens with [CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties).
- Service pages such as [src/pages/services/ThreeDGraphicsPage.tsx](src/pages/services/ThreeDGraphicsPage.tsx) are data-first. Each page passes title, copy, packages, FAQs, and image data into the shared [src/components/ServiceDetail.tsx](src/components/ServiceDetail.tsx), which keeps structure consistent while letting content vary.
- Pricing package rows in [src/components/ServiceDetail.tsx](src/components/ServiceDetail.tsx) use [CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout) for the row and [Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout) inside each card so cards stretch to equal height and CTA buttons stay aligned at the bottom.
- Entrance animation is handled through [Motion for React](https://motion.dev/docs/react) in [src/components/AnimatedSection.tsx](src/components/AnimatedSection.tsx) using `whileInView` and directional variants. The result is a viewport-aware animation layer similar in spirit to the browser's [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API), without custom observer plumbing in app code.
- The translation pipeline in [src/contexts/LanguageContext.tsx](src/contexts/LanguageContext.tsx) checks service-specific translations first, then page-level translations, then falls back to English. It also resolves short service keys into full title keys, which avoids duplicating display-name logic in page components.
- The hero carousel tuning in [src/index.css](src/index.css) uses [attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors) against `data-slot` values to force one-slide-at-a-time behavior without modifying the carousel component itself.
- The chatbot UI in [src/components/Chatbot.tsx](src/components/Chatbot.tsx) uses [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) with an environment-based API target, a message-end ref for automatic scroll syncing, and optimistic local UI state for typing and bot replies.

## Libraries and technologies worth noticing

- [Motion for React](https://motion.dev/docs/react) is the main animation layer. The code uses `motion.div`, `AnimatePresence`, hover transforms, and viewport-triggered transitions across core pages and shared components.
- [Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction) back much of the UI layer in [src/components/ui](src/components/ui). This gives the project accessible, unstyled interaction primitives rather than a pre-skinned component kit.
- [Class Variance Authority](https://cva.style/docs/api-reference) and [tailwind-merge](https://github.com/dcastil/tailwind-merge) are used together in the UI wrappers to build typed variant APIs and merge conflicting Tailwind utility strings safely.
- [Embla Carousel](https://www.embla-carousel.com/docs) powers the carousel primitives in [src/components/ui/carousel.tsx](src/components/ui/carousel.tsx), which is useful if you want a headless carousel instead of a full opinionated slider package.
- [React Hook Form](https://react-hook-form.com/docs) is already wired into the form primitives in [src/components/ui/form.tsx](src/components/ui/form.tsx), which means the component layer is set up for larger controlled and uncontrolled forms.
- [Recharts](https://recharts.org/) is wrapped in [src/components/ui/chart.tsx](src/components/ui/chart.tsx), with project-specific chart theming handled through CSS and utility classes.
- [Vaul](https://vaul.emilkowal.ski/getting-started) is used for drawer behavior in [src/components/ui/drawer.tsx](src/components/ui/drawer.tsx), which is a useful choice for mobile-first overlay interactions.
- [Sonner](https://sonner.emilkowal.ski/) is included through [src/components/ui/sonner.tsx](src/components/ui/sonner.tsx) for toast notifications.
- [React DayPicker](https://daypicker.dev/) and [input-otp](https://input-otp.rodz.dev/) are present in the UI layer, which suggests the component set is intended to support richer workflows than the current marketing pages expose.
- [react-resizable-panels](https://react-resizable-panels.vercel.app/) is wrapped in [src/components/ui/resizable.tsx](src/components/ui/resizable.tsx), giving the codebase a ready-to-use split-panel pattern.
- [Lucide React](https://lucide.dev/guide/packages/lucide-react) is the icon system across pages and shared UI.
- Typography uses the default system sans-serif stack defined in [src/index.css](src/index.css). There is no external font dependency in this release.

## Project structure

```text
.
├── .env.production
├── CNAME
├── index.html
├── main.py
├── package-lock.json
├── package.json
├── pyproject.toml
├── README.md
├── SQA_REPORT.md
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json
├── vite.config.ts
├── wrangler.toml
├── .github/
│   └── workflows/
├── build/
│   └── assets/
├── Chatbot/
├── cloudflare/
├── Database/
├── nginx/
├── project_docs/
│   ├── ai_history/
│   └── history_prompt/
├── public/
│   └── assets/
└── src/
    ├── components/
    │   ├── figma/
    │   └── ui/
    ├── contexts/
    ├── guidelines/
    ├── pages/
    │   └── services/
    ├── styles/
    ├── translations/
    └── utils/
```

- [src/components/ui](src/components/ui): Radix-based UI primitives and wrappers. This is the main place to look for the project's design-system direction.
- [src/pages/services](src/pages/services): Service-detail pages that feed structured content into the shared [src/components/ServiceDetail.tsx](src/components/ServiceDetail.tsx) template.
- [src/contexts](src/contexts): Application-wide state for theme and language selection.
- [src/translations](src/translations): Service-heavy translation dictionaries that complement the larger static dictionary in [src/contexts/LanguageContext.tsx](src/contexts/LanguageContext.tsx).
- [public/assets](public/assets): Static assets that ship as-is with the site, including page-specific imagery such as the 3D graphics hero image.
- [Chatbot](Chatbot): Python backend for chatbot behavior and supporting retrieval-based workflows.
- [cloudflare](cloudflare): Worker-level edge deployment support for the chatbot proxy path.
- [Database](Database): SQL assets for contact and newsletter persistence.
- [project_docs](project_docs): AI history and prompt history documents that explain past changes and project evolution.
