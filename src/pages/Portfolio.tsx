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
    { key: 'all', label: t('portfolio.filters.all') },
    { key: 'web', label: t('portfolio.filters.web') },
    { key: 'mobile', label: t('portfolio.filters.mobile') },
    { key: 'ecommerce', label: t('portfolio.filters.ecommerce') },
    { key: 'marketing', label: t('portfolio.filters.marketing') },
    { key: 'blockchain', label: t('portfolio.filters.blockchain') },
  ];

  const projects = [
    {
      id: 'global-ecommerce',
      title: t('portfolio.projects.global-ecommerce.title'),
      category: 'ecommerce',
      client: 'RetailCo',
      image: 'https://images.unsplash.com/photo-1727407209320-1fa6ae60ee05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjBzaG9wcGluZ3xlbnwxfHx8fDE3NjQzNDQ4NTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description: t('portfolio.projects.global-ecommerce.description'),
      tags: [
        t('portfolio.projects.global-ecommerce.tag1'),
        t('portfolio.projects.global-ecommerce.tag2'),
        t('portfolio.projects.global-ecommerce.tag3'),
      ],
    },
    {
      id: 'corporate-redesign',
      title: t('portfolio.projects.corporate-redesign.title'),
      category: 'web',
      client: 'TechCorp Inc',
      image: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGNvZGluZ3xlbnwxfHx8fDE3NjQzODYyMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description: t('portfolio.projects.corporate-redesign.description'),
      tags: [
        t('portfolio.projects.corporate-redesign.tag1'),
        t('portfolio.projects.corporate-redesign.tag2'),
        t('portfolio.projects.corporate-redesign.tag3'),
      ],
    },
    {
      id: 'fitness-app',
      title: t('portfolio.projects.fitness-app.title'),
      category: 'mobile',
      client: 'FitLife',
      image: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBkZXNpZ258ZW58MXx8fHwxNzY0NDEwODY4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      description: t('portfolio.projects.fitness-app.description'),
      tags: [
        t('portfolio.projects.fitness-app.tag1'),
        t('portfolio.projects.fitness-app.tag2'),
        t('portfolio.projects.fitness-app.tag3'),
      ],
    },
    {
      id: 'digital-campaign',
      title: t('portfolio.projects.digital-campaign.title'),
      category: 'marketing',
      client: 'BrandBoost',
      image: 'https://images.unsplash.com/photo-1557838923-2985c318be48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbWFya2V0aW5nfGVufDF8fHx8MTc2NDQyNjgzNnww&ixlib=rb-4.1.0&q=80&w=1080',
      description: t('portfolio.projects.digital-campaign.description'),
      tags: [
        t('portfolio.projects.digital-campaign.tag1'),
        t('portfolio.projects.digital-campaign.tag2'),
        t('portfolio.projects.digital-campaign.tag3'),
      ],
    },
    {
      id: 'blockchain-platform',
      title: t('portfolio.projects.blockchain-platform.title'),
      category: 'blockchain',
      client: 'CryptoVentures',
      image: 'https://images.unsplash.com/photo-1666816943035-15c29931e975?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9ja2NoYWluJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjQ0MzExMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description: t('portfolio.projects.blockchain-platform.description'),
      tags: [
        t('portfolio.projects.blockchain-platform.tag1'),
        t('portfolio.projects.blockchain-platform.tag2'),
        t('portfolio.projects.blockchain-platform.tag3'),
      ],
    },
    {
      id: 'food-delivery',
      title: t('portfolio.projects.food-delivery.title'),
      category: 'mobile',
      client: 'QuickEats',
      image: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBkZXNpZ258ZW58MXx8fHwxNzY0NDEwODY4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      description: t('portfolio.projects.food-delivery.description'),
      tags: [
        t('portfolio.projects.food-delivery.tag1'),
        t('portfolio.projects.food-delivery.tag2'),
        t('portfolio.projects.food-delivery.tag3'),
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
              <AnimatedSection key={project.id} delay={index * 0.1}>
                <Link to={`/portfolio/${project.id}`}>
                  <motion.div
                    whileHover={{ y: -10 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <ImageWithFallback
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="text-sm text-blue-400 mb-2">{project.client}</div>
                        <h3 className="text-xl text-white mb-2">{project.title}</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-600 mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-orange-50 text-orange-500 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </Link>
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
