/**
 * Contentstack Personalize Service
 * Based on Compass Starter implementation
 * https://www.contentstack.com/docs/developers/sample-apps/build-a-website-using-contestack-compass-starter
 */

import Personalize from '@contentstack/personalize-edge-sdk';

// Personalize configuration interface
interface PersonalizeConfig {
  projectUid: string;
  edgeApiUrl: string;
  environment?: string;
  managementToken?: string;
}

// Personalize attributes interface
interface PersonalizeAttributes {
  [key: string]: string | number | boolean;
}

// Audience configuration interface
interface AudienceConfig {
  name: string;
  attributes: Array<{
    key: string;
    value: string | number | boolean;
  }>;
}

class PersonalizeService {
  private sdk: any = null;
  private config: PersonalizeConfig | null = null;
  private isInitialized = false;
  private userUid: string | null = null; // Track user UID for Edge API calls

  constructor() {
    this.initializeConfig();
  }

  /**
   * Initialize Personalize configuration from environment variables
   */
  private initializeConfig() {
    // Use NEXT_PUBLIC_ prefixed variables for client-side access
    const projectUid = process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID || 
                      process.env.CONTENTSTACK_PERSONALIZE_PROJECT_UID;
    const edgeApiUrl = process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL || 
                      process.env.CONTENTSTACK_PERSONALIZE_EDGE_API_URL || 
                      'https://personalize-api.contentstack.com/v3';


    console.log('🔍 Environment Variables Check:');
    console.log('  - NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID:', process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID ? '✅ Found' : '❌ Missing');
    console.log('  - CONTENTSTACK_PERSONALIZE_PROJECT_UID:', process.env.CONTENTSTACK_PERSONALIZE_PROJECT_UID ? '✅ Found' : '❌ Missing');
    console.log('  - NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL:', process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL ? '✅ Found' : '❌ Missing');
    console.log('  - CONTENTSTACK_PERSONALIZE_EDGE_API_URL:', process.env.CONTENTSTACK_PERSONALIZE_EDGE_API_URL ? '✅ Found' : '❌ Missing');
    console.log('  - NEXT_PUBLIC_CONTENTSTACK_MANAGEMENT_TOKEN:', process.env.NEXT_PUBLIC_CONTENTSTACK_MANAGEMENT_TOKEN ? '✅ Found' : '❌ Missing');
    console.log('  - CONTENTSTACK_MANAGEMENT_TOKEN:', process.env.CONTENTSTACK_MANAGEMENT_TOKEN ? '✅ Found' : '❌ Missing');

    if (projectUid && edgeApiUrl) {
      this.config = {
        projectUid,
        edgeApiUrl,
        environment: process.env.CONTENTSTACK_ENVIRONMENT || process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT || 'development'
      };
      console.log('🎯 Personalize Config Initialized:', {
        projectUid: this.config.projectUid.substring(0, 8) + '...',
        edgeApiUrl: this.config.edgeApiUrl,
        environment: this.config.environment
      });
    } else {
      console.error('❌ Personalize configuration missing!');
      console.error('Please set these environment variables:');
      console.error('  - NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID (for client-side)');
      console.error('  - NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL (for client-side)');
      console.error('  - NEXT_PUBLIC_CONTENTSTACK_MANAGEMENT_TOKEN (for client-side)');
      console.error('Or:');
      console.error('  - CONTENTSTACK_PERSONALIZE_PROJECT_UID (for server-side)');
      console.error('  - CONTENTSTACK_PERSONALIZE_EDGE_API_URL (for server-side)');
      console.error('  - CONTENTSTACK_MANAGEMENT_TOKEN (for server-side)');
      console.error('Missing values:', {
        projectUid: projectUid ? '✅' : '❌',
        edgeApiUrl: edgeApiUrl ? '✅' : '❌',
      });
    }
  }

  /**
   * Initialize Personalize SDK
   */
  async initialize(): Promise<boolean> {
    if (!this.config) {
      console.error('❌ Personalize configuration not available');
      return false;
    }

    if (this.isInitialized) {
      console.log('✅ Personalize SDK already initialized');
      return true;
    }

    try {
      console.log('🚀 Initializing Contentstack Personalize SDK...');
      console.log('🔑 Using authentication with management token');
      
      // Initialize the Personalize SDK
      this.sdk = await Personalize.init(this.config.projectUid);

      this.isInitialized = true;
      console.log('✅ Personalize SDK initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Personalize SDK:', error);
      console.error('❌ This might be due to invalid credentials or network issues');
      return false;
    }
  }

  /**
   * Set personalization attributes (keeps the original interface)
   */
  async setAttributes(attributes: PersonalizeAttributes): Promise<void> {
    await this.setUserAttributes(attributes);
  }

  /**
   * Get current personalization attributes (legacy method)
   */
  getCurrentAttributes(): PersonalizeAttributes {
    return this.getAttributes();
  }

  /**
   * Get variants for personalized content
   */
  getVariants(): Record<string, any> {
    if (!this.sdk || !this.isInitialized) {
      console.warn('⚠️ Personalize SDK not initialized');
      return {};
    }

    try {
      const variants = this.sdk.getVariants();
      console.log('🎭 Current variants:', variants);
      return variants || {};
    } catch (error) {
      console.error('❌ Failed to get variants:', error);
      return {};
    }
  }

  /**
   * Trigger impression event for A/B testing
   */
  async triggerImpression(experienceId: string): Promise<void> {
    if (!this.sdk || !this.isInitialized) {
      console.warn('⚠️ Personalize SDK not initialized');
      return;
    }

    try {
      console.log('📊 Triggering impression for experience:', experienceId);
      await this.sdk.triggerImpression(experienceId);
      console.log('✅ Impression triggered successfully');
    } catch (error) {
      console.error('❌ Failed to trigger impression:', error);
    }
  }

  /**
   * Trigger conversion event
   */
  async triggerEvent(eventName: string, eventData?: any): Promise<void> {
    if (!this.sdk || !this.isInitialized) {
      console.warn('⚠️ Personalize SDK not initialized');
      return;
    }

    try {
      console.log('📊 Triggering event:', eventName, eventData);
      await this.sdk.triggerEvent(eventName, eventData);
      console.log('✅ Event triggered successfully');
    } catch (error) {
      console.error('❌ Failed to trigger event:', error);
    }
  }

  /**
   * Set attributes for specific audience (Compass Starter pattern)
   */
  async setAudienceAttributes(audienceConfig: AudienceConfig): Promise<void> {
    const attributes: PersonalizeAttributes = {};
    
    audienceConfig.attributes.forEach(attr => {
      attributes[attr.key] = attr.value;
    });

    console.log(`🎭 Setting attributes for audience: ${audienceConfig.name}`, attributes);
    await this.setAttributes(attributes);
  }

  /**
   * Set attributes for book genre interest (specific to your books app)
   */
  async setBookGenreAttributes(genre: string, bookId?: string): Promise<void> {
    const attributes: PersonalizeAttributes = {
      book_genre: genre.toLowerCase(),
      reading_preference: genre.toLowerCase(),
      last_viewed_genre: genre.toLowerCase()
    };

    if (bookId) {
      attributes.last_viewed_book = bookId;
    }

    console.log('📚 Setting book genre attributes:', attributes);
    await this.setAttributes(attributes);
  }

  /**
   * Set user segment attributes
   */
  async setUserSegmentAttributes(segment: string, preferences?: any): Promise<void> {
    const attributes: PersonalizeAttributes = {
      user_segment: segment,
      personalization_level: 'active'
    };

    if (preferences) {
      if (preferences.favoriteGenres?.length > 0) {
        attributes.favorite_genres = preferences.favoriteGenres.join(',');
      }
      if (preferences.priceRange) {
        attributes.price_preference = preferences.priceRange.max > 500 ? 'premium' : 'budget';
      }
    }

    console.log('👤 Setting user segment attributes:', attributes);
    await this.setAttributes(attributes);
  }

  /**
   * Get initialization status
   */
  getInitializationStatus(): 'success' | 'failed' | 'pending' {
    if (this.isInitialized) return 'success';
    if (this.config) return 'pending';
    return 'failed';
  }

  /**
   * Get or generate user UID for Personalize Edge API calls
   */
  private getUserUid(): string {
    if (this.userUid) return this.userUid;
    
    // Try to get from localStorage first
    if (typeof window !== 'undefined') {
      const storedUid = localStorage.getItem('contentstack_personalize_user_uid');
      if (storedUid) {
        this.userUid = storedUid;
        return storedUid;
      }
    }
    
    // Generate new UID
    const newUid = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.userUid = newUid;
    
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('contentstack_personalize_user_uid', newUid);
    }
    
    console.log('🆔 Generated new Personalize User UID:', newUid);
    return newUid;
  }

  /**
   * Set user attributes via Contentstack Personalize SDK (cleaner approach)
   * Uses the SDK's built-in set() method instead of direct API calls
   */
  async setUserAttributes(attributes: PersonalizeAttributes): Promise<boolean> {
    if (!this.sdk || !this.isInitialized) {
      console.warn('⚠️ Personalize SDK not initialized');
      return false;
    }

    try {
      console.group('🎯 SETTING USER ATTRIBUTES VIA SDK');
      console.log('📊 Attributes to set:', attributes);
      
      // Use the SDK's built-in set() method
      await this.sdk.set(attributes);
      
      console.log('✅ User attributes set successfully via SDK');
      console.groupEnd();
      return true;
    } catch (error) {
      console.error('❌ Error setting user attributes via SDK:', error);
      console.groupEnd();
      return false;
    }
  }

  /**
   * Set book-type-based attributes dynamically using SDK
   * For example: if book type is "War", set "War": true
   */
  async setBookTypeAttributes(bookType: string, bookId?: string): Promise<boolean> {
    if (!bookType) return false;

    const attributes: PersonalizeAttributes = {
      // Set the book type as a boolean attribute (e.g., "War": true)
      [bookType]: true,
      
      // Set reading preference  
      [`reading_preference_${bookType.toLowerCase()}`]: true,
      
      // Track last viewed genre
      'last_viewed_genre': bookType.toLowerCase(),
      
      // Set genre-specific attributes for better targeting
      'book_genre_interest': bookType.toLowerCase(),
      'current_genre_focus': bookType.toLowerCase(),
    };

    // Add genre-specific attributes for enhanced personalization
    if (bookType.toLowerCase() === 'war') {
      attributes.war_enthusiast = true;
      attributes.military_history_interest = true;
      attributes.historical_content_preference = 'military';
    } else if (bookType.toLowerCase() === 'fantasy') {
      attributes.fantasy_lover = true;
      attributes.fictional_content_preference = 'fantasy';
      attributes.imaginative_content_preference = true;
    } else if (bookType.toLowerCase() === 'mystery') {
      attributes.mystery_fan = true;
      attributes.suspense_preference = true;
      attributes.thriller_interest = true;
    } else if (bookType.toLowerCase() === 'romance') {
      attributes.romance_reader = true;
      attributes.emotional_content_preference = true;
    }

    if (bookId) {
      attributes['last_viewed_book'] = bookId;
      attributes['last_viewed_book_type'] = bookType.toLowerCase();
    }

    console.log(`📚 Setting book type attributes for genre "${bookType}" using SDK:`, attributes);
    return await this.setUserAttributes(attributes);
  }

  /**
   * Get current user attributes from SDK
   */
  getAttributes(): PersonalizeAttributes {
    if (!this.sdk || !this.isInitialized) {
      console.warn('⚠️ Personalize SDK not initialized');
      return {};
    }

    try {
      const attributes = this.sdk.get();
      console.log('📊 Current user attributes from SDK:', attributes);
      return attributes || {};
    } catch (error) {
      console.error('❌ Error getting user attributes from SDK:', error);
      return {};
    }
  }

  /**
   * Check if SDK is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.sdk !== null;
  }
}

// Export singleton instance
export const personalizeService = new PersonalizeService();

// Export utility functions
export const PersonalizeUtils = {
  /**
   * Remove special characters from string (Compass Starter utility)
   */
  removeSpecialChar: (str: string): string => {
    return str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  },

  /**
   * Get personalize attributes from audience config
   */
  getPersonalizeAttribute: (audiences: any, criteria: string): PersonalizeAttributes => {
    if (!audiences?.group) return {};

    const matchingAudience = audiences.group.find((audience: AudienceConfig) => 
      PersonalizeUtils.removeSpecialChar(audience.name) === criteria
    );

    if (!matchingAudience) return {};

    const attributes: PersonalizeAttributes = {};
    matchingAudience.attributes.forEach((attr: any) => {
      attributes[attr.key] = attr.value;
    });

    return attributes;
  },

  /**
   * Deserialize variant IDs for Contentstack Delivery SDK
   */
  deserializeVariantIds: (personalizeSDK: any): string[] => {
    if (!personalizeSDK) return [];
    
    try {
      const variants = personalizeSDK.getVariants();
      return Object.keys(variants || {});
    } catch (error) {
      console.error('❌ Failed to deserialize variant IDs:', error);
      return [];
    }
  }
};

export default personalizeService;
