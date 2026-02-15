import React from 'react';
import { ServiceDetail } from '../../components/ServiceDetail';
import { useLanguage } from '../../contexts/LanguageContext';

export const GoogleAdsPage: React.FC = () => {
    const { t } = useLanguage();
    const serviceData = {
        title: t('services.google.title'),
        subtitle: t('services.google.subtitle'),
        description: t('services.google.description'),
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
        features: [
            t('services.google.feature1'),
            t('services.google.feature2'),
            t('services.google.feature3'),
            t('services.google.feature4'),
            t('services.google.feature5'),
            t('services.google.feature6'),
            t('services.google.feature7'),
            t('services.google.feature8'),
            t('services.google.feature9'),
            t('services.google.feature10'),
            t('services.google.feature11'),
            t('services.google.feature12'),
        ],
        benefits: [
            t('services.google.benefit1'),
            t('services.google.benefit2'),
            t('services.google.benefit3'),
            t('services.google.benefit4'),
            t('services.google.benefit5'),
            t('services.google.benefit6'),
        ],
        process: [
            { title: t('services.google.process1.title'), description: t('services.google.process1.desc') },
            { title: t('services.google.process2.title'), description: t('services.google.process2.desc') },
            { title: t('services.google.process3.title'), description: t('services.google.process3.desc') },
            { title: t('services.google.process4.title'), description: t('services.google.process4.desc') },
        ],
        packages: [
            {
                name: t('services.google.package1.name'),
                price: '$599',
                features: t('services.google.package1.features').split(','),
            },
            {
                name: t('services.google.package2.name'),
                price: '$1,299',
                popular: true,
                features: t('services.google.package2.features').split(','),
            },
            {
                name: t('services.google.package3.name'),
                price: '$2,499',
                features: t('services.google.package3.features').split(','),
            },
        ],
        faqs: [
            {
                question: t('services.google.faq1.q'),
                answer: t('services.google.faq1.a'),
            },
            {
                question: t('services.google.faq2.q'),
                answer: t('services.google.faq2.a'),
            },
            {
                question: t('services.google.faq3.q'),
                answer: t('services.google.faq3.a'),
            },
            {
                question: t('services.google.faq4.q'),
                answer: t('services.google.faq4.a'),
            },
            {
                question: t('services.google.faq5.q'),
                answer: t('services.google.faq5.a'),
            },
        ],
    };

    return <ServiceDetail {...serviceData} />;
};
