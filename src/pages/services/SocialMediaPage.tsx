import React from 'react';
import { ServiceDetail } from '../../components/ServiceDetail';
import { useLanguage } from '../../contexts/LanguageContext';

export const SocialMediaPage: React.FC = () => {
    const { t } = useLanguage();
    const serviceData = {
        title: t('services.social.title'),
        subtitle: t('services.social.subtitle'),
        description: t('services.social.description'),
        image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
        features: [
            t('services.social.feature1'),
            t('services.social.feature2'),
            t('services.social.feature3'),
            t('services.social.feature4'),
            t('services.social.feature5'),
            t('services.social.feature6'),
            t('services.social.feature7'),
            t('services.social.feature8'),
            t('services.social.feature9'),
            t('services.social.feature10'),
            t('services.social.feature11'),
            t('services.social.feature12'),
        ],
        benefits: [
            t('services.social.benefit1'),
            t('services.social.benefit2'),
            t('services.social.benefit3'),
            t('services.social.benefit4'),
            t('services.social.benefit5'),
            t('services.social.benefit6'),
        ],
        process: [
            { title: t('services.social.process1.title'), description: t('services.social.process1.desc') },
            { title: t('services.social.process2.title'), description: t('services.social.process2.desc') },
            { title: t('services.social.process3.title'), description: t('services.social.process3.desc') },
            { title: t('services.social.process4.title'), description: t('services.social.process4.desc') },
        ],
        packages: [
            {
                name: t('services.social.package1.name'),
                price: '$699',
                features: t('services.social.package1.features').split(','),
            },
            {
                name: t('services.social.package2.name'),
                price: '$1,499',
                popular: true,
                features: t('services.social.package2.features').split(','),
            },
            {
                name: t('services.social.package3.name'),
                price: '$2,999',
                features: t('services.social.package3.features').split(','),
            },
        ],
        faqs: [
            {
                question: t('services.social.faq1.q'),
                answer: t('services.social.faq1.a'),
            },
            {
                question: t('services.social.faq2.q'),
                answer: t('services.social.faq2.a'),
            },
            {
                question: t('services.social.faq3.q'),
                answer: t('services.social.faq3.a'),
            },
            {
                question: t('services.social.faq4.q'),
                answer: t('services.social.faq4.a'),
            },
            {
                question: t('services.social.faq5.q'),
                answer: t('services.social.faq5.a'),
            },
        ],
    };

    return <ServiceDetail {...serviceData} />;
};
