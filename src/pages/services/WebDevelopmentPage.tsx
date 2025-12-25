import React from 'react';
import { ServiceDetail } from '../../components/ServiceDetail';

export const WebDevelopmentPage: React.FC = () => {
  const serviceData = {
    title: 'Website Development',
    subtitle: 'Custom websites that engage visitors and drive business growth',
    description: 'Create a powerful online presence with a professionally designed and developed website. We build fast, secure, and SEO-optimized websites that not only look great but also deliver exceptional user experiences and achieve your business goals.',
    image: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGNvZGluZ3xlbnwxfHx8fDE3NjQzODYyMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    features: [
      'Responsive design for all devices',
      'Fast loading speeds',
      'SEO-friendly architecture',
      'Content management system',
      'Contact forms and lead generation',
      'Social media integration',
      'Google Analytics setup',
      'Security features and SSL',
      'Cross-browser compatibility',
      'Accessibility compliance',
      'Blog integration',
      'Custom functionality',
    ],
    benefits: [
      'Establish credibility and trust with professional design',
      'Reach more customers with mobile-friendly design',
      'Improve search engine rankings',
      'Generate more leads and conversions',
      'Easy content management without technical knowledge',
      'Stay ahead of competitors with modern technology',
    ],
    process: [
      { title: 'Planning', description: 'Define goals, audience, and create site architecture' },
      { title: 'Design', description: 'Create beautiful mockups aligned with your brand' },
      { title: 'Development', description: 'Build the website with clean, efficient code' },
      { title: 'Testing', description: 'Ensure everything works perfectly across devices' },
    ],
    packages: [
      {
        name: 'Basic',
        price: '$1,499',
        features: [
          'Up to 5 pages',
          'Responsive design',
          'Contact form',
          'Basic SEO setup',
          'Social media links',
          '2 months support',
        ],
      },
      {
        name: 'Business',
        price: '$2,999',
        popular: true,
        features: [
          'Up to 15 pages',
          'Custom design',
          'CMS integration',
          'Advanced SEO',
          'Blog setup',
          'Google Analytics',
          '4 months support',
          'Content migration',
        ],
      },
      {
        name: 'Premium',
        price: '$5,999',
        features: [
          'Unlimited pages',
          'Custom features',
          'E-commerce integration',
          'Advanced animations',
          'Multi-language support',
          'Priority support',
          '12 months support',
          'Monthly consultations',
        ],
      },
    ],
    faqs: [
      {
        question: 'What technologies do you use?',
        answer: 'We use modern technologies including React, Next.js, WordPress, and custom solutions based on project requirements.',
      },
      {
        question: 'Will my website be mobile-friendly?',
        answer: 'Yes, all our websites are fully responsive and optimized for mobile devices, tablets, and desktops.',
      },
      {
        question: 'Can I update the website myself?',
        answer: 'Absolutely! We integrate user-friendly content management systems that allow you to easily update content without technical knowledge.',
      },
      {
        question: 'Do you provide hosting?',
        answer: 'We can recommend reliable hosting providers and help with setup, or work with your existing hosting service.',
      },
      {
        question: 'What about website maintenance?',
        answer: 'We offer ongoing maintenance packages including updates, security monitoring, backups, and technical support.',
      },
    ],
  };

  return <ServiceDetail {...serviceData} />;
};
