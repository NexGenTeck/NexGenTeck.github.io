import React from 'react';
import { ServiceDetail } from '../../components/ServiceDetail';
import { useLanguage } from '../../contexts/LanguageContext';

export const AIPage: React.FC = () => {
  const { t } = useLanguage();
  const serviceData = {
    title: t('services.ai.title'),
    subtitle: t('services.ai.subtitle'),
    description: t('services.ai.description'),
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlfGVufDF8fHx8MTc2NDQyNjgzNnww&ixlib=rb-4.1.0&q=80&w=1080',
    features: [
      t('services.ai.feature1'),
      t('services.ai.feature2'),
      t('services.ai.feature3'),
      t('services.ai.feature4'),
      t('services.ai.feature5'),
      t('services.ai.feature6'),
      t('services.ai.feature7'),
      t('services.ai.feature8'),
      t('services.ai.feature9'),
    ],
    benefits: [
      t('services.ai.benefit1'),
      t('services.ai.benefit2'),
      t('services.ai.benefit3'),
      t('services.ai.benefit4'),
      t('services.ai.benefit5'),
      t('services.ai.benefit6'),
    ],
    process: [
      { title: t('services.ai.process1.title'), description: t('services.ai.process1.desc') },
      { title: t('services.ai.process2.title'), description: t('services.ai.process2.desc') },
      { title: t('services.ai.process3.title'), description: t('services.ai.process3.desc') },
      { title: t('services.ai.process4.title'), description: t('services.ai.process4.desc') },
      { title: t('services.ai.process5.title'), description: t('services.ai.process5.desc') },
      { title: t('services.ai.process6.title'), description: t('services.ai.process6.desc') },
    ],
    packages: [
      {
        name: t('services.ai.package1.name'),
        price: 'USD 500 – 1,500',
        features: t('services.ai.package1.features').split(','),
      },
      {
        name: t('services.ai.package2.name'),
        price: 'USD 1,500 – 5,000',
        popular: true,
        features: t('services.ai.package2.features').split(','),
      },
      {
        name: t('services.ai.package3.name'),
        price: 'USD 5,000+',
        features: t('services.ai.package3.features').split(','),
      },
    ],
    faqs: [
      {
        question: t('services.ai.faq1.q'),
        answer: t('services.ai.faq1.a'),
      },
      {
        question: t('services.ai.faq2.q'),
        answer: t('services.ai.faq2.a'),
      },
      {
        question: t('services.ai.faq3.q'),
        answer: t('services.ai.faq3.a'),
      },
      {
        question: t('services.ai.faq4.q'),
        answer: t('services.ai.faq4.a'),
      },
      {
        question: t('services.ai.faq5.q'),
        answer: t('services.ai.faq5.a'),
      },
    ],
  };

  return <ServiceDetail {...serviceData} />;
};
