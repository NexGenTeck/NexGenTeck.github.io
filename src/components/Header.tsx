import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage, Language } from '../contexts/LanguageContext';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ur', name: 'اردو', flag: '🇵🇰' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ];

  const services = [
    { name: 'E-commerce Development', path: '/services/ecommerce' },
    { name: 'Website Development', path: '/services/web-development' },
    { name: 'Google Ads (PPC)', path: '/services/google-ads' },
    { name: 'SEO', path: '/services/seo' },
    { name: 'Social Media Marketing', path: '/services/social-media' },
    { name: 'Mobile App Development', path: '/services/mobile-app' },
    { name: 'Software Development', path: '/services/software' },
    { name: 'Outdoor Media', path: '/services/outdoor-media' },
    { name: 'Blockchain Development', path: '/services/blockchain' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white">NT</span>
            </div>
            <span className="text-xl text-gray-900">NexGen Tech</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link to="/" className={`hover:text-blue-600 transition-colors ${location.pathname === '/' ? 'text-blue-600' : 'text-gray-700'}`}>
              {t('nav.home')}
            </Link>
            <Link to="/about" className={`hover:text-blue-600 transition-colors ${location.pathname === '/about' ? 'text-blue-600' : 'text-gray-700'}`}>
              {t('nav.about')}
            </Link>
            
            {/* Services Dropdown */}
            <div className="relative" onMouseEnter={() => setIsServicesOpen(true)} onMouseLeave={() => setIsServicesOpen(false)}>
              <button className={`flex items-center space-x-1 hover:text-blue-600 transition-colors ${location.pathname.startsWith('/services') ? 'text-blue-600' : 'text-gray-700'}`}>
                <span>{t('nav.services')}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {isServicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2"
                  >
                    {services.map((service) => (
                      <Link
                        key={service.path}
                        to={service.path}
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        {service.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/portfolio" className={`hover:text-blue-600 transition-colors ${location.pathname === '/portfolio' ? 'text-blue-600' : 'text-gray-700'}`}>
              {t('nav.portfolio')}
            </Link>
            <Link to="/blog" className={`hover:text-blue-600 transition-colors ${location.pathname === '/blog' ? 'text-blue-600' : 'text-gray-700'}`}>
              {t('nav.blog')}
            </Link>
            <Link to="/pricing" className={`hover:text-blue-600 transition-colors ${location.pathname === '/pricing' ? 'text-blue-600' : 'text-gray-700'}`}>
              {t('nav.pricing')}
            </Link>
            <Link to="/contact" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              {t('nav.contact')}
            </Link>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Globe className="w-5 h-5" />
                <ChevronDown className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-40 bg-white rounded-lg shadow-xl py-2"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors flex items-center space-x-2 ${
                          language === lang.code ? 'text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-gray-700 hover:text-blue-600 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-4 pb-4"
            >
              <div className="flex flex-col space-y-3">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-blue-600 transition-colors py-2">
                  {t('nav.home')}
                </Link>
                <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-blue-600 transition-colors py-2">
                  {t('nav.about')}
                </Link>
                <div className="py-2">
                  <button
                    onClick={() => setIsServicesOpen(!isServicesOpen)}
                    className="flex items-center justify-between w-full text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <span>{t('nav.services')}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isServicesOpen && (
                    <div className="ml-4 mt-2 space-y-2">
                      {services.map((service) => (
                        <Link
                          key={service.path}
                          to={service.path}
                          onClick={() => setIsMenuOpen(false)}
                          className="block text-gray-600 hover:text-blue-600 transition-colors py-1"
                        >
                          {service.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <Link to="/portfolio" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-blue-600 transition-colors py-2">
                  {t('nav.portfolio')}
                </Link>
                <Link to="/blog" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-blue-600 transition-colors py-2">
                  {t('nav.blog')}
                </Link>
                <Link to="/pricing" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-blue-600 transition-colors py-2">
                  {t('nav.pricing')}
                </Link>
                <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center">
                  {t('nav.contact')}
                </Link>
                
                {/* Mobile Language Selector */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsMenuOpen(false);
                        }}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                          language === lang.code ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};
