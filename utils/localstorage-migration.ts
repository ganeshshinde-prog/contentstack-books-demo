/**
 * LocalStorage Migration Utility
 * 
 * This utility ensures that localStorage data is in the correct format
 * and migrates or fixes any corrupted data from previous versions.
 */

export interface UserBehavior {
  viewedBooks: string[];
  viewedGenres: string[];
  searchHistory: string[];
  purchaseHistory: string[];
  timeOnPage: Record<string, number>;
  clickPatterns: Record<string, number>;
  sessionCount: number;
  lastVisit: Date | string;
}

export interface UserPreferences {
  favoriteGenres: string[];
  readingLevel: 'beginner' | 'intermediate' | 'advanced';
  priceRange: { min: number; max: number };
  preferredAuthors: string[];
  readingGoals: number;
  preferredFormats: ('physical' | 'ebook' | 'audiobook')[];
  ageGroup: 'kids' | 'teen' | 'adult';
  languages: string[];
}

const STORAGE_VERSION_KEY = 'storage-version';
const CURRENT_VERSION = '2.0.0'; // Updated after viewedGenres fix

/**
 * Validates and migrates localStorage data to ensure compatibility
 */
export function migrateLocalStorage(): void {
  if (typeof window === 'undefined') return;

  console.group('🔄 LocalStorage Migration Check');
  
  const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
  console.log(`📦 Stored version: ${storedVersion || 'none'}`);
  console.log(`📦 Current version: ${CURRENT_VERSION}`);

  if (storedVersion === CURRENT_VERSION) {
    console.log('✅ LocalStorage is up to date');
    console.groupEnd();
    return;
  }

  console.log('🔧 Migration needed - checking data...');

  // Migrate user behavior
  const behaviorMigrated = migrateBehaviorData();
  
  // Migrate user preferences
  const preferencesMigrated = migratePreferencesData();

  if (behaviorMigrated || preferencesMigrated) {
    localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
    console.log('✅ Migration completed successfully');
  } else {
    console.log('ℹ️ No migration needed');
  }

  console.groupEnd();
}

/**
 * Migrates user behavior data to ensure all arrays are valid
 */
function migrateBehaviorData(): boolean {
  try {
    const behaviorData = localStorage.getItem('user-behavior');
    
    if (!behaviorData) {
      console.log('📊 No behavior data found');
      return false;
    }

    const behavior = JSON.parse(behaviorData);
    console.log('📊 Original behavior data:', behavior);

    let needsMigration = false;

    // Ensure all array fields are valid arrays
    const arrayFields: (keyof UserBehavior)[] = [
      'viewedBooks',
      'viewedGenres',
      'searchHistory',
      'purchaseHistory'
    ];

    arrayFields.forEach(field => {
      if (!Array.isArray(behavior[field])) {
        console.warn(`⚠️ ${field} is not an array, converting...`);
        behavior[field] = [];
        needsMigration = true;
      }
    });

    // Ensure object fields are valid objects
    if (typeof behavior.timeOnPage !== 'object' || behavior.timeOnPage === null) {
      console.warn('⚠️ timeOnPage is not an object, resetting...');
      behavior.timeOnPage = {};
      needsMigration = true;
    }

    if (typeof behavior.clickPatterns !== 'object' || behavior.clickPatterns === null) {
      console.warn('⚠️ clickPatterns is not an object, resetting...');
      behavior.clickPatterns = {};
      needsMigration = true;
    }

    // Ensure sessionCount is a number
    if (typeof behavior.sessionCount !== 'number') {
      console.warn('⚠️ sessionCount is not a number, resetting to 1...');
      behavior.sessionCount = 1;
      needsMigration = true;
    }

    // Ensure lastVisit is present
    if (!behavior.lastVisit) {
      console.warn('⚠️ lastVisit is missing, setting to now...');
      behavior.lastVisit = new Date().toISOString();
      needsMigration = true;
    }

    if (needsMigration) {
      console.log('✅ Saving migrated behavior data:', behavior);
      localStorage.setItem('user-behavior', JSON.stringify(behavior));
      return true;
    }

    console.log('✅ Behavior data is valid');
    return false;

  } catch (error) {
    console.error('❌ Error migrating behavior data:', error);
    console.warn('🔄 Resetting behavior data due to corruption...');
    
    // Reset to default if migration fails
    const defaultBehavior: UserBehavior = {
      viewedBooks: [],
      viewedGenres: [],
      searchHistory: [],
      purchaseHistory: [],
      timeOnPage: {},
      clickPatterns: {},
      sessionCount: 1,
      lastVisit: new Date().toISOString(),
    };
    
    localStorage.setItem('user-behavior', JSON.stringify(defaultBehavior));
    return true;
  }
}

/**
 * Migrates user preferences data to ensure all fields are valid
 */
function migratePreferencesData(): boolean {
  try {
    const preferencesData = localStorage.getItem('user-preferences');
    
    if (!preferencesData) {
      console.log('⭐ No preferences data found');
      return false;
    }

    const preferences = JSON.parse(preferencesData);
    console.log('⭐ Original preferences data:', preferences);

    let needsMigration = false;

    // Ensure favoriteGenres is an array
    if (!Array.isArray(preferences.favoriteGenres)) {
      console.warn('⚠️ favoriteGenres is not an array, converting...');
      preferences.favoriteGenres = [];
      needsMigration = true;
    }

    // Ensure preferredAuthors is an array
    if (!Array.isArray(preferences.preferredAuthors)) {
      console.warn('⚠️ preferredAuthors is not an array, converting...');
      preferences.preferredAuthors = [];
      needsMigration = true;
    }

    // Ensure preferredFormats is an array
    if (!Array.isArray(preferences.preferredFormats)) {
      console.warn('⚠️ preferredFormats is not an array, converting...');
      preferences.preferredFormats = ['physical'];
      needsMigration = true;
    }

    // Ensure languages is an array
    if (!Array.isArray(preferences.languages)) {
      console.warn('⚠️ languages is not an array, converting...');
      preferences.languages = ['English'];
      needsMigration = true;
    }

    if (needsMigration) {
      console.log('✅ Saving migrated preferences data:', preferences);
      localStorage.setItem('user-preferences', JSON.stringify(preferences));
      return true;
    }

    console.log('✅ Preferences data is valid');
    return false;

  } catch (error) {
    console.error('❌ Error migrating preferences data:', error);
    console.warn('🔄 Resetting preferences data due to corruption...');
    
    // Reset to default if migration fails
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
    
    localStorage.setItem('user-preferences', JSON.stringify(defaultPreferences));
    return true;
  }
}

/**
 * Force clear all localStorage data (useful for testing)
 */
export function clearPersonalizationData(): void {
  if (typeof window === 'undefined') return;

  console.warn('🗑️ Clearing all personalization data...');
  localStorage.removeItem('user-behavior');
  localStorage.removeItem('user-preferences');
  localStorage.removeItem(STORAGE_VERSION_KEY);
  console.log('✅ Personalization data cleared');
}

/**
 * Get debug info about current localStorage state
 */
export function getStorageDebugInfo(): {
  version: string | null;
  behavior: UserBehavior | null;
  preferences: UserPreferences | null;
  errors: string[];
} {
  const errors: string[] = [];
  let behavior: UserBehavior | null = null;
  let preferences: UserPreferences | null = null;

  try {
    const behaviorData = localStorage.getItem('user-behavior');
    if (behaviorData) {
      behavior = JSON.parse(behaviorData);
    }
  } catch (error) {
    errors.push(`Failed to parse user-behavior: ${error}`);
  }

  try {
    const preferencesData = localStorage.getItem('user-preferences');
    if (preferencesData) {
      preferences = JSON.parse(preferencesData);
    }
  } catch (error) {
    errors.push(`Failed to parse user-preferences: ${error}`);
  }

  return {
    version: localStorage.getItem(STORAGE_VERSION_KEY),
    behavior,
    preferences,
    errors,
  };
}

