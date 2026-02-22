import React from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { AnimatedSection } from '../components/AnimatedSection';
import { useLanguage } from '../contexts/LanguageContext';

export const Pricing: React.FC = () => {
  const { t } = useLanguage();
  const services = [
    { id: 'ecommerce', tiers: ['basic', 'standard', 'enterprise'] },
    { id: 'website', tiers: ['simple', 'standard', 'custom'] },
    { id: 'social', tiers: ['basic', 'growth', 'advanced'] },
    { id: 'seo', tiers: ['basic', 'standard', 'enterprise'] },
    { id: 'mobile', tiers: ['simple', 'mid', 'enterprise'] },
    { id: 'software', tiers: ['custom', 'webapp', 'qa'] },
    { id: 'graphic', tiers: ['social', 'banner', 'brochure'] },
    { id: 'video', tiers: ['basic', 'advanced'] },
    { id: 'ai', tiers: ['basic', 'standard', 'enterprise'] },
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
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">{t('nav.pricing')}</h1>
            <p className="text-xl text-white/90 mb-8">
              {t('pricing.hero.subtitle')}
            </p>

          </AnimatedSection>
        </div>
      </section>

      {/* Service Pricing */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">{t('pricing.section.title')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t('pricing.section.subtitle')}</p>
          </AnimatedSection>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <AnimatedSection key={service.id} delay={index * 0.05}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all"
                >
                  <div className="mb-6">
                    <h3 className="text-2xl text-gray-900 mb-2">{t(`pricing.services.${service.id}.title`)}</h3>
                    <p className="text-gray-600">{t(`pricing.services.${service.id}.subtitle`)}</p>
                  </div>

                  <div className="space-y-4">
                    {service.tiers.map((tier) => (
                      <div key={tier} className="flex items-start justify-between border-b border-gray-100 pb-3 last:border-b-0">
                        <span className="text-gray-700 font-medium">
                          {t(`pricing.services.${service.id}.tier.${tier}.label`)}
                        </span>
                        <span className="text-orange-500 font-semibold">
                          {t(`pricing.services.${service.id}.tier.${tier}.price`)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="text-sm text-gray-500 mt-4">
                    {t(`pricing.services.${service.id}.note`)}
                  </p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>

          <div className="max-w-3xl mx-auto mt-12 text-center text-sm text-gray-500">
            <h3 className="text-gray-900 font-semibold mb-2">{t('pricing.disclaimer.title')}</h3>
            <p>{t('pricing.disclaimer.body')}</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-12 text-center text-white">
              <h2 className="text-4xl lg:text-5xl mb-6">{t('pricing.cta.title')}</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
                {t('pricing.cta.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center space-x-2 bg-white text-orange-500 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105"
                >
                  <span>{t('pricing.cta.contactSales')}</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="tel:+923009270131"
                  className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-orange-500 transition-all"
                >
                  {t('pricing.cta.callUs')} +92 300 927 0131
                </a>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};
