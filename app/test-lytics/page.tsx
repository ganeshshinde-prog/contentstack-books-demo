'use client';

import React, { useState, useEffect } from 'react';
import LyticsPersonalization, { UserProfile } from '../../lib/lytics-personalization';

export default function TestLyticsPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [audienceTest, setAudienceTest] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const profile = await LyticsPersonalization.getUserProfile();
      setUserProfile(profile);
      console.log('👤 Current User Profile:', profile);
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const testAudienceAPI = async () => {
    setLoading(true);
    try {
      const behaviorData = localStorage.getItem('user-behavior');
      const behavior = behaviorData ? JSON.parse(behaviorData) : {};

      const response = await fetch('/api/lytics-audience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_behavior: behavior,
          session_data: {
            session_duration: Date.now() - new Date(behavior.lastVisit || Date.now()).getTime(),
            current_page: '/test-lytics'
          },
          engagement_metrics: {
            pages_viewed: behavior.viewedBooks?.length || 0,
            interactions: Object.keys(behavior.clickPatterns || {}).length
          }
        })
      });

      const result = await response.json();
      setAudienceTest(result);
      console.log('🎯 Audience Test Result:', result);
    } catch (error) {
      console.error('❌ Error testing audience API:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateEngagement = (level: 'first_time' | 'repeat' | 'deeply_engaged') => {
    const behavior: {
      viewedBooks: string[];
      searchHistory: string[];
      purchaseHistory: string[];
      timeOnPage: Record<string, number>;
      clickPatterns: Record<string, number>;
      sessionCount: number;
      lastVisit: Date;
    } = {
      viewedBooks: [],
      searchHistory: [],
      purchaseHistory: [],
      timeOnPage: {},
      clickPatterns: {},
      sessionCount: 0,
      lastVisit: new Date()
    };

    switch (level) {
      case 'deeply_engaged':
        behavior.viewedBooks = Array.from({length: 15}, (_, i) => `book_${i}`);
        behavior.sessionCount = 5;
        behavior.clickPatterns = {
          personalized_recommendation: 8,
          book_detail_view: 15,
          add_to_cart: 3,
          search: 5
        };
        break;
      case 'repeat':
        behavior.viewedBooks = Array.from({length: 6}, (_, i) => `book_${i}`);
        behavior.sessionCount = 3;
        behavior.clickPatterns = {
          personalized_recommendation: 3,
          book_detail_view: 6,
          add_to_cart: 1
        };
        break;
      case 'first_time':
        behavior.viewedBooks = ['book_1'];
        behavior.sessionCount = 1;
        behavior.clickPatterns = {
          book_detail_view: 1
        };
        break;
    }

    localStorage.setItem('user-behavior', JSON.stringify(behavior));
    loadUserProfile();
  };

  return (
    <div className="test-lytics-page">
      <div className="container">
        <h1>🎯 Lytics Personalization Test</h1>
        <p>Test and debug the Lytics-based audience detection and personalization system.</p>

        <div className="test-sections">
          {/* Current User Profile */}
          <section className="test-section">
            <h2>👤 Current User Profile</h2>
            {loading ? (
              <div className="loading">Loading user profile...</div>
            ) : userProfile ? (
              <div className="profile-display">
                <div className="profile-item">
                  <strong>Engagement Level:</strong> 
                  <span className={`engagement-badge ${userProfile.engagement_level}`}>
                    {userProfile.engagement_level.replace('_', ' ')}
                  </span>
                </div>
                <div className="profile-item">
                  <strong>Visit Count:</strong> {userProfile.visit_count}
                </div>
                <div className="profile-item">
                  <strong>Pages Viewed:</strong> {userProfile.pages_viewed}
                </div>
                <div className="profile-item">
                  <strong>Audiences:</strong>
                  <div className="audiences-list">
                    {userProfile.audiences.map((audience, index) => (
                      <div key={index} className="audience-item">
                        <span className="audience-name">{audience.name}</span>
                        <span className="audience-confidence">
                          {Math.round((audience.confidence || 0) * 100)}% confidence
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-profile">No user profile available</div>
            )}
            <button onClick={loadUserProfile} disabled={loading}>
              🔄 Refresh Profile
            </button>
          </section>

          {/* Engagement Simulation */}
          <section className="test-section">
            <h2>🎭 Simulate User Engagement</h2>
            <p>Simulate different user engagement levels to test audience detection:</p>
            <div className="simulation-buttons">
              <button 
                onClick={() => simulateEngagement('first_time')}
                className="sim-btn first-time"
              >
                👋 First-time Visitor
                <small>1 book viewed, 1 session</small>
              </button>
              <button 
                onClick={() => simulateEngagement('repeat')}
                className="sim-btn repeat"
              >
                🔄 Repeat Visitor
                <small>6 books viewed, 3 sessions</small>
              </button>
              <button 
                onClick={() => simulateEngagement('deeply_engaged')}
                className="sim-btn deeply-engaged"
              >
                🎯 Deeply Engaged User
                <small>15 books viewed, 5 sessions</small>
              </button>
            </div>
          </section>

          {/* API Test */}
          <section className="test-section">
            <h2>🔍 Test Audience Detection API</h2>
            <button onClick={testAudienceAPI} disabled={loading}>
              🧪 Test Audience API
            </button>
            {audienceTest && (
              <div className="api-result">
                <h3>API Response:</h3>
                <pre>{JSON.stringify(audienceTest, null, 2)}</pre>
              </div>
            )}
          </section>

          {/* Instructions */}
          <section className="test-section">
            <h2>📋 How to Test Personalization</h2>
            <ol className="instructions">
              <li>
                <strong>Simulate different engagement levels</strong> using the buttons above
              </li>
              <li>
                <strong>Visit the <a href="/books">/books page</a></strong> to see personalized recommendations
              </li>
              <li>
                <strong>Check the console logs</strong> for detailed personalization information
              </li>
              <li>
                <strong>Look for the "Recommended Books" section</strong> with audience-specific content
              </li>
              <li>
                <strong>Notice different book genres and strategies</strong> for each audience type:
                <ul>
                  <li><strong>First-time Visitors:</strong> Fantasy, Adventure, Popular Fiction</li>
                  <li><strong>Repeat Visitors:</strong> Mystery, Thriller, Romance, Fiction</li>
                  <li><strong>Deeply Engaged Users:</strong> War, Biography, History, Science</li>
                </ul>
              </li>
            </ol>
          </section>
        </div>
      </div>

      <style jsx>{`
        .test-lytics-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .container h1 {
          color: #1a202c;
          margin-bottom: 0.5rem;
        }

        .container > p {
          color: #4a5568;
          margin-bottom: 2rem;
        }

        .test-sections {
          display: grid;
          gap: 2rem;
        }

        .test-section {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .test-section h2 {
          color: #2d3748;
          margin-bottom: 1rem;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 0.5rem;
        }

        .loading {
          color: #4a5568;
          font-style: italic;
        }

        .profile-display {
          display: grid;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .profile-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .engagement-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .engagement-badge.first_time {
          background: #fed7d7;
          color: #c53030;
        }

        .engagement-badge.repeat {
          background: #bee3f8;
          color: #2b6cb0;
        }

        .engagement-badge.deeply_engaged {
          background: #c6f6d5;
          color: #2f855a;
        }

        .audiences-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .audience-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f7fafc;
          padding: 0.5rem;
          border-radius: 4px;
        }

        .audience-confidence {
          font-size: 0.875rem;
          color: #4a5568;
        }

        .simulation-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .sim-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem;
          border: 2px solid;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .sim-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .sim-btn.first-time {
          border-color: #f56565;
          color: #c53030;
        }

        .sim-btn.repeat {
          border-color: #4299e1;
          color: #2b6cb0;
        }

        .sim-btn.deeply-engaged {
          border-color: #48bb78;
          color: #2f855a;
        }

        .sim-btn small {
          margin-top: 0.5rem;
          font-size: 0.75rem;
          opacity: 0.8;
        }

        .api-result {
          margin-top: 1rem;
          background: #f7fafc;
          padding: 1rem;
          border-radius: 4px;
          border-left: 4px solid #4299e1;
        }

        .api-result pre {
          background: #1a202c;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 0.875rem;
        }

        .instructions {
          color: #4a5568;
          line-height: 1.6;
        }

        .instructions li {
          margin-bottom: 0.5rem;
        }

        .instructions ul {
          margin-top: 0.5rem;
        }

        .instructions a {
          color: #4299e1;
          text-decoration: underline;
        }

        button {
          background: #4299e1;
          color: white;
          border: none;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.2s;
        }

        button:hover:not(:disabled) {
          background: #3182ce;
        }

        button:disabled {
          background: #a0aec0;
          cursor: not-allowed;
        }

        .no-profile {
          color: #a0aec0;
          font-style: italic;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}
