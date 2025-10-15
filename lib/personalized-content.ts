/**
 * Personalized Content Fetcher for Launch
 * Based on: https://www.contentstack.com/docs/personalize/setup-nextjs-website-with-personalize-launch
 */

import Personalize from '@contentstack/personalize-edge-sdk';
import { getBooksRes } from '../helper'; // Use existing helper

export interface PersonalizedContentOptions {
  contentTypeUid: string;
  entryUid?: string;
  variantParam?: string;
  includeReferences?: string[];
  locale?: string;
}

/**
 * Fetch personalized books based on user preferences
 */
export async function fetchPersonalizedBooks(variantParam?: string): Promise<any[]> {
  try {
    console.log('📚 Fetching personalized books with variant support');
    
    // Use existing helper to get books
    const allBooks = await getBooksRes();
    
    if (variantParam) {
      console.log('🎭 Variant parameter provided:', variantParam);
      // In a real implementation, this would use the variant parameter
      // to fetch different content variants from Contentstack
      // For now, we'll return the books as-is since we don't have variants set up
    }
    
    return allBooks || [];
    
  } catch (error) {
    console.error('❌ Error fetching personalized books:', error);
    return [];
  }
}

/**
 * Extract variant parameter from URL search params
 */
export function extractVariantParam(searchParams: Record<string, string>): string | undefined {
  const variantParam = searchParams[Personalize.VARIANT_QUERY_PARAM];
  
  if (variantParam) {
    console.log('🎭 Variant parameter found in URL:', variantParam);
    return decodeURIComponent(variantParam);
  }
  
  console.log('ℹ️ No variant parameter in URL');
  return undefined;
}

/**
 * Create personalized book recommendations based on user attributes
 */
export async function createPersonalizedRecommendations(
  userAttributes: Record<string, any>,
  allBooks: any[]
): Promise<any[]> {
  console.group('🎯 CREATING PERSONALIZED RECOMMENDATIONS');
  console.log('User Attributes:', userAttributes);
  console.log('Available Books:', allBooks.length);
  
  try {
    let recommendations = [...allBooks];
    
    // Skip the old genre interest filtering - use the more precise attribute-based filtering below
    // This prevents mixing unwanted genres when user has specific interests
    
    // Filter by multiple genre interests (Fantasy, War, etc.)
    const genreInterests: string[] = [];
    if (userAttributes.Fantasy === true) genreInterests.push('Fantasy');
    if (userAttributes.War === true) genreInterests.push('War');
    if (userAttributes.Romance === true) genreInterests.push('Romance');
    if (userAttributes.Mystery === true) genreInterests.push('Mystery');
    if (userAttributes['Science Fiction'] === true) genreInterests.push('Science Fiction');
    
    if (genreInterests.length > 0) {
      console.log(`🎭 User has genre interests: ${genreInterests.join(', ')}`);
      
      // If user has only one genre interest, show ONLY that genre
      if (genreInterests.length === 1) {
        const singleGenre = genreInterests[0];
        const genreBooks = recommendations.filter(book => 
          book.book_type && book.book_type.toLowerCase() === singleGenre.toLowerCase()
        );
        
        if (genreBooks.length > 0) {
          recommendations = genreBooks.slice(0, 6);
          console.log(`📚 Single genre focus (${singleGenre}): showing ${recommendations.length} ${singleGenre} books only`);
          console.log(`📖 Books: ${recommendations.map(b => `"${b.title}"`).join(', ')}`);
        } else {
          console.log(`⚠️ No ${singleGenre} books found, keeping mixed recommendations`);
        }
      } else {
        // Multiple genre interests - show balanced mix
        const genreBooks: Record<string, any[]> = {};
        const otherBooks: any[] = [];
        
        recommendations.forEach(book => {
          const bookGenre = book.book_type;
          const matchingGenre = genreInterests.find(genre => 
            bookGenre && bookGenre.toLowerCase() === genre.toLowerCase()
          );
          
          console.log(`📖 Book: "${book.title}" (${bookGenre}) → ${matchingGenre ? `Matches ${matchingGenre}` : 'No match'}`);
          
          if (matchingGenre) {
            if (!genreBooks[matchingGenre]) {
              genreBooks[matchingGenre] = [];
            }
            genreBooks[matchingGenre].push(book);
          } else {
            otherBooks.push(book);
          }
        });
        
        // Create balanced recommendations: equal books per interested genre
        const maxBooksPerGenre = Math.max(2, Math.floor(6 / genreInterests.length));
        recommendations = [];
        
        genreInterests.forEach(genre => {
          if (genreBooks[genre]) {
            const books = genreBooks[genre].slice(0, maxBooksPerGenre);
            recommendations.push(...books);
            console.log(`📚 Added ${books.length} ${genre} books: ${books.map(b => `"${b.title}"`).join(', ')}`);
          }
        });
        
        console.log(`🎯 Multi-genre filtering complete: ${recommendations.length} total books`);
        console.log(`📊 Genre distribution:`, genreInterests.map(genre => 
          `${genre}: ${genreBooks[genre]?.length || 0} available, ${recommendations.filter(r => r.book_type === genre).length} selected`
        ));
      }
    }
    
    // Filter by price sensitivity
    if (userAttributes.price_sensitivity === 'high' || userAttributes.budget_preference === 'budget') {
      console.log('💰 User is price sensitive - showing budget-friendly books');
      
      recommendations = recommendations.filter(book => 
        book.price && book.price <= 400
      ).sort((a, b) => (a.price || 0) - (b.price || 0));
    }
    
    // Limit to top recommendations
    recommendations = recommendations.slice(0, 6);
    
    console.log(`✅ Final recommendations: ${recommendations.length} books`);
    console.log('Recommended books:', recommendations.map(b => `"${b.title}" (${b.book_type})`));
    console.groupEnd();
    
    return recommendations;
    
  } catch (error) {
    console.error('❌ Error creating personalized recommendations:', error);
    console.groupEnd();
    return allBooks.slice(0, 6); // Fallback to first 6 books
  }
}

export default {
  fetchPersonalizedBooks,
  extractVariantParam,
  createPersonalizedRecommendations,
};
