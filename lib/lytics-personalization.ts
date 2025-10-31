// Lytics Audience-Based Personalization Service

interface LyticsAudience {
  id: string;
  name: string;
  slug: string;
  confidence?: number;
}

interface UserProfile {
  audiences: LyticsAudience[];
  attributes: Record<string, any>;
  engagement_level: 'first_time' | 'repeat' | 'deeply_engaged' | 'casual';
  visit_count?: number;
  last_visit?: string;
  session_duration?: number;
  pages_viewed?: number;
}

interface PersonalizationRule {
  audience: string;
  book_preferences: {
    genres: string[];
    price_range?: { min: number; max: number };
    popularity_weight: number;
    recency_weight: number;
    diversity_factor: number;
  };
  recommendation_strategy: 'trending' | 'similar_to_viewed' | 'genre_focused' | 'discovery';
}

class LyticsPersonalization {
  private static readonly AUDIENCE_RULES: Record<string, PersonalizationRule> = {
    'repeat_visitors': {
      audience: 'repeat_visitors',
      book_preferences: {
        genres: [], // Dynamic - will be populated from user behavior
        price_range: { min: 200, max: 800 },
        popularity_weight: 0.4,
        recency_weight: 0.6,
        diversity_factor: 0.3 // Lower diversity to focus on user preferences
      },
      recommendation_strategy: 'similar_to_viewed'
    },
    'deeply_engaged_users': {
      audience: 'deeply_engaged_users', 
      book_preferences: {
        genres: [], // Dynamic - will be populated from user behavior
        price_range: { min: 300, max: 1200 },
        popularity_weight: 0.2,
        recency_weight: 0.8,
        diversity_factor: 0.2 // Very focused on user preferences
      },
      recommendation_strategy: 'genre_focused'
    },
    'first_time_visitors': {
      audience: 'first_time_visitors',
      book_preferences: {
        genres: ['Fantasy', 'Adventure', 'Young Adult', 'Popular Fiction'],
        price_range: { min: 150, max: 600 },
        popularity_weight: 0.6,
        recency_weight: 0.4,
        diversity_factor: 0.7
      },
      recommendation_strategy: 'discovery'
    }
  };

  /**
   * Check if Lytics is available and get user profile
   */
  static async getUserProfile(): Promise<UserProfile | null> {
    try {
      if (typeof window === 'undefined' || !window.jstag) {
        console.warn('⚠️ Lytics jstag not available for audience detection');
        return null;
      }

      // Get user data from Lytics
      const userData = await this.getLyticsUserData();
      
      if (!userData) {
        return this.getDefaultProfile();
      }

      return this.parseUserProfile(userData);
    } catch (error) {
      console.error('❌ Error getting Lytics user profile:', error);
      return this.getDefaultProfile();
    }
  }

  /**
   * Get user data from Lytics jstag
   */
  private static async getLyticsUserData(): Promise<any> {
    return new Promise((resolve) => {
      try {
        // Check if user has audience data
        if (window.jstag && window.jstag.call) {
          window.jstag.call('getAudiences', (audiences: any) => {
            const userData = {
              audiences: audiences || [],
              attributes: window.jstag.call('getAttributes') || {},
              session_data: window.jstag.call('getSessionData') || {}
            };
            resolve(userData);
          });
        } else {
          // Fallback: analyze user behavior from localStorage
          resolve(this.analyzeUserBehavior());
        }
      } catch (error) {
        console.warn('⚠️ Error getting Lytics data, using behavior analysis:', error);
        resolve(this.analyzeUserBehavior());
      }
    });
  }

  /**
   * Analyze user behavior from stored data to determine engagement level
   */
  private static analyzeUserBehavior(): any {
    try {
      const behaviorData = localStorage.getItem('user-behavior');
      const preferencesData = localStorage.getItem('user-preferences');
      
      if (!behaviorData) {
        return null;
      }

      const behavior = JSON.parse(behaviorData);
      const preferences = preferencesData ? JSON.parse(preferencesData) : {};

      // Determine engagement level based on behavior
      const viewedBooksCount = behavior.viewedBooks?.length || 0;
      const sessionCount = behavior.sessionCount || 0;
      const clickPatterns = Object.keys(behavior.clickPatterns || {}).length;

      let engagement_level = 'first_time';
      let audiences = [];

      if (sessionCount >= 3 && viewedBooksCount >= 10) {
        engagement_level = 'deeply_engaged';
        audiences.push({ 
          id: 'deeply_engaged_users', 
          name: 'Deeply Engaged Users',
          slug: 'deeply_engaged_users',
          confidence: 0.9 
        });
      } else if (sessionCount >= 2 || viewedBooksCount >= 3) {
        engagement_level = 'repeat';
        audiences.push({ 
          id: 'repeat_visitors', 
          name: 'Repeat Visitors',
          slug: 'repeat_visitors',
          confidence: 0.8 
        });
      } else {
        audiences.push({ 
          id: 'first_time_visitors', 
          name: 'First-time Visitors',
          slug: 'first_time_visitors',
          confidence: 0.7 
        });
      }

      return {
        audiences,
        attributes: {
          visit_count: sessionCount,
          pages_viewed: viewedBooksCount,
          engagement_score: (viewedBooksCount * 2) + (sessionCount * 5) + clickPatterns,
          favorite_genres: preferences.favoriteGenres || []
        },
        session_data: {
          current_session_duration: Date.now() - new Date(behavior.lastVisit).getTime(),
          engagement_level
        }
      };
    } catch (error) {
      console.error('❌ Error analyzing user behavior:', error);
      return null;
    }
  }

  /**
   * Parse user profile from Lytics data
   */
  private static parseUserProfile(userData: any): UserProfile {
    const audiences = userData.audiences || [];
    const attributes = userData.attributes || {};
    const sessionData = userData.session_data || {};

    // Determine engagement level
    let engagement_level: UserProfile['engagement_level'] = 'first_time';
    
    if (audiences.some((a: any) => a.slug === 'deeply_engaged_users')) {
      engagement_level = 'deeply_engaged';
    } else if (audiences.some((a: any) => a.slug === 'repeat_visitors')) {
      engagement_level = 'repeat';
    } else if (attributes.visit_count > 1) {
      engagement_level = 'repeat';
    }

    return {
      audiences: audiences.map((a: any) => ({
        id: a.id || a.slug,
        name: a.name || a.slug,
        slug: a.slug,
        confidence: a.confidence || 0.5
      })),
      attributes,
      engagement_level,
      visit_count: attributes.visit_count || sessionData.visit_count || 1,
      last_visit: attributes.last_visit || sessionData.last_visit,
      session_duration: sessionData.current_session_duration || 0,
      pages_viewed: attributes.pages_viewed || 0
    };
  }

  /**
   * Get default profile for new users
   */
  private static getDefaultProfile(): UserProfile {
    return {
      audiences: [{
        id: 'first_time_visitors',
        name: 'First-time Visitors', 
        slug: 'first_time_visitors',
        confidence: 0.9
      }],
      attributes: {},
      engagement_level: 'first_time',
      visit_count: 1,
      pages_viewed: 0
    };
  }

  /**
   * Get personalized book recommendations based on user's audience
   */
  static async getPersonalizedRecommendations(books: any[], limit: number = 8): Promise<{
    books: any[];
    audience: string;
    strategy: string;
    confidence: number;
  }> {
    try {
      console.group('🎯 DYNAMIC LYTICS PERSONALIZATION');
      
      const userProfile = await this.getUserProfile();
      console.log('👤 User Profile:', userProfile);

      if (!userProfile || !userProfile.audiences.length) {
        console.log('📚 No audience data, using default recommendations');
        console.groupEnd();
        return {
          books: books.slice(0, limit),
          audience: 'default',
          strategy: 'discovery',
          confidence: 0.5
        };
      }

      // Get the highest confidence audience
      const primaryAudience = userProfile.audiences.reduce((prev, current) => 
        (current.confidence || 0) > (prev.confidence || 0) ? current : prev
      );

      console.log('🎯 Primary Audience:', primaryAudience);

      // Get dynamic rule based on user behavior
      const rule = this.getDynamicPersonalizationRule(primaryAudience.slug, userProfile);
      console.log('📋 Dynamic Personalization Rule:', rule);

      const personalizedBooks = this.applyPersonalizationRule(books, rule, userProfile);
      
      console.log(`✅ Generated ${personalizedBooks.length} personalized recommendations for ${primaryAudience.name}`);
      console.log('📚 Sample personalized books:', personalizedBooks.slice(0, 3).map(b => ({
        title: b.title,
        genre: b.book_type,
        score: b.personalization_score
      })));
      console.groupEnd();

      return {
        books: personalizedBooks.slice(0, limit),
        audience: primaryAudience.name,
        strategy: rule.recommendation_strategy,
        confidence: primaryAudience.confidence || 0.5
      };
    } catch (error) {
      console.error('❌ Error generating personalized recommendations:', error);
      console.groupEnd();
      return {
        books: books.slice(0, limit),
        audience: 'fallback',
        strategy: 'discovery',
        confidence: 0.1
      };
    }
  }

  /**
   * Get dynamic personalization rule based on user behavior
   */
  private static getDynamicPersonalizationRule(audienceSlug: string, userProfile: UserProfile): PersonalizationRule {
    const baseRule = this.AUDIENCE_RULES[audienceSlug] 
      ? { ...this.AUDIENCE_RULES[audienceSlug] } 
      : { ...this.AUDIENCE_RULES['first_time_visitors'] };
    
    // Get user's preferred genres from behavior
    const userGenres = this.extractUserGenrePreferences(userProfile);
    console.log('🎯 User preferred genres from behavior:', userGenres);
    
    // For repeat visitors and deeply engaged users, use their actual behavior
    if (audienceSlug === 'repeat_visitors' || audienceSlug === 'deeply_engaged_users') {
      if (userGenres.length > 0) {
        baseRule.book_preferences.genres = userGenres;
        console.log('✅ Updated rule with user genres:', baseRule.book_preferences.genres);
      } else {
        // Fallback to popular genres if no behavior data
        baseRule.book_preferences.genres = ['War', 'Mystery', 'Fantasy', 'Biography'];
        console.log('⚠️ No user behavior, using fallback genres');
      }
    }
    
    return baseRule;
  }

  /**
   * Extract user's genre preferences from their behavior
   */
  private static extractUserGenrePreferences(userProfile: UserProfile): string[] {
    try {
      // Get genres from user attributes (favorite_genres from personalization context)
      const favoriteGenres = userProfile.attributes.favorite_genres || [];
      
      // Also check localStorage for recent behavior
      if (typeof window !== 'undefined') {
        const behaviorData = localStorage.getItem('user-behavior');
        const preferencesData = localStorage.getItem('user-preferences');
        
        if (behaviorData) {
          const behavior = JSON.parse(behaviorData);
          const viewedGenres = behavior.viewedGenres || [];
          
          // Combine and deduplicate
          const allGenres = [...favoriteGenres, ...viewedGenres];
          const uniqueGenres = Array.from(new Set(allGenres)).filter(Boolean);
          
          console.log('📊 Extracted user genres:', {
            from_attributes: favoriteGenres,
            from_behavior: viewedGenres,
            combined: uniqueGenres
          });
          
          return uniqueGenres;
        }
        
        if (preferencesData) {
          const preferences = JSON.parse(preferencesData);
          const prefGenres = preferences.favoriteGenres || [];
          return Array.from(new Set([...favoriteGenres, ...prefGenres])).filter(Boolean);
        }
      }
      
      return favoriteGenres.filter(Boolean);
    } catch (error) {
      console.error('❌ Error extracting user genre preferences:', error);
      return [];
    }
  }

  /**
   * Apply personalization rule to filter and sort books
   */
  private static applyPersonalizationRule(books: any[], rule: PersonalizationRule, userProfile: UserProfile): any[] {
    let scoredBooks = books.map(book => ({
      ...book,
      personalization_score: this.calculatePersonalizationScore(book, rule, userProfile)
    }));

    // Sort by personalization score
    scoredBooks.sort((a, b) => b.personalization_score - a.personalization_score);

    // Apply diversity factor
    if (rule.book_preferences.diversity_factor > 0.5) {
      scoredBooks = this.applyDiversityFilter(scoredBooks, rule.book_preferences.diversity_factor);
    }

    return scoredBooks;
  }

  /**
   * Calculate personalization score for a book
   */
  private static calculatePersonalizationScore(book: any, rule: PersonalizationRule, userProfile: UserProfile): number {
    let score = 0.1; // Lower base score to make preferences more impactful

    // Get user's actual preferred genres
    const userPreferredGenres = this.extractUserGenrePreferences(userProfile);
    
    // HIGHEST PRIORITY: User's actual behavior (clicked genres)
    if (userPreferredGenres.includes(book.book_type)) {
      score += 0.8; // Very high score for user's preferred genres
      console.log(`🎯 HIGH SCORE for ${book.title} (${book.book_type}) - matches user preference`);
    } 
    // MEDIUM PRIORITY: Rule-based genre preferences
    else if (rule.book_preferences.genres.includes(book.book_type)) {
      score += 0.4; // Medium score for rule-based preferences
    } 
    // LOW PRIORITY: Other genres (for diversity)
    else {
      score += 0.05; // Very low score for non-preferred genres
    }

    // Price range score (lower weight)
    if (rule.book_preferences.price_range) {
      const { min, max } = rule.book_preferences.price_range;
      if (book.price >= min && book.price <= max) {
        score += 0.1;
      }
    }

    // Strategy-specific scoring
    if (rule.recommendation_strategy === 'genre_focused') {
      // For genre-focused strategy, heavily penalize non-preferred genres
      if (!userPreferredGenres.includes(book.book_type) && !rule.book_preferences.genres.includes(book.book_type)) {
        score *= 0.2; // Heavily reduce score for non-preferred genres
      }
    } else if (rule.recommendation_strategy === 'similar_to_viewed') {
      // Boost books similar to what user has viewed
      if (userPreferredGenres.includes(book.book_type)) {
        score += 0.2;
      }
    }

    // Small random factor for variety within same-genre books
    score += Math.random() * 0.1;

    return Math.min(score, 1.0); // Cap at 1.0
  }

  /**
   * Apply diversity filter to avoid too many books of the same genre
   */
  private static applyDiversityFilter(books: any[], diversityFactor: number): any[] {
    if (diversityFactor <= 0.5) return books;

    const genreCount: Record<string, number> = {};
    const maxPerGenre = Math.max(2, Math.floor(books.length * (1 - diversityFactor)));
    
    return books.filter(book => {
      const genre = book.book_type || 'Unknown';
      genreCount[genre] = (genreCount[genre] || 0) + 1;
      return genreCount[genre] <= maxPerGenre;
    });
  }

  /**
   * Track recommendation interaction for learning
   */
  static trackRecommendationInteraction(bookId: string, audience: string, action: 'view' | 'click' | 'add_to_cart'): void {
    try {
      if (typeof window !== 'undefined' && window.jstag) {
        window.jstag.send({
          event: 'recommendation_interaction',
          book_id: bookId,
          audience: audience,
          action: action,
          timestamp: new Date().toISOString()
        });
        console.log(`📊 Tracked recommendation ${action} for audience ${audience}`);
      }
    } catch (error) {
      console.error('❌ Error tracking recommendation interaction:', error);
    }
  }
}

export default LyticsPersonalization;
export type { UserProfile, LyticsAudience, PersonalizationRule };
