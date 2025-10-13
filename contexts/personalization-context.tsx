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

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('user-preferences');
    const savedBehavior = localStorage.getItem('user-behavior');
    
    if (savedPreferences) {
      try {
        const prefs = JSON.parse(savedPreferences);
        setUserPreferences(prefs);
        setIsPersonalized(true);
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    }
    
    if (savedBehavior) {
      try {
        const behavior = JSON.parse(savedBehavior);
        setUserBehavior(behavior);
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

  // Update Contentstack Personalize attributes based on user state using SDK
  const updatePersonalizeAttributes = async () => {
    if (!personalizeSDK || !personalizeSDK.isReady || !personalizeSDK.isReady()) {
      console.warn('⚠️ Personalize SDK not ready for attribute updates');
      return;
    }

    try {
      console.group('🎯 UPDATING PERSONALIZE ATTRIBUTES VIA SDK');
      
      const attributes: Record<string, any> = {
        user_segment: userSegment,
        personalization_level: isPersonalized ? 'active' : 'basic',
        session_count: userBehavior.sessionCount,
        viewed_books_count: userBehavior.viewedBooks.length,
        purchase_count: userBehavior.purchaseHistory.length,
      };

      // Add genre preferences
      if (userPreferences.favoriteGenres.length > 0) {
        attributes.favorite_genres = userPreferences.favoriteGenres.join(',');
        attributes.primary_genre = userPreferences.favoriteGenres[0];
        
        // Special handling for War genre (matching your setup)
        if (userPreferences.favoriteGenres.includes('War')) {
          attributes.war_interest = true;
          attributes.military_history_fan = true;
        }
      }

      // Add price preferences
      if (userPreferences.priceRange) {
        attributes.price_preference = userPreferences.priceRange.max > 500 ? 'premium' : 'budget';
        attributes.max_price_range = userPreferences.priceRange.max;
      }

      // Add reading behavior
      if (userBehavior.viewedBooks.length > 0) {
        attributes.last_viewed_book = userBehavior.viewedBooks[userBehavior.viewedBooks.length - 1];
        attributes.browsing_behavior = userBehavior.viewedBooks.length > 10 ? 'active_browser' : 'casual_browser';
      }

      console.log('📊 Setting Personalize attributes via SDK:', attributes);
      
      // Use SDK's set method instead of direct API call
      await personalizeSDK.setUserAttributes(attributes);
      console.log('✅ Personalize attributes updated successfully via SDK');
      
      console.groupEnd();
    } catch (error) {
      console.error('❌ Failed to update Personalize attributes via SDK:', error);
      console.groupEnd();
    }
  };

  // Set custom personalize attributes (public method) using SDK
  const setPersonalizeAttributes = async (attributes: Record<string, any>): Promise<void> => {
    if (!personalizeSDK || !personalizeSDK.isReady || !personalizeSDK.isReady()) {
      console.warn('⚠️ Personalize SDK not available for setting custom attributes');
      return;
    }

    try {
      console.log('🎯 Setting custom Personalize attributes via SDK:', attributes);
      await personalizeSDK.setUserAttributes(attributes);
      console.log('✅ Custom attributes set successfully via SDK');
    } catch (error) {
      console.error('❌ Failed to set custom attributes via SDK:', error);
    }
  };

  // Trigger personalize events (public method) using SDK
  const triggerPersonalizeEvent = async (eventName: string, data?: any): Promise<void> => {
    if (!personalizeSDK || !personalizeSDK.isReady || !personalizeSDK.isReady()) {
      console.warn('⚠️ Personalize SDK not available for event:', eventName);
      return;
    }

    try {
      console.log('📊 Triggering Personalize event via SDK:', eventName, data);
      await personalizeSDK.triggerEvent(eventName, data);
      console.log('✅ Event triggered successfully via SDK');
    } catch (error) {
      console.error('❌ Failed to trigger event via SDK:', error);
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
          console.log(`📖 Updated viewed books:`, updated.viewedBooks);
          
          // Auto-learn user preferences from viewed genres
          if (data.genre && !userPreferences.favoriteGenres.includes(data.genre)) {
            // If user has viewed 2+ books from same genre, add it to favorites
            const genreViewCount = updated.viewedBooks.filter(bookId => {
              // This is a simplified check - in a real app you'd track genre per book
              return data.genre; // For now, we'll add the genre after 1 view for demo
            }).length;
            
            if (genreViewCount >= 1) {
              console.log(`🎓 AUTO-LEARNING: Adding "${data.genre}" to favorite genres`);
              console.log(`📊 Genre view count for ${data.genre}:`, genreViewCount);
              
              setUserPreferences(prev => {
                const newPrefs = {
                  ...prev,
                  favoriteGenres: [...prev.favoriteGenres, data.genre].slice(0, 5) // Limit to 5 genres
                };
                console.log(`📚 NEW FAVORITE GENRES:`, newPrefs.favoriteGenres);
                return newPrefs;
              });
              
              // Mark user as personalized when we auto-learn preferences
              setIsPersonalized(true);
              console.log(`✅ User marked as personalized due to auto-learning`);
            }
          } else if (data.genre && userPreferences.favoriteGenres.includes(data.genre)) {
            console.log(`✅ Genre "${data.genre}" already in favorites:`, userPreferences.favoriteGenres);
          }
          
          // Mark user as personalized after any book view (even without auto-learning)
          if (!isPersonalized) {
            console.log('🎯 User now personalized after first book interaction');
            setIsPersonalized(true);
          }
          
          // Send book_viewed event to Contentstack Personalize (Enhanced Compass Starter approach)
          console.group(`🚀 BOOK_VIEWED EVENT PROCESSING`);
          console.log(`📊 Event Data:`, data);
          console.log(`🎯 Personalize SDK Status:`, personalizeSDK ? 'Available' : 'Not Available');
          console.log(`🏗️ Personalize SDK Object:`, personalizeSDK);
          
          // Use new Compass Starter SDK if available (async operations)
          (async () => {
            try {
              if (personalizeSDK && personalizeSDK.isReady && personalizeSDK.isReady()) {
                console.log(`✅ Using Personalize SDK to send book_viewed event...`);
                
                // First set book genre attributes using SDK
                await personalizeSDK.setBookGenreAttributes(data.genre, data.bookId);
                
                // Trigger the book_viewed event using SDK
                await personalizeSDK.triggerEvent('book_viewed', {
                  book_id: data.bookId,
                  book_title: data.title,
                  book_genre: data.genre,
                  book_author: data.author,
                  book_price: data.price,
                  timestamp: new Date().toISOString(),
                  user_segment: userSegment,
                  user_preferences: userPreferences,
                });
                console.log(`✅ book_viewed event sent via Personalize SDK`);
                
                // Set user attributes based on book type using SDK methods
                console.log(`🎯 Setting user attributes for book type: "${data.genre}"`);
                const attributeSuccess = await personalizeSDK.setBookTypeAttributes(data.genre, data.bookId);
                
                if (attributeSuccess) {
                  console.log(`✅ User attributes set successfully for genre: ${data.genre}`);
                } else {
                  console.warn(`⚠️ Failed to set user attributes for genre: ${data.genre}`);
                }
                
              } else {
                console.warn(`⚠️ Personalize SDK not available - logging event data instead`);
                console.log(`📊 book_viewed event that would have been sent:`, {
                  book_id: data.bookId,
                  book_title: data.title,
                  book_genre: data.genre,
                  book_author: data.author,
                  book_price: data.price,
                  timestamp: new Date().toISOString(),
                  user_segment: userSegment,
                  user_preferences: userPreferences,
                });
                
                console.log(`📊 User attributes that would have been set:`, {
                  [data.genre]: true,
                  [`reading_preference_${data.genre.toLowerCase()}`]: true,
                  'last_viewed_genre': data.genre.toLowerCase(),
                  'book_genre_interest': data.genre.toLowerCase(),
                  'last_viewed_book': data.bookId,
                  'last_viewed_book_type': data.genre.toLowerCase(),
                });
              }
            } catch (error) {
              console.error('❌ Error sending book_viewed event:', error);
              console.error('❌ Error details:', (error as Error).message, (error as Error).stack);
            } finally {
              console.groupEnd();
            }
          })();
          
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
