import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Header } from './Header';
import { Footer } from './Footer';
import { Chatbot } from './Chatbot';
import { AnimatedBackground } from './AnimatedBackground';
import { useTheme } from '../contexts/ThemeContext';

export const Layout: React.FC = () => {
  const location = useLocation();
  const { theme } = useTheme();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const isHome = location.pathname === '/';
  const contentThemeClass = isHome ? '' : 'theme-non-home';

  return (
    <div className={`site-shell ${textColor} transition-colors duration-300`}>
      <AnimatedBackground />
      <div className={`site-content min-h-screen flex flex-col ${contentThemeClass}`}>
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <Chatbot />
      </div>
    </div>
  );
};
