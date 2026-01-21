import React from 'react';
import { ServiceDetail } from '../../components/ServiceDetail';
import { useLanguage } from '../../contexts/LanguageContext';

export const WebDevelopmentPage: React.FC = () => {
  const { t } = useLanguage();
  const serviceData = {
    title: t('services.web.title'),
    subtitle: t('services.web.subtitle'),
    description: t('services.web.description'),
    image: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGNvZGluZ3xlbnwxfHx8fDE3NjQzODYyMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    features: [
      t('services.web.feature1'),
      t('services.web.feature2'),
      t('services.web.feature3'),
      t('services.web.feature4'),
      t('services.web.feature5'),
      t('services.web.feature6'),
      t('services.web.feature7'),
      t('services.web.feature8'),
      t('services.web.feature9'),
      t('services.web.feature10'),
      t('services.web.feature11'),
      t('services.web.feature12'),
    ],
    benefits: [
      t('services.web.benefit1'),
      t('services.web.benefit2'),
      t('services.web.benefit3'),
      t('services.web.benefit4'),
      t('services.web.benefit5'),
      t('services.web.benefit6'),
    ],
    process: [
      { title: t('services.web.process1.title'), description: t('services.web.process1.desc') },
      { title: t('services.web.process2.title'), description: t('services.web.process2.desc') },
      { title: t('services.web.process3.title'), description: t('services.web.process3.desc') },
      { title: t('services.web.process4.title'), description: t('services.web.process4.desc') },
    ],
    packages: [
      {
        name: t('services.web.package1.name'),
        price: '$1,499',
        features: t('services.web.package1.features').split(','),
      },
      {
        name: t('services.web.package2.name'),
        price: '$2,999',
        popular: true,
        features: t('services.web.package2.features').split(','),
      },
      {
        name: t('services.web.package3.name'),
        price: '$5,999',
        features: t('services.web.package3.features').split(','),
      },
    ],
    faqs: [
      {
        question: t('services.web.faq1.q'),
        answer: t('services.web.faq1.a'),
      },
      {
        question: t('services.web.faq2.q'),
        answer: t('services.web.faq2.a'),
      },
      {
        question: t('services.web.faq3.q'),
        answer: t('services.web.faq3.a'),
      },
      {
        question: t('services.web.faq4.q'),
        answer: t('services.web.faq4.a'),
      },
      {
        question: t('services.web.faq5.q'),
        answer: t('services.web.faq5.a'),
      },
    ],
  };

  return <ServiceDetail {...serviceData} />;
};
