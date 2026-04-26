import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config';
import { getUserProfile } from './userService';

const USERS_COLLECTION = 'users';
const DOCUMENTS_COLLECTION = 'documents';

export const fetchAdminStats = async () => {
  try {
    console.log('AdminService: Fetching admin statistics...');

    // Debug: Check current user authentication and role
    const { auth } = await import('firebase/auth');
    const { getAuth } = await import('firebase/auth');
    const currentUser = getAuth().currentUser;
    console.log('AdminService: Current user UID:', currentUser?.uid);
    console.log('AdminService: Current user email:', currentUser?.email);

    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    if (currentUser?.uid) {
      try {
        const profileResult = await getUserProfile(currentUser.uid);
        console.log('AdminService: User profile exists:', profileResult.success);
        if (profileResult.success) {
          console.log('AdminService: User role from Firestore:', profileResult.data?.role);
          if (profileResult.data?.role !== 'ADMIN') {
            throw new Error(`User is not an admin. Current role: ${profileResult.data?.role || 'none'}`);
          }
        } else {
          throw new Error('Admin user profile not found in Firestore. Please complete onboarding first.');
        }
      } catch (profileError) {
        console.log('AdminService: Error fetching user profile:', profileError.message);
        throw profileError;
        collection(db, DOCUMENTS_COLLECTION),
        where('status', '==', 'PENDING'),
        where('isReference', '==', false)
      )
    );
    console.log('AdminService: Loaded pending documents:', pendingSnapshot.size);

    const verifiedSnapshot = await getDocs(
      query(
        collection(db, DOCUMENTS_COLLECTION),
        where('status', '==', 'VERIFIED'),
        where('isReference', '==', false)
      )
    );
    console.log('AdminService: Loaded verified documents:', verifiedSnapshot.size);

    return {
      success: true,
      stats: {
        totalUsers: usersSnapshot.size,
        totalDocuments: documentsSnapshot.size,
        pendingReviews: pendingSnapshot.size,
        verifiedDocuments: verifiedSnapshot.size,
      },
    };
  } catch (error) {
    console.error('❌ Error fetching admin stats:', error?.message || error);
    return {
      success: false,
      error: error?.message || 'Failed to fetch admin statistics',
      stats: {
        totalUsers: 0,
        totalDocuments: 0,
        pendingReviews: 0,
        verifiedDocuments: 0,
      },
    };
  }
};
