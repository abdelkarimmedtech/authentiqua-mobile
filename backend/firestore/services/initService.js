import { 
  collection, 
  doc, 
  setDoc,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config';

/**
 * Initialize Firestore collections by creating starter documents
 * This ensures collections exist in Firestore console
 */
export const initializeFirestoreCollections = async () => {
  try {
    // Create users collection starter doc
    const usersDocRef = doc(db, 'users', '_system');
    const usersSnap = await getDoc(usersDocRef);
    if (!usersSnap.exists()) {
      await setDoc(usersDocRef, {
        _type: 'system',
        _initialized: true,
        _createdAt: Timestamp.now(),
      });
    }

    // Create documents collection starter doc
    const docsDocRef = doc(db, 'documents', '_system');
    const docsSnap = await getDoc(docsDocRef);
    if (!docsSnap.exists()) {
      await setDoc(docsDocRef, {
        _type: 'system',
        _initialized: true,
        _createdAt: Timestamp.now(),
      });
    }

    // Create activity collection starter doc
    const activityDocRef = doc(db, 'activity', '_system');
    const activitySnap = await getDoc(activityDocRef);
    if (!activitySnap.exists()) {
      await setDoc(activityDocRef, {
        _type: 'system',
        _initialized: true,
        _createdAt: Timestamp.now(),
      });
    }

    // Create settings collection starter doc
    const settingsDocRef = doc(db, 'settings', '_system');
    const settingsSnap = await getDoc(settingsDocRef);
    if (!settingsSnap.exists()) {
      await setDoc(settingsDocRef, {
        _type: 'system',
        _initialized: true,
        _createdAt: Timestamp.now(),
      });
    }
    return true;
  } catch (error) {
    console.error('⚠️  Error initializing collections:', error.message);
    // Don't throw - collections may exist already or will be created on first write
    return false;
  }
};
