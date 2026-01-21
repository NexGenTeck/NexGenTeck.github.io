import React from 'react';
import { ServiceDetail } from '../../components/ServiceDetail';
import { useLanguage } from '../../contexts/LanguageContext';

export const SEOPage: React.FC = () => {
  const { t } = useLanguage();
  const serviceData = {
    title: t('services.seo.title'),
    subtitle: t('services.seo.subtitle'),
    description: t('services.seo.description'),
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZW8lMjBhbmFseXRpY3N8ZW58MXx8fHwxNzY0NDAyMjQ1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    features: [
      t('services.seo.feature1'),
      t('services.seo.feature2'),
      t('services.seo.feature3'),
      t('services.seo.feature4'),
      t('services.seo.feature5'),
      t('services.seo.feature6'),
      t('services.seo.feature7'),
      t('services.seo.feature8'),
      t('services.seo.feature9'),
      t('services.seo.feature10'),
      t('services.seo.feature11'),
      t('services.seo.feature12'),
    ],
    benefits: [
      t('services.seo.benefit1'),
      t('services.seo.benefit2'),
      t('services.seo.benefit3'),
      t('services.seo.benefit4'),
      t('services.seo.benefit5'),
      t('services.seo.benefit6'),
    ],
    process: [
      { title: t('services.seo.process1.title'), description: t('services.seo.process1.desc') },
      { title: t('services.seo.process2.title'), description: t('services.seo.process2.desc') },
      { title: t('services.seo.process3.title'), description: t('services.seo.process3.desc') },
      { title: t('services.seo.process4.title'), description: t('services.seo.process4.desc') },
    ],
    packages: [
      {
        name: t('services.seo.package1.name'),
        price: '$799',
        features: t('services.seo.package1.features').split(','),
      },
      {
        name: t('services.seo.package2.name'),
        price: '$1,499',
        popular: true,
        features: t('services.seo.package2.features').split(','),
      },
      {
        name: t('services.seo.package3.name'),
        price: '$2,999',
        features: t('services.seo.package3.features').split(','),
      },
    ],
    faqs: [
      {
        question: t('services.seo.faq1.q'),
        answer: t('services.seo.faq1.a'),
      },
      {
        question: t('services.seo.faq2.q'),
        answer: t('services.seo.faq2.a'),
      },
      {
        question: t('services.seo.faq3.q'),
        answer: t('services.seo.faq3.a'),
      },
      {
        question: t('services.seo.faq4.q'),
        answer: t('services.seo.faq4.a'),
      },
      {
        question: t('services.seo.faq5.q'),
        answer: t('services.seo.faq5.a'),
      },
    ],
  };

  return <ServiceDetail {...serviceData} />;
};
