import React from 'react';
import { ServiceDetail } from '../../components/ServiceDetail';
import { useLanguage } from '../../contexts/LanguageContext';

export const EcommercePage: React.FC = () => {
  const { t } = useLanguage();
  const serviceData = {
    title: t('services.ecommerce.title'),
    subtitle: t('services.ecommerce.subtitle'),
    description: t('services.ecommerce.description'),
    image: '/services/ecommerce-hero.png',
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
        price: 'USD 89 – 357',
        features: t('services.ecommerce.package1.features').split(','),
      },
      {
        name: t('services.ecommerce.package2.name'),
        price: 'USD 357 – 1,072+',
        popular: true,
        features: t('services.ecommerce.package2.features').split(','),
      },
      {
        name: t('services.ecommerce.package3.name'),
        price: 'USD 1,200 – 2,200+',
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
