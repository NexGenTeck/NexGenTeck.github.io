import { createBrowserRouter } from 'react-router';
import { Layout } from '../components/Layout';
import { Home } from '../pages/Home';
import { About } from '../pages/About';
import { Services } from '../pages/Services';
import { Portfolio } from '../pages/Portfolio';
import { Blog } from '../pages/Blog';
import { Contact } from '../pages/Contact';
import { Pricing } from '../pages/Pricing';
import { EcommercePage } from '../pages/services/EcommercePage';
import { WebDevelopmentPage } from '../pages/services/WebDevelopmentPage';
import { SEOPage } from '../pages/services/SEOPage';
import { MobileAppPage } from '../pages/services/MobileAppPage';
import { SocialMediaPage } from '../pages/services/SocialMediaPage';
import { SoftwareDevelopmentPage } from '../pages/services/SoftwareDevelopmentPage';
import { ThreeDGraphicsPage } from '../pages/services/ThreeDGraphicsPage';
import { VideoEditingPage } from '../pages/services/VideoEditingPage';
import { NotFound } from '../pages/NotFound';

const BLOG_ENABLED = false;

const blogRoutes = BLOG_ENABLED
  ? [
    { path: 'blog', Component: Blog },
    { path: 'blog/:id', Component: Blog },
    { path: 'blog/category/:category', Component: Blog },
    { path: 'blog/tag/:tag', Component: Blog },
  ]
  : [];

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'about', Component: About },
      { path: 'services', Component: Services },
      { path: 'services/ecommerce', Component: EcommercePage },
      { path: 'services/web-development', Component: WebDevelopmentPage },
      { path: 'services/seo', Component: SEOPage },
      { path: 'services/mobile-app', Component: MobileAppPage },
      { path: 'services/social-media', Component: SocialMediaPage },
      { path: 'services/software', Component: SoftwareDevelopmentPage },
      { path: 'services/3d-graphics', Component: ThreeDGraphicsPage },
      { path: 'services/video-editing', Component: VideoEditingPage },
      { path: 'portfolio', Component: Portfolio },
      { path: 'portfolio/:id', Component: Portfolio },
      ...blogRoutes,
      { path: 'pricing', Component: Pricing },
      { path: 'contact', Component: Contact },
      { path: '*', Component: NotFound },
    ],
  },
], {
  basename: import.meta.env.BASE_URL
});

