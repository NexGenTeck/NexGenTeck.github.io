import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { AnimatedSection } from '../components/AnimatedSection';
import { useLanguage } from '../contexts/LanguageContext';

export const Contact: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const apiUrl = import.meta.env.VITE_CONTACT_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
        console.error('Form submission error:', data.error);
      }
    } catch (error) {
      setSubmitStatus('error');
      console.error('Network error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section - Dark Theme */}
      <section className="relative hero-dark text-white py-20">
        <div className="hero-network"></div>
        <div className="hero-glow-lines"></div>
        <div className="hero-particles"></div>
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">{t('contact.title')}</h1>
            <p className="text-xl text-white/90">
              {t('contact.subtitle')}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <AnimatedSection direction="left">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl text-gray-900 mb-6">{t('contact.form.title')}</h2>
                
                {/* Success Message */}
                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <p className="text-green-800 font-medium">{t('contact.form.success')}</p>
                  </motion.div>
                )}

                {/* Error Message */}
                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <p className="text-red-800 font-medium">{t('contact.form.error')}</p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 mb-2">
                      {t('contact.name')} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder={t('contact.form.namePlaceholder')}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-gray-700 mb-2">
                      {t('contact.email')} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder={t('contact.form.emailPlaceholder')}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-gray-700 mb-2">
                      {t('contact.phone')}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder={t('contact.form.phonePlaceholder')}
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-gray-700 mb-2">
                      {t('contact.subject')} *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">{t('contact.form.subjectPlaceholder')}</option>
                      <option value="web">{t('contact.form.subject.web')}</option>
                      <option value="mobile">{t('contact.form.subject.mobile')}</option>
                      <option value="ecommerce">{t('contact.form.subject.ecommerce')}</option>
                      <option value="marketing">{t('contact.form.subject.marketing')}</option>
                      <option value="seo">{t('contact.form.subject.seo')}</option>
                      <option value="other">{t('contact.form.subject.other')}</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-gray-700 mb-2">
                      {t('contact.message')} *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                      placeholder={t('contact.form.messagePlaceholder')}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-orange-500 text-white px-8 py-4 rounded-lg hover:bg-orange-600 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isSubmitting ? t('contact.form.sending') : t('contact.send')}</span>
                    <Send className="w-5 h-5" />
                  </motion.button>
                </form>
              </div>
            </AnimatedSection>

            {/* Contact Info */}
            <AnimatedSection direction="right">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl text-gray-900 mb-6">{t('contact.info.title')}</h2>
                  <p className="text-lg text-gray-600 mb-8">
                    {t('contact.info.description')}
                  </p>
                </div>

                {/* Contact Cards */}
                <div className="space-y-4">
                  <motion.div
                    whileHover={{ x: 10 }}
                    className="flex items-start space-x-4 p-6 bg-blue-50 rounded-xl"
                  >
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 mb-1">{t('contact.cards.email.title')}</h3>
                      <a href="mailto:info@nexgentech.com" className="text-orange-500 hover:text-orange-600">
                        info@nexgentech.com
                      </a>
                      <br />
                      <a href="mailto:support@nexgentech.com" className="text-orange-500 hover:text-orange-600">
                        support@nexgentech.com
                      </a>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 10 }}
                    className="flex items-start space-x-4 p-6 bg-purple-50 rounded-xl"
                  >
                    <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 mb-1">{t('contact.cards.phone.title')}</h3>
                      <a href="tel:+15551234567" className="text-orange-600 hover:text-purple-700">
                        +1 (555) 123-4567
                      </a>
                      <br />
                      <a href="tel:+15559876543" className="text-orange-600 hover:text-purple-700">
                        +1 (555) 987-6543
                      </a>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 10 }}
                    className="flex items-start space-x-4 p-6 bg-green-50 rounded-xl"
                  >
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 mb-1">{t('contact.cards.address.title')}</h3>
                      <p className="text-gray-600">
                        {t('contact.cards.address.line1')}<br />
                        {t('contact.cards.address.line2')}<br />
                        {t('contact.cards.address.line3')}
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 10 }}
                    className="flex items-start space-x-4 p-6 bg-orange-50 rounded-xl"
                  >
                    <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 mb-1">{t('contact.cards.hours.title')}</h3>
                      <p className="text-gray-600">
                        {t('contact.cards.hours.weekdays')}<br />
                        {t('contact.cards.hours.saturday')}<br />
                        {t('contact.cards.hours.sunday')}
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Map */}
                <div className="bg-gray-200 rounded-2xl h-64 flex items-center justify-center">
                  <p className="text-gray-500">{t('contact.map.placeholder')}</p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">{t('contact.faq.title')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('contact.faq.subtitle')}
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                q: t('contact.faq.items.1.q'),
                a: t('contact.faq.items.1.a'),
              },
              {
                q: t('contact.faq.items.2.q'),
                a: t('contact.faq.items.2.a'),
              },
              {
                q: t('contact.faq.items.3.q'),
                a: t('contact.faq.items.3.a'),
              },
              {
                q: t('contact.faq.items.4.q'),
                a: t('contact.faq.items.4.a'),
              },
            ].map((item, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg text-gray-900 mb-3">{item.q}</h3>
                  <p className="text-gray-600">{item.a}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
