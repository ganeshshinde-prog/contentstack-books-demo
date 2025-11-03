/**
 * Lytics Personalization Service
 * 
 * Uses Lytics jstag and Pathfora to get real-time audience data
 * and power personalization based on Lytics-determined user segments
 */

// Extend Window interface
declare global {
  interface Window {
    jstag?: {
      send: (data: any) => void;
      pageView: () => void;
      getid: () => string | null;
      call: (method: string, callback: (data: any) => void) => void;
      getEntity: (callback: (entity: any) => void) => void;
    };
    pathfora?: any;
  }
}

export interface LyticsAudience {
  id: string;
  name: string;
  slug: string;
  confidence?: number;
}

export interface LyticsUser {
  audiences: LyticsAudience[];
  attributes: Record<string, any>;
  segments: string[];
}

class LyticsPersonalizationService {
  private static instance: LyticsPersonalizationService;
  private isReady: boolean = false;
  private audiences: LyticsAudience[] = [];
  private userAttributes: Record<string, any> = {};

  private constructor() {
    this.initialize();
  }

  static getInstance(): LyticsPersonalizationService {
    if (!LyticsPersonalizationService.instance) {
      LyticsPersonalizationService.instance = new LyticsPersonalizationService();
    }
    return LyticsPersonalizationService.instance;
  }

  /**
   * Initialize Lytics jstag and wait for it to be ready
   */
  private async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;

    console.log('🚀 Initializing Lytics Personalization Service...');

    // Wait for jstag to be loaded
    await this.waitForJstag();
    
    // Get initial user data
    await this.refreshUserData();
    
    this.isReady = true;
    console.log('✅ Lytics Personalization Service ready');
  }

  /**
   * Wait for jstag to be loaded and available
   */
  private waitForJstag(maxAttempts = 20): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      const checkJstag = () => {
        attempts++;
        
        if (window.jstag && typeof window.jstag.call === 'function') {
          console.log('✅ jstag is ready');
          resolve();
        } else if (attempts >= maxAttempts) {
          console.warn('⚠️ jstag failed to load after', maxAttempts, 'attempts');
          reject(new Error('jstag not available'));
        } else {
          console.log(`⏳ Waiting for jstag... (attempt ${attempts}/${maxAttempts})`);
          setTimeout(checkJstag, 500);
        }
      };
      
      checkJstag();
    });
  }

  /**
   * Refresh user data from Lytics
   */
  async refreshUserData(): Promise<void> {
    if (!window.jstag) {
      console.warn('⚠️ jstag not available');
      return;
    }

    return new Promise((resolve) => {
      console.log('🔄 Fetching user data from Lytics...');
      
      // Get user entity (profile) from Lytics
      window.jstag.call('getEntity', (entity: any) => {
        if (entity && entity.data) {
          console.log('📊 Lytics user entity:', entity.data);
          
          // Extract audiences
          const audiences = entity.data.audiences || [];
          this.audiences = audiences.map((aud: any) => ({
            id: aud.id,
            name: aud.name,
            slug: aud.slug || aud.id,
            confidence: aud.confidence
          }));
          
          console.log('👥 User audiences:', this.audiences);
          
          // Extract attributes
          this.userAttributes = entity.data.attributes || {};
          console.log('📋 User attributes:', this.userAttributes);
          
        } else {
          console.log('ℹ️ No Lytics user data yet (new user)');
          this.audiences = [];
          this.userAttributes = {};
        }
        
        resolve();
      });
    });
  }

  /**
   * Check if service is ready
   */
  isServiceReady(): boolean {
    return this.isReady;
  }

  /**
   * Get user's Lytics audiences
   */
  getUserAudiences(): LyticsAudience[] {
    return this.audiences;
  }

  /**
   * Get user's Lytics ID (seerid)
   */
  getLyticsId(): string | null {
    if (!window.jstag) return null;
    return window.jstag.getid();
  }

  /**
   * Check if user is in a specific audience
   */
  isInAudience(audienceSlug: string): boolean {
    return this.audiences.some(aud => 
      aud.slug === audienceSlug || 
      aud.id === audienceSlug ||
      aud.name.toLowerCase().includes(audienceSlug.toLowerCase())
    );
  }

  /**
   * Get preferred genre based on Lytics audiences
   * Maps audience names to genre preferences
   */
  getPreferredGenreFromAudiences(): string | null {
    console.group('🎯 Getting Genre from Lytics Audiences');
    console.log('Available audiences:', this.audiences.map(a => a.name));
    
    // Map Lytics audience names to genres
    const audienceToGenreMap: Record<string, string> = {
      'war_enthusiasts': 'War',
      'war_books': 'War',
      'war_audience': 'War',
      'biography_readers': 'Biography',
      'biography_books': 'Biography',
      'biography_audience': 'Biography',
      'fantasy_fans': 'Fantasy',
      'fantasy_books': 'Fantasy',
      'mystery_readers': 'Mystery',
      'mystery_books': 'Mystery',
      'thriller_fans': 'Thrillers',
      'romance_readers': 'Romance',
      // Add more mappings as needed
    };

    // Check audiences in order of priority
    for (const audience of this.audiences) {
      const audienceKey = audience.slug.toLowerCase();
      
      // Check direct mapping
      if (audienceToGenreMap[audienceKey]) {
        const genre = audienceToGenreMap[audienceKey];
        console.log(`✅ Found genre mapping: ${audience.name} → ${genre}`);
        console.groupEnd();
        return genre;
      }
      
      // Check if audience name contains genre keywords
      const audienceName = audience.name.toLowerCase();
      if (audienceName.includes('war')) {
        console.log(`✅ Detected War from audience: ${audience.name}`);
        console.groupEnd();
        return 'War';
      }
      if (audienceName.includes('biography') || audienceName.includes('biograph')) {
        console.log(`✅ Detected Biography from audience: ${audience.name}`);
        console.groupEnd();
        return 'Biography';
      }
      if (audienceName.includes('fantasy')) {
        console.log(`✅ Detected Fantasy from audience: ${audience.name}`);
        console.groupEnd();
        return 'Fantasy';
      }
      if (audienceName.includes('mystery')) {
        console.log(`✅ Detected Mystery from audience: ${audience.name}`);
        console.groupEnd();
        return 'Mystery';
      }
      if (audienceName.includes('thriller')) {
        console.log(`✅ Detected Thrillers from audience: ${audience.name}`);
        console.groupEnd();
        return 'Thrillers';
      }
    }

    console.log('❌ No genre found in audiences');
    console.groupEnd();
    return null;
  }

  /**
   * Get all genre preferences from audiences
   */
  getAllGenrePreferences(): string[] {
    const genres: string[] = [];
    
    for (const audience of this.audiences) {
      const audienceName = audience.name.toLowerCase();
      
      if (audienceName.includes('war')) genres.push('War');
      if (audienceName.includes('biography')) genres.push('Biography');
      if (audienceName.includes('fantasy')) genres.push('Fantasy');
      if (audienceName.includes('mystery')) genres.push('Mystery');
      if (audienceName.includes('thriller')) genres.push('Thrillers');
      if (audienceName.includes('romance')) genres.push('Romance');
    }
    
    // Remove duplicates
    return Array.from(new Set(genres));
  }

  /**
   * Get user attribute value
   */
  getUserAttribute(key: string): any {
    return this.userAttributes[key];
  }

  /**
   * Check if user is a new visitor (no Lytics ID yet)
   */
  isNewVisitor(): boolean {
    const lyticsId = this.getLyticsId();
    return !lyticsId || this.audiences.length === 0;
  }

  /**
   * Wait for service to be ready
   */
  async waitUntilReady(timeout = 10000): Promise<boolean> {
    const startTime = Date.now();
    
    while (!this.isReady && (Date.now() - startTime) < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return this.isReady;
  }

  /**
   * Force refresh of user data from Lytics
   */
  async refresh(): Promise<void> {
    console.log('🔄 Manual refresh requested');
    await this.refreshUserData();
  }
}

// Export singleton instance
export const lyticsPersonalization = LyticsPersonalizationService.getInstance();
export default lyticsPersonalization;

