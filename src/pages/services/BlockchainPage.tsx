import React from 'react';
import { ServiceDetail } from '../../components/ServiceDetail';
import { useLanguage } from '../../contexts/LanguageContext';

export const BlockchainPage: React.FC = () => {
    const { t } = useLanguage();
    const serviceData = {
        title: t('services.blockchain.title'),
        subtitle: t('services.blockchain.subtitle'),
        description: t('services.blockchain.description'),
        image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
        features: [
            t('services.blockchain.feature1'),
            t('services.blockchain.feature2'),
            t('services.blockchain.feature3'),
            t('services.blockchain.feature4'),
            t('services.blockchain.feature5'),
            t('services.blockchain.feature6'),
            t('services.blockchain.feature7'),
            t('services.blockchain.feature8'),
            t('services.blockchain.feature9'),
            t('services.blockchain.feature10'),
            t('services.blockchain.feature11'),
            t('services.blockchain.feature12'),
        ],
        benefits: [
            t('services.blockchain.benefit1'),
            t('services.blockchain.benefit2'),
            t('services.blockchain.benefit3'),
            t('services.blockchain.benefit4'),
            t('services.blockchain.benefit5'),
            t('services.blockchain.benefit6'),
        ],
        process: [
            { title: t('services.blockchain.process1.title'), description: t('services.blockchain.process1.desc') },
            { title: t('services.blockchain.process2.title'), description: t('services.blockchain.process2.desc') },
            { title: t('services.blockchain.process3.title'), description: t('services.blockchain.process3.desc') },
            { title: t('services.blockchain.process4.title'), description: t('services.blockchain.process4.desc') },
        ],
        packages: [
            {
                name: t('services.blockchain.package1.name'),
                price: 'Custom',
                features: t('services.blockchain.package1.features').split(','),
            },
            {
                name: t('services.blockchain.package2.name'),
                price: 'Custom',
                popular: true,
                features: t('services.blockchain.package2.features').split(','),
            },
            {
                name: t('services.blockchain.package3.name'),
                price: 'Custom',
                features: t('services.blockchain.package3.features').split(','),
            },
        ],
        faqs: [
            {
                question: t('services.blockchain.faq1.q'),
                answer: t('services.blockchain.faq1.a'),
            },
            {
                question: t('services.blockchain.faq2.q'),
                answer: t('services.blockchain.faq2.a'),
            },
            {
                question: t('services.blockchain.faq3.q'),
                answer: t('services.blockchain.faq3.a'),
            },
            {
                question: t('services.blockchain.faq4.q'),
                answer: t('services.blockchain.faq4.a'),
            },
            {
                question: t('services.blockchain.faq5.q'),
                answer: t('services.blockchain.faq5.a'),
            },
        ],
    };

    return <ServiceDetail {...serviceData} />;
};
