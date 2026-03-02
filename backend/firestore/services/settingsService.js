import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config';

const SETTINGS_COLLECTION = 'settings';

/**
 * Initialize or get user settings
 */
export const initializeSettings = async (userId) => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, userId);
    const docSnap = await getDoc(settingsRef);

    if (!docSnap.exists()) {
      // Create default settings
      const defaultSettings = {
        userId,
        notifications: {
          pushEnabled: true,
          emailEnabled: true,
          updateEnabled: true,
          promoEnabled: false,
        },
        appearance: {
          theme: 'dark',
        },
        biometric: {
          enabled: false,
          method: null,
        },
        twoFactorAuth: {
          enabled: false,
          method: null,
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(settingsRef, defaultSettings);
      return { success: true, data: defaultSettings };
    } else {
      return { success: true, data: docSnap.data() };
    }
  } catch (error) {
    console.error('❌ Error initializing settings:', error.message);
    // Don't throw - settings are not critical for login
    return { success: false, data: null };
  }
};

/**
 * Get user settings
 */
export const getUserSettings = async (userId) => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, userId);
    const docSnap = await getDoc(settingsRef);

    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      // Initialize if doesn't exist
      return await initializeSettings(userId);
    }
  } catch (error) {
    console.error('Error getting user settings:', error);
    throw error;
  }
};

/**
 * Update notification settings
 */
export const updateNotificationSettings = async (userId, notificationSettings) => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, userId);
    
    await updateDoc(settingsRef, {
      notifications: notificationSettings,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw error;
  }
};

/**
 * Update appearance settings
 */
export const updateAppearanceSettings = async (userId, appearanceSettings) => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, userId);
    
    await updateDoc(settingsRef, {
      appearance: appearanceSettings,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating appearance settings:', error);
    throw error;
  }
};

/**
 * Update biometric settings
 */
export const updateBiometricSettings = async (userId, enabled) => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, userId);
    
    await updateDoc(settingsRef, {
      biometric: { enabled },
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating biometric settings:', error);
    throw error;
  }
};

/**
 * Update two-factor auth settings
 */
export const updateTwoFactorAuthSettings = async (userId, enabled) => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, userId);
    
    await updateDoc(settingsRef, {
      twoFactorAuth: { enabled },
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating Two-Factor Auth settings:', error);
    throw error;
  }
};

/**
 * Real-time listener for user settings
 */
export const onUserSettingsChange = (userId, callback) => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, userId);
    
    const unsubscribe = onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        callback({ success: true, data: doc.data() });
      } else {
        // Initialize settings if they don't exist
        initializeSettings(userId).then(callback);
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up settings listener:', error);
    throw error;
  }
};

/**
 * Get specific notification setting
 */
export const getNotificationSetting = async (userId, settingKey) => {
  try {
    const result = await getUserSettings(userId);
    if (result.success && result.data.notifications) {
      return { success: true, value: result.data.notifications[settingKey] };
    }
    return { success: false, value: null };
  } catch (error) {
    console.error('Error getting notification setting:', error);
    throw error;
  }
};

/**
 * Update all settings at once
 */
export const updateAllSettings = async (userId, updates) => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, userId);
    
    await updateDoc(settingsRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating all settings:', error);
    throw error;
  }
};
