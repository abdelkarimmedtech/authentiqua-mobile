import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config';

const USERS_COLLECTION = 'users';

/**
 * Create or update user profile
 */
export const setUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    const profileData = {
      uid: userId,
      ...userData,
      updatedAt: Timestamp.now(),
      createdAt: userData.createdAt || Timestamp.now(),
    };

    await setDoc(userRef, profileData, { merge: true });
    return { success: true, userId };
  } catch (error) {
    console.error('❌ Error setting user profile:', error.message);
    throw error;
  }
};

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, data: null };
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email) => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('email', '==', email)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return { success: true, data: querySnapshot.docs[0].data(), userId: querySnapshot.docs[0].id };
    } else {
      return { success: false, data: null };
    }
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Real-time listener for user profile
 */
export const onUserProfileChange = (userId, callback) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        callback({ success: true, data: doc.data() });
      } else {
        callback({ success: false, data: null });
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up user profile listener:', error);
    throw error;
  }
};

/**
 * Get verification status for user
 */
export const getUserVerificationStatus = async (userId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        success: true,
        verificationStatus: data.verificationStatus || 'UNVERIFIED',
        documents: data.documents || [],
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error('Error getting verification status:', error);
    throw error;
  }
};
