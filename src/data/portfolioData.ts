export interface Project {
  id: string;
  title: string;
  category: string;
  type: string;
  image: string;
  description: string;
  tags: string[];
  featured?: boolean;
}

export const getProjects = (t: (key: string) => string): Project[] => [
  {
    id: 'trackit',
    title: 'TrackIT',
    category: 'ecommerce',
    type: 'E-commerce Platform',
    image: '/portfolio/trackit.jpeg',
    description:
      'A data-driven e-commerce platform designed to help sellers launch, manage, and grow their TikTok Shop by tracking products, creators, sales performance, and market trends.',
    tags: ['E-commerce', 'Data Analytics', 'TikTok Shop'],
    featured: true,
  },
  {
    id: 'swift-translate-pro',
    title: 'Swift Translate Pro',
    category: 'ai',
    type: 'AI Translation System',
    image: '/portfolio/swift-translate-pro.jpeg',
    description:
      'AI-powered multilingual translation via fast, API-based language processing. Streamlines cross-team communication with accurate, real-time translations.',
    tags: ['AI', 'API Integration', 'Translation'],
    featured: true,
  },
  {
    id: 'tiktok-downloader',
    title: 'TikTok Downloader – Flagship SaaS',
    category: 'mobile',
    type: 'Mobile and SaaS Application',
    image: '/portfolio/tiktok-downloader.jpeg',
    description:
      'A scalable SaaS platform for downloading TikTok videos, built for speed and reliability. Featuring responsive interfaces, API integration, and seamless multi-device support.',
    tags: ['Next.js', 'Node.js', 'API Integration'],
  },
  {
    id: 't-downloader-app',
    title: 'T Downloader App',
    category: 'mobile',
    type: 'Mobile Application',
    image: '/portfolio/t-downloader-app.jpeg',
    description:
      'A mobile-first Android application for fast, watermark-free social media video downloads with a clean, intuitive, and highly responsive user experience.',
    tags: ['Flutter', 'Android', 'Mobile Application'],
  },
  {
    id: 'ai-property-booking-concierge',
    title: 'AI Property Booking Concierge',
    category: 'ai',
    type: 'Multi-Agent AI System',
    image: '/portfolio/ai-booking-concierge.jpg',
    description:
      'A multi-agent AI property booking system featuring intelligent search, booking workflows, memory, recommendations, retrieval, and conversational support.',
    tags: ['Multi-Agent AI', 'RAG', 'FastAPI'],
    featured: true,
  },
  {
    id: 'digital-campaign',
    title: t('portfolio.projects.digital-campaign.title'),
    category: 'marketing',
    type: 'Digital Marketing',
    image: 'https://images.unsplash.com/photo-1557838923-2985c318be48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbWFya2V0aW5nfGVufDF8fHx8MTc2NDQyNjgzNnww&ixlib=rb-4.1.0&q=80&w=1080',
    description: t('portfolio.projects.digital-campaign.description'),
    tags: [
      t('portfolio.projects.digital-campaign.tag1'),
      t('portfolio.projects.digital-campaign.tag2'),
      t('portfolio.projects.digital-campaign.tag3'),
    ],
  },
];
