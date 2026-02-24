import React from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Quote, Star, X } from 'lucide-react';
import { AnimatedSection } from '../components/AnimatedSection';
import { useLanguage } from '../contexts/LanguageContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { TypewriterText } from '../components/TypewriterText';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '../components/ui/carousel';

export const Home: React.FC = () => {
  const { t, language } = useLanguage();
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isDemoOpen, setIsDemoOpen] = React.useState(false);

  // Typewriter phrases for hero animation - using translations
  const typewriterPhrases = [
    t('hero.typewriter.1'),
    t('hero.typewriter.2'),
    t('hero.typewriter.3'),
    t('hero.typewriter.4'),
  ];

  // Hero Slider Data - NexGenTeck Brand (using translations)
  const heroSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920&q=80',
      titlePrefix: t('hero.slide1.title'),
      useTypewriter: true,
      subtitle: t('hero.slide1.subtitle'),
      ctaText: t('hero.slide1.cta'),
      ctaSecondary: t('hero.slide1.cta2'),
      ctaLink: '/contact',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920&q=80',
      title: t('hero.slide2.title'),
      subtitle: t('hero.slide2.subtitle'),
      ctaText: t('hero.slide2.cta'),
      ctaLink: '/services',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920&q=80',
      title: t('hero.slide3.title'),
      subtitle: t('hero.slide3.subtitle'),
      ctaText: t('hero.slide3.cta'),
      ctaLink: '/contact',
    },
  ];

  // Carousel slide change handler
  React.useEffect(() => {
    if (!carouselApi) return;

    setCurrentSlide(carouselApi.selectedScrollSnap());

    carouselApi.on('select', () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  React.useEffect(() => {
    if (!isDemoOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDemoOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isDemoOpen]);

  const services = [
    {
      titleKey: 'services.ecommerce',
      descKey: 'services.ecommerce.desc',
      icon: '🛒',
      link: '/services/ecommerce',
      image: 'https://images.unsplash.com/photo-1727407209320-1fa6ae60ee05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjBzaG9wcGluZ3xlbnwxfHx8fDE3NjQzNDQ4NTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      titleKey: 'services.web',
      descKey: 'services.web.desc',
      icon: '💻',
      link: '/services/web-development',
      image: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGNvZGluZ3xlbnwxfHx8fDE3NjQzODYyMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      titleKey: 'services.mobile',
      descKey: 'services.mobile.desc',
      icon: '📱',
      link: '/services/mobile-app',
      image: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBkZXNpZ258ZW58MXx8fHwxNzY0NDEwODY4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      titleKey: 'services.social',
      descKey: 'services.social.desc',
      icon: '📊',
      link: '/services/social-media',
      image: 'https://images.unsplash.com/photo-1557838923-2985c318be48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbWFya2V0aW5nfGVufDF8fHx8MTc2NDQyNjgzNnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      titleKey: 'services.seo',
      descKey: 'services.seo.desc',
      icon: '🔍',
      link: '/services/seo',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZW8lMjBhbmFseXRpY3N8ZW58MXx8fHwxNzY0NDAyMjQ1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      titleKey: 'services.software',
      descKey: 'services.software.desc',
      icon: '⚙️',
      link: '/services/software',
      image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGRldmVsb3BtZW50fGVufDB8fHx8MTczOTU4MDkwNXww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      titleKey: 'services.ai',
      descKey: 'services.ai.desc',
      icon: '🤖',
      link: '/services/artificial-intelligence',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlfGVufDF8fHx8MTc2NDQyNjgzNnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

  const stats = [
    { number: '30+', labelKey: 'stats.projects' },
    { number: '23+', labelKey: 'stats.clients' },
    { number: '19+', labelKey: 'stats.team' },
    { number: '3+', labelKey: 'stats.experience' },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CEO, TechStart Inc',
      image: 'https://images.unsplash.com/photo-1762341118883-13bbd9d79927?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHBlcnNvbnxlbnwxfHx8fDE3NjQ0MzcwMTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      quote: 'NexGenTeck transformed our digital presence. Their expertise in web development and SEO helped us achieve 300% growth in online revenue.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Founder, E-Shop Global',
      image: 'https://images.unsplash.com/photo-1762341118883-13bbd9d79927?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHBlcnNvbnxlbnwxfHx8fDE3NjQ0MzcwMTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      quote: 'Outstanding e-commerce solution! The platform they built handles thousands of daily transactions flawlessly. Highly recommended!',
      rating: 5,
    },
    {
      name: 'Emma Williams',
      role: 'Marketing Director, BrandBoost',
      image: 'https://images.unsplash.com/photo-1762341118883-13bbd9d79927?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHBlcnNvbnxlbnwxfHx8fDE3NjQ0MzcwMTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      quote: 'Their digital marketing strategies doubled our social media engagement and tripled our conversion rates. True professionals!',
      rating: 5,
    },
  ];

  const portfolioPreview = [
    {
      title: 'Global E-commerce Platform',
      category: 'services.ecommerce',
      image: 'https://images.unsplash.com/photo-1727407209320-1fa6ae60ee05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjBzaG9wcGluZ3xlbnwxfHx8fDE3NjQzNDQ4NTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      link: '/portfolio/global-ecommerce',
    },
    {
      title: 'Corporate Website Redesign',
      category: 'services.web',
      image: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGNvZGluZ3xlbnwxfHx8fDE3NjQzODYyMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      link: '/portfolio/corporate-redesign',
    },
    {
      title: 'Fitness Mobile App',
      category: 'services.mobile',
      image: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBkZXNpZ258ZW58MXx8fHwxNzY0NDEwODY4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      link: '/portfolio/fitness-app',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Slider Section */}
      <section className="relative pt-16">
        <div className="hero-carousel w-full overflow-hidden">
          <Carousel
            setApi={setCarouselApi}
            opts={{
              loop: true,
              align: 'start',
            }}
            className="w-full"
          >
            <CarouselContent className="ml-0">
              {heroSlides.map((slide) => (
                <CarouselItem key={slide.id} className="pl-0 min-w-0 shrink-0 grow-0" style={{ flexBasis: '100%' }}>
                  <div className="relative w-full flex items-center justify-center" style={{ height: '600px' }}>
                    {/* Background Image */}
                    <div className="absolute inset-0">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Gradient Overlay - NexGenTeck Dark Brand */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                    </div>

                    {/* Content Overlay */}
                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center px-4">
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto text-white mt-16"
                      >
                        <motion.h1
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.6 }}
                          className="text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight drop-shadow-lg"
                        >
                          {'titlePrefix' in slide && slide.useTypewriter ? (
                            <>
                              {slide.titlePrefix}{' '}
                              <TypewriterText phrases={typewriterPhrases} />
                            </>
                          ) : (
                            'title' in slide ? slide.title : ''
                          )}
                        </motion.h1>
                        <motion.p
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.6 }}
                          className="text-lg md:text-xl mb-10 text-white/90 leading-relaxed max-w-2xl mx-auto drop-shadow-md"
                        >
                          {slide.subtitle}
                        </motion.p>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6, duration: 0.6 }}
                          className="flex flex-wrap justify-center gap-4"
                        >
                          {/* Primary CTA Button */}
                          <Link
                            to={slide.ctaLink}
                            className="inline-flex items-center space-x-2 bg-white px-8 py-3 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 text-base shadow-lg"
                            style={{
                              color: '#1a1a1a',
                              fontWeight: 600,
                              letterSpacing: '0.02em',
                            }}
                          >
                            <span>{slide.ctaText}</span>
                            <ArrowRight className="w-5 h-5" />
                          </Link>
                          {/* Secondary CTA Button (if exists) */}
                          {'ctaSecondary' in slide && slide.ctaSecondary && language === 'en' && (
                            <button
                              type="button"
                              onClick={() => setIsDemoOpen(true)}
                              className="inline-flex items-center space-x-2 px-8 py-3 rounded-full hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] transition-all transform hover:scale-105"
                              style={{
                                border: '2px solid #F97316',
                                color: '#F97316',
                                backgroundColor: 'transparent',
                                fontWeight: 600,
                                fontSize: '1rem',
                                letterSpacing: '0.02em',
                              }}
                            >
                              <span>{slide.ctaSecondary}</span>
                            </button>
                          )}
                        </motion.div>
                      </motion.div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation Arrows - Minimal style, just arrows */}
            <CarouselPrevious
              className="absolute left-4 lg:left-12 top-1/2 -translate-y-1/2 bg-transparent hover:bg-white/20 border-0 text-white rounded-full flex items-center justify-center transition-all"
              style={{ width: '48px', height: '48px', fontSize: 0 }}
            />
            <CarouselNext
              className="absolute right-4 lg:right-12 top-1/2 -translate-y-1/2 bg-transparent hover:bg-white/20 border-0 text-white rounded-full flex items-center justify-center transition-all"
              style={{ width: '48px', height: '48px', fontSize: 0 }}
            />

            {/* Dot Indicators - Positioned higher to be visible within slide */}
            <div className="absolute left-1/2 -translate-x-1/2 flex gap-3 z-20" style={{ bottom: '80px' }}>
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => carouselApi?.scrollTo(index)}
                  className="rounded-full transition-all duration-300 hover:opacity-100"
                  style={index === currentSlide
                    ? { width: '12px', height: '12px', backgroundColor: 'white', boxShadow: '0 0 0 4px transparent, 0 0 0 5px white' }
                    : { width: '12px', height: '12px', backgroundColor: 'rgba(255, 255, 255, 0.5)' }
                  }
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </Carousel>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative bg-black py-24 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="hero-network"></div>
          <div className="hero-glow-lines"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative group"
              >
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>

                {/* Blurry Card */}
                <div className="relative h-full text-center p-8 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl">
                  <div className="text-4xl lg:text-5xl font-bold text-orange-500 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-white/80 font-medium uppercase text-sm tracking-wide">
                    {t(stat.labelKey)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="relative bg-black py-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="hero-network"></div>
          <div className="hero-glow-lines"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Black Card Container */}
          <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl text-white mb-4">{t('services.title')}</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                {t('services.subtitle')}
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <Link to={service.link}>
                    <motion.div
                      whileHover={{ y: -10 }}
                      className="bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group border border-white/5"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <ImageWithFallback
                          src={service.image}
                          alt={t(service.titleKey)}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 text-4xl">{service.icon}</div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl text-white mb-3">{t(service.titleKey)}</h3>
                        <p className="text-gray-400 mb-4">{t(service.descKey)}</p>
                        <div className="flex items-center text-orange-500 group-hover:text-orange-600 transition-colors">
                          <span className="mr-2">{t('common.learnMore')}</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/services"
                className="inline-flex items-center space-x-2 bg-orange-500 text-white px-8 py-4 rounded-lg hover:bg-orange-600 transition-colors"
              >
                <span>{t('services.viewAll')}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="relative bg-[#000000] py-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="hero-network"></div>
          <div className="hero-glow-lines"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Solid Black Card Container */}
          <div
            className="border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative z-20"
            style={{ backgroundColor: '#000000' }}
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <AnimatedSection direction="left">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1760346546771-a81d986459ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB0ZWFtJTIwbWVldGluZ3xlbnwxfHx8fDE3NjQ0MTcxMDh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Professional Team"
                  className="rounded-2xl shadow-2xl"
                />
              </AnimatedSection>
              <AnimatedSection direction="right">
                <h2 className="text-4xl lg:text-5xl text-white mb-6">{t('whyus.title')}</h2>
                <p className="text-xl text-white/80 mb-8">
                  {t('whyus.subtitle')}
                </p>
                <div className="space-y-4">
                  {[
                    t('whyus.point1'),
                    t('whyus.point2'),
                    t('whyus.point3'),
                    t('whyus.point4'),
                    t('whyus.point5'),
                    t('whyus.point6'),
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <CheckCircle2 className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                      <span className="text-white">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Preview Section */}
      <section className="relative bg-black py-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="hero-network"></div>
          <div className="hero-glow-lines"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Black Card Container */}
          <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl text-white mb-4">{t('portfolio.title')}</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                {t('portfolio.subtitle')}
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8">
              {portfolioPreview.map((project, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <Link to={project.link}>
                    <motion.div
                      whileHover={{ y: -10 }}
                      className="bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group border border-white/5"
                    >
                      <div className="relative h-64 overflow-hidden">
                        <ImageWithFallback
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="text-sm text-orange-400 mb-2">{t(project.category)}</div>
                          <h3 className="text-xl text-white">{project.title}</h3>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/portfolio"
                className="inline-flex items-center space-x-2 bg-orange-500 text-white px-8 py-4 rounded-lg hover:bg-orange-600 transition-colors"
              >
                <span>{t('portfolio.viewAll')}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative bg-black py-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="hero-network"></div>
          <div className="hero-glow-lines"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Black Card Container */}
          <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl text-white mb-4">{t('testimonials.title')}</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                {t('testimonials.subtitle')}
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <motion.div
                    whileHover={{ y: -10 }}
                    className="bg-[#1a1a1a] backdrop-blur-lg rounded-2xl p-8 border border-white/10 h-full"
                  >
                    <Quote className="w-12 h-12 text-orange-500/40 mb-4" />
                    <p className="text-gray-300 mb-6">{testimonial.quote}</p>
                    <div className="flex items-center space-x-4">
                      <ImageWithFallback
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-white">{testimonial.name}</div>
                        <div className="text-gray-500 text-sm">{testimonial.role}</div>
                      </div>
                    </div>
                    <div className="flex space-x-1 mt-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </motion.div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-black py-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="hero-network"></div>
          <div className="hero-glow-lines"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection>
            {/* Black Card Container with Orange Gradient Inside */}
            <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-12 text-center text-white">
                <h2 className="text-4xl lg:text-5xl mb-6">{t('cta.title')}</h2>
                <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
                  {t('cta.subtitle')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/contact"
                    className="bg-white px-8 py-4 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 inline-flex items-center justify-center space-x-2"
                    style={{
                      color: '#F97316',
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                    }}
                  >
                    <span>{t('cta.button')}</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/pricing"
                    className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-orange-500 transition-all inline-flex items-center justify-center"
                  >
                    {t('nav.pricing')}
                  </Link>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {isDemoOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/90 p-4"
          style={{ zIndex: 99999 }}
          onClick={() => setIsDemoOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-xl p-4 md:p-6 border border-orange-500/30 shadow-2xl"
            style={{ zIndex: 100000 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsDemoOpen(false)}
              className="absolute -top-3 -right-3 z-[100001] p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-lg"
              aria-label="Close video"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                style={{ zIndex: 1 }}
                src="https://www.youtube.com/embed/MdOanVqkeG8?autoplay=1&rel=0"
                title="NexGenTeck Quick Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};
