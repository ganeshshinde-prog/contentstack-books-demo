'use client';

import React, { useState, useEffect } from 'react';
import { usePersonalization } from '../contexts/personalization-context';
import Link from 'next/link';

interface PersonalizedBook {
  uid: string; // Changed from id to uid to match Contentstack
  title: string;
  author: string;
  genre: string;
  price: number;
  image?: string; // Added image
  description?: string; // Added description
  tags?: string[]; // Added tags
  number_of_pages?: number; // Added number_of_pages
  personalization: {
    reason: string;
    confidence: number;
    segment: string;
    source: string; // Added source
  };
}

export default function PersonalizedRecommendations() {
  const { 
    userSegment, 
    userPreferences, 
    getPersonalizedContent, 
    trackBehavior, 
    isPersonalized 
  } = usePersonalization();
  
  const [recommendations, setRecommendations] = useState<PersonalizedBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPersonalizedContent();
  }, [userSegment, userPreferences]);

  const loadPersonalizedContent = async () => {
    setLoading(true);
    
    console.group(`🎯 PERSONALIZED RECOMMENDATIONS`);
    console.log(`👤 User Segment:`, userSegment);
    console.log(`📚 User Preferences:`, userPreferences);
    console.log(`🎯 Is Personalized:`, isPersonalized);
    
    try {
      console.log(`🚀 Fetching personalized content...`);
      const content = await getPersonalizedContent('book_recommendations');
      
      console.log(`📦 Raw content received:`, content);
      console.log(`📦 Content type:`, typeof content);
      console.log(`📦 Is array:`, Array.isArray(content));
      setRecommendations(content);
      
      console.log(`✅ Total recommendations: ${content.length}`);
      
      // Log War genre recommendations specifically
      const warBooks = content.filter(book => book.genre?.toLowerCase() === 'war');
      if (warBooks.length > 0) {
        console.log(`🎖️ WAR GENRE RECOMMENDATIONS: ${warBooks.length} books`);
        warBooks.forEach((book, index) => {
          console.log(`  ${index + 1}. "${book.title}" by ${book.author} - ${book.personalization?.reason}`);
        });
      } else {
        console.log(`ℹ️ No War genre books in recommendations`);
      }
      
      // Log all recommendations with their personalization reasons
      console.group(`📋 ALL RECOMMENDATIONS`);
      content.forEach((book, index) => {
        console.log(`${index + 1}. "${book.title}" (${book.genre}) - ${book.personalization?.reason} [${Math.round((book.personalization?.confidence || 0) * 100)}% match]`);
      });
      console.groupEnd();
      
      // Track that we showed personalized content
      console.log(`📊 Tracking view_recommendations event...`);
      trackBehavior('view_recommendations', {
        segment: userSegment,
        count: content.length,
        war_book_count: warBooks.length,
        genres_shown: Array.from(new Set(content.map(book => book.genre))),
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      console.error('❌ PersonalizedRecommendations: Error loading content:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  const handleBookClick = (book: PersonalizedBook) => {
    trackBehavior('click', {
      element: 'personalized_recommendation',
      bookId: book.uid, // Changed from id to uid
      reason: book.personalization.reason,
      confidence: book.personalization.confidence,
    });
  };

  if (!isPersonalized) {
    // Don't show any recommendations section for first-time visitors
    // Only show after user has interacted with books or set preferences
    return null;
  }

  return (
    <section className='personalized-recommendations-container'>
      <div className='max-width'>
        <div className='section-header'>
          <div className='personalization-badge'>
            <span className='badge-icon'>🎯</span>
            <span className='badge-text'>Personalized for You</span>
          </div>
                <h2>
                  {getPersonalizedTitle(userPreferences.favoriteGenres, userSegment)}
                </h2>
                <p className='section-subtitle'>
                  {getPersonalizedSubtitle(userPreferences.favoriteGenres, userSegment)}
                </p>
        </div>

        {loading ? (
          <div className='recommendations-loading'>
            <div className='loading-grid-compact'>
              {[...Array(3)].map((_, i) => (
                <div key={i} className='recommendation-skeleton-compact'>
                  <div className='skeleton-image'></div>
                  <div className='skeleton-text'></div>
                  <div className='skeleton-text short'></div>
                </div>
              ))}
            </div>
          </div>
        ) : recommendations.length > 0 ? (
          <div className='recommendations-grid-compact'>
            {recommendations.slice(0, 3).map((book, index) => (
              <div 
                key={book.uid}
                className='recommendation-card-compact'
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className='book-preview-compact'>
                  {book.image ? (
                    <img src={book.image} alt={book.title} className='book-image-compact' />
                  ) : (
                    <div className='book-image-placeholder-compact'>
                      📖
                    </div>
                  )}
                  <div className='book-info-compact'>
                    <h4 className='book-title-compact'>{book.title}</h4>
                    <p className='book-author-compact'>by {book.author}</p>
                    <div className='book-meta-compact'>
                      <span className='genre-tag-compact'>{book.genre}</span>
                      <span className='price-compact'>₹{book.price}</span>
                    </div>
                    <div className='personalization-reason-compact'>
                      {book.personalization.reason}
                    </div>
                  </div>
                </div>

                <div className='card-actions-compact'>
                  <Link 
                    href={`/books/${book.uid}`}
                    className='btn primary-btn compact'
                    onClick={() => handleBookClick(book)}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='no-recommendations'>
            <p>Browse some books to get personalized recommendations!</p>
          </div>
        )}

        <div className='personalization-controls'>
          <button 
            className='refresh-recommendations'
            onClick={loadPersonalizedContent}
            disabled={loading}
          >
            🔄 Refresh Recommendations
          </button>
          <Link href='/preferences' className='update-preferences'>
            ⚙️ Update Preferences
          </Link>
        </div>
      </div>
    </section>
  );
}

function getUserSegmentLabel(segment: string): string {
  const labels = {
    new_user: '👋 New Reader',
    frequent_reader: '📚 Avid Reader',
    genre_enthusiast: '🎭 Genre Fan',
    war_enthusiast: '🎖️ War History Buff',      // New segment
    price_conscious: '💰 Value Seeker',
    casual_browser: '🚶 Explorer',
    returning_customer: '🔄 Returning Reader',
    high_value_customer: '💎 Premium Reader',    // New segment
    at_risk_customer: '⚠️ Needs Attention',     // New segment
  };
  
  return labels[segment as keyof typeof labels] || '📖 Reader';
}

// Dynamic title generation based on user's favorite genres
function getPersonalizedTitle(favoriteGenres: string[], userSegment: string): string {
  if (!favoriteGenres || favoriteGenres.length === 0) {
    return 'Recommended Books';
  }

  // Get unique genres
  const uniqueGenres = Array.from(new Set(favoriteGenres));
  
  // Special cases for specific genres
  const genreIcons: Record<string, string> = {
    'War': '🎖️',
    'Thrillers': '🔍',
    'Mystery': '🕵️',
    'Fantasy': '🧙‍♂️',
    'Romance': '💕',
    'Sci-Fi': '🚀',
    'Horror': '👻',
    'Biography': '👤',
    'History': '📜',
    'Business': '💼'
  };

  if (uniqueGenres.length === 1) {
    const genre = uniqueGenres[0];
    const icon = genreIcons[genre] || '📚';
    
    switch (genre) {
      case 'War':
        return `${icon} War Books & Military History`;
      case 'Thrillers':
        return `${icon} Thrilling Page-Turners`;
      case 'Mystery':
        return `${icon} Mystery & Detective Stories`;
      case 'Fantasy':
        return `${icon} Fantasy Adventures`;
      case 'Romance':
        return `${icon} Love Stories & Romance`;
      default:
        return `${icon} ${genre} Books`;
    }
  } else if (uniqueGenres.length === 2) {
    const [genre1, genre2] = uniqueGenres;
    const icon1 = genreIcons[genre1] || '📚';
    const icon2 = genreIcons[genre2] || '📚';
    return `${icon1}${icon2} ${genre1} & ${genre2} Collection`;
  } else {
    return `📚 Your Multi-Genre Collection`;
  }
}

// Dynamic subtitle generation
function getPersonalizedSubtitle(favoriteGenres: string[], userSegment: string): string {
  if (!favoriteGenres || favoriteGenres.length === 0) {
    return `Curated for ${getUserSegmentLabel(userSegment).replace(/[^\w\s]/g, '').trim()} readers`;
  }

  const uniqueGenres = Array.from(new Set(favoriteGenres));
  
  if (uniqueGenres.length === 1) {
    const genre = uniqueGenres[0];
    const descriptions: Record<string, string> = {
      'War': 'Explore heroic stories and military history',
      'Thrillers': 'Heart-pounding suspense and excitement',
      'Mystery': 'Puzzles, clues, and detective work',
      'Fantasy': 'Magical worlds and epic adventures',
      'Romance': 'Love stories that touch the heart',
      'Sci-Fi': 'Future worlds and scientific wonders',
      'Horror': 'Spine-chilling tales of terror',
      'Biography': 'Real stories of remarkable people',
      'History': 'Journey through time and events',
      'Business': 'Success strategies and entrepreneurship'
    };
    
    const description = descriptions[genre] || `Discover amazing ${genre.toLowerCase()} books`;
    return `Based on your love for ${genre} - ${description}`;
  } else if (uniqueGenres.length <= 3) {
    return `Based on your interest in ${uniqueGenres.join(', ')} books`;
  } else {
    return `Curated for your diverse reading interests across ${uniqueGenres.length} genres`;
  }
}
