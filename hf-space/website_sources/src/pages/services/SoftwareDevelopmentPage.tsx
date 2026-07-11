import React from 'react';
import { ServiceDetail } from '../../components/ServiceDetail';
import { useLanguage } from '../../contexts/LanguageContext';

export const SoftwareDevelopmentPage: React.FC = () => {
    const { t } = useLanguage();
    const serviceData = {
        title: t('services.software.title'),
        subtitle: t('services.software.subtitle'),
        description: t('services.software.description'),
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
        features: [
            t('services.software.feature1'),
            t('services.software.feature2'),
            t('services.software.feature3'),
            t('services.software.feature4'),
            t('services.software.feature5'),
            t('services.software.feature6'),
            t('services.software.feature7'),
            t('services.software.feature8'),
            t('services.software.feature9'),
            t('services.software.feature10'),
            t('services.software.feature11'),
            t('services.software.feature12'),
        ],
        benefits: [
            t('services.software.benefit1'),
            t('services.software.benefit2'),
            t('services.software.benefit3'),
            t('services.software.benefit4'),
            t('services.software.benefit5'),
            t('services.software.benefit6'),
        ],
        process: [
            { title: t('services.software.process1.title'), description: t('services.software.process1.desc') },
            { title: t('services.software.process2.title'), description: t('services.software.process2.desc') },
            { title: t('services.software.process3.title'), description: t('services.software.process3.desc') },
            { title: t('services.software.process4.title'), description: t('services.software.process4.desc') },
        ],
        packages: [
            {
                name: t('services.software.package1.name'),
                price: 'USD 179+',
                features: t('services.software.package1.features').split(','),
            },
            {
                name: t('services.software.package2.name'),
                price: 'USD 143+',
                popular: true,
                features: t('services.software.package2.features').split(','),
            },
            {
                name: t('services.software.package3.name'),
                price: 'USD 54+',
                features: t('services.software.package3.features').split(','),
            },
        ],
        faqs: [
            {
                question: t('services.software.faq1.q'),
                answer: t('services.software.faq1.a'),
            },
            {
                question: t('services.software.faq2.q'),
                answer: t('services.software.faq2.a'),
            },
            {
                question: t('services.software.faq3.q'),
                answer: t('services.software.faq3.a'),
            },
            {
                question: t('services.software.faq4.q'),
                answer: t('services.software.faq4.a'),
            },
            {
                question: t('services.software.faq5.q'),
                answer: t('services.software.faq5.a'),
            },
        ],
    };

    return <ServiceDetail {...serviceData} />;
};
