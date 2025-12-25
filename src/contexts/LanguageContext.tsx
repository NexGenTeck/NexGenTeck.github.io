import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define available languages
export type Language = 'en' | 'ur' | 'ar' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.portfolio': 'Portfolio',
    'nav.blog': 'Blog',
    'nav.pricing': 'Pricing',
    'nav.contact': 'Contact',
    
    // Hero Section
    'hero.title': 'Transform Your Digital Presence',
    'hero.subtitle': 'We craft innovative digital solutions that drive growth and success for your business',
    'hero.cta': 'Get Started',
    'hero.learn': 'Learn More',
    
    // Services
    'services.title': 'Our Services',
    'services.subtitle': 'Comprehensive digital solutions tailored to your needs',
    'services.ecommerce': 'E-commerce Development',
    'services.web': 'Website Development',
    'services.ppc': 'Google Ads (PPC)',
    'services.seo': 'Search Engine Optimization',
    'services.social': 'Social Media Marketing',
    'services.mobile': 'Mobile App Development',
    'services.software': 'Software Development',
    'services.outdoor': 'Outdoor Media Advertising',
    'services.blockchain': 'Blockchain Development',
    
    // About
    'about.title': 'About Us',
    'about.subtitle': 'Leading the digital transformation',
    'about.team': 'Our Team',
    'about.partners': 'Our Partners',
    
    // Contact
    'contact.title': 'Get In Touch',
    'contact.subtitle': 'We\'d love to hear from you',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.message': 'Message',
    'contact.send': 'Send Message',
    
    // Footer
    'footer.tagline': 'Innovating digital solutions for tomorrow',
    'footer.subscribe': 'Subscribe to our newsletter',
    'footer.company': 'Company',
    'footer.services': 'Services',
    'footer.resources': 'Resources',
    
    // Common
    'common.learnMore': 'Learn More',
    'common.viewAll': 'View All',
    'common.readMore': 'Read More',
  },
  ur: {
    'nav.home': 'گھر',
    'nav.about': 'ہمارے بارے میں',
    'nav.services': 'خدمات',
    'nav.portfolio': 'پورٹ فولیو',
    'nav.blog': 'بلاگ',
    'nav.pricing': 'قیمتیں',
    'nav.contact': 'رابطہ',
    'hero.title': 'اپنی ڈیجیٹل موجودگی کو تبدیل کریں',
    'hero.subtitle': 'ہم جدید ڈیجیٹل حل تیار کرتے ہیں',
    'hero.cta': 'شروع کریں',
    'hero.learn': 'مزید جانیں',
    'services.title': 'ہماری خدمات',
    'services.subtitle': 'جامع ڈیجیٹل حل',
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.about': 'من نحن',
    'nav.services': 'الخدمات',
    'nav.portfolio': 'المحفظة',
    'nav.blog': 'المدونة',
    'nav.pricing': 'الأسعار',
    'nav.contact': 'اتصل بنا',
    'hero.title': 'حوّل حضورك الرقمي',
    'hero.subtitle': 'نحن نصنع حلولاً رقمية مبتكرة',
    'hero.cta': 'ابدأ الآن',
    'hero.learn': 'اعرف المزيد',
    'services.title': 'خدماتنا',
    'services.subtitle': 'حلول رقمية شاملة',
  },
  de: {
    'nav.home': 'Startseite',
    'nav.about': 'Über uns',
    'nav.services': 'Dienstleistungen',
    'nav.portfolio': 'Portfolio',
    'nav.blog': 'Blog',
    'nav.pricing': 'Preise',
    'nav.contact': 'Kontakt',
    'hero.title': 'Transformieren Sie Ihre digitale Präsenz',
    'hero.subtitle': 'Wir entwickeln innovative digitale Lösungen',
    'hero.cta': 'Jetzt starten',
    'hero.learn': 'Mehr erfahren',
    'services.title': 'Unsere Dienstleistungen',
    'services.subtitle': 'Umfassende digitale Lösungen',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
