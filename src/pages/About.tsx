import React, { useEffect } from 'react';
import { useLocation } from 'react-router';
import { motion } from 'motion/react';
import { Users, Target, Award, Heart, User } from 'lucide-react';
import { AnimatedSection } from '../components/AnimatedSection';
import { useLanguage } from '../contexts/LanguageContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export const About: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const values = [
    {
      icon: <Target className="w-12 h-12" />,
      titleKey: 'about.values.innovation',
      descKey: 'about.values.innovation.desc',
    },
    {
      icon: <Users className="w-12 h-12" />,
      titleKey: 'about.values.collaboration',
      descKey: 'about.values.collaboration.desc',
    },
    {
      icon: <Award className="w-12 h-12" />,
      titleKey: 'about.values.excellence',
      descKey: 'about.values.excellence.desc',
    },
    {
      icon: <Heart className="w-12 h-12" />,
      titleKey: 'about.values.passion',
      descKey: 'about.values.passion.desc',
    },
  ];

  const partners = [
    { nameKey: 'about.partners.partner1' },
    { nameKey: 'about.partners.partner2' },
    { nameKey: 'about.partners.partner3' },
  ];

  const teamMembers = Array.from({ length: 8 }, (_, index) => index);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section - Dark Theme */}
      <section className="relative hero-dark text-white py-20">
        <div className="hero-network"></div>
        <div className="hero-glow-lines"></div>
        <div className="hero-particles"></div>
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">{t('about.title')}</h1>
            <p className="text-xl text-white/90">
              {t('about.subtitle')}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection direction="left">
              <h2 className="text-4xl lg:text-5xl text-gray-900 mb-6">{t('about.story')}</h2>
              <p className="text-lg text-gray-600 mb-4">
                {t('about.story.p1')}
              </p>
              <p className="text-lg text-gray-600 mb-4">
                {t('about.story.p2')}
              </p>
              <p className="text-lg text-gray-600">
                {t('about.story.p3')}
              </p>
            </AnimatedSection>
            <AnimatedSection direction="right">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1702047135360-e549c2e1f7df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwc3RhcnR1cCUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NjQ0MTI5Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Tech Workspace"
                className="rounded-2xl shadow-2xl"
              />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">{t('about.values')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('about.values.subtitle')}
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all"
                >
                  <div className="text-orange-500 flex justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl text-gray-900 mb-3">{t(value.titleKey)}</h3>
                  <p className="text-gray-600">{t(value.descKey)}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">{t('about.partners')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('about.partners.subtitle')}
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
            {partners.map((partner, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all flex items-center justify-center h-24 w-full max-w-sm mx-auto"
                >
                  <div className="text-gray-400 text-center">
                    <div className="text-2xl">{t(partner.nameKey)}</div>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="mt-16 text-center">
            <p className="text-lg text-gray-600 mb-8">
              {t('about.partners.text')}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-16 bg-gray-950">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-4xl lg:text-5xl text-white mb-4">{t('about.team')}</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('about.team.subtitle')}
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 items-stretch justify-items-center max-w-5xl mx-auto">
            {teamMembers.map((index) => (
              <AnimatedSection key={index} delay={index * 0.06} className="h-full w-full max-w-[200px]">
                <motion.div
                  whileHover={{
                    y: -6,
                    rotate: index % 2 === 0 ? 1.5 : -1.5,
                  }}
                  transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                  className="group relative h-full flex flex-col items-center bg-gray-900/90 rounded-xl border border-orange-500/15 p-4 text-center shadow-md shadow-orange-500/5 hover:shadow-lg hover:shadow-orange-500/30 hover:border-orange-500/50 transition-colors duration-300"
                >
                  <div className="relative mb-3 w-20 h-20 rounded-full bg-gray-800 border border-orange-500/25 flex items-center justify-center overflow-hidden shrink-0">
                    <User className="w-8 h-8 text-gray-600 group-hover:text-orange-500/60 transition-colors duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent pointer-events-none" />
                  </div>

                  <div
                    className="h-3.5 w-24 mb-2 rounded bg-gray-800 border border-gray-700/50"
                    aria-hidden="true"
                  />

                  <div
                    className="h-3 w-16 rounded bg-gray-800/60 border border-gray-700/30"
                    aria-hidden="true"
                  />
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
              <h2 className="text-4xl lg:text-5xl mb-6">{t('about.cta.title')}</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
                {t('about.cta.subtitle')}
              </p>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSd5SpUZsZ0Fd6b5E-RS2ZjnuVFEufiNb4GbLvfLzyxbaytO1Q/viewform?pli=1" target="_blank"
                className="inline-block bg-white text-orange-500 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105"
              >
                {t('about.cta.button')}
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};
