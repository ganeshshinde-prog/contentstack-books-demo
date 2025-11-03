'use client';

import React from 'react';
import ModernNavigation from './modern-navigation';
import Footer from './footer';

interface ModernLayoutProps {
  children: React.ReactNode;
}

const ModernLayout: React.FC<ModernLayoutProps> = ({ children }) => {
  return (
    <div className="modern-layout">
      <ModernNavigation />
      <main className="main-content">
        {children}
      </main>
      <Footer />
      
      <style jsx>{`
        .modern-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .main-content {
          flex: 1;
          padding-top: 80px; /* Account for fixed navigation */
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Focus management for accessibility */
        :focus {
          outline: 2px solid #667eea;
          outline-offset: 2px;
        }
        
        /* Skip link for accessibility */
        .skip-link {
          position: absolute;
          top: -40px;
          left: 6px;
          background: #667eea;
          color: white;
          padding: 8px;
          text-decoration: none;
          border-radius: 4px;
          z-index: 1001;
        }
        
        .skip-link:focus {
          top: 6px;
        }
      `}</style>
    </div>
  );
};

export default ModernLayout;

