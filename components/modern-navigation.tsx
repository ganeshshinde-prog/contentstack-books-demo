'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
}

interface ModernNavigationProps {
  logo?: string;
  logoText?: string;
  items?: NavigationItem[];
  showSearch?: boolean;
  showUserMenu?: boolean;
}

const ModernNavigation: React.FC<ModernNavigationProps> = ({
  logoText = "BookHaven",
  items = [
    { label: "Home", href: "/", icon: "🏠" },
    { label: "Books", href: "/books", icon: "📚" },
    { label: "New Arrivals", href: "/new_arrivals", icon: "✨" },
    { label: "Cart", href: "/carts", icon: "🛒" },
    { label: "Request Book", href: "/request-book", icon: "📝" }
  ],
  showSearch = true,
  showUserMenu = true
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className={`modern-nav ${isScrolled ? 'scrolled' : ''}`}>
      <div className="max-width">
        <div className="nav-container">
          {/* Logo */}
          <Link href="/" className="nav-logo">
            <span className="logo-icon">📚</span>
            <span className="logo-text">{logoText}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-links desktop-only">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
              >
                {item.icon && <span className="nav-icon">{item.icon}</span>}
                {item.label}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="nav-search desktop-only">
              <div className="search-container">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search books..."
                  className="search-input"
                />
              </div>
            </div>
          )}

          {/* User Menu & Mobile Toggle */}
          <div className="nav-actions">
            {showUserMenu && (
              <button className="user-menu-btn desktop-only">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
            )}
            
            <button 
              className="mobile-menu-btn mobile-only"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-content">
            {showSearch && (
              <div className="mobile-search">
                <div className="search-container">
                  <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search books..."
                    className="search-input"
                  />
                </div>
              </div>
            )}
            
            <div className="mobile-nav-links">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mobile-nav-link ${isActive(item.href) ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon && <span className="nav-icon">{item.icon}</span>}
                  {item.label}
                </Link>
              ))}
            </div>

            {showUserMenu && (
              <div className="mobile-user-section">
                <button className="mobile-user-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .modern-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        
        .modern-nav.scrolled {
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .nav-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          gap: 24px;
        }
        
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.5rem;
          font-weight: 800;
          color: #1a202c;
          text-decoration: none;
          transition: transform 0.2s ease;
        }
        
        .nav-logo:hover {
          transform: scale(1.05);
        }
        
        .logo-icon {
          font-size: 2rem;
        }
        
        .logo-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .nav-links {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: 8px;
          font-weight: 500;
          color: #4a5568;
          text-decoration: none;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .nav-link:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          transform: translateY(-1px);
        }
        
        .nav-link.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .nav-icon {
          font-size: 1.1rem;
        }
        
        .nav-search {
          flex: 1;
          max-width: 400px;
        }
        
        .search-container {
          position: relative;
          width: 100%;
        }
        
        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          z-index: 1;
        }
        
        .search-input {
          width: 100%;
          padding: 12px 16px 12px 48px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 16px;
          background: white;
          transition: all 0.2s ease;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .user-menu-btn {
          padding: 12px;
          border: none;
          background: #f7fafc;
          border-radius: 12px;
          color: #4a5568;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .user-menu-btn:hover {
          background: #edf2f7;
          color: #667eea;
        }
        
        .mobile-menu-btn {
          padding: 8px;
          border: none;
          background: transparent;
          cursor: pointer;
        }
        
        .hamburger {
          display: flex;
          flex-direction: column;
          width: 24px;
          height: 18px;
          justify-content: space-between;
        }
        
        .hamburger span {
          display: block;
          height: 2px;
          width: 100%;
          background: #4a5568;
          border-radius: 1px;
          transition: all 0.3s ease;
        }
        
        .hamburger.active span:nth-child(1) {
          transform: rotate(45deg) translate(6px, 6px);
        }
        
        .hamburger.active span:nth-child(2) {
          opacity: 0;
        }
        
        .hamburger.active span:nth-child(3) {
          transform: rotate(-45deg) translate(6px, -6px);
        }
        
        .mobile-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          transform: translateY(-100%);
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }
        
        .mobile-menu.open {
          transform: translateY(0);
          opacity: 1;
          visibility: visible;
        }
        
        .mobile-menu-content {
          padding: 24px 0;
        }
        
        .mobile-search {
          padding: 0 20px 24px;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 24px;
        }
        
        .mobile-nav-links {
          display: flex;
          flex-direction: column;
        }
        
        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          font-weight: 500;
          color: #4a5568;
          text-decoration: none;
          transition: all 0.2s ease;
          border-left: 4px solid transparent;
        }
        
        .mobile-nav-link:hover {
          background: #f7fafc;
          color: #667eea;
        }
        
        .mobile-nav-link.active {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          border-left-color: #667eea;
        }
        
        .mobile-user-section {
          padding: 24px 20px 0;
          border-top: 1px solid #f1f5f9;
          margin-top: 24px;
        }
        
        .mobile-user-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          font-weight: 500;
          color: #4a5568;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .mobile-user-btn:hover {
          border-color: #667eea;
          color: #667eea;
        }
        
        /* Responsive Classes */
        .desktop-only {
          display: flex;
        }
        
        .mobile-only {
          display: none;
        }
        
        @media (max-width: 768px) {
          .desktop-only {
            display: none;
          }
          
          .mobile-only {
            display: flex;
          }
          
          .nav-container {
            padding: 12px 0;
          }
          
          .logo-text {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </nav>
  );
};

export default ModernNavigation;

