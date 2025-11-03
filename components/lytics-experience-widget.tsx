'use client';

import React, { useEffect, useState } from 'react';
import lyticsPersonalization from '../lib/lytics-personalization-service';

// Extend Window interface for Pathfora
declare global {
  interface Window {
    pathfora?: any;
    jstag?: any;
  }
}

interface LyticsExperienceWidgetProps {
  experienceId?: string; // Your specific Lytics experience ID
  books: any[];
  targetPath?: string; // Only show on specific paths
}

export default function LyticsExperienceWidget({ 
  experienceId, 
  books,
  targetPath = '/books'
}: LyticsExperienceWidgetProps) {
  const [isReady, setIsReady] = useState(false);
  const [experienceLoaded, setExperienceLoaded] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [refreshCounter, setRefreshCounter] = useState(0); // Used to force re-renders
  const [currentGenre, setCurrentGenre] = useState<string | null>(null);

  useEffect(() => {
    // Get current path
    setCurrentPath(window.location.pathname);
    
    // Only show if we're on the target path
    if (targetPath && window.location.pathname !== targetPath) {
      console.log(`🚫 Skipping recommendations - not on target path ${targetPath}`);
      return;
    }

    // Simple setup - no complex Pathfora initialization needed
    setIsReady(true);
    console.log('📚 Curated recommendations ready');
    
    // Wait for Lytics to be ready, then get initial genre
    console.log('🔄 Waiting for Lytics to initialize...');
    lyticsPersonalization.waitUntilReady(5000).then((ready) => {
      if (ready) {
        console.log('✅ Lytics ready - checking genre from audiences');
        const initialGenre = getUserPreferredGenre();
        setCurrentGenre(initialGenre);
        console.log(`🎯 Initial genre set to: ${initialGenre || 'none'} (from Lytics)`);
      } else {
        console.log('⚠️ Lytics not ready - using localStorage fallback');
        const initialGenre = getUserPreferredGenre();
        setCurrentGenre(initialGenre);
        console.log(`🎯 Initial genre set to: ${initialGenre || 'none'} (from localStorage)`);
      }
    });

    // Listen for genre book interactions to refresh recommendations
    const handleGenreBookInteraction = (event: CustomEvent) => {
      const { genre, bookId, title } = event.detail;
      console.log(`🎯 ${genre} book interaction detected - refreshing recommendations`);
      console.log(`📖 Book: ${title} (${bookId})`);
      
      // Refresh Lytics data to get updated audiences
      setTimeout(async () => {
        console.log('🔄 Refreshing Lytics audience data...');
        
        try {
          // Wait a bit for Lytics to process the event
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Refresh Lytics user data
          await lyticsPersonalization.refresh();
          console.log('✅ Lytics data refreshed');
          
          // Trigger UI update
          console.log('🔄 Triggering recommendation refresh...');
          setRefreshCounter(prev => prev + 1);
        } catch (error) {
          console.error('❌ Error refreshing Lytics:', error);
          // Still trigger refresh with localStorage fallback
          setRefreshCounter(prev => prev + 1);
        }
      }, 600);
    };

    // Listen for personalized recommendations refresh events
    const handlePersonalizationRefresh = (event: CustomEvent) => {
      console.log('🔄 Personalization refresh requested:', event.detail);
      setTimeout(() => {
        console.log('🔄 Triggering recommendation refresh...');
        setRefreshCounter(prev => prev + 1);
      }, 300);
    };

    // Listen for storage changes (when user clicks on books) - Note: only works across tabs
    const handleStorageChange = () => {
      console.log('🔄 Storage event detected (from another tab)');
      setTimeout(() => {
        console.log('🔄 Triggering recommendation refresh...');
        setRefreshCounter(prev => prev + 1);
      }, 500);
    };
    
    // Check for visibility changes to refresh recommendations when returning to tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Tab became visible - checking for updates');
        setTimeout(() => {
          setRefreshCounter(prev => prev + 1);
        }, 200);
      }
    };
    
    // Handle browser back/forward navigation
    const handlePopState = () => {
      console.log('🔙 Browser navigation detected (back/forward)');
      if (window.location.pathname === targetPath) {
        console.log('✅ Returned to /books - refreshing recommendations');
        setTimeout(() => {
          setRefreshCounter(prev => prev + 1);
        }, 300);
      }
    };
    
    // Handle page focus (when returning from another page/tab)
    const handleFocus = () => {
      console.log('🎯 Window focused - checking for updates');
      setTimeout(() => {
        setRefreshCounter(prev => prev + 1);
      }, 200);
    };

    // Add event listeners
    window.addEventListener('genreBookClicked', handleGenreBookInteraction as EventListener);
    window.addEventListener('warBookClicked', handleGenreBookInteraction as EventListener);
    window.addEventListener('personalizedRecommendationsRefresh', handlePersonalizationRefresh as EventListener);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('genreBookClicked', handleGenreBookInteraction as EventListener);
      window.removeEventListener('warBookClicked', handleGenreBookInteraction as EventListener);
      window.removeEventListener('personalizedRecommendationsRefresh', handlePersonalizationRefresh as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [books, targetPath]);

  // Monitor localStorage changes and update current genre when refreshCounter changes
  useEffect(() => {
    if (refreshCounter > 0) { // Skip initial mount (counter is 0)
      console.log(`🔄 Refresh triggered (counter: ${refreshCounter})`);
      const preferredGenre = getUserPreferredGenre();
      
      if (preferredGenre !== currentGenre) {
        console.log(`🎯 Genre changed: ${currentGenre || 'none'} → ${preferredGenre || 'none'}`);
        setCurrentGenre(preferredGenre);
      } else {
        console.log(`✅ Genre unchanged: ${currentGenre || 'none'}`);
      }
    }
  }, [refreshCounter, currentGenre]); // Runs every time refreshCounter changes

  // Simplified - no complex initialization needed
  const getBooksWithImages = () => {
    return books.filter((book: any) => book.featured_image?.url || book.bookimage?.url);
  };

  // Experience ID mapping for different genres
  const GENRE_EXPERIENCES: Record<string, string> = {
    'War': 'fec91f970b8cb82cf5abc068e16d835e',
    'Biography': '652d4a3cf9c73893d97116846dad16bb',
    // Add more genres and their experience IDs as needed
  };

  // Get user's preferred genre from Lytics audiences (with localStorage fallback)
  const getUserPreferredGenre = (): string | null => {
    try {
      if (typeof window === 'undefined') return null;
      
      console.group('🔍 Getting User Genre Preference');
      console.log('🎯 Source: Lytics Audiences');
      
      // PRIMARY: Try Lytics first
      if (lyticsPersonalization.isServiceReady()) {
        const lyticsGenre = lyticsPersonalization.getPreferredGenreFromAudiences();
        
        if (lyticsGenre) {
          console.log(`✅ Lytics says: ${lyticsGenre}`);
          const audiences = lyticsPersonalization.getUserAudiences();
          console.log(`📊 Based on audiences:`, audiences.map(a => a.name));
          console.groupEnd();
          return lyticsGenre;
        } else {
          console.log('⚠️ Lytics has no genre preference yet');
        }
      } else {
        console.log('⏳ Lytics not ready yet, checking localStorage fallback...');
      }
      
      // FALLBACK: Use localStorage if Lytics doesn't have data
      console.log('📦 Falling back to localStorage...');
      const behaviorData = localStorage.getItem('user-behavior');
      const preferencesData = localStorage.getItem('user-preferences');
      
      console.log('📊 localStorage behavior:', behaviorData ? 'exists' : 'not found');
      console.log('📊 localStorage preferences:', preferencesData ? 'exists' : 'not found');
      
      // Check viewed genres from behavior
      if (behaviorData) {
        try {
          const behavior = JSON.parse(behaviorData);
          const viewedGenres = Array.isArray(behavior.viewedGenres) ? behavior.viewedGenres : [];
          console.log('👀 localStorage genres:', viewedGenres);
          
          // Return the most recently viewed genre
          for (let i = viewedGenres.length - 1; i >= 0; i--) {
            const genre = viewedGenres[i];
            if (GENRE_EXPERIENCES[genre]) {
              console.log(`✅ localStorage says: ${genre}`);
              console.groupEnd();
              return genre;
            }
          }
        } catch (parseError) {
          console.error('❌ Error parsing localStorage:', parseError);
        }
      }
      
      // Check favorite genres from preferences
      if (preferencesData) {
        try {
          const preferences = JSON.parse(preferencesData);
          const favoriteGenres = Array.isArray(preferences.favoriteGenres) ? preferences.favoriteGenres : [];
          
          for (const genre of favoriteGenres) {
            if (GENRE_EXPERIENCES[genre]) {
              console.log(`✅ localStorage preferences say: ${genre}`);
              console.groupEnd();
              return genre;
            }
          }
        } catch (parseError) {
          console.error('❌ Error parsing preferences:', parseError);
        }
      }
      
      console.log('❌ No genre found in Lytics or localStorage');
      console.groupEnd();
      return null;
    } catch (error) {
      console.error('❌ Error getting preferred genre:', error);
      console.groupEnd();
      return null;
    }
  };

  // Check if user has interacted with any specific genre
  const checkUserGenreInteraction = (genre: string): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      
      const behaviorData = localStorage.getItem('user-behavior');
      const preferencesData = localStorage.getItem('user-preferences');
      
      if (behaviorData) {
        const behavior = JSON.parse(behaviorData);
        const viewedGenres = behavior.viewedGenres || [];
        if (viewedGenres.includes(genre)) {
          return true;
        }
      }
      
      if (preferencesData) {
        const preferences = JSON.parse(preferencesData);
        const favoriteGenres = preferences.favoriteGenres || [];
        if (favoriteGenres.includes(genre)) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error(`Error checking ${genre} book interaction:`, error);
      return false;
    }
  };

  // Get curated books with preference for user's preferred genre
  const getCuratedBooks = () => {
    console.group('📚 Getting Curated Books');
    const booksWithImages = books.filter((book: any) => book.featured_image?.url || book.bookimage?.url);
    console.log(`📖 Total books with images: ${booksWithImages.length}`);
    console.log(`🎯 Current genre state: ${currentGenre || 'none'}`);
    
    // Use currentGenre state instead of calling getUserPreferredGenre()
    if (currentGenre) {
      const hasInteraction = checkUserGenreInteraction(currentGenre);
      console.log(`👆 Has ${currentGenre} interaction: ${hasInteraction}`);
      
      if (hasInteraction) {
        console.log(`📚 Prioritizing ${currentGenre} books for recommendations`);
        
        // Prioritize books of the preferred genre
        const preferredGenreBooks = booksWithImages.filter((book: any) => book.book_type === currentGenre);
        const otherBooks = booksWithImages.filter((book: any) => book.book_type !== currentGenre);
        
        console.log(`✅ Found ${preferredGenreBooks.length} ${currentGenre} books`);
        console.log(`📚 Found ${otherBooks.length} other books`);
        
        const result = [...preferredGenreBooks, ...otherBooks].slice(0, 4);
        console.log(`🎁 Returning ${result.length} books:`, result.map(b => `${b.title} (${b.book_type})`));
        console.groupEnd();
        return result;
      }
    }
    
    // Otherwise show first 4 books with images
    console.log('📚 No specific genre preference, showing default recommendations');
    const result = booksWithImages.slice(0, 4);
    console.log(`🎁 Returning ${result.length} default books:`, result.map(b => `${b.title} (${b.book_type})`));
    console.groupEnd();
    return result;
  };

  // Get the current active experience ID based on user's preferred genre
  const getCurrentExperienceId = (): string => {
    // Use currentGenre state
    if (currentGenre && GENRE_EXPERIENCES[currentGenre]) {
      console.log(`🎯 Using ${currentGenre} experience: ${GENRE_EXPERIENCES[currentGenre]}`);
      return GENRE_EXPERIENCES[currentGenre];
    }
    
    // Default to War experience if no preference
    console.log('🎯 Using default War experience');
    return GENRE_EXPERIENCES['War'];
  };

  // Get display text for the current genre focus
  const getGenreDisplayInfo = () => {
    // Check if using Lytics or localStorage
    const isUsingLytics = lyticsPersonalization.isServiceReady() && 
                          lyticsPersonalization.getUserAudiences().length > 0;
    
    // Use currentGenre state
    if (currentGenre && checkUserGenreInteraction(currentGenre)) {
      const genreEmojis: Record<string, string> = {
        'War': '⚔️',
        'Biography': '👤',
        'Mystery': '🔍',
        'Fantasy': '🧙‍♂️',
        'Romance': '💕',
        'Science': '🔬',
        'History': '📜',
        'Thrillers': '🎭'
      };
      
      return {
        status: `${genreEmojis[currentGenre] || '📚'} ${currentGenre} Books Focus`,
        subtitle: isUsingLytics 
          ? `Powered by Lytics Audiences` 
          : `${currentGenre} Books Experience Active`,
        title: `📚 ${currentGenre} Recommendations`
      };
    }
    
    return {
      status: isUsingLytics ? '✅ Lytics Personalization' : '✅ Personalized',
      subtitle: isUsingLytics ? 'Real-time Audience Tracking' : 'Powered by Lytics',
      title: '📚 Curated Recommendations'
    };
  };

  // Only render if we're on the target path and have books
  if (targetPath && currentPath !== targetPath) {
    return null;
  }

  if (!books || books.length === 0) {
    return null;
  }

  return (
    <section className="lytics-experience-section">
      <div className="container">
        <div className="experience-header">
          <h2>📚 Recommended Books</h2>
          <div className="experience-status">
            <span className={`status-indicator ${isReady ? 'ready' : 'loading'}`}>
              {isReady ? getGenreDisplayInfo().status : '⏳ Loading...'}
            </span>
            <span className="experience-subtitle">
              {getGenreDisplayInfo().subtitle}
            </span>
          </div>
        </div>

        {/* Curated Recommendations - Only books with images */}
        <div className="curated-recommendations">
          <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#666', fontSize: '1rem', fontWeight: '500' }}>
            {getGenreDisplayInfo().title}
          </p>
          <div className="books-grid-curated">
            {getCuratedBooks().map((book: any) => (
                <div key={book.uid} className="book-card-curated" onClick={() => window.location.href = `/books/${book.uid}`}>
                  <img 
                    src={book.featured_image?.url || book.bookimage?.url} 
                    alt={book.title}
                    className="book-image-curated"
                  />
                  <h4 className="book-title-curated">{book.title}</h4>
                  <p className="book-author-curated">by {book.author}</p>
                  <p className="book-price-curated">₹{book.price}</p>
                  <span className="book-genre-curated">{book.book_type}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .lytics-experience-section {
          margin: 2rem 0;
          padding: 2rem 0;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 16px;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        .experience-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .experience-header h2 {
          font-size: 1.8rem;
          font-weight: bold;
          color: #1a202c;
          margin: 0;
        }
        
        .experience-status {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        
        .status-indicator {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .status-indicator.ready {
          background: #d1fae5;
          color: #065f46;
        }
        
        .status-indicator.loading {
          background: #fef3c7;
          color: #92400e;
        }
        
        .experience-subtitle {
          font-size: 0.75rem;
          color: #6b7280;
          background: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
        }
        
        .experience-container {
          min-height: 300px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: #6b7280;
        }
        
        .spinner {
          font-size: 2rem;
          margin-bottom: 1rem;
          animation: spin 2s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Override Pathfora styles */
        :global(.pf-widget-inline) {
          position: relative !important;
          width: 100% !important;
          border-radius: 12px !important;
          overflow: hidden !important;
        }

        .curated-recommendations {
          margin-top: 2rem;
          padding: 2rem;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .books-grid-curated {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          margin-top: 1rem;
        }

        .book-card-curated {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .book-card-curated:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border-color: #3b82f6;
        }

        .book-image-curated {
          width: 100%;
          max-width: 140px;
          height: 180px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 1rem;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }

        .book-title-curated {
          font-size: 1rem;
          font-weight: 700;
          margin: 0.75rem 0;
          color: #1f2937;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .book-author-curated {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0.5rem 0;
          font-style: italic;
        }

        .book-price-curated {
          font-size: 1.125rem;
          font-weight: 700;
          color: #059669;
          margin: 0.75rem 0;
        }

        .book-genre-curated {
          display: inline-block;
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          color: #1e40af;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>
    </section>
  );
}
