'use client';

import React, { useState, useEffect } from 'react';
import BookCard from './book-card';
import LyticsPersonalization, { UserProfile } from '../lib/lytics-personalization';
import LyticsAnalytics from '../lib/lytics-analytics';

interface PersonalizedRecommendationsProps {
  books: any[];
  maxRecommendations?: number;
}

interface RecommendationResult {
  books: any[];
  audience: string;
  strategy: string;
  confidence: number;
}

export default function PersonalizedRecommendationsLytics({ 
  books, 
  maxRecommendations = 8 
}: PersonalizedRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  console.log('🎯 PersonalizedRecommendationsLytics component rendered');
  console.log('📚 Books prop:', books.length, 'books');
  console.log('🔄 Loading state:', isLoading);
  
  // Always show this component for debugging
  if (books.length === 0) {
    return (
      <section className="personalized-recommendations-section">
        <div className="container">
          <h2 className="section-title">📚 Recommended Books</h2>
          <div className="no-recommendations">
            <p>🔍 Waiting for books to load...</p>
            <p>Books available: {books.length}</p>
            <p>Component is rendering correctly!</p>
          </div>
        </div>
      </section>
    );
  }

  useEffect(() => {
    console.log('🎯 useEffect triggered, books length:', books.length);
    if (books.length > 0) {
      loadPersonalizedRecommendations();
    } else {
      console.warn('⚠️ No books available, skipping personalization');
    }
  }, [books]);

  const loadPersonalizedRecommendations = async () => {
    try {
      setIsLoading(true);
      console.log('🎯 Loading Lytics-based personalized recommendations...');
      console.log('📚 Input books count:', books.length);
      console.log('📚 Sample books:', books.slice(0, 3));

      // Get user profile for display
      const profile = await LyticsPersonalization.getUserProfile();
      setUserProfile(profile);
      console.log('👤 User Profile loaded:', profile);

      // Get personalized recommendations
      const result = await LyticsPersonalization.getPersonalizedRecommendations(
        books, 
        maxRecommendations
      );
      
      console.log('🎯 Personalization result:', result);

      setRecommendations(result);
      
      // Track that recommendations were shown
      LyticsAnalytics.sendEvent('recommendations_displayed', {
        audience: result.audience,
        strategy: result.strategy,
        confidence: result.confidence,
        book_count: result.books.length
      });

      console.log('✅ Lytics personalized recommendations loaded:', result);
      
      // If no books in result, use fallback
      if (!result.books || result.books.length === 0) {
        console.warn('⚠️ No personalized books returned, using fallback');
        setRecommendations({
          books: books.slice(0, maxRecommendations),
          audience: result.audience || 'fallback',
          strategy: 'trending',
          confidence: 0.3
        });
      }
    } catch (error) {
      console.error('❌ Error loading personalized recommendations:', error);
      // Fallback to first few books
      setRecommendations({
        books: books.slice(0, maxRecommendations),
        audience: 'fallback',
        strategy: 'trending',
        confidence: 0.1
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookClick = (book: any) => {
    if (recommendations) {
      LyticsPersonalization.trackRecommendationInteraction(
        book.uid, 
        recommendations.audience, 
        'click'
      );
    }
  };

  const getAudienceDisplayInfo = () => {
    if (!userProfile || !recommendations) return null;

    const audienceInfo = {
      'Repeat Visitors': {
        icon: '🔄',
        description: 'Curated for returning readers',
        color: 'bg-blue-100 text-blue-800'
      },
      'Deeply Engaged Users': {
        icon: '🎯',
        description: 'Advanced selections for book enthusiasts',
        color: 'bg-purple-100 text-purple-800'
      },
      'First-time Visitors': {
        icon: '👋',
        description: 'Popular picks to get you started',
        color: 'bg-green-100 text-green-800'
      }
    };

    return audienceInfo[recommendations.audience as keyof typeof audienceInfo] || {
      icon: '📚',
      description: 'Personalized for you',
      color: 'bg-gray-100 text-gray-800'
    };
  };

  const audienceInfo = getAudienceDisplayInfo();

  if (isLoading) {
    return (
      <section className="personalized-recommendations-section">
        <div className="container">
          <h2 className="section-title">📚 Recommended Books</h2>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Personalizing your book recommendations...</p>
            <p style={{fontSize: '0.875rem', color: '#666', marginTop: '1rem'}}>
              Debug: {books.length} books available, Loading: {isLoading ? 'Yes' : 'No'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!recommendations || recommendations.books.length === 0) {
    return (
      <section className="personalized-recommendations-section">
        <div className="container">
          <h2 className="section-title">📚 Recommended Books</h2>
          <div className="no-recommendations">
            <p>🔍 No personalized recommendations available.</p>
            <p>Debug Info:</p>
            <ul>
              <li>Input books: {books.length}</li>
              <li>User Profile: {userProfile ? 'Loaded' : 'Not loaded'}</li>
              <li>Recommendations: {recommendations ? 'Loaded but empty' : 'Not loaded'}</li>
            </ul>
            <button onClick={loadPersonalizedRecommendations}>
              🔄 Retry Loading Recommendations
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="personalized-recommendations-section">
      <div className="container">
        <div className="recommendations-header">
          <h2 className="section-title">📚 Recommended Books</h2>
          
          {audienceInfo && (
            <div className="audience-badge-container">
              <div className={`audience-badge ${audienceInfo.color}`}>
                <span className="audience-icon">{audienceInfo.icon}</span>
                <div className="audience-info">
                  <span className="audience-name">{recommendations.audience}</span>
                  <span className="audience-description">{audienceInfo.description}</span>
                </div>
                <div className="confidence-indicator">
                  <span className="confidence-label">Match:</span>
                  <span className="confidence-value">
                    {Math.round(recommendations.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="personalization-details">
          <div className="strategy-info">
            <span className="strategy-label">Strategy:</span>
            <span className="strategy-value">{recommendations.strategy.replace('_', ' ')}</span>
          </div>
          
          {userProfile && (
            <div className="user-stats">
              <span className="stat-item">
                📖 {userProfile.pages_viewed || 0} books viewed
              </span>
              <span className="stat-item">
                🔄 Visit #{userProfile.visit_count || 1}
              </span>
              <span className="stat-item">
                🎯 {userProfile.engagement_level.replace('_', ' ')} user
              </span>
            </div>
          )}
        </div>

        <div className="books-grid">
          {recommendations.books.map((book, index) => (
            <div key={book.uid} className="recommendation-book-wrapper">
              <BookCard 
                book={book} 
                isNewArrival={false}
              />
              <div className="recommendation-score">
                Relevance: {Math.round((book.personalization_score || 0.5) * 100)}%
              </div>
            </div>
          ))}
        </div>

        <div className="recommendations-footer">
          <p className="personalization-note">
            💡 Recommendations are personalized based on your reading behavior and preferences from Lytics audience data.
          </p>
          <button 
            className="refresh-recommendations-btn"
            onClick={loadPersonalizedRecommendations}
          >
            🔄 Refresh Recommendations
          </button>
        </div>
      </div>

      <style jsx>{`
        .personalized-recommendations-section {
          padding: 2rem 0;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 12px;
          margin: 2rem 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .recommendations-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .section-title {
          font-size: 2rem;
          font-weight: bold;
          color: #1a202c;
          margin: 0;
        }

        .audience-badge-container {
          display: flex;
          align-items: center;
        }

        .audience-badge {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .audience-icon {
          font-size: 1.25rem;
        }

        .audience-info {
          display: flex;
          flex-direction: column;
        }

        .audience-name {
          font-weight: 600;
        }

        .audience-description {
          font-size: 0.75rem;
          opacity: 0.8;
        }

        .confidence-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-left: 0.5rem;
          padding-left: 0.5rem;
          border-left: 1px solid rgba(0,0,0,0.2);
        }

        .confidence-label {
          font-size: 0.7rem;
          opacity: 0.7;
        }

        .confidence-value {
          font-weight: 700;
          font-size: 0.875rem;
        }

        .personalization-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 8px;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .strategy-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .strategy-label {
          font-weight: 600;
          color: #4a5568;
        }

        .strategy-value {
          background: #edf2f7;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
          text-transform: capitalize;
        }

        .user-stats {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .stat-item {
          font-size: 0.875rem;
          color: #4a5568;
          background: rgba(255, 255, 255, 0.8);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .books-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .recommendation-book-wrapper {
          position: relative;
        }

        .recommendation-score {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          z-index: 10;
        }

        .recommendations-footer {
          text-align: center;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }

        .personalization-note {
          color: #4a5568;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          font-style: italic;
        }

        .refresh-recommendations-btn {
          background: #4299e1;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .refresh-recommendations-btn:hover {
          background: #3182ce;
        }

        .loading-container {
          text-align: center;
          padding: 3rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #4299e1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .recommendations-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .personalization-details {
            flex-direction: column;
            align-items: flex-start;
          }

          .books-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          }
        }

        .no-recommendations {
          text-align: center;
          padding: 2rem;
          background: #f7fafc;
          border-radius: 8px;
          border: 2px dashed #e2e8f0;
        }

        .no-recommendations ul {
          text-align: left;
          display: inline-block;
          margin: 1rem 0;
        }

        .no-recommendations li {
          margin: 0.5rem 0;
          color: #4a5568;
        }
      `}</style>
    </section>
  );
}
