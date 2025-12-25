import React from 'react';
import { ServiceDetail } from '../../components/ServiceDetail';

export const EcommercePage: React.FC = () => {
  const serviceData = {
    title: 'E-commerce Development',
    subtitle: 'Build powerful online stores that drive sales and customer satisfaction',
    description: 'Transform your retail business with a custom e-commerce platform designed to maximize conversions and provide seamless shopping experiences. Our e-commerce solutions combine beautiful design, robust functionality, and secure payment processing to help you succeed in the digital marketplace.',
    image: 'https://images.unsplash.com/photo-1727407209320-1fa6ae60ee05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjBzaG9wcGluZ3xlbnwxfHx8fDE3NjQzNDQ4NTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    features: [
      'Custom shopping cart with advanced features',
      'Secure payment gateway integration',
      'Product catalog management',
      'Order tracking and management',
      'Customer account dashboard',
      'Inventory management system',
      'Multi-currency support',
      'Mobile-responsive design',
      'SEO optimization',
      'Analytics and reporting',
      'Email marketing integration',
      'Social media integration',
    ],
    benefits: [
      'Increase sales with optimized checkout process',
      'Reduce cart abandonment rates',
      'Improve customer retention with personalized experiences',
      'Streamline operations with automated workflows',
      'Scale easily as your business grows',
      'Gain insights with detailed analytics',
    ],
    process: [
      { title: 'Discovery', description: 'We analyze your business model, target audience, and competition' },
      { title: 'Design', description: 'Create user-friendly interfaces that drive conversions' },
      { title: 'Development', description: 'Build a robust platform with all necessary features' },
      { title: 'Launch', description: 'Deploy and provide ongoing support and optimization' },
    ],
    packages: [
      {
        name: 'Starter',
        price: '$2,499',
        features: [
          'Up to 100 products',
          'Basic payment integration',
          'Mobile responsive design',
          'SSL certificate',
          'Basic SEO setup',
          '3 months support',
        ],
      },
      {
        name: 'Professional',
        price: '$4,999',
        popular: true,
        features: [
          'Unlimited products',
          'Multiple payment gateways',
          'Advanced product filters',
          'Customer reviews system',
          'Advanced SEO optimization',
          'Email marketing integration',
          '6 months support',
          'Training sessions',
        ],
      },
      {
        name: 'Enterprise',
        price: '$9,999',
        features: [
          'Everything in Professional',
          'Custom features development',
          'Multi-vendor support',
          'Advanced analytics',
          'Priority support',
          '12 months support',
          'Dedicated account manager',
          'Custom integrations',
        ],
      },
    ],
    faqs: [
      {
        question: 'What platforms do you work with?',
        answer: 'We work with popular platforms like Shopify, WooCommerce, Magento, and can also build custom solutions from scratch based on your needs.',
      },
      {
        question: 'How long does it take to build an e-commerce website?',
        answer: 'Typically, a basic e-commerce site takes 4-6 weeks, while more complex projects can take 8-12 weeks or more depending on requirements.',
      },
      {
        question: 'Do you provide payment gateway integration?',
        answer: 'Yes, we integrate with all major payment gateways including Stripe, PayPal, Square, and others based on your preference.',
      },
      {
        question: 'Can you migrate my existing store?',
        answer: 'Absolutely! We can migrate your products, customers, and orders from your current platform to a new one without any data loss.',
      },
      {
        question: 'What kind of support do you offer?',
        answer: 'We provide ongoing technical support, maintenance, security updates, and feature enhancements based on your selected package.',
      },
    ],
  };

  return <ServiceDetail {...serviceData} />;
};
