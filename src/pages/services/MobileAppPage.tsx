import React from 'react';
import { ServiceDetail } from '../../components/ServiceDetail';
import { useLanguage } from '../../contexts/LanguageContext';

export const MobileAppPage: React.FC = () => {
  const { t } = useLanguage();
  const serviceData = {
    title: t('services.mobile.title'),
    subtitle: t('services.mobile.subtitle'),
    description: t('services.mobile.description'),
    image: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBkZXNpZ258ZW58MXx8fHwxNzY0NDEwODY4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    features: [
      t('services.mobile.feature1'),
      t('services.mobile.feature2'),
      t('services.mobile.feature3'),
      t('services.mobile.feature4'),
      t('services.mobile.feature5'),
      t('services.mobile.feature6'),
      t('services.mobile.feature7'),
      t('services.mobile.feature8'),
      t('services.mobile.feature9'),
      t('services.mobile.feature10'),
      t('services.mobile.feature11'),
      t('services.mobile.feature12'),
    ],
    benefits: [
      t('services.mobile.benefit1'),
      t('services.mobile.benefit2'),
      t('services.mobile.benefit3'),
      t('services.mobile.benefit4'),
      t('services.mobile.benefit5'),
      t('services.mobile.benefit6'),
    ],
    process: [
      { title: t('services.mobile.process1.title'), description: t('services.mobile.process1.desc') },
      { title: t('services.mobile.process2.title'), description: t('services.mobile.process2.desc') },
      { title: t('services.mobile.process3.title'), description: t('services.mobile.process3.desc') },
      { title: t('services.mobile.process4.title'), description: t('services.mobile.process4.desc') },
    ],
    packages: [
      {
        name: t('services.mobile.package1.name'),
        price: '$9,999',
        features: t('services.mobile.package1.features').split(','),
      },
      {
        name: t('services.mobile.package2.name'),
        price: '$19,999',
        popular: true,
        features: t('services.mobile.package2.features').split(','),
      },
      {
        name: t('services.mobile.package3.name'),
        price: '$39,999',
        features: t('services.mobile.package3.features').split(','),
      },
    ],
    faqs: [
      {
        question: t('services.mobile.faq1.q'),
        answer: t('services.mobile.faq1.a'),
      },
      {
        question: t('services.mobile.faq2.q'),
        answer: t('services.mobile.faq2.a'),
      },
      {
        question: t('services.mobile.faq3.q'),
        answer: t('services.mobile.faq3.a'),
      },
      {
        question: t('services.mobile.faq4.q'),
        answer: t('services.mobile.faq4.a'),
      },
      {
        question: t('services.mobile.faq5.q'),
        answer: t('services.mobile.faq5.a'),
      },
    ],
  };

  return <ServiceDetail {...serviceData} />;
};
