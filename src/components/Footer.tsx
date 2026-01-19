import React, { useState } from 'react';
import { Link } from 'react-router';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    alert('Thank you for subscribing!');
    setEmail('');
  };

  // Dark mode classes
  const footerBg = theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-gray-900';
  const inputBg = theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-800';

  return (
    <footer className={`${footerBg} text-gray-300`}>
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white">NT</span>
              </div>
              <span className="text-xl text-white">NexGenTeck</span>
            </div>
            <p className="text-gray-400">
              {t('footer.tagline')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-orange-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-orange-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-orange-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-orange-500 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-orange-500 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-white mb-4">{t('footer.company')}</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-orange-500 transition-colors">About Us</Link></li>
              <li><Link to="/about#team" className="hover:text-orange-500 transition-colors">Our Team</Link></li>
              <li><Link to="/about#partners" className="hover:text-orange-500 transition-colors">Partners</Link></li>
              <li><Link to="/portfolio" className="hover:text-orange-500 transition-colors">Portfolio</Link></li>
              <li><Link to="/blog" className="hover:text-orange-500 transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-orange-500 transition-colors">Contact</Link></li>
            </ul>
          </motion.div>

          {/* Services Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-white mb-4">{t('footer.services')}</h3>
            <ul className="space-y-2">
              <li><Link to="/services/web-development" className="hover:text-orange-500 transition-colors">Web Development</Link></li>
              <li><Link to="/services/mobile-app" className="hover:text-orange-500 transition-colors">Mobile Apps</Link></li>
              <li><Link to="/services/ecommerce" className="hover:text-orange-500 transition-colors">E-commerce</Link></li>
              <li><Link to="/services/seo" className="hover:text-orange-500 transition-colors">SEO Services</Link></li>
              <li><Link to="/services/social-media" className="hover:text-orange-500 transition-colors">Social Media</Link></li>
              <li><Link to="/services/blockchain" className="hover:text-orange-500 transition-colors">Blockchain</Link></li>
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-white mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">{t('footer.subscribe')}</p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className={`w-full ${inputBg} text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Subscribe</span>
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-orange-500" />
                <span>info@nexgentech.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-orange-500" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-orange-500" />
                <span>123 Tech Street, Digital City</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-center md:text-left">
              © 2025 NexGenTeck. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-gray-400 hover:text-orange-500 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-orange-500 transition-colors">
                Terms of Service
              </Link>
              <Link to="/sitemap" className="text-gray-400 hover:text-orange-500 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
