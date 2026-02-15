import React, { useState } from 'react';
import { Link } from 'react-router';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import logo from '../nexgentech-01.png';

const XLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 512 512"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172L272.3 180.9 389.2 48zM364.4 421.8h39.1L150.8 88.3H108.9z" />
  </svg>
);

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
  const footerBg = theme === 'dark' ? 'bg-gray-900 border-t border-gray-800' : 'bg-gray-900';
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
            className="flex flex-col items-start space-y-3"
          >
            {/* Logo and Brand Name */}
            <div className="bg-black px-3 py-2 rounded-md flex items-center space-x-2">
              <img src={logo} alt="NexGenTeck Logo" className="h-8 w-auto object-contain" style={{ maxHeight: '32px', maxWidth: '100px' }} />
              <span className="text-2xl font-extrabold tracking-normal">
                <span className="text-orange-500">NexGen</span>
                <span className="text-white">Teck</span>
              </span>
            </div>
            {/* Motto and Social Icons — aligned with logo icon (offset by px-3 = 12px) */}
            <div style={{ paddingLeft: '12px' }} className="space-y-3">
              <p className="text-gray-400 text-sm">
                {t('footer.tagline')}
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://www.facebook.com/profile.php?id=61585558202243"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://x.com/NexGenTeck"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 transition-colors"
                  aria-label="X (Twitter)"
                >
                  <XLogo className="w-5 h-5" />
                </a>
                <a
                  href="https://www.instagram.com/nexgenteck?igsh=MWxhcW93ejM3bjZzcQ=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://www.youtube.com/@NexGenTeckcom"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
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
              <li><Link to="/about" className="hover:text-orange-500 transition-colors">{t('nav.about')}</Link></li>
              <li><Link to="/about#partners" className="hover:text-orange-500 transition-colors">{t('about.partners')}</Link></li>
              <li><Link to="/portfolio" className="hover:text-orange-500 transition-colors">{t('nav.portfolio')}</Link></li>
              <li className="hidden"><Link to="/blog" className="hover:text-orange-500 transition-colors">{t('nav.blog')}</Link></li>
              <li><Link to="/contact" className="hover:text-orange-500 transition-colors">{t('nav.contact')}</Link></li>
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
              <li><Link to="/services/web-development" className="hover:text-orange-500 transition-colors">{t('services.web')}</Link></li>
              <li><Link to="/services/mobile-app" className="hover:text-orange-500 transition-colors">{t('services.mobile')}</Link></li>
              <li><Link to="/services/ecommerce" className="hover:text-orange-500 transition-colors">{t('services.ecommerce')}</Link></li>
              <li><Link to="/services/seo" className="hover:text-orange-500 transition-colors">{t('services.seo')}</Link></li>
              <li><Link to="/services/social-media" className="hover:text-orange-500 transition-colors">{t('services.social')}</Link></li>
              <li><Link to="/services/3d-graphics" className="hover:text-orange-500 transition-colors">{t('services.3dgraphics')}</Link></li>
              <li><Link to="/services/video-editing" className="hover:text-orange-500 transition-colors">{t('services.videoediting')}</Link></li>
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-white mb-4">{t('footer.newsletter')}</h3>
            <p className="text-gray-400 mb-4">{t('footer.subscribe')}</p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.emailHelper')}
                  className={`w-full ${inputBg} text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
              >
                <span>{t('footer.subscribeButton')}</span>
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-orange-500" />
                <span>info@nexgenteck.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-orange-500" />
                <span>+92 300 927 0131</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-orange-500" />
                <span>Shahra-e-Faisal, Karachi, Pakistan</span>
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
              {t('footer.rights')}
            </p>
            <div className="hidden space-x-6" aria-hidden>
              <Link to="/privacy" className="text-gray-400 hover:text-orange-500 transition-colors">
                {t('footer.privacy')}
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-orange-500 transition-colors">
                {t('footer.terms')}
              </Link>
              <Link to="/sitemap" className="text-gray-400 hover:text-orange-500 transition-colors">
                {t('footer.sitemap')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

