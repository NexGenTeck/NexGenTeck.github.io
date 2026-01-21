import React from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useLanguage } from '../contexts/LanguageContext';

interface ServiceDetailProps {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  features: string[];
  benefits: string[];
  process: Array<{ title: string; description: string }>;
  packages: Array<{
    name: string;
    price: string;
    features: string[];
    popular?: boolean;
  }>;
  faqs: Array<{ question: string; answer: string }>;
}

export const ServiceDetail: React.FC<ServiceDetailProps> = ({
  title,
  subtitle,
  description,
  image,
  features,
  benefits,
  process,
  packages,
  faqs,
}) => {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-500 to-orange-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection direction="left">
              <h1 className="text-5xl lg:text-6xl mb-6">{title}</h1>
              <p className="text-xl text-white/90 mb-8">{subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/contact"
                  className="bg-white text-orange-500 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 inline-flex items-center justify-center space-x-2"
                >
                  <span>{t('service.common.getStarted')}</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/pricing"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-orange-500 transition-all inline-flex items-center justify-center"
                >
                  {t('service.common.viewPricing')}
                </Link>
              </div>
            </AnimatedSection>
            <AnimatedSection direction="right">
              <ImageWithFallback
                src={image}
                alt={title}
                className="rounded-2xl shadow-2xl"
              />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <p className="text-xl text-gray-600 leading-relaxed">{description}</p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">{t('service.common.keyFeatures')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('service.common.features.subtitle')}
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <AnimatedSection key={index} delay={index * 0.05}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all flex items-start space-x-3"
                >
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">{feature}</span>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">{t('service.common.benefits')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('service.common.benefits.subtitle')}
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ x: 10 }}
                  className="flex items-start space-x-4 p-6 bg-gray-50 rounded-xl"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 text-white">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-gray-700">{benefit}</p>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">{t('service.common.process')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('service.common.process.subtitle')}
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="text-5xl bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-4">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-xl text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Packages */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">{t('service.common.pricingPackages')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('service.common.pricing.subtitle')}
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -10 }}
                  className={`rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all ${pkg.popular
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white border-4 border-yellow-400'
                      : 'bg-white border border-gray-200'
                    }`}
                >
                  {pkg.popular && (
                    <div className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full inline-block mb-4 text-sm">
                      {t('service.common.mostPopular')}
                    </div>
                  )}
                  <h3 className={`text-2xl mb-2 ${pkg.popular ? 'text-white' : 'text-gray-900'}`}>
                    {pkg.name}
                  </h3>
                  <div className={`text-4xl mb-6 ${pkg.popular ? 'text-white' : 'text-orange-500'}`}>
                    {pkg.price}
                    <span className="text-lg">{t('service.common.perMonth')}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${pkg.popular ? 'text-white' : 'text-green-500'}`} />
                        <span className={pkg.popular ? 'text-white/90' : 'text-gray-600'}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/contact"
                    className={`block text-center px-8 py-4 rounded-lg transition-all ${pkg.popular
                        ? 'bg-white text-orange-500 hover:bg-gray-100'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                      }`}
                  >
                    {t('service.common.getStarted')}
                  </Link>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">{t('service.common.faq')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('service.common.faq.subtitle')}
            </p>
          </AnimatedSection>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <AnimatedSection key={index} delay={index * 0.05}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-gray-900 pr-4">{faq.question}</span>
                    <motion.div
                      animate={{ rotate: openFaq === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ArrowRight className="w-5 h-5 text-orange-500 transform rotate-90" />
                    </motion.div>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: openFaq === index ? 'auto' : 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-gray-600">
                      {faq.answer}
                    </div>
                  </motion.div>
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
              <h2 className="text-4xl lg:text-5xl mb-6">{t('service.common.ready')}</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
                {t('service.common.readyDesc')}
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center space-x-2 bg-white text-orange-500 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105"
              >
                <span>{t('service.common.contact')}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};
