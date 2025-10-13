'use client';

import RenderComponents from "@/components/render-components";
import { onEntryChange } from "@/contentstack-sdk";
import { getPageRes, metaData } from "@/helper";
import { Page } from "@/typescript/pages";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";

// Import new attractive components inspired by Goodreads
import BookDiscoveryHero from "@/components/book-discovery-hero";
import FeaturedBooks from "@/components/featured-books";
import GenreCategories from "@/components/genre-categories";
import ReadingQuotes from "@/components/reading-quotes";
import ReadingStats from "@/components/reading-stats";
import RequestNewBook from "@/components/request-new-book";
import PersonalizedRecommendations from "@/components/personalized-recommendations";
import PersonalizationAnalytics from "@/components/personalization-analytics";
import { usePersonalization } from "@/contexts/personalization-context";

// Debug component to show personalization state
function PersonalizationDebug() {
  const { userSegment, userPreferences, userBehavior, isPersonalized } = usePersonalization();
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    // Show debug info in console on page load
    console.group(`🏠 HOME PAGE - Personalization State`);
    console.log(`👤 User Segment:`, userSegment);
    console.log(`📚 Favorite Genres:`, userPreferences.favoriteGenres);
    console.log(`📖 Viewed Books:`, userBehavior.viewedBooks);
    console.log(`🛒 Purchase History:`, userBehavior.purchaseHistory);
    console.log(`🎯 Is Personalized:`, isPersonalized);
    console.log(`💰 Price Range:`, userPreferences.priceRange);
    console.log(`📊 Reading Level:`, userPreferences.readingLevel);
    console.groupEnd();
  }, [userSegment, userPreferences, userBehavior, isPersonalized]);

  const clearPersonalizationData = () => {
    console.log('🗑️ CLEARING PERSONALIZATION DATA');
    localStorage.removeItem('user-preferences');
    localStorage.removeItem('user-behavior');
    localStorage.removeItem('personalize_session_id');
    window.location.reload();
  };

  if (!showDebug) {
    return (
      <div style={{ 
        position: 'fixed', 
        bottom: '20px', 
        right: '20px', 
        zIndex: 1000,
        display: 'flex',
        gap: '10px'
      }}>
        <div
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}
          onClick={() => setShowDebug(true)}
        >
          🎯 Debug
        </div>
        <div
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}
          onClick={clearPersonalizationData}
        >
          🗑️ Reset
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      zIndex: 1000,
      backgroundColor: 'white',
      border: '2px solid #007bff',
      borderRadius: '10px',
      padding: '20px',
      maxWidth: '400px',
      fontSize: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      maxHeight: '400px',
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, color: '#007bff' }}>🎯 Personalization Debug</h3>
        <button onClick={() => setShowDebug(false)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}>❌</button>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>👤 User Segment:</strong> 
        <span style={{ 
          backgroundColor: 
            userSegment === 'war_enthusiast' ? '#dc3545' : 
            userSegment === 'genre_enthusiast' ? '#28a745' : 
            userSegment === 'high_value_customer' ? '#6f42c1' :
            userSegment === 'at_risk_customer' ? '#fd7e14' : '#6c757d',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '12px',
          marginLeft: '8px',
          fontSize: '11px'
        }}>
          {userSegment}
        </span>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>📚 Favorite Genres:</strong>
        <div style={{ marginTop: '5px' }}>
          {userPreferences.favoriteGenres.length > 0 ? (
            userPreferences.favoriteGenres.map(genre => (
              <span key={genre} style={{ 
                backgroundColor: genre === 'War' ? '#dc3545' : '#17a2b8',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '10px',
                marginRight: '5px',
                fontSize: '10px'
              }}>
                {genre}
              </span>
            ))
          ) : (
            <span style={{ color: '#6c757d', fontStyle: 'italic' }}>None yet</span>
          )}
        </div>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>📖 Books Viewed:</strong> {userBehavior.viewedBooks.length}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>🛒 Purchases:</strong> {userBehavior.purchaseHistory.length}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>🎯 Personalized:</strong> 
        <span style={{ color: isPersonalized ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
          {isPersonalized ? 'Yes' : 'No'}
        </span>
      </div>
      
      <div style={{ fontSize: '10px', color: '#6c757d', marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
        💡 View a War book to see personalization in action!
      </div>
    </div>
  );
}

export default function Home() {
  const entryUrl = usePathname();

  const [getEntry, setEntry] = useState<Page>();

  async function fetchData() {
    try {
      // Use "/home" for the homepage instead of the root URL
      const pageUrl = entryUrl === '/' ? '/home' : entryUrl;
      const entryRes = await getPageRes(pageUrl);
      if (!entryRes) throw new Error('Status code 404');
      setEntry(entryRes);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    onEntryChange(() => fetchData());
  }, []);

  return (
    <>
      {/* SEO Meta Tags */}
      {getEntry?.seo && getEntry.seo.enable_search_indexing && metaData(getEntry.seo)}
      
      {/* Hero Section - Inspired by Goodreads landing */}
      <BookDiscoveryHero />
      
      {/* Featured Books Section */}
      <FeaturedBooks />
      
      {/* Reading Quote Section */}
      <ReadingQuotes />
      
      {/* Genre Categories - Similar to Goodreads genre browsing */}
      <GenreCategories />
      
      {/* Reading Stats/Benefits */}
      <ReadingStats />
      
      {/* Request New Book Section */}
      <RequestNewBook />
      
      {/* Debug Component */}
      <PersonalizationDebug />
      
      {/* Analytics Component */}
      <PersonalizationAnalytics />
      
      {/* CMS Content (if any) */}
      {getEntry ? (
        <RenderComponents
          pageComponents={getEntry.page_components}
          contentTypeUid='page'
          entryUid={getEntry.uid}
          locale={getEntry.locale}
        />
      ) : (
        <div style={{ display: 'none' }}>
          <Skeleton count={3} height={300} />
        </div>
      )}
    </>
  );
}
