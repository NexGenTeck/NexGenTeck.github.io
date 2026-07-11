import React from 'react';
import { ServiceDetail } from '../../components/ServiceDetail';
import { useLanguage } from '../../contexts/LanguageContext';

export const ThreeDGraphicsPage: React.FC = () => {
    const { t } = useLanguage();
    const serviceData = {
        title: t('services.3dgraphics.title'),
        subtitle: t('services.3dgraphics.subtitle'),
        description: t('services.3dgraphics.description'),
        image: '/assets/3d-graphics-hero.jpg',
        features: [
            t('services.3dgraphics.feature1'),
            t('services.3dgraphics.feature2'),
            t('services.3dgraphics.feature3'),
            t('services.3dgraphics.feature4'),
            t('services.3dgraphics.feature5'),
            t('services.3dgraphics.feature6'),
            t('services.3dgraphics.feature7'),
            t('services.3dgraphics.feature8'),
            t('services.3dgraphics.feature9'),
            t('services.3dgraphics.feature10'),
            t('services.3dgraphics.feature11'),
            t('services.3dgraphics.feature12'),
        ],
        benefits: [
            t('services.3dgraphics.benefit1'),
            t('services.3dgraphics.benefit2'),
            t('services.3dgraphics.benefit3'),
            t('services.3dgraphics.benefit4'),
            t('services.3dgraphics.benefit5'),
            t('services.3dgraphics.benefit6'),
        ],
        process: [
            { title: t('services.3dgraphics.process1.title'), description: t('services.3dgraphics.process1.desc') },
            { title: t('services.3dgraphics.process2.title'), description: t('services.3dgraphics.process2.desc') },
            { title: t('services.3dgraphics.process3.title'), description: t('services.3dgraphics.process3.desc') },
            { title: t('services.3dgraphics.process4.title'), description: t('services.3dgraphics.process4.desc') },
        ],
        packages: [
            {
                name: t('services.3dgraphics.package1.name'),
                price: '$799',
                features: t('services.3dgraphics.package1.features').split(','),
            },
            {
                name: t('services.3dgraphics.package2.name'),
                price: '$1,999',
                popular: true,
                features: t('services.3dgraphics.package2.features').split(','),
            },
            {
                name: t('services.3dgraphics.package3.name'),
                price: '$4,999',
                features: t('services.3dgraphics.package3.features').split(','),
            },
        ],
        faqs: [
            {
                question: t('services.3dgraphics.faq1.q'),
                answer: t('services.3dgraphics.faq1.a'),
            },
            {
                question: t('services.3dgraphics.faq2.q'),
                answer: t('services.3dgraphics.faq2.a'),
            },
            {
                question: t('services.3dgraphics.faq3.q'),
                answer: t('services.3dgraphics.faq3.a'),
            },
            {
                question: t('services.3dgraphics.faq4.q'),
                answer: t('services.3dgraphics.faq4.a'),
            },
            {
                question: t('services.3dgraphics.faq5.q'),
                answer: t('services.3dgraphics.faq5.a'),
            },
        ],
    };

    return <ServiceDetail {...serviceData} />;
};
