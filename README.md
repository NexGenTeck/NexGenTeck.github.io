# NexGenTeck - Modern Multi-Page Business Website

[![Deploy to GitHub Pages](https://github.com/muhammadhasaan82/Startup/actions/workflows/deploy.yml/badge.svg)](https://github.com/muhammadhasaan82/Startup/actions/workflows/deploy.yml)
[![CI](https://github.com/muhammadhasaan82/Startup/actions/workflows/ci.yml/badge.svg)](https://github.com/muhammadhasaan82/Startup/actions/workflows/ci.yml)

A comprehensive, production-ready business website template built with React, TypeScript, and Vite. Perfect for digital agencies, tech companies, or service-based businesses looking for a modern web presence.

## 🌟 Features

### Core Functionality
- **8 Complete Pages**: Home, About, Services, Portfolio, Pricing, Blog, Contact, 404
- **8 Service Detail Pages**: E-commerce, Web Development, Mobile Apps, Social Media, SEO, Software, 3D Graphics, Video Editing
- **Multi-language Support**: Built-in internationalization (i18n) with 15+ languages
- **Responsive Design**: Mobile-first approach, works flawlessly on all devices
- **Contact Form with Database**: TypeScript API + PostgreSQL backend for form submissions
- **AI Chatbot Backend**: FastAPI-based RAG chatbot with intelligent lead generation via Cloudflare Worker proxy

### Technical Highlights
- ⚡ **Vite** - Lightning-fast build tool and dev server
- 🎯 **TypeScript** - Full type safety across the codebase
- 🎨 **Framer Motion** - Smooth, professional animations
- 🧩 **Radix UI** - Accessible, unstyled component primitives
- 🎭 **Tailwind Utilities** - Modern styling with tailwind-merge
- 🔄 **React Router** - Client-side routing with dynamic pages
- 🚀 **CI/CD Pipeline** - Automated testing and deployment
- 🤖 **AI Integration** - AgenticRAG chatbot with Groq LLM
- 💾 **Database Backend** - PostgreSQL + TypeScript Express API

### UI/UX Features
- Beautiful gradient backgrounds and glassmorphism effects
- Smooth scroll animations and page transitions
- Interactive hover states and micro-interactions
- Professional testimonials and portfolio sections
- Stats counters and achievement displays
- SEO-optimized structure
- Dark/Light theme support

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/muhammadhasaan82/Startup.git
cd Startup

# Install dependencies
npm install

# Start development server (runs on port 4000)
npm run dev

# Build for production
npm run build
```

## 📦 Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 18.3.1 |
| **Language** | TypeScript |
| **Build Tool** | Vite 6.3.5 |
| **Styling** | CSS + Tailwind utilities |
| **Animations** | Framer Motion |
| **UI Components** | Radix UI |
| **Icons** | Lucide React |
| **Routing** | React Router |
| **Backend API** | Express + TypeScript |
| **Database** | PostgreSQL 16 |
| **Chatbot** | FastAPI + Qdrant + Groq |
| **Proxy** | Cloudflare Workers |
| **CI/CD** | GitHub Actions |

## 📁 Project Structure

```
NGT/
├── .github/
│   └── workflows/
│       ├── deploy.yml      # Deployment pipeline
│       └── ci.yml          # Continuous integration
├── Chatbot/                # FastAPI chatbot backend
│   ├── main.py
│   ├── rag_pipeline.py
│   ├── sentiment.py
│   ├── vector_store.py
│   └── docker-compose.yml
├── cloudflare/             # Cloudflare Worker proxy
│   └── chatbot-proxy-worker.js
├── ContactApi/             # TypeScript Express API
│   ├── src/
│   │   ├── index.ts
│   │   └── db.ts
│   ├── package.json
│   └── docker-compose.yml
├── Database/               # PostgreSQL setup
│   ├── docker-compose.yml
│   └── init/
│       └── 01-schema.sql
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Layout.tsx
│   │   ├── Chatbot.tsx
│   │   └── AnimatedSection.tsx
│   ├── pages/              # Page components
│   │   ├── Home.tsx
│   │   ├── About.tsx
│   │   ├── Services.tsx
│   │   ├── Portfolio.tsx
│   │   ├── Pricing.tsx
│   │   ├── Blog.tsx
│   │   ├── Contact.tsx
│   │   ├── NotFound.tsx
│   │   └── services/       # Service detail pages
│   ├── contexts/           # React contexts
│   │   └── LanguageContext.tsx
│   ├── utils/              # Utility functions
│   │   └── routes.ts
│   └── index.css           # Global styles
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript config
├── wrangler.toml           # Cloudflare Worker config
└── package.json            # Dependencies
```

## 🤖 Backend Services

### Cloudflare Worker Proxy
HTTPS proxy that enables the chatbot to communicate with the backend API from GitHub Pages.

**Features:**
- HTTPS → HTTP proxy (GitHub Pages requires HTTPS for all API calls)
- CORS configuration for allowed origins
- Uses nip.io wildcard DNS to bypass Cloudflare 1003 restrictions
- Clean header forwarding
- Deployed at: `https://ngt-chatbot-proxy.muhammadhasaan82.workers.dev`

**Deployment:**
```bash
cd ngt-chatbot-proxy  # or use cloudflare/ in this repo
npm install wrangler --save-dev
npx wrangler deploy
```

See [project_docs/ai_history/026-chatbot-deployment-worker-fix.md](project_docs/ai_history/026-chatbot-deployment-worker-fix.md) for detailed setup.

### Contact API
TypeScript/Express API for handling contact form submissions with PostgreSQL storage.

**Features:**
- REST endpoint for form submissions
- Input validation
- PostgreSQL storage with prepared statements
- CORS support for GitHub Pages
- Docker deployment

See [ContactApi/README.md](ContactApi/README.md) for setup instructions.

### Chatbot Backend
FastAPI-based RAG chatbot with intelligent conversation and lead generation.

**Features:**
- AgenticRAG pipeline with Qdrant vector store
- Multi-language support
- Sentiment analysis and intent detection
- Automated lead generation
- Website scraping and knowledge ingestion
- Accessible via Cloudflare Worker proxy

See [Chatbot/README.md](Chatbot/README.md) for setup instructions.

## 🔄 CI/CD Pipeline

This project includes automated CI/CD pipelines using GitHub Actions:

### Continuous Integration (CI)
- ✅ Runs on every push and pull request
- ✅ TypeScript type checking
- ✅ Build verification
- ✅ Code quality checks

### Continuous Deployment (CD)
- 🚀 Automatic deployment to GitHub Pages
- 🚀 Triggered on push to `main` branch
- 🚀 Build artifacts optimization
- 🚀 Zero-downtime deployment

### Workflow Files
- `.github/workflows/ci.yml` - Continuous integration
- `.github/workflows/deploy.yml` - Deployment to GitHub Pages

## 🌐 Deployment

### GitHub Pages (Automated)
The site automatically deploys to GitHub Pages when you push to the `main` branch.

**Live URL**: `https://nexgenteck.github.io/NGT/`

### Cloudflare Worker (Chatbot Proxy)
Deploy the Worker proxy for chatbot functionality:

```bash
cd ngt-chatbot-proxy  # or muhammadhasaan82/ngt-chatbot-proxy repo
npm install wrangler --save-dev
npx wrangler deploy
```

**Worker URL**: `https://ngt-chatbot-proxy.muhammadhasaan82.workers.dev`

**Environment Variables** (set in `wrangler.toml`):
- `BACKEND_IP`: Your DigitalOcean droplet IP
- `BACKEND_PORT`: Backend API port (default: 8000)

### Backend Deployment (DigitalOcean VM)

1. **Deploy Database**:
```bash
cd Database
cp .env.example .env
# Edit .env with strong credentials
docker compose up -d
```

2. **Deploy Contact API**:
```bash
cd ContactApi
cp .env.example .env
# Edit .env with DB credentials
docker compose up -d
```

3. **Deploy Chatbot**:
```bash
cd Chatbot
cp .env.example .env
# Add GROQ_API_KEY and configure Qdrant
docker compose up -d

# Or run with PM2 (current production setup):
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**Note**: The chatbot backend is accessed via nip.io hostname (e.g., `165-245-177-103.nip.io`) to bypass Cloudflare's raw IP restrictions. See `026-chatbot-deployment-worker-fix.md` for details.

## 🎨 Design Philosophy

This project emphasizes:
- Modern, vibrant aesthetics with gradient color schemes
- Smooth animations that enhance user experience
- Accessibility-first component design
- Performance optimization
- Clean, maintainable code structure
- Type safety with TypeScript

## 🛠️ DevelopmentNGT/` for GitHub Pages. For local development, it uses `/`.

For Contact API integration, set:
```bash
VITE_CONTACT_API_URL=https://api.yourdomain.com
```

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Type check
npx tsc --noEmit
```

### Environment Variables

Create a `.env.production` file for production builds:

```bash
# Chatbot API (Cloudflare Worker proxy)
VITE_CHATBOT_API_URL=https://ngt-chatbot-proxy.muhammadhasaan82.workers.dev

# Contact API (optional)
VITE_CONTACT_API_URL=https://api.yourdomain.com
```

For production builds, the base path is automatically set to `/NGT/` for GitHub Pages. For local development, it uses `/`.

## 📄 License

This project is based on a Figma design available at [figma.com/design/ygKqUdD2ug2KnKixaW1i0E](https://www.figma.com/design/ygKqUdD2ug2KnKixaW1i0E/Multi-Page-Next.js-Website)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

Muhammad Hasaan - [@muhammadhasaan82](https://github.com/muhammadhasaan82)

**Project Links:**
- Main Site: [https://nexgenteck.github.io/NGT/](https://nexgenteck.github.io/NGT/)
- Frontend Repo: [https://github.com/NexGenTeck/NGT](https://github.com/NexGenTeck/NGT)
- Backend Repo: [https://github.com/muhammadhasaan82/Startup](https://github.com/muhammadhasaan82/Startup)
- Worker Repo: [https://github.com/muhammadhasaan82/ngt-chatbot-proxy](https://github.com/muhammadhasaan82/ngt-chatbot-proxy)

---

⭐ **Star this repository if you find it helpful!**