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
      name: 'Starter',
      description: 'Perfect for small businesses and startups',
      monthlyPrice: 499,
      yearlyPrice: 4990,
      features: [
        'Basic website (up to 5 pages)',
        'Responsive design',
        'SEO optimization',
        'Contact form',
        'Social media integration',
        'SSL certificate',
        'Monthly analytics report',
        'Email support',
      ],
      notIncluded: [
        'E-commerce functionality',
        'Custom features',
        'Priority support',
        'Dedicated account manager',
      ],
    },
    {
      name: 'Professional',
      description: 'Ideal for growing businesses',
      monthlyPrice: 999,
      yearlyPrice: 9990,
      popular: true,
      features: [
        'Everything in Starter',
        'Advanced website (up to 15 pages)',
        'Blog integration',
        'E-commerce (up to 100 products)',
        'Custom design',
        'Advanced SEO',
        'Google Ads management',
        'Social media marketing',
        'Weekly analytics reports',
        'Priority email support',
        'Phone support',
      ],
      notIncluded: [
        'Custom app development',
        'Dedicated account manager',
        '24/7 support',
      ],
    },
    {
      name: 'Enterprise',
      description: 'Complete solution for large organizations',
      monthlyPrice: 2499,
      yearlyPrice: 24990,
      features: [
        'Everything in Professional',
        'Unlimited pages',
        'Custom features development',
        'Mobile app development',
        'Advanced e-commerce',
        'Multi-language support',
        'Custom integrations',
        'Blockchain solutions',
        'Daily analytics reports',
        '24/7 priority support',
        'Dedicated account manager',
        'Monthly strategy calls',
        'On-site visits (quarterly)',
      ],
      notIncluded: [],
    },
  ];

  const addons = [
    { name: 'Additional Page', price: 150 },
    { name: 'Custom Feature', price: 500 },
    { name: 'Mobile App (iOS/Android)', price: 3000 },
    { name: 'E-commerce Setup', price: 1000 },
    { name: 'SEO Package', price: 300 },
    { name: 'Social Media Management', price: 500 },
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
              Transparent pricing for businesses of all sizes
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
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-3 rounded-lg transition-all relative ${billingCycle === 'yearly'
                    ? 'bg-orange-500 text-white'
                    : 'text-white hover:bg-white/10'
                  }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs px-2 py-1 rounded-full">
                  Save 17%
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
                      Most Popular
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
                      <span className="text-xl">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <p className={`text-sm ${plan.popular ? 'text-white/70' : 'text-gray-500'}`}>
                        ${Math.round(plan.yearlyPrice / 12)}/month billed annually
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
                    Get Started
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
            <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">Additional Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Enhance your package with these optional add-ons
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
            <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">Compare Plans</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what's included in each package
            </p>
          </AnimatedSection>

          <div className="overflow-x-auto">
            <table className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Feature</th>
                  <th className="px-6 py-4 text-center">Starter</th>
                  <th className="px-6 py-4 text-center">Professional</th>
                  <th className="px-6 py-4 text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  ['Pages', '5', '15', 'Unlimited'],
                  ['Responsive Design', '✓', '✓', '✓'],
                  ['SEO Optimization', 'Basic', 'Advanced', 'Premium'],
                  ['E-commerce', '✗', '100 products', 'Unlimited'],
                  ['Custom Features', '✗', 'Limited', 'Unlimited'],
                  ['Mobile App', '✗', '✗', '✓'],
                  ['Support', 'Email', 'Email + Phone', '24/7 Priority'],
                  ['Account Manager', '✗', '✗', '✓'],
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
            <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">Pricing FAQs</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Common questions about our pricing
            </p>
          </AnimatedSection>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: 'Can I change my plan later?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
              },
              {
                q: 'Is there a setup fee?',
                a: 'No, there are no hidden setup fees. The price you see is what you pay.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, PayPal, and bank transfers for enterprise clients.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'Yes, we offer a 30-day money-back guarantee if you\'re not satisfied with our services.',
              },
              {
                q: 'Can I get a custom quote?',
                a: 'Absolutely! Contact us for a custom quote tailored to your specific needs.',
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
              <h2 className="text-4xl lg:text-5xl mb-6">Still Have Questions?</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
                Our team is here to help you choose the perfect plan for your business
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center space-x-2 bg-white text-orange-500 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105"
                >
                  <span>Contact Sales</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="tel:+15551234567"
                  className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-orange-500 transition-all"
                >
                  Call Us: +1 (555) 123-4567
                </a>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};
