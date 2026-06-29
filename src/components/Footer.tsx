import React, { useState } from 'react';
import { Link } from 'react-router';
import { Facebook, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import logo from '../nexgentech-01.png';

const WhatsAppLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 448 512"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32 101 32 1 132.1 1 255c0 39.2 10.3 77.6 29.9 111.4L-.9 480l116.4-30.5c32.6 17.8 69.4 27.2 106.9 27.2h.1c122.9 0 222.9-100.1 222.9-223 0-59.3-23.1-115.1-64.5-156.6zM222.5 439.1h-.1c-33.4 0-66.1-9-94.6-26l-6.8-4-69 18.1 18.4-67.3-4.4-6.9C47.3 323.4 37.5 289.5 37.5 255 37.5 152.2 121.1 68.5 223.9 68.5c49.6 0 96.3 19.4 131.4 54.5 35.1 35.2 54.4 81.9 54.3 131.5-.1 102.8-83.7 184.6-187.1 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8s-14.3 18-17.6 21.8c-3.2 3.7-6.5 4.2-12 1.4-32.8-16.4-54.3-29.3-76-66.4-5.7-9.9 5.7-9.2 16.4-30.6 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2s-9.7 1.4-14.8 6.9c-5.1 5.6-19.4 19-19.4 46.3s19.9 53.7 22.6 57.4c2.8 3.7 39.1 59.7 94.8 83.7 13.2 5.7 23.6 9.1 31.6 11.7 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.4-2.5-5-3.9-10.5-6.7z" />
  </svg>
);

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const footerBrandOffset = 52;
  const footerSocialWidth = 104;

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
            {/* Align motto/icons to left edge of NexGenTeck text (after logo img + gap) */}
            <div style={{ paddingLeft: `${footerBrandOffset}px` }} className="space-y-3">
              <p className="text-gray-400 text-sm">
                {t('footer.tagline')}
              </p>
              <div
                className="flex items-center justify-between"
                style={{
                  width: `${footerSocialWidth + 0.5}px`,
                }}
              >
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
                  href="https://wa.me/923009270131"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 transition-colors"
                  aria-label="WhatsApp"
                >
                  <WhatsAppLogo className="w-5 h-5" />
                </a>
                <a
                  href="https://www.linkedin.com/company/nexgenteck"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
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
              <li><Link to="/services/artificial-intelligence" className="hover:text-orange-500 transition-colors">{t('services.ai.title')}</Link></li>
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
