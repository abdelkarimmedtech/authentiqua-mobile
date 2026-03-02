import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword
} from 'firebase/auth';
import { auth } from '../config';
import { setUserProfile, getUserProfile } from './userService';
import { initializeSettings } from './settingsService';

/**
 * Register new user with email and password
 */
export const registerUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update auth profile
    if (userData.fullName) {
      await updateProfile(user, { displayName: userData.fullName });
    }

    // Create user profile in Firestore
    await setUserProfile(user.uid, {
      uid: user.uid,
      email,
      fullName: userData.fullName || '',
      university: userData.university || '',
      location: userData.location || '',
      role: userData.role || null,
      onboardingComplete: !!userData.onboardingComplete,
      verificationStatus: 'UNVERIFIED',
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...userData,
    });

    // Initialize user settings
    await initializeSettings(user.uid);
    return { success: true, user: { uid: user.uid, email, displayName: userData.fullName } };
  } catch (error) {
    console.error('❌ Error registering user:', error.message);
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Please login instead.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Use at least 6 characters.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address format.');
    } else if (error.code === 'auth/api-key-not-valid') {
      throw new Error('Firebase configuration error. Check your .env file.');
    }
    throw error;
  }
};

/**
 * Login user with email and password
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user profile
    const profileResult = await getUserProfile(user.uid);

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        profile: profileResult.data,
      },
    };
  } catch (error) {
    console.error('❌ Error logging in user:', error.message);
    if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address format.');
    } else if (error.code === 'auth/user-not-found') {
      throw new Error('User not found. Please sign up first.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password.');
    } else if (error.code === 'auth/api-key-not-valid') {
      throw new Error('Firebase configuration error. Check your .env file.');
    }
    throw error;
  }
};

/**
 * Logout current user
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('❌ Error logging out user:', error.message);
    throw error;
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const profileResult = await getUserProfile(user.uid);
        callback({
          authenticated: true,
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            profile: profileResult.data,
          },
        });
      } catch (error) {
        // Profile might not exist yet, return basic user info
        callback({
          authenticated: true,
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          },
        });
      }
    } else {
      callback({ authenticated: false, user: null });
    }
  });
};

/**
 * Send password reset email
 */
export const sendResetEmail = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending reset email:', error.message);
    if (error.code === 'auth/user-not-found') {
      throw new Error('User not found');
    }
    throw error;
  }
};

/**
 * Update user email
 */
export const updateUserEmail = async (newEmail) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('No user logged in');
    }

    await updateEmail(user, newEmail);
    return { success: true };
  } catch (error) {
    console.error('Error updating email:', error);
    throw error;
  }
};

/**
 * Update user password
 */
export const updateUserPassword = async (newPassword) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('No user logged in');
    }

    await updatePassword(user, newPassword);
    return { success: true };
  } catch (error) {
    console.error('Error updating password:', error);
    if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak');
    }
    throw error;
  }
};
