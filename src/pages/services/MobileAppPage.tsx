import React from 'react';
import { ServiceDetail } from '../../components/ServiceDetail';

export const MobileAppPage: React.FC = () => {
  const serviceData = {
    title: 'Mobile App Development',
    subtitle: 'Native and cross-platform mobile applications that engage users',
    description: 'Create stunning mobile applications for iOS and Android that provide exceptional user experiences. Our team specializes in both native and cross-platform development, ensuring your app performs flawlessly across all devices while meeting your business objectives.',
    image: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBkZXNpZ258ZW58MXx8fHwxNzY0NDEwODY4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    features: [
      'iOS app development (Swift)',
      'Android app development (Kotlin)',
      'Cross-platform development (React Native)',
      'Custom UI/UX design',
      'API integration',
      'Push notifications',
      'In-app purchases',
      'Location-based services',
      'Offline functionality',
      'App analytics',
      'App Store optimization',
      'Ongoing maintenance',
    ],
    benefits: [
      'Reach customers on their preferred devices',
      'Increase customer engagement and loyalty',
      'Provide value with mobile-first experiences',
      'Enable new revenue streams',
      'Build brand awareness',
      'Collect valuable user data and insights',
    ],
    process: [
      { title: 'Discovery', description: 'Define app goals, features, and target audience' },
      { title: 'Design', description: 'Create intuitive UI/UX designs and prototypes' },
      { title: 'Development', description: 'Build the app with clean, scalable code' },
      { title: 'Launch', description: 'Deploy to app stores and provide ongoing support' },
    ],
    packages: [
      {
        name: 'MVP',
        price: '$9,999',
        features: [
          'Single platform (iOS or Android)',
          'Basic features (5-7 screens)',
          'Custom design',
          'API integration',
          'App store submission',
          '3 months support',
        ],
      },
      {
        name: 'Standard',
        price: '$19,999',
        popular: true,
        features: [
          'Cross-platform (iOS & Android)',
          'Advanced features (10-15 screens)',
          'Premium design',
          'Backend development',
          'Push notifications',
          'Analytics integration',
          'App store optimization',
          '6 months support',
        ],
      },
      {
        name: 'Premium',
        price: '$39,999',
        features: [
          'Everything in Standard',
          'Complex features',
          'Real-time functionality',
          'Third-party integrations',
          'Admin panel',
          'Advanced security',
          'Performance optimization',
          '12 months support',
          'Dedicated team',
        ],
      },
    ],
    faqs: [
      {
        question: 'Should I build native or cross-platform?',
        answer: 'It depends on your needs. Native apps offer best performance but cost more. Cross-platform apps are cost-effective and faster to develop, with great performance for most use cases.',
      },
      {
        question: 'How long does app development take?',
        answer: 'A basic app takes 3-4 months, while complex apps can take 6-12 months or more depending on features and complexity.',
      },
      {
        question: 'Do you help with app store submission?',
        answer: 'Yes, we handle the entire submission process for both Apple App Store and Google Play Store, including compliance with all guidelines.',
      },
      {
        question: 'What about app maintenance?',
        answer: 'We offer ongoing maintenance packages including bug fixes, updates for new OS versions, and feature enhancements.',
      },
      {
        question: 'Can you integrate with my existing systems?',
        answer: 'Absolutely! We can integrate your app with existing databases, APIs, and third-party services to create a seamless experience.',
      },
    ],
  };

  return <ServiceDetail {...serviceData} />;
};
