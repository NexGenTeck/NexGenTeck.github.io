import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { CheckCircle, X, ArrowRight } from 'lucide-react';
import { AnimatedSection } from '../components/AnimatedSection';
import { useLanguage } from '../contexts/LanguageContext';

export const Pricing: React.FC = () => {
  const { t } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const pricingPlans = [
    {
      name: t('pricing.plans.starter.name'),
      description: t('pricing.plans.starter.description'),
      monthlyPrice: 499,
      yearlyPrice: 4990,
      features: [
        t('pricing.plans.starter.features.1'),
        t('pricing.plans.starter.features.2'),
        t('pricing.plans.starter.features.3'),
        t('pricing.plans.starter.features.4'),
        t('pricing.plans.starter.features.5'),
        t('pricing.plans.starter.features.6'),
        t('pricing.plans.starter.features.7'),
        t('pricing.plans.starter.features.8'),
      ],
      notIncluded: [
        t('pricing.plans.starter.notIncluded.1'),
        t('pricing.plans.starter.notIncluded.2'),
        t('pricing.plans.starter.notIncluded.3'),
        t('pricing.plans.starter.notIncluded.4'),
      ],
    },
    {
      name: t('pricing.plans.professional.name'),
      description: t('pricing.plans.professional.description'),
      monthlyPrice: 999,
      yearlyPrice: 9990,
      popular: true,
      features: [
        t('pricing.plans.professional.features.1'),
        t('pricing.plans.professional.features.2'),
        t('pricing.plans.professional.features.3'),
        t('pricing.plans.professional.features.4'),
        t('pricing.plans.professional.features.5'),
        t('pricing.plans.professional.features.6'),
        t('pricing.plans.professional.features.7'),
        t('pricing.plans.professional.features.8'),
        t('pricing.plans.professional.features.9'),
        t('pricing.plans.professional.features.10'),
        t('pricing.plans.professional.features.11'),
      ],
      notIncluded: [
        t('pricing.plans.professional.notIncluded.1'),
        t('pricing.plans.professional.notIncluded.2'),
        t('pricing.plans.professional.notIncluded.3'),
      ],
    },
    {
      name: t('pricing.plans.enterprise.name'),
      description: t('pricing.plans.enterprise.description'),
      monthlyPrice: 2499,
      yearlyPrice: 24990,
      features: [
        t('pricing.plans.enterprise.features.1'),
        t('pricing.plans.enterprise.features.2'),
        t('pricing.plans.enterprise.features.3'),
        t('pricing.plans.enterprise.features.4'),
        t('pricing.plans.enterprise.features.5'),
        t('pricing.plans.enterprise.features.6'),
        t('pricing.plans.enterprise.features.7'),
        t('pricing.plans.enterprise.features.8'),
        t('pricing.plans.enterprise.features.9'),
        t('pricing.plans.enterprise.features.10'),
        t('pricing.plans.enterprise.features.11'),
        t('pricing.plans.enterprise.features.12'),
        t('pricing.plans.enterprise.features.13'),
      ],
      notIncluded: [],
    },
  ];

  const addons = [
    { name: t('pricing.addons.additionalPage'), price: 150 },
    { name: t('pricing.addons.customFeature'), price: 500 },
    { name: t('pricing.addons.mobileApp'), price: 3000 },
    { name: t('pricing.addons.ecommerceSetup'), price: 1000 },
    { name: t('pricing.addons.seoPackage'), price: 300 },
    { name: t('pricing.addons.socialMediaManagement'), price: 500 },
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

            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-white/10 backdrop-blur-lg rounded-lg p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-lg transition-all ${billingCycle === 'monthly'
                    ? 'bg-orange-500 text-white'
                    : 'text-white hover:bg-white/10'
                  }`}
              >
                {t('pricing.billing.monthly')}
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-3 rounded-lg transition-all relative ${billingCycle === 'yearly'
                    ? 'bg-orange-500 text-white'
                    : 'text-white hover:bg-white/10'
                  }`}
              >
                {t('pricing.billing.yearly')}
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs px-2 py-1 rounded-full">
                  {t('pricing.billing.save')}
                </span>
              </button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -10 }}
                  className={`rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all h-full flex flex-col ${plan.popular
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white border-4 border-yellow-400 relative'
                      : 'bg-white border border-gray-200'
                    }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-6 py-2 rounded-full">
                      {t('pricing.popularLabel')}
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className={`text-3xl mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                      {plan.name}
                    </h3>
                    <p className={plan.popular ? 'text-white/80' : 'text-gray-600'}>
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-8">
                    <div className={`text-5xl mb-2 ${plan.popular ? 'text-white' : 'text-orange-500'}`}>
                      ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                      <span className="text-xl">/{billingCycle === 'monthly' ? t('pricing.billing.mo') : t('pricing.billing.yr')}</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <p className={`text-sm ${plan.popular ? 'text-white/70' : 'text-gray-500'}`}>
                        ${Math.round(plan.yearlyPrice / 12)}{t('pricing.billing.perMonthBilledAnnually')}
                      </p>
                    )}
                  </div>

                  <div className="flex-1 mb-8">
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start space-x-3">
                          <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-white' : 'text-green-500'
                            }`} />
                          <span className={plan.popular ? 'text-white/90' : 'text-gray-600'}>
                            {feature}
                          </span>
                        </li>
                      ))}
                      {plan.notIncluded.map((feature, idx) => (
                        <li key={idx} className="flex items-start space-x-3 opacity-50">
                          <X className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-white' : 'text-gray-400'
                            }`} />
                          <span className={plan.popular ? 'text-white/70' : 'text-gray-400'}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to="/contact"
                    className={`block text-center px-8 py-4 rounded-lg transition-all ${plan.popular
                        ? 'bg-white text-orange-500 hover:bg-gray-100'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                      }`}
                  >
                    {t('pricing.actions.getStarted')}
                  </Link>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">{t('pricing.addons.title')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('pricing.addons.subtitle')}
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {addons.map((addon, index) => (
              <AnimatedSection key={index} delay={index * 0.05}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg text-gray-900">{addon.name}</h3>
                    <div className="text-2xl text-orange-500">${addon.price}</div>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">{t('pricing.compare.title')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('pricing.compare.subtitle')}
            </p>
          </AnimatedSection>

          <div className="overflow-x-auto">
            <table className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">{t('pricing.compare.header.feature')}</th>
                  <th className="px-6 py-4 text-center">{t('pricing.compare.header.starter')}</th>
                  <th className="px-6 py-4 text-center">{t('pricing.compare.header.professional')}</th>
                  <th className="px-6 py-4 text-center">{t('pricing.compare.header.enterprise')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  [t('pricing.compare.rows.pages'), '5', '15', t('pricing.compare.values.unlimited')],
                  [t('pricing.compare.rows.responsiveDesign'), '✓', '✓', '✓'],
                  [t('pricing.compare.rows.seoOptimization'), t('pricing.compare.values.basic'), t('pricing.compare.values.advanced'), t('pricing.compare.values.premium')],
                  [t('pricing.compare.rows.ecommerce'), '✗', t('pricing.compare.values.products100'), t('pricing.compare.values.unlimited')],
                  [t('pricing.compare.rows.customFeatures'), '✗', t('pricing.compare.values.limited'), t('pricing.compare.values.unlimited')],
                  [t('pricing.compare.rows.mobileApp'), '✗', '✗', '✓'],
                  [t('pricing.compare.rows.support'), t('pricing.compare.values.email'), t('pricing.compare.values.emailPhone'), t('pricing.compare.values.priority247')],
                  [t('pricing.compare.rows.accountManager'), '✗', '✗', '✓'],
                ].map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900">{row[0]}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{row[1]}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{row[2]}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">{t('pricing.faq.title')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('pricing.faq.subtitle')}
            </p>
          </AnimatedSection>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                  q: t('pricing.faq.items.1.q'),
                  a: t('pricing.faq.items.1.a'),
              },
              {
                  q: t('pricing.faq.items.2.q'),
                  a: t('pricing.faq.items.2.a'),
              },
              {
                  q: t('pricing.faq.items.3.q'),
                  a: t('pricing.faq.items.3.a'),
              },
              {
                  q: t('pricing.faq.items.4.q'),
                  a: t('pricing.faq.items.4.a'),
              },
              {
                  q: t('pricing.faq.items.5.q'),
                  a: t('pricing.faq.items.5.a'),
              },
            ].map((item, index) => (
              <AnimatedSection key={index} delay={index * 0.05}>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg text-gray-900 mb-3">{item.q}</h3>
                  <p className="text-gray-600">{item.a}</p>
                </div>
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
                  href="tel:+15551234567"
                  className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-orange-500 transition-all"
                >
                  {t('pricing.cta.callUs')} +1 (555) 123-4567
                </a>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};
