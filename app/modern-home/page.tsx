'use client';

import React from 'react';
import ModernHeroSection from '@/components/modern-hero-section';
import FeaturedBooks from '@/components/featured-books';
import GenreCategories from '@/components/genre-categories';
import ReadingStats from '@/components/reading-stats';
import PersonalizedRecommendations from '@/components/personalized-recommendations';

export default function ModernHomePage() {
  return (
    <div className="modern-home-page">
      {/* Hero Section */}
      <ModernHeroSection
        title="Discover Your Next Great Read"
        subtitle="BookHaven - Your Literary Paradise"
        description="Explore thousands of books, get personalized recommendations, and join a community of passionate readers. From bestsellers to hidden gems, find your perfect book today."
        primaryCTA={{ text: "Browse Books", href: "/books" }}
        secondaryCTA={{ text: "Request a Book", href: "/request-book" }}
      />

      {/* Main Content */}
      <main className="main-content">
        <div className="max-width">
          {/* Featured Books Section */}
          <section className="section featured-section">
            <div className="section-header">
              <h2 className="section-title">Featured Books</h2>
              <p className="section-subtitle">
                Handpicked selections from our curators
              </p>
            </div>
            <FeaturedBooks />
          </section>

          {/* Personalized Recommendations */}
          <section className="section recommendations-section">
            <div className="section-header">
              <h2 className="section-title">Recommended for You</h2>
              <p className="section-subtitle">
                Based on your reading preferences and history
              </p>
            </div>
            <PersonalizedRecommendations />
          </section>

          {/* Genre Categories */}
          <section className="section genres-section">
            <div className="section-header">
              <h2 className="section-title">Browse by Genre</h2>
              <p className="section-subtitle">
                Explore our diverse collection across all genres
              </p>
            </div>
            <GenreCategories />
          </section>

          {/* Reading Stats */}
          <section className="section stats-section">
            <div className="section-header">
              <h2 className="section-title">Community Stats</h2>
              <p className="section-subtitle">
                Join thousands of readers in our growing community
              </p>
            </div>
            <ReadingStats />
          </section>

          {/* Call to Action Section */}
          <section className="section cta-section">
            <div className="cta-container">
              <div className="cta-content">
                <h2 className="cta-title">Can't Find What You're Looking For?</h2>
                <p className="cta-description">
                  Request any book and we'll do our best to add it to our collection. 
                  Help us grow our library together!
                </p>
                <div className="cta-actions">
                  <a href="/request-book" className="btn btn-primary btn-lg">
                    Request a Book
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </a>
                  <a href="/contact-us" className="btn btn-secondary btn-lg">
                    Contact Us
                  </a>
                </div>
              </div>
              <div className="cta-visual">
                <div className="cta-stats">
                  <div className="cta-stat">
                    <div className="stat-number">500+</div>
                    <div className="stat-label">Books Requested</div>
                  </div>
                  <div className="cta-stat">
                    <div className="stat-number">95%</div>
                    <div className="stat-label">Fulfillment Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <style jsx>{`
        .modern-home-page {
          min-height: 100vh;
        }
        
        .main-content {
          padding: 80px 0;
        }
        
        .section {
          margin-bottom: 120px;
        }
        
        .section-header {
          text-align: center;
          margin-bottom: 60px;
        }
        
        .section-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1a202c;
          margin: 0 0 16px 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .section-subtitle {
          font-size: 1.2rem;
          color: #6b7280;
          margin: 0;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }
        
        .cta-section {
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
          border-radius: 24px;
          padding: 80px 60px;
          margin: 120px 0;
        }
        
        .cta-container {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 60px;
          align-items: center;
        }
        
        .cta-title {
          font-size: 2.25rem;
          font-weight: 800;
          color: #1a202c;
          margin: 0 0 20px 0;
          line-height: 1.3;
        }
        
        .cta-description {
          font-size: 1.1rem;
          color: #4a5568;
          margin: 0 0 40px 0;
          line-height: 1.6;
        }
        
        .cta-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        
        .cta-visual {
          display: flex;
          justify-content: center;
        }
        
        .cta-stats {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .cta-stat {
          text-align: center;
          padding: 32px 24px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .cta-stat .stat-number {
          font-size: 2.5rem;
          font-weight: 800;
          color: #667eea;
          margin-bottom: 8px;
        }
        
        .cta-stat .stat-label {
          font-size: 1rem;
          color: #6b7280;
          font-weight: 500;
        }
        
        /* Responsive Design */
        @media (max-width: 1024px) {
          .cta-section {
            padding: 60px 40px;
          }
          
          .cta-container {
            grid-template-columns: 1fr;
            gap: 40px;
            text-align: center;
          }
        }
        
        @media (max-width: 768px) {
          .main-content {
            padding: 60px 0;
          }
          
          .section {
            margin-bottom: 80px;
          }
          
          .section-header {
            margin-bottom: 40px;
          }
          
          .section-title {
            font-size: 2rem;
          }
          
          .section-subtitle {
            font-size: 1.1rem;
          }
          
          .cta-section {
            padding: 40px 20px;
            margin: 80px 0;
          }
          
          .cta-title {
            font-size: 1.75rem;
          }
          
          .cta-actions {
            justify-content: center;
          }
          
          .cta-stats {
            flex-direction: row;
            gap: 16px;
          }
          
          .cta-stat {
            padding: 24px 16px;
          }
          
          .cta-stat .stat-number {
            font-size: 2rem;
          }
        }
        
        @media (max-width: 480px) {
          .cta-actions {
            flex-direction: column;
            align-items: center;
          }
          
          .btn-lg {
            width: 100%;
            max-width: 280px;
          }
          
          .cta-stats {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

