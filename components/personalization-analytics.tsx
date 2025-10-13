'use client';

import React, { useState, useEffect } from 'react';
import { usePersonalization } from '../contexts/personalization-context';

interface AnalyticsData {
  segmentTransitions: Array<{
    from: string;
    to: string;
    timestamp: string;
    trigger: string;
  }>;
  eventCounts: Record<string, number>;
  genreEngagement: Record<string, number>;
  conversionFunnel: {
    views: number;
    cartAdds: number;
    purchases: number;
  };
}

export default function PersonalizationAnalytics() {
  const { userSegment, userBehavior, userPreferences } = usePersonalization();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    segmentTransitions: [],
    eventCounts: {},
    genreEngagement: {},
    conversionFunnel: { views: 0, cartAdds: 0, purchases: 0 }
  });
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    // Update analytics data based on user behavior
    const newAnalytics: AnalyticsData = {
      segmentTransitions: [], // Would be populated from localStorage or API
      eventCounts: {
        book_views: userBehavior.viewedBooks.length,
        searches: userBehavior.searchHistory.length,
        purchases: userBehavior.purchaseHistory.length,
        sessions: userBehavior.sessionCount,
      },
      genreEngagement: userPreferences.favoriteGenres.reduce((acc, genre) => {
        acc[genre] = (acc[genre] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      conversionFunnel: {
        views: userBehavior.viewedBooks.length,
        cartAdds: 0, // Would be tracked separately
        purchases: userBehavior.purchaseHistory.length,
      }
    };

    setAnalyticsData(newAnalytics);
  }, [userBehavior, userPreferences]);

  if (!showAnalytics) {
    return (
      <div style={{ 
        position: 'fixed', 
        bottom: '80px', 
        right: '20px', 
        zIndex: 1000,
        backgroundColor: '#28a745',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }} onClick={() => setShowAnalytics(true)}>
        📊 Analytics
      </div>
    );
  }

  const conversionRate = analyticsData.conversionFunnel.views > 0 
    ? (analyticsData.conversionFunnel.purchases / analyticsData.conversionFunnel.views * 100).toFixed(1)
    : '0';

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '80px', 
      right: '20px', 
      zIndex: 1000,
      backgroundColor: 'white',
      border: '2px solid #28a745',
      borderRadius: '10px',
      padding: '15px',
      maxWidth: '350px',
      fontSize: '11px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      maxHeight: '350px',
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: '#28a745', fontSize: '14px' }}>📊 Personalization Analytics</h3>
        <button onClick={() => setShowAnalytics(false)} style={{ background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer' }}>❌</button>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>🎯 Current Segment:</strong> 
        <span style={{ 
          backgroundColor: '#007bff',
          color: 'white',
          padding: '1px 5px',
          borderRadius: '8px',
          marginLeft: '5px',
          fontSize: '10px'
        }}>
          {userSegment}
        </span>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>📈 Event Counts:</strong>
        <div style={{ marginTop: '3px', fontSize: '10px' }}>
          {Object.entries(analyticsData.eventCounts).map(([event, count]) => (
            <div key={event} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{event.replace('_', ' ')}:</span>
              <span style={{ fontWeight: 'bold' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>📚 Genre Engagement:</strong>
        <div style={{ marginTop: '3px', fontSize: '10px' }}>
          {Object.entries(analyticsData.genreEngagement).map(([genre, count]) => (
            <div key={genre} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{genre}:</span>
              <span style={{ 
                backgroundColor: genre === 'War' ? '#dc3545' : '#17a2b8',
                color: 'white',
                padding: '1px 4px',
                borderRadius: '6px',
                fontSize: '9px'
              }}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>🎯 Conversion Funnel:</strong>
        <div style={{ marginTop: '3px', fontSize: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Views:</span>
            <span>{analyticsData.conversionFunnel.views}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Cart Adds:</span>
            <span>{analyticsData.conversionFunnel.cartAdds}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Purchases:</span>
            <span>{analyticsData.conversionFunnel.purchases}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px', paddingTop: '3px', borderTop: '1px solid #eee' }}>
            <span>Conversion Rate:</span>
            <span style={{ fontWeight: 'bold', color: '#28a745' }}>{conversionRate}%</span>
          </div>
        </div>
      </div>
      
      <div style={{ fontSize: '9px', color: '#6c757d', marginTop: '8px', borderTop: '1px solid #eee', paddingTop: '8px' }}>
        💡 Based on contentstack-onkar-demo patterns
      </div>
    </div>
  );
}
