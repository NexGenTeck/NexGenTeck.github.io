import React from 'react';
import { ServiceDetail } from '../../components/ServiceDetail';
import { useLanguage } from '../../contexts/LanguageContext';

export const VideoEditingPage: React.FC = () => {
    const { t } = useLanguage();
    const serviceData = {
        title: t('services.videoediting.title'),
        subtitle: t('services.videoediting.subtitle'),
        description: t('services.videoediting.description'),
        image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMGVkaXRpbmd8ZW58MXx8fHwxNzY0Mzg2MjAyfDA&ixlib=rb-4.1.0&q=80&w=1080',
        features: [
            t('services.videoediting.feature1'),
            t('services.videoediting.feature2'),
            t('services.videoediting.feature3'),
            t('services.videoediting.feature4'),
            t('services.videoediting.feature5'),
            t('services.videoediting.feature6'),
            t('services.videoediting.feature7'),
            t('services.videoediting.feature8'),
            t('services.videoediting.feature9'),
            t('services.videoediting.feature10'),
            t('services.videoediting.feature11'),
            t('services.videoediting.feature12'),
        ],
        benefits: [
            t('services.videoediting.benefit1'),
            t('services.videoediting.benefit2'),
            t('services.videoediting.benefit3'),
            t('services.videoediting.benefit4'),
            t('services.videoediting.benefit5'),
            t('services.videoediting.benefit6'),
        ],
        process: [
            { title: t('services.videoediting.process1.title'), description: t('services.videoediting.process1.desc') },
            { title: t('services.videoediting.process2.title'), description: t('services.videoediting.process2.desc') },
            { title: t('services.videoediting.process3.title'), description: t('services.videoediting.process3.desc') },
            { title: t('services.videoediting.process4.title'), description: t('services.videoediting.process4.desc') },
        ],
        packages: [
            {
                name: t('services.videoediting.package1.name'),
                price: 'USD 11 /video',
                features: t('services.videoediting.package1.features').split(','),
            },
            {
                name: t('services.videoediting.package2.name'),
                price: 'USD 29 /video',
                popular: true,
                features: t('services.videoediting.package2.features').split(','),
            },
            {
                name: t('services.videoediting.package3.name'),
                price: 'USD 29+ /video',
                features: t('services.videoediting.package3.features').split(','),
            },
        ],
        faqs: [
            {
                question: t('services.videoediting.faq1.q'),
                answer: t('services.videoediting.faq1.a'),
            },
            {
                question: t('services.videoediting.faq2.q'),
                answer: t('services.videoediting.faq2.a'),
            },
            {
                question: t('services.videoediting.faq3.q'),
                answer: t('services.videoediting.faq3.a'),
            },
            {
                question: t('services.videoediting.faq4.q'),
                answer: t('services.videoediting.faq4.a'),
            },
            {
                question: t('services.videoediting.faq5.q'),
                answer: t('services.videoediting.faq5.a'),
            },
        ],
    };

    return <ServiceDetail {...serviceData} />;
};
