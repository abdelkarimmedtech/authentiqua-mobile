import React, { createContext, useEffect, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loginUser,
  registerUser,
  logoutUser,
  onAuthStateChange,
  logActivity,
  initializeFirestoreCollections,
  getUserProfile,
  updateUserProfile,
} from '../../backend/firestore';
import { getUserDisplayName } from '../utils/user';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const normalizeUser = (user) => {
    if (!user) return null;
    const displayName = getUserDisplayName(user);
    return { ...user, displayName };
  };

  const [state, dispatch] = useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.payload?.uid || null,
            user: action.payload,
            isSignOut: false,
            loading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignOut: false,
            userToken: action.payload?.uid || null,
            user: action.payload,
          };
        case 'SIGN_UP':
          return {
            ...prevState,
            isSignOut: false,
            userToken: action.payload?.uid || null,
            user: action.payload,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignOut: true,
            userToken: null,
            user: null,
          };
        case 'SET_LOADING':
          return {
            ...prevState,
            loading: action.payload,
          };
        case 'SET_ERROR':
          return {
            ...prevState,
            error: action.payload,
          };
        case 'SET_USER':
          return {
            ...prevState,
            user: action.payload,
          };
      }
    },
    {
      userToken: null,
      user: null,
      loading: true,
      isSignOut: false,
      error: null,
    }
  );

  // Listen to auth state changes on app start
  useEffect(() => {
    // Initialize Firestore collections on app startup
    initializeFirestoreCollections().catch((err) => {
      console.error('❌ Firestore initialization error:', err.message);
    });

    const unsubscribe = onAuthStateChange(async (result) => {
      try {
        if (result.authenticated) {
          const normalized = normalizeUser(result.user);
          dispatch({ type: 'RESTORE_TOKEN', payload: normalized });
          // Cache user data locally
          await AsyncStorage.setItem('@user_data', JSON.stringify(normalized));
          
          // Log user session
          try {
            await logActivity(normalized.uid, {
              type: 'LOGIN',
              status: 'SUCCESS',
              description: 'User session restored',
            });
          } catch (err) {
            // Silently fail activity logging
          }
        } else {
          dispatch({ type: 'RESTORE_TOKEN', payload: null });
          await AsyncStorage.removeItem('@user_data');
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    });

    return () => unsubscribe?.();
  }, []);

  const signIn = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await loginUser(email, password);
      
      if (result.success) {
        const normalized = normalizeUser(result.user);
        dispatch({ type: 'SIGN_IN', payload: normalized });
        await AsyncStorage.setItem('@user_data', JSON.stringify(normalized));
        
        // Log login activity
        try {
          await logActivity(normalized.uid, {
            type: 'LOGIN',
            status: 'SUCCESS',
            description: 'User logged in via email/password',
          });
        } catch (err) {
        }
        
        return { ok: true };
      }
      return { ok: false, message: 'Login failed' };
    } catch (error) {
      const message = error.message || 'Login failed';
      console.error('❌ Login error:', message);
      
      // Provide helpful error context
      if (message.includes('api-key-not-valid')) {
        console.error('   Check: Is your .env file configured with valid Firebase credentials?');
      } else if (message.includes('auth/user-not-found')) {
        console.error('   Error: User account not found. Please sign up first.');
      } else if (message.includes('auth/wrong-password')) {
        console.error('   Error: Incorrect password.');
      }
      
      dispatch({ type: 'SET_ERROR', payload: message });
      return { ok: false, message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signUp = async (email, password, userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await registerUser(email, password, {
        fullName: userData?.fullName || 'User',
        university: userData?.university || '',
        location: userData?.location || '',
        ...userData,
      });

      if (result.success) {
        const normalized = normalizeUser(result.user);
        dispatch({ type: 'SIGN_UP', payload: normalized });
        await AsyncStorage.setItem('@user_data', JSON.stringify(normalized));
        
        // Log signup activity
        try {
          await logActivity(normalized.uid, {
            type: 'SIGNUP',
            status: 'SUCCESS',
            description: 'New user account created',
          });
        } catch (err) {
        }
        
        return { ok: true };
      }
      return { ok: false, message: 'Registration failed' };
    } catch (error) {
      const message = error.message || 'Registration failed';
      console.error('❌ Registration error:', message);

      // Provide helpful error context
      if (message.includes('api-key-not-valid')) {
        console.error('   Check: Is your .env file configured with valid Firebase credentials?');
      } else if (message.includes('auth/email-already-in-use')) {
        console.error('   Error: This email is already registered. Please login instead.');
      } else if (message.includes('auth/weak-password')) {
        console.error('   Error: Password is too weak. Use at least 6 characters.');
      } else if (message.includes('auth/invalid-email')) {
        console.error('   Error: Please enter a valid email address.');
      }

      dispatch({ type: 'SET_ERROR', payload: message });
      return { ok: false, message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signOut = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const uid = state.user?.uid;
      
      // Log logout activity
      if (uid) {
        try {
          await logActivity(uid, {
            type: 'LOGOUT',
            status: 'SUCCESS',
            description: 'User logged out',
          });
        } catch (err) {
        }
      }
      
      await logoutUser();
      dispatch({ type: 'SIGN_OUT' });
      await AsyncStorage.removeItem('@user_data');
      return { ok: true };
    } catch (error) {
      const message = error.message || 'Logout failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { ok: false, message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const refreshProfile = async () => {
    const uid = state.user?.uid;
    if (!uid) return { ok: false };
    try {
      const profileResult = await getUserProfile(uid);
      const nextUser = normalizeUser({
        ...(state.user || {}),
        profile: profileResult.success ? profileResult.data : state.user?.profile,
      });
      dispatch({ type: 'SET_USER', payload: nextUser });
      await AsyncStorage.setItem('@user_data', JSON.stringify(nextUser));
      return { ok: true };
    } catch (error) {
      console.error('❌ Profile refresh error:', error?.message || 'Unknown error');
      return { ok: false, message: error?.message };
    }
  };

  const completeOnboarding = async (updates) => {
    const uid = state.user?.uid;
    if (!uid) return { ok: false, message: 'No user' };
    try {
      await updateUserProfile(uid, {
        ...updates,
        onboardingComplete: true,
      });
      await refreshProfile();
      return { ok: true };
    } catch (error) {
      const message = error?.message || 'Failed to save profile';
      console.error('❌ Onboarding save error:', message);
      return { ok: false, message };
    }
  };

  const value = {
    userToken: state.userToken,
    user: state.user,
    loading: state.loading,
    isSignOut: state.isSignOut,
    error: state.error,
    signIn,
    signUp,
    signOut,
    clearError,
    refreshProfile,
    completeOnboarding,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
