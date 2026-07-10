import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { AnimatedSection } from '../components/AnimatedSection';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useLanguage } from '../contexts/LanguageContext';

export const Portfolio: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const { t } = useLanguage();

  const categories = [
    { key: 'all', label: 'All Projects' },
    { key: 'ecommerce', label: 'E-commerce' },
    { key: 'mobile', label: 'Mobile Applications' },
    { key: 'ai', label: 'Artificial Intelligence' },
    { key: 'marketing', label: 'Digital Marketing' },
  ];

  const projects = [
    {
      id: 'trackit',
      title: 'TrackIT',
      category: 'ecommerce',
      type: 'E-commerce Platform',
      image: '/portfolio/trackit.jpeg',
      description:
        'A data-driven e-commerce platform designed to help sellers launch, manage, and grow their TikTok Shop by tracking products, creators, sales performance, and market trends.',
      tags: ['E-commerce', 'Product Analytics', 'TikTok Shop'],
    },
    {
      id: 'swift-translate-pro',
      title: 'Swift Translate Pro',
      category: 'ai',
      type: 'AI Translation System',
      image: '/portfolio/swift-translate-pro.jpeg',
      description:
        'AI-powered multilingual translation via fast, API-based language processing. Streamlines cross-team communication with accurate, real-time translations.',
      tags: ['Artificial Intelligence', 'API Integration', 'Translation'],
    },
    {
      id: 'tiktok-downloader',
      title: 'TikTok Downloader – Flagship SaaS',
      category: 'mobile',
      type: 'Mobile and SaaS Application',
      image: '/portfolio/tiktok-downloader.jpeg',
      description:
        'A scalable SaaS platform for downloading TikTok videos, built for speed and reliability. Featuring responsive interfaces, API integration, and seamless multi-device support.',
      tags: ['Next.js', 'Node.js', 'API Integration'],
    },
    {
      id: 't-downloader-app',
      title: 'T Downloader App',
      category: 'mobile',
      type: 'Mobile Application',
      image: '/portfolio/t-downloader-app.jpeg',
      description:
        'A mobile-first Android application for fast, watermark-free social media video downloads with a clean and responsive user experience.',
      tags: ['Flutter', 'Android', 'Mobile Application'],
    },
    {
      id: 'ai-property-booking-concierge',
      title: 'AI Property Booking Concierge',
      category: 'ai',
      type: 'Multi-Agent AI System',
      image: '/portfolio/ai-booking-concierge.jpg',
      description:
        'A multi-agent AI property booking system featuring intelligent search, booking workflows, memory, recommendations, retrieval, and conversational support.',
      tags: ['Multi-Agent AI', 'RAG', 'FastAPI'],
    },
    {
      id: 'digital-campaign',
      title: t('portfolio.projects.digital-campaign.title'),
      category: 'marketing',
      type: 'Digital Marketing',
      image: 'https://images.unsplash.com/photo-1557838923-2985c318be48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbWFya2V0aW5nfGVufDF8fHx8MTc2NDQyNjgzNnww&ixlib=rb-4.1.0&q=80&w=1080',
      description: t('portfolio.projects.digital-campaign.description'),
      tags: [
        t('portfolio.projects.digital-campaign.tag1'),
        t('portfolio.projects.digital-campaign.tag2'),
        t('portfolio.projects.digital-campaign.tag3'),
      ],
    },
  ];

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter(p => p.category === filter);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section - Dark Theme */}
      <section className="relative hero-dark text-white py-20">
        <div className="hero-network"></div>
        <div className="hero-glow-lines"></div>
        <div className="hero-particles"></div>
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">{t('portfolio.page.title')}</h1>
            <p className="text-xl text-white/90">
              {t('portfolio.page.subtitle')}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <motion.button
                key={cat.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(cat.key)}
                className={`px-6 py-3 rounded-lg transition-all ${filter === cat.key
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <AnimatedSection key={project.id} delay={index * 0.1} className="h-full">
                <motion.div
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group h-full flex flex-col"
                >
                  <div className="relative h-64 overflow-hidden">
                    <ImageWithFallback
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="text-sm text-orange-400 mb-2">{project.type}</div>
                      <h3 className="text-xl text-white mb-2">{project.title}</h3>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1 min-w-0">
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1">
                      {project.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="shrink-0 whitespace-nowrap px-3 py-1 bg-orange-50 text-orange-500 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-12 text-center text-white">
              <h2 className="text-4xl lg:text-5xl mb-6">{t('portfolio.cta.title')}</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
                {t('portfolio.cta.subtitle')}
              </p>
              <Link
                to="/contact"
                className="inline-block bg-white text-orange-500 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105"
              >
                {t('portfolio.cta.button')}
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};
