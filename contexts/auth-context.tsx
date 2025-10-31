'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// User interface
export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  createdAt: string;
  preferences?: {
    favoriteGenres: string[];
    readingLevel: string;
    notifications: boolean;
  };
}

// Authentication context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: {
    fullName: string;
    email: string;
    phoneNumber?: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to restore user personalization data
const restoreUserPersonalizationData = (userId: string) => {
  try {
    if (typeof window !== 'undefined') {
      // Restore user-specific behavior data
      const userBehaviorKey = `user-behavior-${userId}`;
      const userPreferencesKey = `user-preferences-${userId}`;
      
      const savedBehavior = localStorage.getItem(userBehaviorKey);
      const savedPreferences = localStorage.getItem(userPreferencesKey);
      
      if (savedBehavior) {
        localStorage.setItem('user-behavior', savedBehavior);
        console.log('🔄 Restored user behavior data from previous session');
      }
      
      if (savedPreferences) {
        localStorage.setItem('user-preferences', savedPreferences);
        console.log('🔄 Restored user preferences from previous session');
      }
      
      // Trigger a custom event to notify personalization components
      window.dispatchEvent(new CustomEvent('userPersonalizationRestored', {
        detail: { userId, hasBehavior: !!savedBehavior, hasPreferences: !!savedPreferences }
      }));
    }
  } catch (error) {
    console.error('❌ Error restoring user personalization data:', error);
  }
};

// Helper function to save user personalization data
const saveUserPersonalizationData = (userId: string) => {
  try {
    if (typeof window !== 'undefined') {
      // Save current behavior and preferences with user ID
      const currentBehavior = localStorage.getItem('user-behavior');
      const currentPreferences = localStorage.getItem('user-preferences');
      
      if (currentBehavior) {
        localStorage.setItem(`user-behavior-${userId}`, currentBehavior);
      }
      
      if (currentPreferences) {
        localStorage.setItem(`user-preferences-${userId}`, currentPreferences);
      }
      
      console.log('💾 Saved user personalization data for future sessions');
    }
  } catch (error) {
    console.error('❌ Error saving user personalization data:', error);
  }
};

// Helper function to send user profile data to Lytics
const sendUserProfileToLytics = (user: User, eventType: 'login' | 'signup') => {
  try {
    // Check if jstag is available
    if (typeof window !== 'undefined' && (window as any).jstag) {
      const jstag = (window as any).jstag;
      
      console.log(`📊 Sending ${eventType} profile data to Lytics:`, {
        email: user.email,
        fullName: user.fullName,
        eventType
      });

      // Get user behavior data to send enriched profile
      const behaviorData = localStorage.getItem('user-behavior');
      let enrichedData: any = {};
      
      if (behaviorData) {
        try {
          const behavior = JSON.parse(behaviorData);
          enrichedData = {
            viewed_books_count: behavior.viewedBooks?.length || 0,
            viewed_genres: behavior.viewedGenres?.join(',') || '',
            search_history_count: behavior.searchHistory?.length || 0,
            session_count: behavior.sessionCount || 1,
            last_visit: behavior.lastVisit || new Date().toISOString()
          };
        } catch (e) {
          console.warn('Could not parse behavior data for Lytics');
        }
      }

      // Send user profile data to Lytics
      jstag.send({
        email: user.email,
        name: user.fullName,
        phone: user.phoneNumber || '',
        user_id: user.id,
        event_type: eventType,
        timestamp: new Date().toISOString(),
        // Additional profile data
        account_created: user.createdAt,
        favorite_genres: user.preferences?.favoriteGenres?.join(',') || '',
        reading_level: user.preferences?.readingLevel || 'intermediate',
        notifications_enabled: user.preferences?.notifications || true,
        // Custom attributes for segmentation
        customer_segment: 'authenticated_user',
        engagement_level: eventType === 'signup' ? 'new_user' : 'returning_user',
        platform: 'web',
        // Enriched behavior data
        ...enrichedData
      });

      console.log('✅ User profile sent to Lytics successfully');
    } else {
      console.warn('⚠️ Lytics jstag not available - skipping profile tracking');
    }
  } catch (error) {
    console.error('❌ Error sending user profile to Lytics:', error);
  }
};

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        // Check if we're in the browser
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }

        const storedUser = localStorage.getItem('bookhaven-user');
        const storedToken = localStorage.getItem('bookhaven-token');
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          
          // Verify token is still valid (simple expiry check)
          const tokenData = JSON.parse(atob(storedToken.split('.')[1]));
          const currentTime = Date.now() / 1000;
          
          if (tokenData.exp > currentTime) {
            setUser(userData);
            console.log('✅ User authenticated from localStorage:', userData.fullName);
            
            // Restore user's personalization data from previous sessions
            restoreUserPersonalizationData(userData.id);
            
            // Send session restoration event to Lytics (existing user returning)
            sendUserProfileToLytics(userData, 'login');
          } else {
            // Token expired, clear storage
            localStorage.removeItem('bookhaven-user');
            localStorage.removeItem('bookhaven-token');
            console.log('⚠️ Token expired, user logged out');
          }
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        // Clear corrupted data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('bookhaven-user');
          localStorage.removeItem('bookhaven-token');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Generate a simple JWT-like token (for demo purposes)
  const generateToken = (userId: string): string => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      userId,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      iat: Math.floor(Date.now() / 1000)
    }));
    const signature = btoa(`signature-${userId}-${Date.now()}`);
    
    return `${header}.${payload}.${signature}`;
  };

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate password strength
  const isValidPassword = (password: string): boolean => {
    return password.length >= 6; // Minimum 6 characters
  };

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      // Validate inputs
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      if (!isValidEmail(email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user exists in localStorage
      const existingUsers = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem('bookhaven-users') || '[]')
        : [];
      const existingUser = existingUsers.find((u: any) => u.email === email);

      if (!existingUser) {
        return { success: false, error: 'No account found with this email address' };
      }

      // Simple password check (in real app, this would be hashed)
      if (existingUser.password !== password) {
        return { success: false, error: 'Incorrect password' };
      }

      // Create user object (without password)
      const userData: User = {
        id: existingUser.id,
        fullName: existingUser.fullName,
        email: existingUser.email,
        phoneNumber: existingUser.phoneNumber,
        createdAt: existingUser.createdAt,
        preferences: existingUser.preferences || {
          favoriteGenres: [],
          readingLevel: 'intermediate',
          notifications: true
        }
      };

      // Generate token
      const token = generateToken(userData.id);

      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('bookhaven-user', JSON.stringify(userData));
        localStorage.setItem('bookhaven-token', token);
      }

      setUser(userData);
      console.log('✅ User logged in successfully:', userData.fullName);

      // Restore user's personalization data from previous sessions
      restoreUserPersonalizationData(userData.id);

      // Send user profile to Lytics for login event
      sendUserProfileToLytics(userData, 'login');

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (userData: {
    fullName: string;
    email: string;
    phoneNumber?: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      // Validate inputs
      if (!userData.fullName || !userData.email || !userData.password) {
        return { success: false, error: 'Full name, email, and password are required' };
      }

      if (!isValidEmail(userData.email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      if (!isValidPassword(userData.password)) {
        return { success: false, error: 'Password must be at least 6 characters long' };
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check if user already exists
      const existingUsers = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('bookhaven-users') || '[]')
        : [];
      const existingUser = existingUsers.find((u: any) => u.email === userData.email);

      if (existingUser) {
        return { success: false, error: 'An account with this email already exists' };
      }

      // Create new user
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fullName: userData.fullName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        password: userData.password, // In real app, this would be hashed
        createdAt: new Date().toISOString(),
        preferences: {
          favoriteGenres: [],
          readingLevel: 'intermediate',
          notifications: true
        }
      };

      // Save to users array
      if (typeof window !== 'undefined') {
        existingUsers.push(newUser);
        localStorage.setItem('bookhaven-users', JSON.stringify(existingUsers));
      }

      // Create user object for context (without password)
      const userForContext: User = {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        createdAt: newUser.createdAt,
        preferences: newUser.preferences
      };

      // Generate token
      const token = generateToken(userForContext.id);

      // Store current user
      if (typeof window !== 'undefined') {
        localStorage.setItem('bookhaven-user', JSON.stringify(userForContext));
        localStorage.setItem('bookhaven-token', token);
      }

      setUser(userForContext);
      console.log('✅ User account created successfully:', userForContext.fullName);

      // Send user profile to Lytics for signup event
      sendUserProfileToLytics(userForContext, 'signup');

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Save current personalization data before logout
    if (user) {
      saveUserPersonalizationData(user.id);
    }
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bookhaven-user');
      localStorage.removeItem('bookhaven-token');
      // Clear current session data but keep user-specific data
      localStorage.removeItem('user-behavior');
      localStorage.removeItem('user-preferences');
    }
    setUser(null);
    console.log('✅ User logged out successfully');
    
    // Optionally redirect to home page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  // Update user function
  const updateUser = (updatedData: Partial<User>) => {
    if (!user || typeof window === 'undefined') return;

    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('bookhaven-user', JSON.stringify(updatedUser));

    // Also update in users array
    const existingUsers = JSON.parse(localStorage.getItem('bookhaven-users') || '[]');
    const userIndex = existingUsers.findIndex((u: any) => u.id === user.id);
    if (userIndex !== -1) {
      existingUsers[userIndex] = { ...existingUsers[userIndex], ...updatedData };
      localStorage.setItem('bookhaven-users', JSON.stringify(existingUsers));
    }

    console.log('✅ User updated successfully');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
