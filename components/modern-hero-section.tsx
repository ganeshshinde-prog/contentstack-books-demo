'use client';

import React from 'react';
import Link from 'next/link';

interface ModernHeroSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  primaryCTA?: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  backgroundImage?: string;
}

const ModernHeroSection: React.FC<ModernHeroSectionProps> = ({
  title = "Discover Your Next Great Read",
  subtitle = "BookHaven - Your Literary Paradise",
  description = "Explore thousands of books, get personalized recommendations, and join a community of passionate readers.",
  primaryCTA = { text: "Browse Books", href: "/books" },
  secondaryCTA = { text: "Request a Book", href: "/request-book" },
  backgroundImage
}) => {
  return (
    <section className="modern-hero">
      <div className="hero-background">
        {backgroundImage && (
          <div 
            className="hero-bg-image"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        )}
        <div className="hero-overlay" />
      </div>
      
      <div className="max-width">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              {title}
            </h1>
            <p className="hero-subtitle">
              {subtitle}
            </p>
            <p className="hero-description">
              {description}
            </p>
            
            <div className="hero-actions">
              <Link href={primaryCTA.href} className="btn btn-primary btn-lg">
                {primaryCTA.text}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              
              <Link href={secondaryCTA.href} className="btn btn-secondary btn-lg">
                {secondaryCTA.text}
              </Link>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Books Available</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">5K+</div>
                <div className="stat-label">Happy Readers</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Genres</div>
              </div>
            </div>
            
            <div className="hero-features">
              <div className="feature-item">
                <div className="feature-icon">📚</div>
                <div className="feature-text">Curated Collection</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🎯</div>
                <div className="feature-text">Personalized Recommendations</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">⚡</div>
                <div className="feature-text">Fast Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .modern-hero {
          position: relative;
          min-height: 70vh;
          display: flex;
          align-items: center;
          overflow: hidden;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1;
        }
        
        .hero-bg-image {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
        
        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
        }
        
        .hero-content {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          padding: 80px 0;
        }
        
        .hero-text {
          color: white;
        }
        
        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.2;
          margin: 0 0 16px 0;
          background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .hero-subtitle {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 20px 0;
          color: rgba(255, 255, 255, 0.9);
        }
        
        .hero-description {
          font-size: 1.1rem;
          line-height: 1.6;
          margin: 0 0 40px 0;
          color: rgba(255, 255, 255, 0.8);
          max-width: 500px;
        }
        
        .hero-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        
        .btn-lg {
          padding: 16px 32px;
          font-size: 1.1rem;
          font-weight: 600;
          min-height: 52px;
        }
        
        .hero-visual {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        
        .hero-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        
        .stat-item {
          text-align: center;
          padding: 24px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .stat-number {
          font-size: 2rem;
          font-weight: 800;
          color: white;
          margin-bottom: 8px;
        }
        
        .stat-label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }
        
        .hero-features {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .feature-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .feature-icon {
          font-size: 1.5rem;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
        }
        
        .feature-text {
          color: white;
          font-weight: 600;
          font-size: 1rem;
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .modern-hero {
            min-height: 60vh;
          }
          
          .hero-content {
            grid-template-columns: 1fr;
            gap: 40px;
            padding: 60px 0;
            text-align: center;
          }
          
          .hero-title {
            font-size: 2.5rem;
          }
          
          .hero-stats {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
          
          .stat-item {
            padding: 16px;
          }
          
          .stat-number {
            font-size: 1.5rem;
          }
          
          .hero-actions {
            justify-content: center;
          }
        }
        
        @media (max-width: 480px) {
          .hero-title {
            font-size: 2rem;
          }
          
          .hero-actions {
            flex-direction: column;
            align-items: center;
          }
          
          .btn-lg {
            width: 100%;
            max-width: 280px;
          }
        }
      `}</style>
    </section>
  );
};

export default ModernHeroSection;

