import {
  collection,
  doc,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config';

const ACTIVITY_COLLECTION = 'activity';

/**
 * Log verification activity
 */
export const logActivity = async (userId, activityData) => {
  try {
    const activityRef = await addDoc(collection(db, ACTIVITY_COLLECTION), {
      userId,
      type: activityData.type || 'OTHER',
      documentId: activityData.documentId || null,
      status: activityData.status || 'PENDING',
      description: activityData.description || '',
      details: activityData.details || {},
      createdAt: Timestamp.now(),
    });
    return { success: true, activityId: activityRef.id };
  } catch (error) {
    // Don't throw - log activity failure is not critical
    console.error('⚠️  Error logging activity:', error.message);
    return { success: false, activityId: null };
  }
};

/**
 * Get all activity for a user
 */
export const getUserActivity = async (userId, limit = 50) => {
  try {
    const q = query(
      collection(db, ACTIVITY_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const activities = [];

    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Limit results
    return { success: true, activities: activities.slice(0, limit) };
  } catch (error) {
    console.error('Error getting user activity:', error);
    throw error;
  }
};

/**
 * Get activity by type
 */
export const getActivityByType = async (userId, type) => {
  try {
    const q = query(
      collection(db, ACTIVITY_COLLECTION),
      where('userId', '==', userId),
      where('type', '==', type),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const activities = [];

    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return { success: true, activities };
  } catch (error) {
    console.error('Error getting activity by type:', error);
    throw error;
  }
};

/**
 * Get activity by status
 */
export const getActivityByStatus = async (userId, status) => {
  try {
    const q = query(
      collection(db, ACTIVITY_COLLECTION),
      where('userId', '==', userId),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const activities = [];

    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return { success: true, activities };
  } catch (error) {
    console.error('Error getting activity by status:', error);
    throw error;
  }
};

/**
 * Real-time listener for user activity
 */
export const onUserActivityChange = (userId, callback) => {
  try {
    const q = query(
      collection(db, ACTIVITY_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const activities = [];
      querySnapshot.forEach((doc) => {
        activities.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      callback({ success: true, activities });
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up activity listener:', error);
    throw error;
  }
};

/**
 * Get verification summary
 */
export const getVerificationSummary = async (userId) => {
  try {
    const q = query(
      collection(db, ACTIVITY_COLLECTION),
      where('userId', '==', userId),
      where('type', '==', 'VERIFICATION'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    let verified = 0;
    let pending = 0;
    let rejected = 0;

    querySnapshot.forEach((doc) => {
      const status = doc.data().status;
      if (status === 'VERIFIED') verified++;
      else if (status === 'PENDING') pending++;
      else if (status === 'REJECTED') rejected++;
    });

    return { success: true, verified, pending, rejected };
  } catch (error) {
    console.error('Error getting verification summary:', error);
    throw error;
  }
};
