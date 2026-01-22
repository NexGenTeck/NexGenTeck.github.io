import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Calendar, User, Clock, ArrowRight, Search } from 'lucide-react';
import { AnimatedSection } from '../components/AnimatedSection';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useLanguage } from '../contexts/LanguageContext';

export const Blog: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { t } = useLanguage();

  const categories = [
    { key: 'all', label: t('blog.categories.all') },
    { key: 'web-development', label: t('blog.categories.webDevelopment') },
    { key: 'mobile-apps', label: t('blog.categories.mobileApps') },
    { key: 'digital-marketing', label: t('blog.categories.digitalMarketing') },
    { key: 'seo', label: t('blog.categories.seo') },
    { key: 'blockchain', label: t('blog.categories.blockchain') },
  ];

  const blogPosts = [
    {
      id: 'future-web-development',
      title: t('blog.posts.future-web-development.title'),
      excerpt: t('blog.posts.future-web-development.excerpt'),
      author: t('blog.posts.future-web-development.author'),
      date: t('blog.posts.future-web-development.date'),
      readTime: t('blog.posts.future-web-development.readTime'),
      category: 'web-development',
      image: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGNvZGluZ3xlbnwxfHx8fDE3NjQzODYyMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      tags: [
        t('blog.tags.webDevelopment'),
        t('blog.tags.technology'),
        t('blog.tags.trends'),
      ],
    },
    {
      id: 'mobile-app-optimization',
      title: t('blog.posts.mobile-app-optimization.title'),
      excerpt: t('blog.posts.mobile-app-optimization.excerpt'),
      author: t('blog.posts.mobile-app-optimization.author'),
      date: t('blog.posts.mobile-app-optimization.date'),
      readTime: t('blog.posts.mobile-app-optimization.readTime'),
      category: 'mobile-apps',
      image: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxtb2JpbGUlMjBhcHAlMjBkZXNpZ258ZW58MXx8fHwxNzY0NDEwODY4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      tags: [
        t('blog.tags.mobileApps'),
        t('blog.tags.performance'),
        t('blog.tags.optimization'),
      ],
    },
    {
      id: 'digital-marketing-strategies',
      title: t('blog.posts.digital-marketing-strategies.title'),
      excerpt: t('blog.posts.digital-marketing-strategies.excerpt'),
      author: t('blog.posts.digital-marketing-strategies.author'),
      date: t('blog.posts.digital-marketing-strategies.date'),
      readTime: t('blog.posts.digital-marketing-strategies.readTime'),
      category: 'digital-marketing',
      image: 'https://images.unsplash.com/photo-1557838923-2985c318be48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxkaWdpdGFsJTIwbWFya2V0aW5nfGVufDF8fHx8MTc2NDQyNjgzNnww&ixlib=rb-4.1.0&q=80&w=1080',
      tags: [
        t('blog.tags.marketing'),
        t('blog.tags.strategy'),
        t('blog.tags.growth'),
      ],
    },
    {
      id: 'seo-best-practices',
      title: t('blog.posts.seo-best-practices.title'),
      excerpt: t('blog.posts.seo-best-practices.excerpt'),
      author: t('blog.posts.seo-best-practices.author'),
      date: t('blog.posts.seo-best-practices.date'),
      readTime: t('blog.posts.seo-best-practices.readTime'),
      category: 'seo',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxzZW8lMjBhbmFseXRpY3N8ZW58MXx8fHwxNzY0NDAyMjQ1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      tags: [
        t('blog.tags.seo'),
        t('blog.tags.google'),
        t('blog.tags.search'),
      ],
    },
    {
      id: 'blockchain-business',
      title: t('blog.posts.blockchain-business.title'),
      excerpt: t('blog.posts.blockchain-business.excerpt'),
      author: t('blog.posts.blockchain-business.author'),
      date: t('blog.posts.blockchain-business.date'),
      readTime: t('blog.posts.blockchain-business.readTime'),
      category: 'blockchain',
      image: 'https://images.unsplash.com/photo-1666816943035-15c29931e975?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxibG9ja2NoYWluJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjQ0MzExMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      tags: [
        t('blog.tags.blockchain'),
        t('blog.tags.technology'),
        t('blog.tags.business'),
      ],
    },
    {
      id: 'ecommerce-conversion',
      title: t('blog.posts.ecommerce-conversion.title'),
      excerpt: t('blog.posts.ecommerce-conversion.excerpt'),
      author: t('blog.posts.ecommerce-conversion.author'),
      date: t('blog.posts.ecommerce-conversion.date'),
      readTime: t('blog.posts.ecommerce-conversion.readTime'),
      category: 'web-development',
      image: 'https://images.unsplash.com/photo-1727407209320-1fa6ae60ee05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxlY29tbWVyY2UlMjBzaG9wcGluZ3xlbnwxfHx8fDE3NjQzNDQ4NTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      tags: [
        t('blog.tags.ecommerce'),
        t('blog.tags.conversion'),
        t('blog.tags.sales'),
      ],
    },
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts[0];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section - Dark Theme */}
      <section className="relative hero-dark text-white py-20">
        <div className="hero-network"></div>
        <div className="hero-glow-lines"></div>
        <div className="hero-particles"></div>
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">{t('blog.hero.title')}</h1>
            <p className="text-xl text-white/90 mb-8">
              {t('blog.hero.subtitle')}
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('blog.search.placeholder')}
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <Link to={`/blog/${featuredPost.id}`}>
              <motion.div
                whileHover={{ y: -10 }}
                className="grid lg:grid-cols-2 gap-8 bg-gradient-to-br from-orange-50 to-purple-50 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="relative h-96 lg:h-auto">
                  <ImageWithFallback
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg">
                    {t('blog.featured.label')}
                  </div>
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {featuredPost.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-500 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-3xl lg:text-4xl text-gray-900 mb-4">{featuredPost.title}</h2>
                  <p className="text-lg text-gray-600 mb-6">{featuredPost.excerpt}</p>
                  <div className="flex items-center space-x-6 text-gray-600 mb-6">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span className="text-sm">{featuredPost.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{featuredPost.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{featuredPost.readTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-orange-500 group">
                    <span className="mr-2">{t('blog.actions.readArticle')}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <motion.button
                key={cat.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-6 py-3 rounded-lg transition-all ${selectedCategory === cat.key
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <AnimatedSection key={post.id} delay={index * 0.1}>
                <Link to={`/blog/${post.id}`}>
                  <motion.article
                    whileHover={{ y: -10 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all h-full flex flex-col"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <ImageWithFallback
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="px-3 py-1 bg-orange-50 text-orange-500 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-xl text-gray-900 mb-3">{post.title}</h3>
                      <p className="text-gray-600 mb-4 flex-1">{post.excerpt}</p>
                      <div className="flex items-center space-x-4 text-gray-500 text-sm mb-4">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-orange-500 group">
                        <span className="mr-2">{t('blog.actions.readMore')}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </motion.article>
                </Link>
              </AnimatedSection>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">{t('blog.empty')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-12 text-center text-white">
              <h2 className="text-4xl lg:text-5xl mb-6">{t('blog.newsletter.title')}</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
                {t('blog.newsletter.subtitle')}
              </p>
              <form className="max-w-md mx-auto flex gap-4">
                <input
                  type="email"
                  placeholder={t('blog.newsletter.placeholder')}
                  className="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                  type="submit"
                  className="bg-white text-orange-500 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all flex items-center space-x-2"
                >
                  <span>{t('blog.newsletter.button')}</span>
                </button>
              </form>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};
