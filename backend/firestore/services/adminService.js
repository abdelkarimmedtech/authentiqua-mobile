import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../config';
import { getUserProfile } from './userService';

const USERS_COLLECTION = 'users';
const DOCUMENTS_COLLECTION = 'documents';
const FEEDBACK_COLLECTION = 'feedback';
const VERIFICATION_RESULTS_COLLECTION = 'verificationResults';
const FRAUD_CASES_COLLECTION = 'fraud_cases';
const TEMPLATES_COLLECTION = 'templates';

const APPROVED_STATUSES = ['APPROVED', 'VERIFIED'];
const VALID_ROLES = ['USER', 'UNIVERSITY_STAFF', 'ADMIN'];

const toMillis = (value) => value?.toMillis?.() || value?.toDate?.()?.getTime?.() || 0;

const sortNewest = (items, dateFields = ['uploadedAt', 'createdAt', 'updatedAt']) =>
  [...items].sort((a, b) => {
    const aTime = Math.max(...dateFields.map((field) => toMillis(a?.[field])));
    const bTime = Math.max(...dateFields.map((field) => toMillis(b?.[field])));
    return bTime - aTime;
  });

const getUserName = (user) =>
  user?.fullName || user?.displayName || user?.name || user?.email || user?.uid || 'Unknown user';

const normalizeRole = (role) => {
  const value = String(role || 'USER').trim().toUpperCase();
  if (value === 'STAFF') return 'UNIVERSITY_STAFF';
  return value;
};

const isAdminRole = (role) => normalizeRole(role) === 'ADMIN';

const getUsersMap = async () => {
  const snapshot = await getDocs(collection(db, USERS_COLLECTION));
  const users = {};
  snapshot.forEach((userDoc) => {
    const data = userDoc.data();
    users[userDoc.id] = {
      id: userDoc.id,
      ...data,
      displayName: getUserName({ uid: userDoc.id, ...data }),
    };
  });
  return users;
};

const enrichDocuments = async (documents) => {
  const users = await getUsersMap();
  return documents.map((document) => {
    const uploader = users[document.userId] || users[document.uploadedBy] || null;
    return {
      ...document,
      uploader,
      uploadedByName: document.uploadedByName || document.uploaderName || getUserName(uploader),
      uploaderEmail: document.uploaderEmail || uploader?.email || '',
    };
  });
};

const requireAdmin = async () => {
  const currentUser = getAuth().currentUser;

  if (!currentUser) {
    throw new Error('No authenticated user found');
  }

  const profileResult = await getUserProfile(currentUser.uid);
  console.log('AdminService: current auth user', {
    uid: currentUser.uid,
    email: currentUser.email,
    firestoreRole: profileResult.data?.role,
    normalizedRole: normalizeRole(profileResult.data?.role),
  });

  if (!profileResult.success) {
    throw new Error('Admin user profile not found in Firestore. Please complete onboarding first.');
  }

  if (!isAdminRole(profileResult.data?.role)) {
    throw new Error(`User is not an admin. Current role: ${profileResult.data?.role || 'none'}`);
  }

  return currentUser;
};

export const getCurrentAdminContext = async () => {
  try {
    const currentUser = getAuth().currentUser;
    if (!currentUser) {
      return { success: false, error: 'No authenticated Firebase user found.' };
    }

    const userRef = doc(db, USERS_COLLECTION, currentUser.uid);
    const userSnap = await getDoc(userRef);
    const profile = userSnap.exists() ? userSnap.data() : null;
    const normalizedRole = normalizeRole(profile?.role);

    console.log('AdminService: admin context check', {
      uid: currentUser.uid,
      email: currentUser.email,
      profileExists: userSnap.exists(),
      role: profile?.role,
      normalizedRole,
    });

    return {
      success: true,
      uid: currentUser.uid,
      email: currentUser.email,
      profile,
      role: profile?.role || null,
      normalizedRole,
      isAdmin: isAdminRole(profile?.role),
    };
  } catch (error) {
    console.error('AdminService getCurrentAdminContext error:', error?.message || error);
    return { success: false, error: error?.message || 'Failed to check admin profile.' };
  }
};

const buildSnapshotHandler = (callback, mapper) => async (querySnapshot) => {
  try {
    const items = [];
    querySnapshot.forEach((snapshotDoc) => {
      items.push({
        id: snapshotDoc.id,
        ...snapshotDoc.data(),
      });
    });

    const mapped = mapper ? await mapper(items) : items;
    callback({ success: true, data: mapped, documents: mapped, users: mapped, feedback: mapped, activity: mapped });
  } catch (error) {
    console.error('AdminService snapshot processing error:', error?.message || error);
    callback({ success: false, error: error?.message || 'Failed to process admin data' });
  }
};

const buildSnapshotErrorHandler = (callback, label) => (error) => {
  console.error(`AdminService ${label} listener error:`, error?.message || error);
  callback({ success: false, error: error?.message || `Failed to load ${label}` });
};

export const onPendingDocumentsChange = (callback) => {
  console.log('AdminService: listening for pending documents');
  const q = query(
    collection(db, DOCUMENTS_COLLECTION),
    where('status', '==', 'PENDING')
  );

  return onSnapshot(
    q,
    buildSnapshotHandler(callback, async (documents) => {
      const nonReference = documents.filter((document) => !document.isReference);
      return sortNewest(await enrichDocuments(nonReference), ['uploadedAt', 'createdAt']);
    }),
    buildSnapshotErrorHandler(callback, 'pending documents')
  );
};

export const onAllDocumentsChange = (callback) => {
  console.log('AdminService: listening for all documents');
  return onSnapshot(
    collection(db, DOCUMENTS_COLLECTION),
    buildSnapshotHandler(callback, async (documents) => {
      const nonReference = documents.filter((document) => !document.isReference);
      return sortNewest(await enrichDocuments(nonReference), ['uploadedAt', 'createdAt']);
    }),
    buildSnapshotErrorHandler(callback, 'documents')
  );
};

export const updateDocumentStatus = async (documentId, status, reason = '') => {
  try {
    await requireAdmin();
    console.log('AdminService: updating document status', { documentId, status });

    const documentRef = doc(db, DOCUMENTS_COLLECTION, documentId);
    await updateDoc(documentRef, {
      status,
      verificationNotes: reason,
      reviewedBy: getAuth().currentUser?.uid || null,
      reviewedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error('AdminService updateDocumentStatus error:', error?.message || error);
    throw error;
  }
};

export const onAllUsersChange = (callback) => {
  console.log('AdminService: listening for all users');
  return onSnapshot(
    collection(db, USERS_COLLECTION),
    buildSnapshotHandler(callback, (users) =>
      sortNewest(
        users.map((user) => ({
          ...user,
          displayName: getUserName(user),
          role: normalizeRole(user.role),
        })),
        ['createdAt', 'updatedAt']
      )
    ),
    buildSnapshotErrorHandler(callback, 'users')
  );
};

export const updateUserRole = async (userId, newRole) => {
  try {
    const currentUser = await requireAdmin();
    const normalizedRole = String(newRole || '').toUpperCase();

    if (!VALID_ROLES.includes(normalizedRole)) {
      throw new Error('Invalid user role');
    }

    if (currentUser.uid === userId && normalizedRole !== 'ADMIN') {
      throw new Error('You cannot remove your own ADMIN role.');
    }

    console.log('AdminService: updating user role', { userId, newRole: normalizedRole });
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      role: normalizedRole,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error('AdminService updateUserRole error:', error?.message || error);
    throw error;
  }
};

export const fetchAdminStats = async () => {
  try {
    console.log('AdminService: Fetching admin statistics...');
    await requireAdmin();

    const [usersSnapshot, documentsSnapshot] = await Promise.all([
      getDocs(collection(db, USERS_COLLECTION)),
      getDocs(collection(db, DOCUMENTS_COLLECTION)),
    ]);

    let pendingDocuments = 0;
    let approvedDocuments = 0;
    let rejectedDocuments = 0;
    let totalDocuments = 0;

    documentsSnapshot.forEach((documentDoc) => {
      const document = documentDoc.data();
      if (document.isReference) return;

      totalDocuments += 1;
      if (document.status === 'PENDING') pendingDocuments += 1;
      if (APPROVED_STATUSES.includes(document.status)) approvedDocuments += 1;
      if (document.status === 'REJECTED') rejectedDocuments += 1;
    });

    let universityStaffCount = 0;
    usersSnapshot.forEach((userDoc) => {
      if (normalizeRole(userDoc.data()?.role) === 'UNIVERSITY_STAFF') {
        universityStaffCount += 1;
      }
    });

    return {
      success: true,
      stats: {
        totalUsers: usersSnapshot.size,
        totalDocuments,
        pendingDocuments,
        approvedDocuments,
        rejectedDocuments,
        universityStaffCount,
        pendingReviews: pendingDocuments,
        verifiedDocuments: approvedDocuments,
      },
    };
  } catch (error) {
    console.error('AdminService fetchAdminStats error:', error?.message || error);

    return {
      success: false,
      error: error?.message || 'Failed to fetch admin statistics',
      stats: {
        totalUsers: 0,
        totalDocuments: 0,
        pendingDocuments: 0,
        approvedDocuments: 0,
        rejectedDocuments: 0,
        universityStaffCount: 0,
        pendingReviews: 0,
        verifiedDocuments: 0,
      },
    };
  }
};

export const onFeedbackChange = (callback) => {
  console.log('AdminService: listening for feedback');
  return onSnapshot(
    collection(db, FEEDBACK_COLLECTION),
    buildSnapshotHandler(callback, (feedback) => sortNewest(feedback, ['createdAt', 'updatedAt'])),
    buildSnapshotErrorHandler(callback, 'feedback')
  );
};

export const onFraudCasesChange = (callback) => {
  console.log('AdminService: listening for fraud cases');
  return onSnapshot(
    collection(db, FRAUD_CASES_COLLECTION),
    buildSnapshotHandler(callback, (cases) => sortNewest(cases, ['createdAt', 'updatedAt'])),
    buildSnapshotErrorHandler(callback, 'fraud cases')
  );
};

export const onDocumentTemplatesChange = (callback) => {
  console.log('AdminService: listening for document templates');
  return onSnapshot(
    collection(db, TEMPLATES_COLLECTION),
    buildSnapshotHandler(callback, (templates) => sortNewest(templates, ['createdAt', 'updatedAt'])),
    buildSnapshotErrorHandler(callback, 'document templates')
  );
};

export const onBulkVerificationDocumentsChange = (callback) => {
  console.log('AdminService: listening for bulk verification documents');
  return onSnapshot(
    collection(db, DOCUMENTS_COLLECTION),
    buildSnapshotHandler(callback, async (documents) => {
      const reviewable = documents.filter((document) => !document.isReference && document.status === 'PENDING');
      return sortNewest(await enrichDocuments(reviewable), ['uploadedAt', 'createdAt']);
    }),
    buildSnapshotErrorHandler(callback, 'bulk verification documents')
  );
};

export const bulkUpdateDocumentStatus = async (documentIds, status, reason = '') => {
  try {
    await requireAdmin();
    const ids = Array.isArray(documentIds) ? documentIds.filter(Boolean) : [];
    if (!ids.length) {
      throw new Error('No documents selected.');
    }

    console.log('AdminService: bulk updating document status', { count: ids.length, status });
    await Promise.all(ids.map((documentId) => updateDoc(doc(db, DOCUMENTS_COLLECTION, documentId), {
      status,
      verificationNotes: reason,
      reviewedBy: getAuth().currentUser?.uid || null,
      reviewedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })));

    return { success: true, count: ids.length };
  } catch (error) {
    console.error('AdminService bulkUpdateDocumentStatus error:', error?.message || error);
    throw error;
  }
};

export const updateFeedbackStatus = async (feedbackId, status) => {
  try {
    await requireAdmin();
    console.log('AdminService: updating feedback status', { feedbackId, status });
    await updateDoc(doc(db, FEEDBACK_COLLECTION, feedbackId), {
      status,
      reviewedAt: Timestamp.now(),
      reviewedBy: getAuth().currentUser?.uid || null,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error('AdminService updateFeedbackStatus error:', error?.message || error);
    throw error;
  }
};

export const deleteFeedback = async (feedbackId) => {
  try {
    await requireAdmin();
    console.log('AdminService: deleting feedback', { feedbackId });
    await deleteDoc(doc(db, FEEDBACK_COLLECTION, feedbackId));
    return { success: true };
  } catch (error) {
    console.error('AdminService deleteFeedback error:', error?.message || error);
    throw error;
  }
};

export const onVerificationActivityChange = (callback) => {
  console.log('AdminService: listening for verification activity');
  let documents = [];
  let results = [];
  let lastError = null;

  const emit = async () => {
    if (lastError) return;
    try {
      const enrichedDocuments = await enrichDocuments(documents);
      const activity = [
        ...enrichedDocuments.map((document) => ({
          id: `document-${document.id}`,
          sourceId: document.id,
          source: 'documents',
          type: 'DOCUMENT_UPLOAD',
          title: document.fileName || document.documentType || 'Document upload',
          userId: document.userId,
          userName: document.uploadedByName,
          userEmail: document.uploaderEmail,
          university: document.university || '',
          status: document.status || 'PENDING',
          confidenceScore: document.confidenceScore || document.aiConfidence || document.verificationResult?.confidenceScore,
          createdAt: document.uploadedAt || document.createdAt || document.updatedAt,
          document,
        })),
        ...results.map((result) => ({
          id: `verification-${result.id}`,
          sourceId: result.id,
          source: 'verificationResults',
          type: 'AI_VERIFICATION',
          title: result.documentTitle || result.fileName || result.documentType || 'AI verification result',
          userId: result.userId,
          userName: result.userName || result.userEmail || result.userId || 'Unknown user',
          userEmail: result.userEmail || '',
          university: result.university || '',
          status: result.status || result.result || 'COMPLETED',
          confidenceScore: result.confidenceScore || result.confidence || result.score,
          createdAt: result.createdAt || result.updatedAt || result.verifiedAt,
          result,
        })),
      ];

      callback({ success: true, activity: sortNewest(activity, ['createdAt']).slice(0, 75) });
    } catch (error) {
      console.error('AdminService verification activity emit error:', error?.message || error);
      callback({ success: false, error: error?.message || 'Failed to load verification activity' });
    }
  };

  const documentsUnsubscribe = onSnapshot(
    collection(db, DOCUMENTS_COLLECTION),
    (snapshot) => {
      documents = [];
      snapshot.forEach((snapshotDoc) => {
        const data = snapshotDoc.data();
        if (!data?.isReference) {
          documents.push({ id: snapshotDoc.id, ...data });
        }
      });
      emit();
    },
    (error) => {
      lastError = error;
      buildSnapshotErrorHandler(callback, 'verification documents')(error);
    }
  );

  const resultsUnsubscribe = onSnapshot(
    collection(db, VERIFICATION_RESULTS_COLLECTION),
    (snapshot) => {
      results = [];
      snapshot.forEach((snapshotDoc) => {
        results.push({ id: snapshotDoc.id, ...snapshotDoc.data() });
      });
      emit();
    },
    (error) => {
      lastError = error;
      buildSnapshotErrorHandler(callback, 'verification results')(error);
    }
  );

  return () => {
    documentsUnsubscribe?.();
    resultsUnsubscribe?.();
  };
};
