import React from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, ShoppingCart, Globe, Megaphone, Search, Share2, Smartphone, Code, TrendingUp, Lock } from 'lucide-react';
import { AnimatedSection } from '../components/AnimatedSection';
import { useLanguage } from '../contexts/LanguageContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export const Services: React.FC = () => {
  const { t } = useLanguage();

  const services = [
    {
      title: 'E-commerce Development',
      slug: 'ecommerce',
      icon: <ShoppingCart className="w-12 h-12" />,
      description: 'Create powerful online stores with seamless shopping experiences, secure payment processing, and inventory management.',
      features: ['Custom Shopping Cart', 'Payment Gateway Integration', 'Product Management', 'Order Tracking', 'Analytics Dashboard'],
      image: 'https://images.unsplash.com/photo-1727407209320-1fa6ae60ee05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjBzaG9wcGluZ3xlbnwxfHx8fDE3NjQzNDQ4NTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: 'Website Development',
      slug: 'web-development',
      icon: <Globe className="w-12 h-12" />,
      description: 'Build responsive, fast, and SEO-optimized websites that engage visitors and drive conversions.',
      features: ['Responsive Design', 'CMS Integration', 'Fast Loading Speed', 'SEO Optimization', 'Security Features'],
      image: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGNvZGluZ3xlbnwxfHx8fDE3NjQzODYyMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: 'Google Ads (PPC)',
      slug: 'google-ads',
      icon: <Megaphone className="w-12 h-12" />,
      description: 'Drive targeted traffic and maximize ROI with expertly managed Google Ads campaigns.',
      features: ['Campaign Strategy', 'Keyword Research', 'Ad Copywriting', 'Bid Management', 'Performance Tracking'],
      image: 'https://images.unsplash.com/photo-1557838923-2985c318be48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbWFya2V0aW5nfGVufDF8fHx8MTc2NDQyNjgzNnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: 'Search Engine Optimization',
      slug: 'seo',
      icon: <Search className="w-12 h-12" />,
      description: 'Improve your search rankings and organic visibility with comprehensive SEO strategies.',
      features: ['Technical SEO', 'Content Optimization', 'Link Building', 'Local SEO', 'SEO Audits'],
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZW8lMjBhbmFseXRpY3N8ZW58MXx8fHwxNzY0NDAyMjQ1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: 'Social Media Marketing',
      slug: 'social-media',
      icon: <Share2 className="w-12 h-12" />,
      description: 'Build brand awareness and engage your audience across all major social platforms.',
      features: ['Content Creation', 'Community Management', 'Paid Social Ads', 'Influencer Marketing', 'Analytics & Reporting'],
      image: 'https://images.unsplash.com/photo-1557838923-2985c318be48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbWFya2V0aW5nfGVufDF8fHx8MTc2NDQyNjgzNnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: 'Mobile App Development',
      slug: 'mobile-app',
      icon: <Smartphone className="w-12 h-12" />,
      description: 'Create native and cross-platform mobile applications for iOS and Android.',
      features: ['Native iOS & Android', 'Cross-Platform Development', 'UI/UX Design', 'API Integration', 'App Store Optimization'],
      image: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBkZXNpZ258ZW58MXx8fHwxNzY0NDEwODY4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: 'Software Development',
      slug: 'software',
      icon: <Code className="w-12 h-12" />,
      description: 'Custom software solutions tailored to your business needs and workflows.',
      features: ['Custom Software', 'Enterprise Solutions', 'API Development', 'Cloud Integration', 'Maintenance & Support'],
      image: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGNvZGluZ3xlbnwxfHx8fDE3NjQzODYyMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: 'Outdoor Media Advertising',
      slug: 'outdoor-media',
      icon: <TrendingUp className="w-12 h-12" />,
      description: 'Maximize brand visibility with strategic outdoor advertising campaigns.',
      features: ['Billboard Advertising', 'Transit Advertising', 'Digital Displays', 'Location Planning', 'Campaign Management'],
      image: 'https://images.unsplash.com/photo-1557838923-2985c318be48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbWFya2V0aW5nfGVufDF8fHx8MTc2NDQyNjgzNnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: 'Blockchain Development',
      slug: 'blockchain',
      icon: <Lock className="w-12 h-12" />,
      description: 'Leverage blockchain technology for secure, transparent, and decentralized solutions.',
      features: ['Smart Contracts', 'DApp Development', 'Cryptocurrency', 'NFT Platforms', 'Blockchain Consulting'],
      image: 'https://images.unsplash.com/photo-1666816943035-15c29931e975?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9ja2NoYWluJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjQ0MzExMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section - Dark Theme */}
      <section className="relative hero-dark text-white py-20">
        <div className="hero-network"></div>
        <div className="hero-glow-lines"></div>
        <div className="hero-particles"></div>
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">{t('services.title')}</h1>
            <p className="text-xl text-white/90">
              {t('services.subtitle')}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <Link to={`/services/${service.slug}`}>
                  <motion.div
                    whileHover={{ y: -10 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100 h-full"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <ImageWithFallback
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 text-white">
                        {service.icon}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl text-gray-900 mb-3">{service.title}</h3>
                      <p className="text-gray-600 mb-4">{service.description}</p>
                      <ul className="space-y-2 mb-6">
                        {service.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="flex items-center text-gray-600 text-sm">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center text-orange-500 group hover:text-orange-600 transition-colors">
                        <span className="mr-2">Learn More</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">Our Process</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A proven methodology to deliver exceptional results
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Discovery', description: 'We analyze your needs and goals to create a strategic plan' },
              { step: '02', title: 'Design', description: 'Our team creates beautiful, user-centric designs' },
              { step: '03', title: 'Development', description: 'We build your solution using cutting-edge technologies' },
              { step: '04', title: 'Launch', description: 'We deploy and provide ongoing support and optimization' },
            ].map((item, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="text-5xl bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
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
              <h2 className="text-4xl lg:text-5xl mb-6">Ready to Get Started?</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
                Let's discuss your project and how we can help bring your vision to life
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  className="bg-white text-orange-500 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 inline-flex items-center justify-center space-x-2"
                >
                  <span>Contact Us</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/pricing"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-orange-500 transition-all inline-flex items-center justify-center"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};
