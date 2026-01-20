import React, { useEffect } from 'react';
import { useLocation } from 'react-router';
import { motion } from 'motion/react';
import { Users, Target, Award, Heart, Linkedin, Twitter, Mail } from 'lucide-react';
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

  const team = [
    {
      name: 'John Anderson',
      role: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1762341118883-13bbd9d79927?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHBlcnNvbnxlbnwxfHx8fDE3NjQ0MzcwMTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      bio: '15+ years of experience in digital transformation and technology leadership',
      linkedin: '#',
      twitter: '#',
      email: 'john@nexgentech.com',
    },
    {
      name: 'Sarah Mitchell',
      role: 'Chief Technology Officer',
      image: 'https://images.unsplash.com/photo-1762341118883-13bbd9d79927?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHBlcnNvbnxlbnwxfHx8fDE3NjQ0MzcwMTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      bio: 'Expert in cloud architecture and enterprise software development',
      linkedin: '#',
      twitter: '#',
      email: 'sarah@nexgentech.com',
    },
    {
      name: 'Michael Chen',
      role: 'Creative Director',
      image: 'https://images.unsplash.com/photo-1762341118883-13bbd9d79927?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHBlcnNvbnxlbnwxfHx8fDE3NjQ0MzcwMTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      bio: 'Award-winning designer with a passion for creating exceptional user experiences',
      linkedin: '#',
      twitter: '#',
      email: 'michael@nexgentech.com',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Marketing',
      image: 'https://images.unsplash.com/photo-1762341118883-13bbd9d79927?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHBlcnNvbnxlbnwxfHx8fDE3NjQ0MzcwMTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      bio: 'Digital marketing strategist specializing in SEO and social media growth',
      linkedin: '#',
      twitter: '#',
      email: 'emily@nexgentech.com',
    },
    {
      name: 'David Thompson',
      role: 'Lead Developer',
      image: 'https://images.unsplash.com/photo-1762341118883-13bbd9d79927?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHBlcnNvbnxlbnwxfHx8fDE3NjQ0MzcwMTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      bio: 'Full-stack developer with expertise in modern web technologies',
      linkedin: '#',
      twitter: '#',
      email: 'david@nexgentech.com',
    },
    {
      name: 'Lisa Wang',
      role: 'Product Manager',
      image: 'https://images.unsplash.com/photo-1762341118883-13bbd9d79927?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHBlcnNvbnxlbnwxfHx8fDE3NjQ0MzcwMTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      bio: 'Driving product innovation and ensuring exceptional customer satisfaction',
      linkedin: '#',
      twitter: '#',
      email: 'lisa@nexgentech.com',
    },
  ];

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
    { name: 'Google', logo: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png' },
    { name: 'Amazon AWS', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg' },
    { name: 'Microsoft', logo: 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31' },
    { name: 'Meta', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg' },
    { name: 'Shopify', logo: 'https://cdn.shopify.com/assets2/press/brand-assets/shopify-logo-primary-logo-1057x304-870e8c7cf6ed5a7c0a28b694406f6b67.svg' },
    { name: 'Stripe', logo: 'https://images.ctfassets.net/fzn2n1nzq965/HTTOloNPhisV9P4hlMPNA/cacf1bb88b9fc492dfad34378d844280/Stripe_icon_-_square.svg' },
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

      {/* Team Section */}
      <section id="team" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">{t('about.team')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('about.team.subtitle')}
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
                >
                  <div className="relative h-80 overflow-hidden">
                    <ImageWithFallback
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-2xl text-white mb-1">{member.name}</h3>
                      <p className="text-blue-400">{member.role}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">{member.bio}</p>
                    <div className="flex space-x-4">
                      <a href={member.linkedin} className="text-gray-400 hover:text-orange-500 transition-colors">
                        <Linkedin className="w-5 h-5" />
                      </a>
                      <a href={member.twitter} className="text-gray-400 hover:text-orange-500 transition-colors">
                        <Twitter className="w-5 h-5" />
                      </a>
                      <a href={`mailto:${member.email}`} className="text-gray-400 hover:text-orange-500 transition-colors">
                        <Mail className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {partners.map((partner, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all flex items-center justify-center h-24"
                >
                  <div className="text-gray-400 text-center">
                    <div className="text-2xl">{partner.name}</div>
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
                href="/contact"
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
