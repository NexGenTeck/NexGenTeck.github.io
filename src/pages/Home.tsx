import React from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Quote, Star } from 'lucide-react';
import { AnimatedSection } from '../components/AnimatedSection';
import { useLanguage } from '../contexts/LanguageContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '../components/ui/carousel';

export const Home: React.FC = () => {
  const { t } = useLanguage();
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [slideCount, setSlideCount] = React.useState(0);

  // Hero Slider Data
  const heroSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920&q=80',
      title: 'Transform Your Digital Presence',
      subtitle: 'Cutting-edge solutions for modern businesses. We build innovative digital experiences that drive growth.',
      ctaText: 'Get Started',
      ctaLink: '/contact',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920&q=80',
      title: 'Innovative Web Solutions',
      subtitle: 'Building tomorrow\'s digital experiences today. From concept to launch, we deliver excellence.',
      ctaText: 'Our Services',
      ctaLink: '/services',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920&q=80',
      title: 'Scale Your Business',
      subtitle: 'From startup to enterprise, we grow with you. Partner with us to achieve your digital goals.',
      ctaText: 'Contact Us',
      ctaLink: '/contact',
    },
  ];

  // Carousel slide change handler
  React.useEffect(() => {
    if (!carouselApi) return;

    setSlideCount(carouselApi.scrollSnapList().length);
    setCurrentSlide(carouselApi.selectedScrollSnap());

    carouselApi.on('select', () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  const services = [
    {
      title: 'E-commerce Development',
      description: 'Build powerful online stores with seamless shopping experiences',
      icon: '🛒',
      link: '/services/ecommerce',
      image: 'https://images.unsplash.com/photo-1727407209320-1fa6ae60ee05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjBzaG9wcGluZ3xlbnwxfHx8fDE3NjQzNDQ4NTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: 'Website Development',
      description: 'Custom websites that drive engagement and conversions',
      icon: '💻',
      link: '/services/web-development',
      image: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGNvZGluZ3xlbnwxfHx8fDE3NjQzODYyMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: 'Mobile App Development',
      description: 'Native and cross-platform apps for iOS and Android',
      icon: '📱',
      link: '/services/mobile-app',
      image: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBkZXNpZ258ZW58MXx8fHwxNzY0NDEwODY4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: 'Digital Marketing',
      description: 'SEO, PPC, and social media strategies that deliver results',
      icon: '📊',
      link: '/services/social-media',
      image: 'https://images.unsplash.com/photo-1557838923-2985c318be48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbWFya2V0aW5nfGVufDF8fHx8MTc2NDQyNjgzNnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: 'SEO Optimization',
      description: 'Rank higher and attract more organic traffic',
      icon: '🔍',
      link: '/services/seo',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZW8lMjBhbmFseXRpY3N8ZW58MXx8fHwxNzY0NDAyMjQ1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: 'Blockchain Development',
      description: 'Decentralized solutions for the future of technology',
      icon: '⛓️',
      link: '/services/blockchain',
      image: 'https://images.unsplash.com/photo-1666816943035-15c29931e975?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9ja2NoYWluJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjQ0MzExMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

  const stats = [
    { number: '500+', label: 'Projects Completed' },
    { number: '300+', label: 'Happy Clients' },
    { number: '50+', label: 'Team Members' },
    { number: '15+', label: 'Years Experience' },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CEO, TechStart Inc',
      image: 'https://images.unsplash.com/photo-1762341118883-13bbd9d79927?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHBlcnNvbnxlbnwxfHx8fDE3NjQ0MzcwMTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      quote: 'NexGen Tech transformed our digital presence. Their expertise in web development and SEO helped us achieve 300% growth in online revenue.',
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
      category: 'E-commerce',
      image: 'https://images.unsplash.com/photo-1727407209320-1fa6ae60ee05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjBzaG9wcGluZ3xlbnwxfHx8fDE3NjQzNDQ4NTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      link: '/portfolio/global-ecommerce',
    },
    {
      title: 'Corporate Website Redesign',
      category: 'Web Development',
      image: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGNvZGluZ3xlbnwxfHx8fDE3NjQzODYyMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      link: '/portfolio/corporate-redesign',
    },
    {
      title: 'Fitness Mobile App',
      category: 'Mobile App',
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
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-black/40" />
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
                          {slide.title}
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
                          className="flex justify-center"
                        >
                          <Link
                            to={slide.ctaLink}
                            className="inline-flex items-center space-x-2 bg-white text-gray-900 px-8 py-3 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 font-bold text-base shadow-lg"
                          >
                            <span>{slide.ctaText}</span>
                            <ArrowRight className="w-5 h-5" />
                          </Link>
                        </motion.div>
                      </motion.div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation Arrows */}
            <CarouselPrevious className="absolute left-4 lg:left-12 top-1/2 -translate-y-1/2 size-12 bg-white text-gray-900 border-0 hover:bg-white/90 shadow-lg rounded-full flex items-center justify-center [&_svg]:size-6 [&_span]:hidden text-[0px]" />
            <CarouselNext className="absolute right-4 lg:right-12 top-1/2 -translate-y-1/2 size-12 bg-white text-gray-900 border-0 hover:bg-white/90 shadow-lg rounded-full flex items-center justify-center [&_svg]:size-6 [&_span]:hidden text-[0px]" />

            {/* Dot Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => carouselApi?.scrollTo(index)}
                  className={`rounded-full transition-all duration-300 ${index === currentSlide
                    ? 'w-3 h-3 bg-white ring-1 ring-white ring-offset-4 ring-offset-transparent'
                    : 'w-3 h-3 bg-white/50 hover:bg-white/80'
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </Carousel>
        </div>
      </section>

      {/* Stats Section */}
      <AnimatedSection className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">{t('services.title')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('services.subtitle')}
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <Link to={service.link}>
                  <motion.div
                    whileHover={{ y: -10 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <ImageWithFallback
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 text-4xl">{service.icon}</div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl text-gray-900 mb-3">{service.title}</h3>
                      <p className="text-gray-600 mb-4">{service.description}</p>
                      <div className="flex items-center text-blue-600 group-hover:text-purple-600 transition-colors">
                        <span className="mr-2">Learn More</span>
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
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>View All Services</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection direction="left">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1760346546771-a81d986459ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB0ZWFtJTIwbWVldGluZ3xlbnwxfHx8fDE3NjQ0MTcxMDh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Professional Team"
                className="rounded-2xl shadow-2xl"
              />
            </AnimatedSection>
            <AnimatedSection direction="right">
              <h2 className="text-4xl lg:text-5xl text-gray-900 mb-6">Why Choose NexGen Tech?</h2>
              <p className="text-xl text-gray-600 mb-8">
                We combine technical excellence with creative innovation to deliver digital solutions that exceed expectations.
              </p>
              <div className="space-y-4">
                {[
                  'Expert team with 15+ years of industry experience',
                  'Cutting-edge technologies and best practices',
                  '24/7 support and maintenance services',
                  'Transparent communication and project management',
                  'Proven track record with 500+ successful projects',
                  'Competitive pricing with no hidden costs',
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Portfolio Preview Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">Featured Projects</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our latest work and see how we've helped businesses transform digitally
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {portfolioPreview.map((project, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <Link to={project.link}>
                  <motion.div
                    whileHover={{ y: -10 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <ImageWithFallback
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="text-sm text-blue-400 mb-2">{project.category}</div>
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
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>View All Projects</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl mb-4">What Our Clients Say</h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied clients
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -10 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
                >
                  <Quote className="w-12 h-12 text-white/40 mb-4" />
                  <p className="text-white/90 mb-6">{testimonial.quote}</p>
                  <div className="flex items-center space-x-4">
                    <ImageWithFallback
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-white">{testimonial.name}</div>
                      <div className="text-white/70 text-sm">{testimonial.role}</div>
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
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
              <h2 className="text-4xl lg:text-5xl mb-6">Ready to Start Your Project?</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
                Let's discuss how we can help transform your business with cutting-edge digital solutions
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 inline-flex items-center justify-center space-x-2"
                >
                  <span>Get Started Now</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/pricing"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-all inline-flex items-center justify-center"
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
