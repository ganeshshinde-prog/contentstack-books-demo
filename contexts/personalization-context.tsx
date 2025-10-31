// Contentstack Personalize Integration for Book Recommendations
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { personalizeService, PersonalizeUtils } from '../services/personalize';

// User preference types
export interface UserPreferences {
  favoriteGenres: string[];
  readingLevel: 'beginner' | 'intermediate' | 'advanced';
  priceRange: { min: number; max: number };
  preferredAuthors: string[];
  readingGoals: number; // books per month
  preferredFormats: ('physical' | 'ebook' | 'audiobook')[];
  ageGroup: 'kids' | 'teen' | 'adult';
  languages: string[];
}

// User behavior tracking
export interface UserBehavior {
  viewedBooks: string[];
  viewedGenres: string[]; // Track genres for Lytics personalization
  searchHistory: string[];
  purchaseHistory: string[];
  timeOnPage: Record<string, number>;
  clickPatterns: Record<string, number>;
  sessionCount: number;
  lastVisit: Date;
}

// Enhanced personalization segments based on contentstack-onkar-demo patterns
export type PersonalizationSegment = 
  | 'new_user'
  | 'frequent_reader' 
  | 'price_conscious'
  | 'genre_enthusiast'
  | 'war_enthusiast'      // Specific for War genre fans
  | 'casual_browser'
  | 'returning_customer'
  | 'high_value_customer' // Premium segment
  | 'at_risk_customer';   // Re-engagement needed

interface PersonalizationContextType {
  userPreferences: UserPreferences;
  userBehavior: UserBehavior;
  userSegment: PersonalizationSegment;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  trackBehavior: (action: string, data: any) => void;
  getPersonalizedContent: (contentType: string) => Promise<any[]>;
  isPersonalized: boolean;
  // New Compass Starter methods
  personalizeSDK: any;
  initializePersonalization: () => Promise<boolean>;
  setPersonalizeAttributes: (attributes: Record<string, any>) => Promise<void>;
  triggerPersonalizeEvent: (eventName: string, data?: any) => Promise<void>;
}

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

// Default preferences for new users
const defaultPreferences: UserPreferences = {
  favoriteGenres: [],
  readingLevel: 'intermediate',
  priceRange: { min: 0, max: 1000 },
  preferredAuthors: [],
  readingGoals: 2,
  preferredFormats: ['physical'],
  ageGroup: 'adult',
  languages: ['English'],
};

// Default behavior tracking
const defaultBehavior: UserBehavior = {
  viewedBooks: [],
  viewedGenres: [], // Initialize empty array for genre tracking
  searchHistory: [],
  purchaseHistory: [],
  timeOnPage: {},
  clickPatterns: {},
  sessionCount: 0,
  lastVisit: new Date(),
};

export function PersonalizationProvider({ children }: { children: React.ReactNode }) {
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(defaultPreferences);
  const [userBehavior, setUserBehavior] = useState<UserBehavior>(defaultBehavior);
  const [userSegment, setUserSegment] = useState<PersonalizationSegment>('new_user');
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [recentEvents, setRecentEvents] = useState<Set<string>>(new Set()); // Track recent events
  const [personalizeSDK, setPersonalizeSDK] = useState<any>(null);

  // Initialize Contentstack Personalize SDK on mount
  useEffect(() => {
    initializePersonalization();
  }, []);

  // Load user data from localStorage on mount and listen for restoration events
  useEffect(() => {
    const loadPersonalizationData = () => {
      const savedPreferences = localStorage.getItem('user-preferences');
      const savedBehavior = localStorage.getItem('user-behavior');
      
      if (savedPreferences) {
        try {
          const prefs = JSON.parse(savedPreferences);
          setUserPreferences(prefs);
          setIsPersonalized(true);
          console.log('🔄 Loaded user preferences:', prefs.favoriteGenres);
        } catch (error) {
          console.error('Error loading preferences:', error);
        }
      }
      
      if (savedBehavior) {
        try {
          const behavior = JSON.parse(savedBehavior);
          setUserBehavior(behavior);
          setIsPersonalized(true);
          console.log('🔄 Loaded user behavior:', {
            viewedBooks: behavior.viewedBooks?.length || 0,
            viewedGenres: behavior.viewedGenres || [],
            sessionCount: behavior.sessionCount || 1
          });
        } catch (error) {
          console.error('Error loading behavior:', error);
        }
      } else {
        // Initialize session for new users
        console.log('🆕 NEW SESSION: Initializing user session');
        setUserBehavior(prev => ({
          ...prev,
          sessionCount: 1,
          lastVisit: new Date(),
        }));
      }
    };

    // Load data on mount
    loadPersonalizationData();

    // Listen for user personalization restoration events
    const handlePersonalizationRestored = (event: CustomEvent) => {
      console.log('🎯 User personalization restored - reloading data');
      loadPersonalizationData();
      
      // Trigger recommendations refresh
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('personalizedRecommendationsRefresh', {
          detail: { source: 'user_restoration', userId: event.detail.userId }
        }));
      }, 500);
    };

    window.addEventListener('userPersonalizationRestored', handlePersonalizationRestored as EventListener);

    return () => {
      window.removeEventListener('userPersonalizationRestored', handlePersonalizationRestored as EventListener);
    };
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('user-preferences', JSON.stringify(userPreferences));
    localStorage.setItem('user-behavior', JSON.stringify(userBehavior));
    
    // Update user segment based on behavior and preferences
    updateUserSegment();
    
    // Update Contentstack Personalize attributes
    if (personalizeSDK) {
      updatePersonalizeAttributes();
    }
  }, [userPreferences, userBehavior, personalizeSDK]);

  // Initialize Contentstack Personalize SDK (Compass Starter approach)
  const initializePersonalization = async (): Promise<boolean> => {
    console.group('🎯 CONTENTSTACK PERSONALIZE INITIALIZATION');
    
    try {
      console.log('🚀 Attempting to initialize Personalize SDK...');
      const initialized = await personalizeService.initialize();
      
      console.log('📊 Initialization Result:', initialized);
      console.log('📊 PersonalizeService Status:', personalizeService.getInitializationStatus());
      console.log('📊 PersonalizeService isReady:', personalizeService.isReady());
      
      if (initialized) {
        setPersonalizeSDK(personalizeService);
        console.log('✅ Personalize SDK initialized and stored in context');
        console.log('🎯 PersonalizeSDK object set:', personalizeService);
        
        // Set initial attributes based on current user state
        await updatePersonalizeAttributes();
        
        console.groupEnd();
        return true;
      } else {
        console.warn('⚠️ Personalize SDK initialization failed');
        console.warn('⚠️ This usually means environment variables are missing:');
        console.warn('⚠️ - CONTENTSTACK_PERSONALIZE_PROJECT_UID');
        console.warn('⚠️ - CONTENTSTACK_PERSONALIZE_EDGE_API_URL');
        console.warn('⚠️ Continuing with fallback approach...');
        console.groupEnd();
        return false;
      }
    } catch (error) {
      console.error('❌ Personalize initialization error:', error);
      console.error('❌ Error details:', (error as Error).message, (error as Error).stack);
      console.groupEnd();
      return false;
    }
  };

  // Helper function for direct API calls with keepalive
  const sendPersonalizeDataDirect = async (endpoint: string, data: any): Promise<void> => {
    const projectUid = process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID;
    const edgeApiUrl = process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL;
    
    if (!projectUid || !edgeApiUrl) {
      throw new Error('Missing Personalize configuration for direct API call');
    }

    const url = `${edgeApiUrl}/${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CS-Personalize-Project-Uid': projectUid,
      },
      body: JSON.stringify(data),
      keepalive: true, // Prevents cancellation during page navigation
    });

    if (!response.ok) {
      throw new Error(`Direct API call failed: ${response.status} ${response.statusText}`);
    }
  };

  // SIMPLIFIED: Only set book_genre attribute when needed
  const updatePersonalizeAttributes = async () => {
    if (!personalizeSDK || !personalizeSDK.isReady || !personalizeSDK.isReady()) {
      console.warn('⚠️ Personalize SDK not ready for attribute updates');
      return;
    }

    try {
      console.log('🎯 SIMPLIFIED: Skipping bulk attribute updates - only book_genre sent on book clicks');
      // NOTE: book_genre is now ONLY sent via BookCard clicks, not here
      // This prevents duplicate/unwanted attributes
    } catch (error) {
      console.error('❌ Failed to update Personalize attributes via SDK:', error);
      console.groupEnd();
    }
  };

  // Set custom personalize attributes (public method) using SDK
  const setPersonalizeAttributes = async (attributes: Record<string, any>): Promise<void> => {
    if (!personalizeSDK || !personalizeSDK.isReady || !personalizeSDK.isReady()) {
      console.warn('⚠️ Personalize SDK not available for setting custom attributes');
      
      // Fallback: Try direct API call with keepalive
      try {
        await sendPersonalizeDataDirect('user-attributes', attributes);
        console.log('✅ Attributes sent via direct API call');
        return;
      } catch (directError) {
        console.error('❌ Direct API call also failed:', directError);
        throw new Error('Personalize SDK not ready and direct call failed');
      }
    }

    try {
      console.log('🎯 Setting custom Personalize attributes via SDK:', attributes);
      
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Attribute request timeout')), 3000);
      });
      
      const attributePromise = personalizeSDK.setUserAttributes(attributes);
      
      await Promise.race([attributePromise, timeoutPromise]);
      console.log('✅ Custom attributes set successfully via SDK');
    } catch (error) {
      console.error('❌ Failed to set custom attributes via SDK:', error);
      
      // Fallback to direct API call
      try {
        await sendPersonalizeDataDirect('user-attributes', attributes);
        console.log('✅ Attributes sent via fallback direct API call');
      } catch (directError) {
        console.error('❌ Fallback direct API call also failed:', directError);
        throw error;
      }
    }
  };

  // Trigger personalize events (public method) using SDK
  const triggerPersonalizeEvent = async (eventName: string, data?: any): Promise<void> => {
    if (!personalizeSDK || !personalizeSDK.isReady || !personalizeSDK.isReady()) {
      console.warn('⚠️ Personalize SDK not available for event:', eventName);
      
      // Fallback: Try direct API call with keepalive
      try {
        await sendPersonalizeDataDirect('events', { 
          event: eventName, 
          data: data || {},
          timestamp: new Date().toISOString()
        });
        console.log('✅ Event sent via direct API call');
        return;
      } catch (directError) {
        console.error('❌ Direct event API call also failed:', directError);
        throw new Error('Personalize SDK not ready and direct call failed');
      }
    }

    try {
      console.log('📊 Triggering Personalize event via SDK:', eventName, data);
      
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Event request timeout')), 3000);
      });
      
      const eventPromise = personalizeSDK.triggerEvent(eventName);
      
      await Promise.race([eventPromise, timeoutPromise]);
      console.log('✅ Event triggered successfully via SDK');
    } catch (error) {
      console.error('❌ Failed to trigger event via SDK:', error);
      
      // Fallback to direct API call
      try {
        await sendPersonalizeDataDirect('events', { 
          event: eventName, 
          data: data || {},
          timestamp: new Date().toISOString()
        });
        console.log('✅ Event sent via fallback direct API call');
      } catch (directError) {
        console.error('❌ Fallback direct event API call also failed:', directError);
        throw error;
      }
    }
  };

  const updateUserSegment = () => {
    const { sessionCount, purchaseHistory, viewedBooks } = userBehavior;
    const { favoriteGenres, priceRange } = userPreferences;

    console.group(`🏷️ USER SEGMENT UPDATE`);
    console.log(`📊 Current Data:`, {
      sessionCount,
      purchaseHistoryLength: purchaseHistory.length,
      viewedBooksLength: viewedBooks.length,
      favoriteGenres,
      totalSpent: purchaseHistory.length * 500 // Estimated
    });
    console.log(`🏷️ Previous Segment:`, userSegment);

    let newSegment: PersonalizationSegment;

    // Enhanced segmentation logic - prioritize genre interest over session count
    if (favoriteGenres.includes('War') && viewedBooks.length >= 2) {
      // Specific War enthusiast segment - prioritize this over new_user
      newSegment = 'war_enthusiast';
      console.log(`🎖️ Assigned: WAR ENTHUSIAST (War interest + ${viewedBooks.length} views)`);
    } else if (favoriteGenres.includes('Fantasy') && viewedBooks.length >= 1) {
      // Fantasy enthusiast segment - single book view is enough for Fantasy
      newSegment = 'genre_enthusiast';
      console.log(`🧙‍♂️ Assigned: FANTASY ENTHUSIAST (Fantasy interest + ${viewedBooks.length} views)`);
    } else if (favoriteGenres.includes('War') || favoriteGenres.includes('Thrillers')) {
      // General genre enthusiast for War/Thriller interest
      newSegment = 'genre_enthusiast';
      console.log(`🎭 Assigned: GENRE ENTHUSIAST (War/Thriller interest)`);
    } else if (favoriteGenres.length >= 1 && viewedBooks.length >= 1) {
      // Any user with at least one favorite genre and book view is a genre enthusiast
      newSegment = 'genre_enthusiast';
      console.log(`🎭 Assigned: GENRE ENTHUSIAST (${favoriteGenres.join(', ')} interest + ${viewedBooks.length} views)`);
    } else if (sessionCount === 0) {
      newSegment = 'new_user';
      console.log(`👋 Assigned: NEW USER (session count = 0)`);
    } else if (purchaseHistory.length > 10) {
      newSegment = 'high_value_customer';
      console.log(`💎 Assigned: HIGH VALUE CUSTOMER (${purchaseHistory.length} purchases)`);
    } else if (purchaseHistory.length > 5) {
      newSegment = 'frequent_reader';
      console.log(`📚 Assigned: FREQUENT READER (${purchaseHistory.length} purchases)`);
    } else if (favoriteGenres.length > 3) {
      newSegment = 'genre_enthusiast';
      console.log(`🎭 Assigned: GENRE ENTHUSIAST (${favoriteGenres.length} favorite genres)`);
    } else if (priceRange.max < 300) {
      newSegment = 'price_conscious';
      console.log(`💰 Assigned: PRICE CONSCIOUS (max budget: ₹${priceRange.max})`);
    } else if (viewedBooks.length > 20 && purchaseHistory.length === 0) {
      newSegment = 'at_risk_customer';
      console.log(`⚠️ Assigned: AT RISK CUSTOMER (${viewedBooks.length} views, no purchases)`);
    } else if (viewedBooks.length > 20) {
      newSegment = 'casual_browser';
      console.log(`🚶 Assigned: CASUAL BROWSER (${viewedBooks.length} viewed books)`);
    } else if (purchaseHistory.length > 0) {
      newSegment = 'returning_customer';
      console.log(`🔄 Assigned: RETURNING CUSTOMER (${purchaseHistory.length} purchases)`);
    } else if (viewedBooks.length >= 1) {
      // If user has viewed at least 1 book, they're no longer completely new
      newSegment = 'casual_browser';
      console.log(`🚶 Assigned: CASUAL BROWSER (${viewedBooks.length} viewed books)`);
    } else {
      newSegment = 'new_user';
      console.log(`👋 Assigned: NEW USER (no activity yet)`);
    }

    if (newSegment !== userSegment) {
      console.log(`🔄 SEGMENT CHANGED: ${userSegment} → ${newSegment}`);
      setUserSegment(newSegment);
      
      // Track segment change event
      trackSegmentChange(userSegment, newSegment);
    } else {
      console.log(`✅ Segment unchanged: ${userSegment}`);
    }
    
    console.groupEnd();
  };

  // Track segment changes for analytics
  const trackSegmentChange = (oldSegment: PersonalizationSegment, newSegment: PersonalizationSegment) => {
    console.log(`📈 ANALYTICS: Segment transition ${oldSegment} → ${newSegment}`);
    
    // Send segment change event to personalization API
    sendPersonalizeEvent('segment_changed', {
      old_segment: oldSegment,
      new_segment: newSegment,
      trigger_data: {
        viewed_books: userBehavior.viewedBooks.length,
        purchases: userBehavior.purchaseHistory.length,
        favorite_genres: userPreferences.favoriteGenres,
        session_count: userBehavior.sessionCount
      },
      timestamp: new Date().toISOString(),
    });
  };

  const updatePreferences = (prefs: Partial<UserPreferences>) => {
    setUserPreferences(prev => ({ ...prev, ...prefs }));
    setIsPersonalized(true);
  };

  const trackBehavior = async (action: string, data: any) => {
    // Create a unique event key to prevent duplicates
    const eventKey = `${action}_${data.bookId || data.query || Date.now()}_${Date.now()}`;
    const shortEventKey = `${action}_${data.bookId || data.query}`;
    
    console.group(`🎯 PERSONALIZATION: ${action.toUpperCase()} Event`);
    console.log(`📊 Event Data:`, data);
    console.log(`👤 Current User Segment:`, userSegment);
    console.log(`📚 Current Favorite Genres:`, userPreferences.favoriteGenres);
    
    // Check if we've seen this exact event recently (within last 5 seconds)
    if (recentEvents.has(shortEventKey)) {
      console.warn(`🚫 DUPLICATE EVENT BLOCKED: ${action} for:`, data.bookId || data.query);
      console.groupEnd();
      return;
    }
    
    console.log(`✅ Event allowed - processing...`);
    
    // Add to recent events and clean up after 5 seconds
    setRecentEvents(prev => {
      const newSet = new Set(prev);
      newSet.add(shortEventKey);
      
      // Clean up after 5 seconds
      setTimeout(() => {
        setRecentEvents(current => {
          const cleanSet = new Set(current);
          cleanSet.delete(shortEventKey);
          return cleanSet;
        });
      }, 5000);
      
      return newSet;
    });
    
    setUserBehavior(prev => {
      const updated = { ...prev };
      
      switch (action) {
        case 'view_book':
          updated.viewedBooks = Array.from(new Set([...prev.viewedBooks, data.bookId]));
          
          // Track viewed genres for Lytics personalization
          if (data.genre) {
            updated.viewedGenres = Array.from(new Set([...prev.viewedGenres, data.genre]));
            console.log(`📖 Updated viewed genres for Lytics:`, updated.viewedGenres);
          }
          
          console.log(`📖 Updated viewed books:`, updated.viewedBooks);
          
          // SIMPLIFIED: Skip auto-learning to prevent duplicate genres
          // NOTE: We're only sending book_genre on individual clicks now
          console.log(`📖 Book viewed: ${data.genre} (skipping auto-learning to prevent duplicates)`);
          
          // Mark user as personalized when they view books
          setIsPersonalized(true);
          
          // SIMPLIFIED: Skip all Personalize SDK calls from trackBehavior
          // NOTE: Only BookCard sends book_genre attribute now
          console.log(`🔄 SIMPLIFIED: Skipping all Personalize SDK calls from trackBehavior`);
          console.log(`📝 Note: Only BookCard handles book_genre attribute now`);
          
          
          break;
        case 'search':
          updated.searchHistory = [...prev.searchHistory, data.query].slice(-20); // Keep last 20 searches
          console.log(`🔍 Updated search history:`, updated.searchHistory);
          break;
        case 'purchase':
          updated.purchaseHistory = [...prev.purchaseHistory, data.bookId];
          console.log(`🛒 Updated purchase history:`, updated.purchaseHistory);
          
          // Send purchase event to Contentstack Personalize using SDK
          console.log(`🚀 Sending book_purchased event to Contentstack Personalize...`);
          
          // Use SDK for purchase events (async operations)
          (async () => {
            try {
              if (personalizeSDK && personalizeSDK.isReady && personalizeSDK.isReady()) {
                await personalizeSDK.triggerEvent('book_purchased', {
                  book_id: data.bookId,
                  book_title: data.title,
                  book_price: data.price,
                  timestamp: new Date().toISOString(),
                  user_segment: userSegment,
                });
                console.log(`✅ book_purchased event sent via Personalize SDK`);
              } else {
                console.warn(`⚠️ Personalize SDK not available for purchase event`);
                console.log(`📊 book_purchased event data:`, {
                  book_id: data.bookId,
                  book_title: data.title,
                  book_price: data.price,
                  timestamp: new Date().toISOString(),
                  user_segment: userSegment,
                });
              }
            } catch (error) {
              console.error('❌ Error sending book_purchased event via SDK:', error);
            }
          })();
          
          break;
        case 'time_on_page':
          updated.timeOnPage[data.page] = (updated.timeOnPage[data.page] || 0) + data.time;
          console.log(`⏱️ Updated time on page:`, updated.timeOnPage);
          break;
        case 'click':
          updated.clickPatterns[data.element] = (updated.clickPatterns[data.element] || 0) + 1;
          console.log(`👆 Updated click patterns:`, updated.clickPatterns);
          break;
        case 'session_start':
          updated.sessionCount += 1;
          updated.lastVisit = new Date();
          console.log(`🆕 Session started - count:`, updated.sessionCount);
          break;
        case 'view_recommendations':
          console.log(`👁️ Viewed recommendations:`, data);
          break;
      }
      
      console.log(`📊 UPDATED USER BEHAVIOR:`, updated);
      console.groupEnd();
      return updated;
    });
  };

  // Function to send events using Contentstack Personalize SDK (not direct API calls)
  const sendPersonalizeEvent = async (eventName: string, eventData: any) => {
    try {
      console.log(`📊 Sending ${eventName} event via Personalize SDK:`, eventData);
      
      if (personalizeSDK && personalizeSDK.isReady && personalizeSDK.isReady()) {
        // Use SDK's triggerEvent method
        await personalizeSDK.triggerEvent(eventName, eventData);
        console.log(`✅ ${eventName} event sent successfully via SDK`);
      } else {
        console.warn(`⚠️ Personalize SDK not available for ${eventName} event`);
        console.log(`📊 Event data that would have been sent:`, {
          event_name: eventName,
          event_data: eventData,
          user_segment: userSegment,
          user_preferences: userPreferences,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error(`❌ Error sending ${eventName} event via SDK:`, error);
    }
  };

  const getPersonalizedContent = async (contentType: string): Promise<any[]> => {
    try {
      console.group('🎯 GETTING PERSONALIZED CONTENT VIA SDK');
      console.log('📊 Content Type:', contentType);
      console.log('👤 User Segment:', userSegment);
      console.log('🎭 Personalize SDK Available:', personalizeSDK ? 'Yes' : 'No');
      
      // First, try to get variants from the SDK
      let variantData = {};
      if (personalizeSDK && personalizeSDK.isReady && personalizeSDK.isReady()) {
        try {
          variantData = personalizeSDK.getVariants() || {};
          console.log('🎭 Variants from SDK:', variantData);
        } catch (error) {
          console.warn('⚠️ Failed to get variants from SDK:', error);
        }
      }
      
      // Get personalization rules based on content type
      const personalizationRules = getPersonalizationRules(contentType);
      console.log('📋 Personalization Rules:', personalizationRules);
      
      // Call the personalized content API with SDK variant data
      const response = await fetch('/api/personalized-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType,
          userSegment,
          preferences: userPreferences,
          behavior: userBehavior,
          rules: personalizationRules,
          variants: variantData, // Include SDK variants
          sdkAttributes: personalizeSDK && personalizeSDK.isReady && personalizeSDK.isReady() 
            ? personalizeSDK.getAttributes() 
            : {},
        }),
      });
      
      console.groupEnd();
      
      if (response.ok) {
        const content = await response.json();
        console.log('✅ Personalized content retrieved:', content);
        return content;
      }
      
      // Fallback to generic content
      console.warn('⚠️ Failed to get personalized content, using fallback');
      return [];
    } catch (error) {
      console.error('❌ Error fetching personalized content:', error);
      console.groupEnd();
      return [];
    }
  };

  const getPersonalizationRules = (contentType: string) => {
    const rules = {
      homepage_hero: {
        segments: {
          new_user: { priority: ['bestsellers', 'popular'] },
          frequent_reader: { priority: ['new_arrivals', 'recommendations'] },
          genre_enthusiast: { priority: ['genre_specific', 'similar_authors'] },
          price_conscious: { priority: ['discounted', 'under_budget'] },
        }
      },
      book_recommendations: {
        factors: {
          genre_weight: 0.4,
          author_weight: 0.3,
          price_weight: 0.2,
          popularity_weight: 0.1,
        }
      },
      promotional_banners: {
        segments: {
          new_user: { show: 'welcome_discount' },
          returning_customer: { show: 'loyalty_rewards' },
          price_conscious: { show: 'sale_items' },
        }
      }
    };
    
    return rules[contentType as keyof typeof rules] || {};
  };

  return (
    <PersonalizationContext.Provider value={{
      userPreferences,
      userBehavior,
      userSegment,
      updatePreferences,
      trackBehavior,
      getPersonalizedContent,
      isPersonalized,
      // New Compass Starter methods
      personalizeSDK,
      initializePersonalization,
      setPersonalizeAttributes,
      triggerPersonalizeEvent,
    }}>
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalization() {
  const context = useContext(PersonalizationContext);
  if (context === undefined) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
}

// Utility functions for personalization
export const PersonalizationUtils = {
  // Get genre preference score
  getGenreScore: (genre: string, preferences: UserPreferences): number => {
    return preferences.favoriteGenres.includes(genre) ? 1 : 0;
  },

  // Calculate book relevance score
  calculateRelevanceScore: (book: any, preferences: UserPreferences, behavior: UserBehavior): number => {
    let score = 0;
    
    // Genre matching (40% weight)
    if (preferences.favoriteGenres.includes(book.genre)) {
      score += 0.4;
    }
    
    // Author preference (30% weight)
    if (preferences.preferredAuthors.includes(book.author)) {
      score += 0.3;
    }
    
    // Price range (20% weight)
    if (book.price >= preferences.priceRange.min && book.price <= preferences.priceRange.max) {
      score += 0.2;
    }
    
    // Behavioral factors (10% weight)
    if (behavior.viewedBooks.includes(book.id)) {
      score += 0.05;
    }
    if (behavior.searchHistory.some(search => book.title.toLowerCase().includes(search.toLowerCase()))) {
      score += 0.05;
    }
    
    return score;
  },

  // Get time-based recommendations
  getTimeBasedRecommendations: (preferences: UserPreferences): string[] => {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return ['motivational', 'business', 'self-help'];
    } else if (hour < 18) {
      return ['fiction', 'romance', 'mystery'];
    } else {
      return ['thriller', 'horror', 'sci-fi'];
    }
  },
};
