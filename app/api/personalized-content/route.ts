import { NextRequest, NextResponse } from 'next/server';
import { getBooksRes } from '../../../helper';

// Contentstack Personalize API integration with real book data
export async function POST(request: NextRequest) {
  try {
    const { contentType, userSegment, preferences, behavior, rules } = await request.json();

    console.log(`🎯 Personalized Content API: Fetching for segment "${userSegment}"`);

    // Get real books from Contentstack
    const allBooks = await getBooksRes();
    
    if (!allBooks || allBooks.length === 0) {
      return NextResponse.json([]);
    }

    let personalizedBooks = [];

    // Try to get recommendations from Contentstack Personalize first
    const personalizeApiUrl = process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_URL;
    const personalizeToken = process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_TOKEN;
    const personalizeProjectId = process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_ID;

    if (personalizeApiUrl && personalizeToken && personalizeProjectId) {
      try {
        console.log('🚀 Fetching recommendations from Contentstack Personalize...');
        
        const personalizeUrl = `${personalizeApiUrl}/projects/${personalizeProjectId}/recommendations`;
        
        const personalizePayload = {
          user_id: behavior?.user_session || 'anonymous',
          context: {
            content_type: contentType,
            page_type: 'homepage',
            user_segment: userSegment,
            favorite_genres: preferences?.favoriteGenres || [],
            viewed_books: behavior?.viewedBooks || [],
            price_range: preferences?.priceRange || { min: 0, max: 1000 },
            // Add War genre specific context for Contentstack Personalize
            has_war_interest: preferences?.favoriteGenres?.includes('War') || false,
            recent_war_view: behavior?.viewedBooks?.some((bookId: string) => {
              // Check if recently viewed War books
              return true; // Simplified for demo - in real app you'd check actual book genres
            }) || false,
          },
          attributes: {
            // Send user attributes that match your Contentstack Personalize setup
            genre_preference: preferences?.favoriteGenres?.join(',') || '',
            reading_level: preferences?.readingLevel || 'intermediate',
            price_max: preferences?.priceRange?.max || 1000,
            user_segment: userSegment,
          },
          limit: 6,
        };

        const personalizeResponse = await fetch(personalizeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${personalizeToken}`,
            'X-CS-CLI': 'true',
          },
          body: JSON.stringify(personalizePayload),
        });

        if (personalizeResponse.ok) {
          const personalizeResult = await personalizeResponse.json();
          console.log('✅ Got recommendations from Contentstack Personalize:', personalizeResult);
          
          // Map Personalize recommendations to actual books
          if (personalizeResult.recommendations && personalizeResult.recommendations.length > 0) {
            personalizedBooks = personalizeResult.recommendations
              .map((rec: any) => {
                // Find the book by UID or title
                const book = allBooks.find((b: any) => 
                  b.uid === rec.content_id || 
                  b.title === rec.title ||
                  b.title.toLowerCase().includes(rec.title?.toLowerCase() || '')
                );
                
                if (book) {
                  return mapBookWithPersonalization(book, {
                    score: rec.score || 0.8,
                    reason: rec.reason || `Recommended based on your ${userSegment} profile`,
                    source: 'contentstack_personalize',
                    segment: userSegment,
                  });
                }
                return null;
              })
              .filter(Boolean);
          }
        } else {
          console.warn('⚠️ Contentstack Personalize API returned error:', personalizeResponse.status);
        }
      } catch (personalizeError) {
        console.error('❌ Error calling Contentstack Personalize:', personalizeError);
      }
    } else {
      console.log('⚠️ Contentstack Personalize not configured, using fallback personalization');
    }

    // Fallback to rule-based personalization if Contentstack Personalize didn't return results
    if (personalizedBooks.length === 0) {
      console.log('📊 Using fallback rule-based personalization...');
      console.log('🎯 Personalization Input:', {
        segment: userSegment,
        favoriteGenres: preferences?.favoriteGenres || [],
        viewedBooks: behavior?.viewedBooks || [],
        priceRange: preferences?.priceRange || { min: 0, max: 1000 }
      });
      
      personalizedBooks = await generatePersonalizedContentFallback({
        contentType,
        userSegment,
        preferences,
        behavior,
        rules,
        availableBooks: allBooks,
      });
      
      console.log('✅ Fallback personalization completed:', personalizedBooks.length, 'books');
    }

    console.log(`✅ Returning ${personalizedBooks.length} personalized books for segment "${userSegment}"`);
    return NextResponse.json(personalizedBooks);
    
  } catch (error) {
    console.error('❌ Personalized Content API Error:', error);
    return NextResponse.json([]);
  }
}

// Helper function to map book data with personalization metadata
function mapBookWithPersonalization(book: any, personalizationData: any) {
  return {
    uid: book.uid,
    title: book.title,
    author: book.author,
    genre: book.book_type,
    price: book.price,
    image: book.bookimage?.url,
    description: book.book_description,
    tags: book.tags || [],
    number_of_pages: book.number_of_pages,
    personalization: {
      score: personalizationData.score,
      reason: personalizationData.reason,
      source: personalizationData.source,
      segment: personalizationData.segment,
      confidence: personalizationData.confidence || personalizationData.score,
    }
  };
}

async function generatePersonalizedContentFallback({
  contentType,
  userSegment,
  preferences,
  behavior,
  rules,
  availableBooks,
}: any) {
  console.log(`🎯 Personalizing content for segment: ${userSegment}`);
  console.log(`📚 User preferences:`, preferences);
  console.log(`👤 User behavior:`, behavior);
  
  let recommendations = [...availableBooks];

  // Apply personalization based on user segment and preferences
  switch (userSegment) {
    case 'new_user':
      // Show popular books across different genres to help discover preferences
      recommendations = recommendations
        .sort((a, b) => (b.price || 0) - (a.price || 0)) // Assume higher price = more popular
        .slice(0, 4);
      break;
      
    case 'frequent_reader':
      // Show books from genres they haven't explored much
      const favoriteGenres = preferences.favoriteGenres || [];
      if (favoriteGenres.length > 0) {
        // Mix of favorite genres (60%) and new genres (40%)
        const favoriteBooks = recommendations.filter(book => 
          favoriteGenres.some((genre: string) => 
            book.book_type && book.book_type.toLowerCase().includes(genre.toLowerCase())
          )
        );
        const newGenreBooks = recommendations.filter(book => 
          !favoriteGenres.some((genre: string) => 
            book.book_type && book.book_type.toLowerCase().includes(genre.toLowerCase())
          )
        );
        
        recommendations = [
          ...favoriteBooks.slice(0, 3),
          ...newGenreBooks.slice(0, 2)
        ];
      } else {
        recommendations = recommendations.slice(0, 5);
      }
      break;
      
    case 'genre_enthusiast':
      // Enhanced genre enthusiast logic - support multiple genres dynamically
      const userGenres = preferences.favoriteGenres || [];
      console.log('🎭 GENRE ENTHUSIAST Logic - Dynamic multi-genre support:');
      console.log('📚 User favorite genres:', userGenres);
      console.log('📖 Available books:', recommendations.map(b => `"${b.title}" (${b.book_type})`));
      
      if (userGenres.length > 0) {
        console.log(`🎭 User has ${userGenres.length} favorite genre(s): ${userGenres.join(', ')}`);
        
        // If user has only ONE favorite genre, show ONLY that genre
        if (userGenres.length === 1) {
          const singleGenre = userGenres[0];
          const genreBooks = recommendations.filter(book => 
            book.book_type && book.book_type.toLowerCase().includes(singleGenre.toLowerCase())
          );
          
          if (genreBooks.length > 0) {
            recommendations = genreBooks.slice(0, 6);
            console.log(`📚 Single genre focus (${singleGenre}): showing ${recommendations.length} ${singleGenre} books only`);
            console.log(`📖 ${singleGenre} books:`, recommendations.map((b: any) => `"${b.title}"`));
          } else {
            console.log(`⚠️ No ${singleGenre} books found, keeping mixed recommendations`);
            recommendations = recommendations.slice(0, 6);
          }
        } else {
          // Multiple genres - show balanced mix
          // Group books by user's favorite genres
          const genreGroups: Record<string, any[]> = {};
          const otherBooks: any[] = [];
          
          recommendations.forEach(book => {
            const bookGenre = book.book_type || 'Other';
            const matchingGenre = userGenres.find((genre: string) => 
              bookGenre.toLowerCase().includes(genre.toLowerCase())
            );
            
            console.log(`📖 Book: "${book.title}" (${bookGenre}) → ${matchingGenre ? `Matches ${matchingGenre}` : 'No match'}`);
            
            if (matchingGenre) {
              if (!genreGroups[matchingGenre]) {
                genreGroups[matchingGenre] = [];
              }
              genreGroups[matchingGenre].push(book);
            } else {
              otherBooks.push(book);
            }
          });
          
          console.log('📊 Genre groups:', Object.keys(genreGroups).map(genre => 
            `${genre}: ${genreGroups[genre].length} books`
          ));
          
          // Build recommendations with balanced genre distribution
          recommendations = [];
          const uniqueGenres = Array.from(new Set(userGenres)) as string[];
          const maxBooksPerGenre = Math.max(2, Math.floor(6 / uniqueGenres.length));
          
          // Add books from each favorite genre
          uniqueGenres.forEach((genre: string) => {
            if (genreGroups[genre]) {
              const genreBooks = genreGroups[genre].slice(0, maxBooksPerGenre);
              recommendations.push(...genreBooks);
              console.log(`📚 Added ${genreBooks.length} ${genre} books:`, genreBooks.map((b: any) => `"${b.title}"`));
            }
          });
          
          // Fill remaining slots with other books if needed
          const remainingSlots = 6 - recommendations.length;
          if (remainingSlots > 0 && otherBooks.length > 0) {
            const additionalBooks = otherBooks.slice(0, remainingSlots);
            recommendations.push(...additionalBooks);
            console.log(`📖 Added ${additionalBooks.length} other books to fill remaining slots`);
          }
          
          console.log(`✅ Genre enthusiast recommendations: ${recommendations.length} books total`);
          console.log(`📊 Final genre distribution:`, uniqueGenres.map(genre => 
            `${genre}: ${recommendations.filter(r => r.book_type === genre).length} books`
          ));
        }
        
        // If not enough books in favorite genres, add some related ones
        if (recommendations.length < 6) {
          console.log(`⚠️ Not enough genre matches (${recommendations.length}), adding fallback books...`);
          const remainingBooks = availableBooks.filter((book: any) => 
            !recommendations.some((rec: any) => rec.uid === book.uid)
          );
          const fallbackBooks = remainingBooks.slice(0, 6 - recommendations.length);
          recommendations = [...recommendations, ...fallbackBooks];
          console.log('📚 Added fallback books:', fallbackBooks.map((b: any) => `"${b.title}" (${b.book_type})`));
        }
      } else {
        console.log('⚠️ No favorite genres found, using default selection');
        recommendations = recommendations.slice(0, 6);
      }
      break;
      
    case 'war_enthusiast':
      // Dedicated War enthusiast segment - 90% War books
      console.log('🎖️ WAR ENTHUSIAST Segment - Maximum War book priority');
      
      const warOnlyBooks = recommendations.filter(book => 
        book.book_type && book.book_type.toLowerCase() === 'war'
      );
      const nonWarBooks = recommendations.filter(book => 
        book.book_type && book.book_type.toLowerCase() !== 'war'
      );
      
      console.log('⚔️ War books available:', warOnlyBooks.map(b => `"${b.title}"`));
      console.log('📚 Non-war books available:', nonWarBooks.map(b => `"${b.title}" (${b.book_type})`));
      
      // Prioritize War books heavily (90/10 split)
      recommendations = [
        ...warOnlyBooks.slice(0, 3),  // Up to 3 War books (reduced from 5)
        ...nonWarBooks.slice(0, 1)    // Only 1 non-War book
      ];
      
      console.log(`🎯 War enthusiast result: ${warOnlyBooks.length} War books prioritized`);
      console.log('📋 Final war enthusiast recommendations:', recommendations.map(b => `"${b.title}" (${b.book_type})`));
      break;
      
    case 'high_value_customer':
      // Premium customers get premium/expensive books
      console.log('💎 HIGH VALUE CUSTOMER - Premium book selection');
      recommendations = recommendations
        .sort((a, b) => (b.price || 0) - (a.price || 0)) // Sort by price descending
        .slice(0, 6);
      console.log('💰 Premium books selected:', recommendations.map(b => `"${b.title}" (₹${b.price})`));
      break;
      
    case 'at_risk_customer':
      // At-risk customers get popular/trending books to re-engage
      console.log('⚠️ AT RISK CUSTOMER - Re-engagement strategy');
      recommendations = recommendations
        .sort((a, b) => (b.price || 0) - (a.price || 0)) // Popular books (assuming higher price = popular)
        .slice(0, 4);
      console.log('🎣 Re-engagement books:', recommendations.map(b => `"${b.title}"`));
      break;
      
    case 'price_conscious':
      // Show books within budget, sorted by value
      const maxPrice = preferences.priceRange?.max || 1000;
      recommendations = recommendations
        .filter(book => (book.price || 0) <= maxPrice)
        .sort((a, b) => (a.price || 0) - (b.price || 0))
        .slice(0, 6);
      break;
      
    case 'returning_customer':
      // Show books similar to their purchase/view history
      const viewedGenres = extractGenresFromHistory(behavior.viewedBooks, availableBooks);
      if (viewedGenres.length > 0) {
        recommendations = recommendations
          .filter(book => 
            viewedGenres.some(genre => 
              book.book_type && book.book_type.toLowerCase().includes(genre.toLowerCase())
            )
          )
          .slice(0, 5);
      } else {
        recommendations = recommendations.slice(0, 5);
      }
      break;
      
    default:
      recommendations = recommendations.slice(0, 4);
  }

  // Add personalization metadata with real book data
  return recommendations.map(book => mapBookWithPersonalization(book, {
    score: calculateConfidenceScore(book, preferences, behavior, availableBooks),
    reason: getPersonalizationReason(book, userSegment, preferences),
    source: 'rule_based_fallback',
    segment: userSegment,
    confidence: calculateConfidenceScore(book, preferences, behavior, availableBooks),
  }));
}

function extractGenresFromHistory(viewedBooks: string[], allBooks: any[]): string[] {
  const genres = new Set<string>();
  
  viewedBooks.forEach(bookId => {
    const book = allBooks.find(b => b.uid === bookId);
    if (book && book.book_type) {
      genres.add(book.book_type.toLowerCase());
    }
  });
  
  return Array.from(genres);
}

function getMatchedGenres(book: any, favoriteGenres: string[]): string[] {
  if (!book.book_type) return [];
  
  return favoriteGenres.filter(genre => 
    book.book_type.toLowerCase().includes(genre.toLowerCase())
  );
}

function getPersonalizationReason(book: any, segment: string, preferences: any): string {
  const bookGenre = book.book_type || 'Unknown';
  const favoriteGenres = preferences.favoriteGenres || [];
  
  // Check if book matches user's favorite genres
  const matchedGenres = favoriteGenres.filter((genre: string) => 
    bookGenre.toLowerCase().includes(genre.toLowerCase())
  );
  
  if (matchedGenres.length > 0) {
    // Dynamic genre-specific messages
    const genreMessages: Record<string, string> = {
      'War': `Perfect for War history enthusiasts - based on your interest in "${book.title}"`,
      'Thrillers': `Heart-pounding thriller perfect for suspense lovers`,
      'Mystery': `Intriguing mystery that will keep you guessing`,
      'Fantasy': `Epic fantasy adventure for your imagination`,
      'Romance': `Romantic story that will touch your heart`,
      'Sci-Fi': `Mind-bending science fiction for future enthusiasts`,
      'Horror': `Spine-chilling horror for thrill seekers`,
      'Biography': `Inspiring life story for biography lovers`,
      'History': `Fascinating historical account for history buffs`,
      'Business': `Valuable business insights for entrepreneurs`
    };
    
    const primaryGenre = matchedGenres[0];
    const customMessage = genreMessages[primaryGenre];
    
    if (customMessage) {
      return customMessage;
    } else if (matchedGenres.length === 1) {
      return `Perfect match for your love of ${primaryGenre} books`;
    } else {
      return `Perfect match for your interests in ${matchedGenres.join(' and ')} books`;
    }
  }
  
  // Check if book matches preferred authors
  if (preferences.preferredAuthors && preferences.preferredAuthors.includes(book.author)) {
    return `More books by ${book.author}`;
  }
  
  // Segment-based reasons with genre context
  switch (segment) {
    case 'new_user':
      return `Popular ${bookGenre.toLowerCase()} book - great for discovering new genres`;
    case 'frequent_reader':
      return `Expand your reading with this ${bookGenre.toLowerCase()} book`;
    case 'war_enthusiast':
      return `Recommended for War history enthusiasts`;
    case 'genre_enthusiast':
      return `Excellent ${bookGenre.toLowerCase()} book for genre enthusiasts`;
    case 'price_conscious':
      return `Great value ${bookGenre.toLowerCase()} book within your budget`;
    case 'returning_customer':
      return `Based on your reading history in ${bookGenre.toLowerCase()}`;
    case 'high_value_customer':
      return `Premium ${bookGenre.toLowerCase()} selection for discerning readers`;
    case 'at_risk_customer':
      return `Popular ${bookGenre.toLowerCase()} book to reignite your reading passion`;
    default:
      return `Recommended ${bookGenre.toLowerCase()} book for you`;
  }
}

function calculateConfidenceScore(book: any, preferences: any, behavior: any, allBooks: any[]): number {
  let confidence = 0.3; // Base confidence
  
  const bookGenre = book.book_type || '';
  const favoriteGenres = preferences.favoriteGenres || [];
  
  // Strong boost for exact genre match
  const genreMatch = favoriteGenres.some((genre: string) => 
    bookGenre.toLowerCase().includes(genre.toLowerCase())
  );
  if (genreMatch) {
    confidence += 0.4;
  }
  
  // Boost for author match
  if (preferences.preferredAuthors && preferences.preferredAuthors.includes(book.author)) {
    confidence += 0.2;
  }
  
  // Boost for price range match
  if (book.price && preferences.priceRange) {
    if (book.price >= preferences.priceRange.min && book.price <= preferences.priceRange.max) {
      confidence += 0.1;
    }
  }
  
  // Boost for books in similar genres to viewed books
  const viewedGenres = extractGenresFromHistory(behavior.viewedBooks || [], allBooks);
  if (viewedGenres.some(genre => bookGenre.toLowerCase().includes(genre))) {
    confidence += 0.1;
  }
  
  return Math.min(confidence, 1.0);
}
