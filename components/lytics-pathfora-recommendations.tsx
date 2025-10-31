'use client';

import React, { useEffect, useState } from 'react';

// Extend Window interface to include pathfora
declare global {
  interface Window {
    pathfora?: any;
  }
}

interface LyticsPathforaRecommendationsProps {
  books: any[];
  maxRecommendations?: number;
}

export default function LyticsPathforaRecommendations({ 
  books, 
  maxRecommendations = 8 
}: LyticsPathforaRecommendationsProps) {
  const [isPathforaReady, setIsPathforaReady] = useState(false);
  const [experienceData, setExperienceData] = useState<any>(null);

  useEffect(() => {
    // Check if Pathfora and jstag are loaded
    const checkPathforaReady = () => {
      if (window.pathfora && window.jstag) {
        console.log('🎯 Pathfora and jstag are ready');
        setIsPathforaReady(true);
        initializePathforaExperience();
      } else {
        console.log('⏳ Waiting for Pathfora and jstag to load...');
        setTimeout(checkPathforaReady, 500);
      }
    };

    checkPathforaReady();
  }, [books]);

  const initializePathforaExperience = () => {
    if (!window.pathfora || !window.jstag) {
      console.warn('⚠️ Pathfora or jstag not available');
      return;
    }

    try {
      console.log('🚀 Initializing Pathfora experience for book recommendations');
      
      // Get user's audience data from jstag
      window.jstag.call('getAudiences', (audiences: any) => {
        console.log('👥 User audiences:', audiences);
        
        // Create Pathfora configuration for inline content recommendations
        const pathforaConfig = {
          id: 'lytics-book-recommendations',
          type: 'message',
          layout: 'inline',
          position: 'top-left',
          headline: 'Recommended Books for You',
          msg: 'Based on your interests and reading behavior',
          displayConditions: {
            showOnInit: true,
            showOnExitIntent: false,
            hideAfter: 0, // Don't auto-hide
            displayWhenElementVisible: '#pathfora-recommendations-container'
          },
          // Audience targeting - show only if user has audiences
          audiences: audiences && audiences.length > 0 ? {
            include: audiences.map((aud: any) => aud.slug || aud.id)
          } : undefined,
          // Custom content for book recommendations
          content: generateBookRecommendationsHTML(books, audiences),
          // Callbacks for tracking
          callbacks: {
            onLoad: () => {
              console.log('✅ Pathfora experience loaded');
              // Track experience view
              if (window.jstag) {
                window.jstag.send({
                  event: 'pathfora_experience_viewed',
                  experience_type: 'book_recommendations',
                  audience_count: audiences ? audiences.length : 0
                });
              }
            },
            onShow: () => {
              console.log('👀 Pathfora experience shown');
            }
          },
          // Styling
          theme: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#ffffff',
            'close-button': {
              color: '#ffffff'
            }
          }
        };

        // Initialize the widget
        window.pathfora.initializeWidgets([pathforaConfig]);
        
        setExperienceData({
          audiences,
          config: pathforaConfig
        });
      });

    } catch (error) {
      console.error('❌ Error initializing Pathfora experience:', error);
    }
  };

  const generateBookRecommendationsHTML = (availableBooks: any[], audiences: any[]) => {
    if (!availableBooks || availableBooks.length === 0) {
      return '<p>No books available at the moment.</p>';
    }

    // Filter books based on user's audience preferences
    const recommendedBooks = getRecommendedBooks(availableBooks, audiences);
    
    let html = '<div class="pathfora-book-recommendations">';
    html += '<style>';
    html += `
      .pathfora-book-recommendations {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        padding: 1rem;
        max-width: 100%;
      }
      .pathfora-book-card {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 1rem;
        text-align: center;
        transition: transform 0.2s ease;
        cursor: pointer;
      }
      .pathfora-book-card:hover {
        transform: translateY(-2px);
        background: rgba(255, 255, 255, 0.2);
      }
      .pathfora-book-image {
        width: 100%;
        max-width: 120px;
        height: 160px;
        object-fit: cover;
        border-radius: 4px;
        margin-bottom: 0.5rem;
      }
      .pathfora-book-title {
        font-size: 0.9rem;
        font-weight: bold;
        margin-bottom: 0.25rem;
        color: #ffffff;
      }
      .pathfora-book-author {
        font-size: 0.8rem;
        color: #e0e0e0;
        margin-bottom: 0.25rem;
      }
      .pathfora-book-genre {
        font-size: 0.7rem;
        background: rgba(255, 255, 255, 0.2);
        padding: 0.2rem 0.5rem;
        border-radius: 12px;
        display: inline-block;
        margin-bottom: 0.5rem;
      }
      .pathfora-book-price {
        font-size: 0.8rem;
        font-weight: bold;
        color: #4ade80;
      }
    `;
    html += '</style>';

    recommendedBooks.slice(0, maxRecommendations).forEach(book => {
      const bookUrl = `/books/${book.uid}`;
      html += `
        <div class="pathfora-book-card" onclick="window.open('${bookUrl}', '_self')">
          ${book.featured_image?.url || book.bookimage?.url ? 
            `<img src="${book.featured_image?.url || book.bookimage?.url}" alt="${book.title}" class="pathfora-book-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
             <div class="pathfora-book-placeholder" style="display: none; width: 120px; height: 160px; background: #f3f4f6; border-radius: 8px; align-items: center; justify-content: center; flex-direction: column; color: #6b7280; margin-bottom: 0.75rem;">
               <div style="font-size: 20px;">📚</div>
               <div style="font-size: 10px;">No Image</div>
             </div>` :
            `<div class="pathfora-book-placeholder" style="display: flex; width: 120px; height: 160px; background: #f3f4f6; border-radius: 8px; align-items: center; justify-content: center; flex-direction: column; color: #6b7280; margin-bottom: 0.75rem;">
               <div style="font-size: 20px;">📚</div>
               <div style="font-size: 10px;">No Image</div>
             </div>`
          }
          <div class="pathfora-book-title">${book.title}</div>
          <div class="pathfora-book-author">by ${book.author}</div>
          <div class="pathfora-book-genre">${book.book_type}</div>
          <div class="pathfora-book-price">₹${book.price}</div>
        </div>
      `;
    });

    html += '</div>';
    return html;
  };

  const getRecommendedBooks = (availableBooks: any[], audiences: any[]) => {
    if (!audiences || audiences.length === 0) {
      // No audience data, return popular books
      return availableBooks.sort(() => Math.random() - 0.5);
    }

    // Simple audience-based filtering
    const audienceGenreMap: Record<string, string[]> = {
      'repeat_visitors': ['Mystery', 'Thriller', 'Romance', 'Fiction'],
      'deeply_engaged_users': ['War', 'Biography', 'History', 'Science'],
      'first_time_visitors': ['Fantasy', 'Adventure', 'Young Adult']
    };

    let preferredGenres: string[] = [];
    audiences.forEach(audience => {
      const slug = audience.slug || audience.id;
      if (audienceGenreMap[slug]) {
        preferredGenres = [...preferredGenres, ...audienceGenreMap[slug]];
      }
    });

    if (preferredGenres.length === 0) {
      return availableBooks.sort(() => Math.random() - 0.5);
    }

    // Score books based on genre preferences
    const scoredBooks = availableBooks.map(book => ({
      ...book,
      score: preferredGenres.includes(book.book_type) ? 1 : 0.3
    }));

    return scoredBooks
      .sort((a, b) => b.score - a.score)
      .sort(() => Math.random() - 0.5); // Add some randomness
  };

  // Render container for Pathfora to inject content
  return (
    <section className="lytics-pathfora-section">
      <div className="container">
        <h2 className="section-title">🎯 Personalized Recommendations</h2>
        
        {/* Debug info */}
        <div style={{ 
          background: 'rgba(0,0,0,0.1)', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          <p><strong>Pathfora Status:</strong> {isPathforaReady ? '✅ Ready' : '⏳ Loading...'}</p>
          <p><strong>Books Available:</strong> {books.length}</p>
          {experienceData && (
            <>
              <p><strong>User Audiences:</strong> {experienceData.audiences?.length || 0}</p>
              <p><strong>Experience ID:</strong> {experienceData.config?.id}</p>
            </>
          )}
        </div>

        {/* Container where Pathfora will inject the experience */}
        <div 
          id="pathfora-recommendations-container"
          style={{
            minHeight: '200px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center'
          }}
        >
          {!isPathforaReady && (
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
              <p>Loading personalized recommendations...</p>
            </div>
          )}
          {isPathforaReady && !experienceData && (
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚙️</div>
              <p>Initializing Lytics experience...</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .lytics-pathfora-section {
          margin: 2rem 0;
          padding: 2rem 0;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        .section-title {
          font-size: 2rem;
          font-weight: bold;
          color: #1a202c;
          margin-bottom: 1rem;
          text-align: center;
        }

        /* Override Pathfora default styles */
        :global(.pf-widget-inline) {
          position: relative !important;
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          box-shadow: none !important;
          border-radius: 12px !important;
        }

        :global(.pf-widget-content) {
          padding: 0 !important;
        }

        :global(.pf-content-unit) {
          background: transparent !important;
        }
      `}</style>
    </section>
  );
}
