import React from 'react';
import { ServiceDetail } from '../../components/ServiceDetail';

export const SEOPage: React.FC = () => {
  const serviceData = {
    title: 'Search Engine Optimization',
    subtitle: 'Boost your visibility and drive organic traffic with expert SEO strategies',
    description: 'Improve your search engine rankings and attract more qualified traffic with our comprehensive SEO services. We use data-driven strategies and best practices to help your business dominate search results and grow your online presence.',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZW8lMjBhbmFseXRpY3N8ZW58MXx8fHwxNzY0NDAyMjQ1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    features: [
      'Comprehensive SEO audit',
      'Keyword research and analysis',
      'On-page optimization',
      'Technical SEO improvements',
      'Content optimization',
      'Link building strategies',
      'Local SEO optimization',
      'Competitor analysis',
      'Performance tracking',
      'Monthly reporting',
      'Schema markup implementation',
      'Mobile optimization',
    ],
    benefits: [
      'Increase organic traffic to your website',
      'Improve search engine rankings for target keywords',
      'Build long-term sustainable growth',
      'Reduce dependence on paid advertising',
      'Enhance brand visibility and credibility',
      'Target customers at the right moment in their journey',
    ],
    process: [
      { title: 'Audit', description: 'Analyze your current SEO performance and identify opportunities' },
      { title: 'Strategy', description: 'Develop a customized SEO strategy for your business' },
      { title: 'Implementation', description: 'Execute on-page, technical, and off-page optimizations' },
      { title: 'Monitor', description: 'Track progress and continuously optimize for better results' },
    ],
    packages: [
      {
        name: 'Local SEO',
        price: '$799',
        features: [
          'Local keyword research',
          'Google Business Profile optimization',
          'Local citations',
          'On-page optimization',
          'Monthly reporting',
          '3 months minimum',
        ],
      },
      {
        name: 'Growth SEO',
        price: '$1,499',
        popular: true,
        features: [
          'Everything in Local',
          'National keyword targeting',
          'Content optimization',
          'Link building',
          'Technical SEO',
          'Competitor analysis',
          'Bi-weekly reporting',
          '6 months minimum',
        ],
      },
      {
        name: 'Enterprise SEO',
        price: '$2,999',
        features: [
          'Everything in Growth',
          'Custom SEO strategy',
          'Advanced technical SEO',
          'Content creation',
          'International SEO',
          'Dedicated SEO manager',
          'Weekly reporting',
          '12 months minimum',
        ],
      },
    ],
    faqs: [
      {
        question: 'How long does it take to see SEO results?',
        answer: 'SEO is a long-term strategy. You can expect to see initial improvements in 3-6 months, with more significant results after 6-12 months of consistent optimization.',
      },
      {
        question: 'What makes your SEO services different?',
        answer: 'We focus on sustainable, white-hat SEO techniques that provide long-term results. Our strategies are data-driven and customized to your specific business goals.',
      },
      {
        question: 'Do you guarantee first page rankings?',
        answer: 'No reputable SEO company can guarantee specific rankings. However, we do guarantee our best efforts using proven strategies to improve your visibility.',
      },
      {
        question: 'What if I already have someone doing SEO?',
        answer: 'We can provide an audit to identify gaps and opportunities, then work alongside your existing team or take over completely based on your needs.',
      },
      {
        question: 'Is SEO a one-time service?',
        answer: 'No, SEO requires ongoing work. Search algorithms constantly change, and competitors are always optimizing. Continuous optimization is essential for maintaining and improving rankings.',
      },
    ],
  };

  return <ServiceDetail {...serviceData} />;
};
