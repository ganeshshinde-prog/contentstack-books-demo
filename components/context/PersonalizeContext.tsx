/**
 * Contentstack Personalize Context for Launch
 * Based on: https://www.contentstack.com/docs/personalize/setup-nextjs-website-with-personalize-launch
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Personalize from '@contentstack/personalize-edge-sdk';
import { Sdk } from '@contentstack/personalize-edge-sdk/dist/sdk';

// Create the context
const PersonalizeContext = createContext<Sdk | null>(null);

// SDK instance singleton
let sdkInstance: Sdk | null = null;

// Provider component
export function PersonalizeProvider({ children }: { children: React.ReactNode }) {
  const [sdk, setSdk] = useState<Sdk | null>(null);
  
  useEffect(() => {
    getPersonalizeInstance().then(setSdk);
  }, []);
  
  return (
    <PersonalizeContext.Provider value={sdk}>
      {children}
    </PersonalizeContext.Provider>
  );
}

// Hook to use the Personalize SDK
export function usePersonalize(): Sdk | null {
  return useContext(PersonalizeContext);
}

// Function to get or create SDK instance
async function getPersonalizeInstance(): Promise<Sdk | null> {
  try {
    // Check if SDK is already initialized
    if (!Personalize.getInitializationStatus() || Personalize.getInitializationStatus() !== 'success') {
      console.log('🎯 Initializing Contentstack Personalize SDK...');
      
      const projectUid = process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID;
      const edgeApiUrl = process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL;
      
      if (!projectUid) {
        console.warn('⚠️ CONTENTSTACK_PERSONALIZE_PROJECT_UID not found');
        return null;
      }
      
      // Set custom edge API URL if provided
      if (edgeApiUrl) {
        console.log('🌐 Setting custom Edge API URL:', edgeApiUrl);
        Personalize.setEdgeApiUrl(edgeApiUrl);
      }
      
      // Initialize the SDK
      sdkInstance = await Personalize.init(projectUid);
      console.log('✅ Personalize SDK initialized successfully');
      
      return sdkInstance;
    }
    
    return sdkInstance;
  } catch (error) {
    console.error('❌ Failed to initialize Personalize SDK:', error);
    return null;
  }
}

// Utility functions for book-based personalization
export const BookPersonalizationUtils = {
  /**
   * Set attributes based on book genre viewing behavior
   */
  async setBookGenreAttributes(sdk: Sdk | null, genre: string, bookId?: string) {
    if (!sdk) {
      console.warn('⚠️ Personalize SDK not available');
      return;
    }
    
    try {
      console.log(`🎯 Setting book genre attributes for: ${genre}`);
      
      const attributes: Record<string, any> = {
        book_genre_interest: genre.toLowerCase(),
        last_viewed_genre: genre.toLowerCase(),
        reading_preference: genre.toLowerCase(),
      };
      
      if (bookId) {
        attributes.last_viewed_book = bookId;
      }
      
      // Special attributes for War genre (matching your setup)
      if (genre.toLowerCase() === 'war') {
        attributes.war_enthusiast = true;
        attributes.military_history_interest = true;
        attributes.historical_content_preference = 'military';
      }
      
      // Set fantasy attributes
      if (genre.toLowerCase() === 'fantasy') {
        attributes.fantasy_lover = true;
        attributes.fictional_content_preference = 'fantasy';
      }
      
      // Set mystery attributes
      if (genre.toLowerCase() === 'mystery') {
        attributes.mystery_fan = true;
        attributes.suspense_preference = true;
      }
      
      await sdk.set(attributes);
      console.log('✅ Book genre attributes set successfully:', attributes);
    } catch (error) {
      console.error('❌ Failed to set book genre attributes:', error);
    }
  },
  
  /**
   * Set user segment attributes based on behavior
   */
  async setUserSegmentAttributes(sdk: Sdk | null, segment: string, additionalData?: any) {
    if (!sdk) {
      console.warn('⚠️ Personalize SDK not available');
      return;
    }
    
    try {
      console.log(`👤 Setting user segment attributes: ${segment}`);
      
      const attributes: Record<string, any> = {
        user_segment: segment,
        personalization_level: 'active',
        engagement_level: segment === 'frequent_reader' ? 'high' : 'medium',
      };
      
      if (additionalData) {
        if (additionalData.favoriteGenres?.length > 0) {
          attributes.favorite_genres = additionalData.favoriteGenres.join(',');
          attributes.genre_diversity = additionalData.favoriteGenres.length > 2 ? 'high' : 'low';
        }
        
        if (additionalData.priceRange) {
          attributes.price_sensitivity = additionalData.priceRange.max > 500 ? 'low' : 'high';
          attributes.budget_preference = additionalData.priceRange.max > 500 ? 'premium' : 'budget';
        }
        
        if (additionalData.viewedBooksCount) {
          attributes.browsing_intensity = additionalData.viewedBooksCount > 10 ? 'high' : 'medium';
        }
      }
      
      await sdk.set(attributes);
      console.log('✅ User segment attributes set successfully:', attributes);
    } catch (error) {
      console.error('❌ Failed to set user segment attributes:', error);
    }
  },
  
  /**
   * Trigger book view impression
   */
  async triggerBookViewImpression(sdk: Sdk | null, experienceShortUid?: string) {
    if (!sdk) {
      console.warn('⚠️ Personalize SDK not available for impression');
      return;
    }
    
    try {
      if (experienceShortUid) {
        console.log(`📊 Triggering impression for experience: ${experienceShortUid}`);
        await sdk.triggerImpression(experienceShortUid);
        console.log('✅ Impression triggered successfully');
      }
    } catch (error) {
      console.error('❌ Failed to trigger impression:', error);
    }
  },
  
  /**
   * Trigger book-related conversion events
   */
  async triggerBookEvent(sdk: Sdk | null, eventKey: string, eventData?: any) {
    if (!sdk) {
      console.warn('⚠️ Personalize SDK not available for event');
      return;
    }
    
    try {
      console.log(`📊 Triggering event: ${eventKey}`, eventData);
      await sdk.triggerEvent(eventKey);
      console.log('✅ Event triggered successfully');
    } catch (error) {
      console.error('❌ Failed to trigger event:', error);
    }
  },
  
  /**
   * Get variant parameter for URL (used in Launch Edge Proxy)
   */
  getVariantParam(sdk: Sdk | null): string | null {
    if (!sdk) return null;
    
    try {
      return sdk.getVariantParam();
    } catch (error) {
      console.error('❌ Failed to get variant param:', error);
      return null;
    }
  },
  
  /**
   * Convert variant parameter to variant aliases
   */
  variantParamToAliases(variantParam: string): string[] {
    try {
      return Personalize.variantParamToVariantAliases(variantParam);
    } catch (error) {
      console.error('❌ Failed to convert variant param to aliases:', error);
      return [];
    }
  }
};

export default PersonalizeContext;
