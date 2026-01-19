import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X, Globe, ChevronDown, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

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

  // Dynamic classes for dark mode support
  const headerBg = theme === 'dark'
    ? (isScrolled ? 'bg-gray-900 shadow-lg shadow-black/20' : 'bg-gray-900/95 backdrop-blur-sm')
    : (isScrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm');

  const textColor = theme === 'dark' ? 'text-gray-200' : 'text-gray-700';
  const textColorStrong = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const dropdownBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const dropdownHover = theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-orange-50';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const mobileMenuBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100';
  const themeToggleBg = theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100';

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white">NT</span>
            </div>
            <span className={`text-xl ${textColorStrong}`}>NexGenTeck</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link to="/" className={`hover:text-orange-500 transition-colors ${location.pathname === '/' ? 'text-orange-500' : textColor}`}>
              {t('nav.home')}
            </Link>
            <Link to="/about" className={`hover:text-orange-500 transition-colors ${location.pathname === '/about' ? 'text-orange-500' : textColor}`}>
              {t('nav.about')}
            </Link>

            {/* Services Dropdown */}
            <div className="relative" onMouseEnter={() => setIsServicesOpen(true)} onMouseLeave={() => setIsServicesOpen(false)}>
              <button className={`flex items-center space-x-1 hover:text-orange-500 transition-colors ${location.pathname.startsWith('/services') ? 'text-orange-500' : textColor}`}>
                <span>{t('nav.services')}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {isServicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute top-full left-0 mt-2 w-64 ${dropdownBg} rounded-lg shadow-xl py-2`}
                  >
                    {services.map((service) => (
                      <Link
                        key={service.path}
                        to={service.path}
                        className={`block px-4 py-2 ${textColor} ${dropdownHover} hover:text-orange-500 transition-colors`}
                      >
                        {service.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/portfolio" className={`hover:text-orange-500 transition-colors ${location.pathname === '/portfolio' ? 'text-orange-500' : textColor}`}>
              {t('nav.portfolio')}
            </Link>
            <Link to="/blog" className={`hover:text-orange-500 transition-colors ${location.pathname === '/blog' ? 'text-orange-500' : textColor}`}>
              {t('nav.blog')}
            </Link>
            <Link to="/pricing" className={`hover:text-orange-500 transition-colors ${location.pathname === '/pricing' ? 'text-orange-500' : textColor}`}>
              {t('nav.pricing')}
            </Link>
            <Link to="/contact" className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
              {t('nav.contact')}
            </Link>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className={`flex items-center space-x-1 ${textColor} hover:text-orange-500 transition-colors`}
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
                    className={`absolute top-full right-0 mt-2 w-40 ${dropdownBg} rounded-lg shadow-xl py-2`}
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 ${dropdownHover} transition-colors flex items-center space-x-2 ${language === lang.code ? 'text-orange-500' : textColor
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

            {/* Dark Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 ${textColor} hover:text-orange-500 transition-colors rounded-lg ${themeToggleBg}`}
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden ${textColor} hover:text-orange-500 transition-colors`}
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
                <Link to="/" onClick={() => setIsMenuOpen(false)} className={`${textColor} hover:text-orange-500 transition-colors py-2`}>
                  {t('nav.home')}
                </Link>
                <Link to="/about" onClick={() => setIsMenuOpen(false)} className={`${textColor} hover:text-orange-500 transition-colors py-2`}>
                  {t('nav.about')}
                </Link>
                <div className="py-2">
                  <button
                    onClick={() => setIsServicesOpen(!isServicesOpen)}
                    className={`flex items-center justify-between w-full ${textColor} hover:text-orange-500 transition-colors`}
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
                          className={`block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} hover:text-orange-500 transition-colors py-1`}
                        >
                          {service.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <Link to="/portfolio" onClick={() => setIsMenuOpen(false)} className={`${textColor} hover:text-orange-500 transition-colors py-2`}>
                  {t('nav.portfolio')}
                </Link>
                <Link to="/blog" onClick={() => setIsMenuOpen(false)} className={`${textColor} hover:text-orange-500 transition-colors py-2`}>
                  {t('nav.blog')}
                </Link>
                <Link to="/pricing" onClick={() => setIsMenuOpen(false)} className={`${textColor} hover:text-orange-500 transition-colors py-2`}>
                  {t('nav.pricing')}
                </Link>
                <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors text-center">
                  {t('nav.contact')}
                </Link>

                {/* Mobile Theme Toggle */}
                <div className={`pt-4 border-t ${borderColor} flex items-center justify-between`}>
                  <span className={textColor}>Theme</span>
                  <button
                    onClick={toggleTheme}
                    className={`p-2 ${textColor} hover:text-orange-500 transition-colors rounded-lg ${themeToggleBg}`}
                    aria-label="Toggle theme"
                  >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                </div>

                {/* Mobile Language Selector */}
                <div className={`pt-4 border-t ${borderColor}`}>
                  <div className="grid grid-cols-2 gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsMenuOpen(false);
                        }}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${language === lang.code ? 'bg-orange-500 text-white' : `${mobileMenuBg} ${textColor} ${dropdownHover}`
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
