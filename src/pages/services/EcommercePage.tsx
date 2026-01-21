import React from 'react';
import { ServiceDetail } from '../../components/ServiceDetail';
import { useLanguage } from '../../contexts/LanguageContext';

export const EcommercePage: React.FC = () => {
  const { t } = useLanguage();
  const serviceData = {
    title: t('services.ecommerce.title'),
    subtitle: t('services.ecommerce.subtitle'),
    description: t('services.ecommerce.description'),
    image: 'https://images.unsplash.com/photo-1727407209320-1fa6ae60ee05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjBzaG9wcGluZ3xlbnwxfHx8fDE3NjQzNDQ4NTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    features: [
      t('services.ecommerce.feature1'),
      t('services.ecommerce.feature2'),
      t('services.ecommerce.feature3'),
      t('services.ecommerce.feature4'),
      t('services.ecommerce.feature5'),
      t('services.ecommerce.feature6'),
      t('services.ecommerce.feature7'),
      t('services.ecommerce.feature8'),
      t('services.ecommerce.feature9'),
      t('services.ecommerce.feature10'),
      t('services.ecommerce.feature11'),
      t('services.ecommerce.feature12'),
    ],
    benefits: [
      t('services.ecommerce.benefit1'),
      t('services.ecommerce.benefit2'),
      t('services.ecommerce.benefit3'),
      t('services.ecommerce.benefit4'),
      t('services.ecommerce.benefit5'),
      t('services.ecommerce.benefit6'),
    ],
    process: [
      { title: t('services.ecommerce.process1.title'), description: t('services.ecommerce.process1.desc') },
      { title: t('services.ecommerce.process2.title'), description: t('services.ecommerce.process2.desc') },
      { title: t('services.ecommerce.process3.title'), description: t('services.ecommerce.process3.desc') },
      { title: t('services.ecommerce.process4.title'), description: t('services.ecommerce.process4.desc') },
    ],
    packages: [
      {
        name: t('services.ecommerce.package1.name'),
        price: '$2,499',
        features: t('services.ecommerce.package1.features').split(','),
      },
      {
        name: t('services.ecommerce.package2.name'),
        price: '$4,999',
        popular: true,
        features: t('services.ecommerce.package2.features').split(','),
      },
      {
        name: t('services.ecommerce.package3.name'),
        price: '$9,999',
        features: t('services.ecommerce.package3.features').split(','),
      },
    ],
    faqs: [
      {
        question: t('services.ecommerce.faq1.q'),
        answer: t('services.ecommerce.faq1.a'),
      },
      {
        question: t('services.ecommerce.faq2.q'),
        answer: t('services.ecommerce.faq2.a'),
      },
      {
        question: t('services.ecommerce.faq3.q'),
        answer: t('services.ecommerce.faq3.a'),
      },
      {
        question: t('services.ecommerce.faq4.q'),
        answer: t('services.ecommerce.faq4.a'),
      },
      {
        question: t('services.ecommerce.faq5.q'),
        answer: t('services.ecommerce.faq5.a'),
      },
    ],
  };

  return <ServiceDetail {...serviceData} />;
};
