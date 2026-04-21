'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '@/components/ui/Toast';
import { useTheme } from '../providers/useTheme';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 lg:relative lg:transform-none
        ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''}
        ${!isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''}
      `}>
        <Sidebar 
          isDark={isDark}
          isMobile={isMobile}
          onClose={isMobile ? toggleSidebar : undefined}
        />
      </div>

      {/* Main Content */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ${!isMobile ? (isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0') : ''}`}>
        {/* Topbar */}
        <Topbar 
          isDark={isDark}
          isMobile={isMobile}
          onToggleTheme={toggleTheme}
          onToggleSidebar={toggleSidebar}
        />
        
        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 transition-colors duration-300 bg-background">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}
