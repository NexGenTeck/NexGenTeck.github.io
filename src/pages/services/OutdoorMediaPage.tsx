import React from 'react';
import { ServiceDetail } from '../../components/ServiceDetail';
import { useLanguage } from '../../contexts/LanguageContext';

export const OutdoorMediaPage: React.FC = () => {
    const { t } = useLanguage();
    const serviceData = {
        title: t('services.outdoor.title'),
        subtitle: t('services.outdoor.subtitle'),
        description: t('services.outdoor.description'),
        image: 'https://images.unsplash.com/photo-1552960534-582cb621bd1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
        features: [
            t('services.outdoor.feature1'),
            t('services.outdoor.feature2'),
            t('services.outdoor.feature3'),
            t('services.outdoor.feature4'),
            t('services.outdoor.feature5'),
            t('services.outdoor.feature6'),
            t('services.outdoor.feature7'),
            t('services.outdoor.feature8'),
            t('services.outdoor.feature9'),
            t('services.outdoor.feature10'),
            t('services.outdoor.feature11'),
            t('services.outdoor.feature12'),
        ],
        benefits: [
            t('services.outdoor.benefit1'),
            t('services.outdoor.benefit2'),
            t('services.outdoor.benefit3'),
            t('services.outdoor.benefit4'),
            t('services.outdoor.benefit5'),
            t('services.outdoor.benefit6'),
        ],
        process: [
            { title: t('services.outdoor.process1.title'), description: t('services.outdoor.process1.desc') },
            { title: t('services.outdoor.process2.title'), description: t('services.outdoor.process2.desc') },
            { title: t('services.outdoor.process3.title'), description: t('services.outdoor.process3.desc') },
            { title: t('services.outdoor.process4.title'), description: t('services.outdoor.process4.desc') },
        ],
        packages: [
            {
                name: t('services.outdoor.package1.name'),
                price: '$5,000',
                features: t('services.outdoor.package1.features').split(','),
            },
            {
                name: t('services.outdoor.package2.name'),
                price: '$15,000',
                popular: true,
                features: t('services.outdoor.package2.features').split(','),
            },
            {
                name: t('services.outdoor.package3.name'),
                price: '$50,000',
                features: t('services.outdoor.package3.features').split(','),
            },
        ],
        faqs: [
            {
                question: t('services.outdoor.faq1.q'),
                answer: t('services.outdoor.faq1.a'),
            },
            {
                question: t('services.outdoor.faq2.q'),
                answer: t('services.outdoor.faq2.a'),
            },
            {
                question: t('services.outdoor.faq3.q'),
                answer: t('services.outdoor.faq3.a'),
            },
            {
                question: t('services.outdoor.faq4.q'),
                answer: t('services.outdoor.faq4.a'),
            },
            {
                question: t('services.outdoor.faq5.q'),
                answer: t('services.outdoor.faq5.a'),
            },
        ],
    };

    return <ServiceDetail {...serviceData} />;
};
