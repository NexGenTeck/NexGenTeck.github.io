# NexGenTeck - Modern Multi-Page Business Website

[![Deploy to GitHub Pages](https://github.com/muhammadhasaan82/Startup/actions/workflows/deploy.yml/badge.svg)](https://github.com/muhammadhasaan82/Startup/actions/workflows/deploy.yml)
[![CI](https://github.com/muhammadhasaan82/Startup/actions/workflows/ci.yml/badge.svg)](https://github.com/muhammadhasaan82/Startup/actions/workflows/ci.yml)

A comprehensive, production-ready business website template built with React, TypeScript, and Vite. Perfect for digital agencies, tech companies, or service-based businesses looking for a modern web presence.

## 🌟 Features

### Core Functionality
- **8 Complete Pages**: Home, About, Services, Portfolio, Pricing, Blog, Contact, 404
- **6 Service Detail Pages**: E-commerce, Web Development, Mobile Apps, Social Media, SEO, Blockchain
- **Multi-language Support**: Built-in internationalization (i18n) system
- **Responsive Design**: Mobile-first approach, works flawlessly on all devices

### Technical Highlights
- ⚡ **Vite** - Lightning-fast build tool and dev server
- 🎯 **TypeScript** - Full type safety across the codebase
- 🎨 **Framer Motion** - Smooth, professional animations
- 🧩 **Radix UI** - Accessible, unstyled component primitives
- 🎭 **Tailwind Utilities** - Modern styling with tailwind-merge
- 🔄 **React Router** - Client-side routing with dynamic pages
- 🚀 **CI/CD Pipeline** - Automated testing and deployment

### UI/UX Features
- Beautiful gradient backgrounds and glassmorphism effects
- Smooth scroll animations and page transitions
- Interactive hover states and micro-interactions
- Professional testimonials and portfolio sections
- Stats counters and achievement displays
- SEO-optimized structure

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
| **CI/CD** | GitHub Actions |

## 📁 Project Structure

```
Startup/
├── .github/
│   └── workflows/
│       ├── deploy.yml      # Deployment pipeline
│       └── ci.yml          # Continuous integration
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Layout.tsx
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
└── package.json            # Dependencies
```

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

**Live URL**: `https://muhammadhasaan82.github.io/Startup/`

### Manual Deployment

```bash
# Build the project
npm run build

# The build folder contains the production-ready files
# Deploy the contents of the 'build' folder to your hosting provider
```

## 🎨 Design Philosophy

This project emphasizes:
- Modern, vibrant aesthetics with gradient color schemes
- Smooth animations that enhance user experience
- Accessibility-first component design
- Performance optimization
- Clean, maintainable code structure
- Type safety with TypeScript

## 🛠️ Development

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

For production builds, the base path is automatically set to `/Startup/` for GitHub Pages. For local development, it uses `/`.

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

Project Link: [https://github.com/muhammadhasaan82/Startup](https://github.com/muhammadhasaan82/Startup)

---

⭐ **Star this repository if you find it helpful!**