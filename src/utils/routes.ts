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
import { NotFound } from '../pages/NotFound';

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
      { path: 'services/google-ads', Component: Services },
      { path: 'services/social-media', Component: Services },
      { path: 'services/software', Component: Services },
      { path: 'services/outdoor-media', Component: Services },
      { path: 'services/blockchain', Component: Services },
      { path: 'portfolio', Component: Portfolio },
      { path: 'portfolio/:id', Component: Portfolio },
      { path: 'blog', Component: Blog },
      { path: 'blog/:id', Component: Blog },
      { path: 'blog/category/:category', Component: Blog },
      { path: 'blog/tag/:tag', Component: Blog },
      { path: 'pricing', Component: Pricing },
      { path: 'contact', Component: Contact },
      { path: '*', Component: NotFound },
    ],
  },
]);
