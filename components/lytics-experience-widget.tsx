'use client';

import React, { useEffect, useState } from 'react';

// Extend Window interface for Pathfora
declare global {
  interface Window {
    pathfora?: any;
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

    // Listen for genre book interactions to refresh recommendations
    const handleGenreBookInteraction = (event: CustomEvent) => {
      const { genre, bookId, title } = event.detail;
      console.log(`🎯 ${genre} book interaction detected - refreshing recommendations`);
      console.log(`📖 Book: ${title} (${bookId})`);
      
      setTimeout(() => {
        // Force re-render by updating a state or triggering component update
        setIsReady(false);
        setTimeout(() => setIsReady(true), 100);
      }, 500); // Small delay to allow localStorage to update
    };

    // Listen for personalized recommendations refresh events
    const handlePersonalizationRefresh = (event: CustomEvent) => {
      console.log('🔄 Personalization refresh requested:', event.detail);
      setTimeout(() => {
        setIsReady(false);
        setTimeout(() => setIsReady(true), 200);
      }, 300);
    };

    // Listen for storage changes (when user clicks on books)
    const handleStorageChange = () => {
      console.log('🔄 Storage changed - checking for genre preference updates');
      setTimeout(() => {
        setIsReady(false);
        setTimeout(() => setIsReady(true), 100);
      }, 500);
    };

    // Add event listeners
    window.addEventListener('genreBookClicked', handleGenreBookInteraction as EventListener);
    window.addEventListener('warBookClicked', handleGenreBookInteraction as EventListener);
    window.addEventListener('personalizedRecommendationsRefresh', handlePersonalizationRefresh as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('genreBookClicked', handleGenreBookInteraction as EventListener);
      window.removeEventListener('warBookClicked', handleGenreBookInteraction as EventListener);
      window.removeEventListener('personalizedRecommendationsRefresh', handlePersonalizationRefresh as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [books, targetPath]);

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

  // Get user's preferred genre based on their interactions
  const getUserPreferredGenre = (): string | null => {
    try {
      if (typeof window === 'undefined') return null;
      
      const behaviorData = localStorage.getItem('user-behavior');
      const preferencesData = localStorage.getItem('user-preferences');
      
      // Check viewed genres from behavior
      if (behaviorData) {
        const behavior = JSON.parse(behaviorData);
        const viewedGenres = behavior.viewedGenres || [];
        
        // Return the most recently viewed genre that we have an experience for
        for (let i = viewedGenres.length - 1; i >= 0; i--) {
          const genre = viewedGenres[i];
          if (GENRE_EXPERIENCES[genre]) {
            console.log(`🎯 User recently viewed ${genre} books - using ${genre} experience`);
            return genre;
          }
        }
      }
      
      // Check favorite genres from preferences
      if (preferencesData) {
        const preferences = JSON.parse(preferencesData);
        const favoriteGenres = preferences.favoriteGenres || [];
        
        // Return the first favorite genre that we have an experience for
        for (const genre of favoriteGenres) {
          if (GENRE_EXPERIENCES[genre]) {
            console.log(`🎯 User has ${genre} in favorites - using ${genre} experience`);
            return genre;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user preferred genre:', error);
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
    const booksWithImages = books.filter((book: any) => book.featured_image?.url || book.bookimage?.url);
    
    const preferredGenre = getUserPreferredGenre();
    
    if (preferredGenre && checkUserGenreInteraction(preferredGenre)) {
      console.log(`📚 Prioritizing ${preferredGenre} books for recommendations`);
      
      // Prioritize books of the preferred genre
      const preferredGenreBooks = booksWithImages.filter((book: any) => book.book_type === preferredGenre);
      const otherBooks = booksWithImages.filter((book: any) => book.book_type !== preferredGenre);
      
      return [...preferredGenreBooks, ...otherBooks].slice(0, 4);
    }
    
    // Otherwise show first 4 books with images
    console.log('📚 No specific genre preference, showing default recommendations');
    return booksWithImages.slice(0, 4);
  };

  // Get the current active experience ID based on user's preferred genre
  const getCurrentExperienceId = (): string => {
    const preferredGenre = getUserPreferredGenre();
    
    if (preferredGenre && GENRE_EXPERIENCES[preferredGenre]) {
      console.log(`🎯 Using ${preferredGenre} experience: ${GENRE_EXPERIENCES[preferredGenre]}`);
      return GENRE_EXPERIENCES[preferredGenre];
    }
    
    // Default to War experience if no preference
    console.log('🎯 Using default War experience');
    return GENRE_EXPERIENCES['War'];
  };

  // Get display text for the current genre focus
  const getGenreDisplayInfo = () => {
    const preferredGenre = getUserPreferredGenre();
    
    if (preferredGenre && checkUserGenreInteraction(preferredGenre)) {
      const genreEmojis: Record<string, string> = {
        'War': '⚔️',
        'Biography': '👤',
        'Mystery': '🔍',
        'Fantasy': '🧙‍♂️',
        'Romance': '💕',
        'Science': '🔬',
        'History': '📜'
      };
      
      return {
        status: `${genreEmojis[preferredGenre] || '📚'} ${preferredGenre} Books Focus`,
        subtitle: `${preferredGenre} Books Experience Active`,
        title: `📚 ${preferredGenre} Recommendations`
      };
    }
    
    return {
      status: '✅ Personalized',
      subtitle: 'Powered by Lytics',
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
