import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config';

const DOCUMENTS_COLLECTION = 'documents';

const isPdfDocument = (documentData = {}) => {
  const fileName = (documentData.fileName || '').toLowerCase();
  const mimeType = documentData.metadata?.mimeType || documentData.mimeType || '';
  const scanSource = documentData.metadata?.scanSource || documentData.scanSource || '';

  return mimeType === 'application/pdf' || fileName.endsWith('.pdf') || scanSource === 'pdf';
};

/**
 * Firebase Storage is disabled on the Spark plan.
 * Keep this exported helper as a safe no-op for existing imports/call sites.
 */
export const uploadFileToStorage = async (userId, fileUri, fileName, mimeType = 'application/octet-stream') => {
  console.log('[DocumentService] Firebase Storage disabled. Skipping file upload:', {
    userId,
    fileName,
    mimeType,
    fileUri,
  });

  return {
    success: true,
    downloadUrl: null,
    storagePath: null,
  };
};

/**
 * Save document metadata in Firestore only.
 * No Firebase Storage calls are made for PDFs or images.
 */
export const uploadDocument = async (userId, documentData) => {
  try {
    const fileName = documentData.fileName || 'document';
    const mimeType = documentData.metadata?.mimeType || documentData.mimeType || 'application/octet-stream';
    const pdf = isPdfDocument(documentData);
    const scanSource = documentData.metadata?.scanSource || (pdf ? 'pdf' : 'image');
    const metadata = {
      ...(documentData.metadata || {}),
      size: documentData.metadata?.size || 0,
      mimeType,
      pages: documentData.metadata?.pages || 0,
      scanSource,
      storageDisabled: true,
      storagePath: null,
    };

    console.log('[DocumentService] Saving document metadata only. Firebase Storage upload skipped:', {
      userId,
      fileName,
      mimeType,
      scanSource,
    });

    const docRef = await addDoc(collection(db, DOCUMENTS_COLLECTION), {
      userId,
      documentType: documentData.documentType || 'OTHER',
      fileName,
      fileUri: documentData.fileUri || null,
      fileUrl: documentData.fileUrl || null,
      storageUrl: null,
      downloadURL: null,
      downloadUrl: null,
      status: documentData.status || 'PENDING',
      verificationNotes: documentData.verificationNotes || '',
      evidence: documentData.evidence || null,
      final_orchestration: documentData.final_orchestration || null,
      signatureDetected: documentData.signatureDetected ?? documentData.evidence?.signatureDetected ?? null,
      signatureConfidence: documentData.signatureConfidence ?? documentData.evidence?.signatureConfidence ?? null,
      stampDetected: documentData.stampDetected ?? documentData.evidence?.stampDetected ?? null,
      stampConfidence: documentData.stampConfidence ?? documentData.evidence?.stampConfidence ?? null,
      riskScore: documentData.riskScore ?? documentData.final_orchestration?.orchestration_risk_score ?? null,
      university: documentData.university || null,
      isReference: !!documentData.isReference,
      uploadedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      metadata,
    });

    return { success: true, documentId: docRef.id };
  } catch (error) {
    console.error('Error saving document metadata:', error?.message || error);
    throw error;
  }
};

/**
 * Get all documents for a user
 */
export const getUserDocuments = async (userId) => {
  try {
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('uploadedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const documents = [];

    querySnapshot.forEach((docSnap) => {
      documents.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });

    return { success: true, documents };
  } catch (error) {
    console.error('Error getting user documents:', error);
    throw error;
  }
};

/**
 * Get document by ID
 */
export const getDocument = async (documentId) => {
  try {
    const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    }

    return { success: false, data: null };
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
};

/**
 * Update document status or info
 */
export const updateDocument = async (documentId, updates) => {
  try {
    const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);

    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

/**
 * Delete document
 */
export const deleteDocument = async (documentId) => {
  try {
    await deleteDoc(doc(db, DOCUMENTS_COLLECTION, documentId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

/**
 * Real-time listener for user documents
 */
export const onUserDocumentsChange = (userId, callback) => {
  try {
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const documents = [];
      querySnapshot.forEach((docSnap) => {
        documents.push({
          id: docSnap.id,
          ...docSnap.data(),
        });
      });
      documents.sort((a, b) => (b.uploadedAt?.toMillis?.() || 0) - (a.uploadedAt?.toMillis?.() || 0));
      callback({ success: true, documents });
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up documents listener:', error);
    throw error;
  }
};

/**
 * Get documents by status
 */
export const getDocumentsByStatus = async (userId, status) => {
  try {
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      where('userId', '==', userId),
      where('status', '==', status),
      orderBy('uploadedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const documents = [];

    querySnapshot.forEach((docSnap) => {
      documents.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });

    return { success: true, documents };
  } catch (error) {
    console.error('Error getting documents by status:', error);
    throw error;
  }
};

/**
 * Get reference documents for a university (staff uploads)
 */
export const getUniversityReferenceDocuments = async (university, limit = 50) => {
  try {
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      where('university', '==', university)
    );

    const querySnapshot = await getDocs(q);
    const documents = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data?.isReference) {
        documents.push({
          id: docSnap.id,
          ...data,
        });
      }
    });

    documents.sort((a, b) => {
      const am = a.uploadedAt?.toMillis?.() || 0;
      const bm = b.uploadedAt?.toMillis?.() || 0;
      return bm - am;
    });

    return { success: true, documents: documents.slice(0, limit) };
  } catch (error) {
    console.error('Error getting university reference documents:', error?.message || error);
    throw error;
  }
};

/**
 * Real-time listener for university reference documents
 */
export const onUniversityReferenceDocumentsChange = (university, callback) => {
  try {
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      where('university', '==', university)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      try {
        const documents = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data?.isReference) {
            documents.push({
              id: docSnap.id,
              ...data,
            });
          }
        });
        documents.sort((a, b) => {
          const am = a.uploadedAt?.toMillis?.() || 0;
          const bm = b.uploadedAt?.toMillis?.() || 0;
          return bm - am;
        });
        callback({ success: true, documents });
      } catch (error) {
        console.error('Error processing university reference documents snapshot:', error?.message || error);
        callback({ success: false, error: error?.message || 'Failed to process documents' });
      }
    }, (error) => {
      console.error('Error in university reference documents listener:', error?.message || error);
      callback({ success: false, error: error?.message || 'Permission denied or query failed' });
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up reference documents listener:', error?.message || error);
    throw error;
  }
};

/**
 * Check whether a matching reference document exists
 */
export const hasReferenceDocument = async (university, documentType) => {
  try {
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      where('university', '==', university),
      where('isReference', '==', true),
      where('documentType', '==', documentType)
    );
    const querySnapshot = await getDocs(q);
    let reference = null;
    querySnapshot.forEach((docSnap) => {
      if (!reference) {
        reference = { id: docSnap.id, ...docSnap.data() };
      }
    });
    return { success: true, exists: !querySnapshot.empty, reference };
  } catch (error) {
    console.error('Error checking reference document:', error?.message || error);
    throw error;
  }
};

/**
 * Get pending documents for a university (staff review)
 */
export const getPendingDocumentsForUniversity = async (university, limit = 50) => {
  try {
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      where('university', '==', university),
      where('status', '==', 'PENDING'),
      where('isReference', '==', false),
      orderBy('uploadedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const documents = [];

    querySnapshot.forEach((docSnap) => {
      documents.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });

    return { success: true, documents: documents.slice(0, limit) };
  } catch (error) {
    console.error('Error getting pending documents for university:', error?.message || error);
    throw error;
  }
};

/**
 * Real-time listener for pending documents for a university
 */
export const onPendingDocumentsForUniversityChange = (university, callback) => {
  try {
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      where('university', '==', university),
      where('status', '==', 'PENDING'),
      where('isReference', '==', false),
      orderBy('uploadedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      try {
        const documents = [];
        querySnapshot.forEach((docSnap) => {
          documents.push({
            id: docSnap.id,
            ...docSnap.data(),
          });
        });
        callback({ success: true, documents });
      } catch (error) {
        console.error('Error processing university pending documents snapshot:', error?.message || error);
        callback({ success: false, error: error?.message || 'Failed to process documents' });
      }
    }, (error) => {
      console.error('Error in university pending documents listener:', error?.message || error);
      callback({ success: false, error: error?.message || 'Permission denied or query failed' });
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up pending documents listener:', error?.message || error);
    throw error;
  }
};

/**
 * Real-time listener for all pending documents (admin use)
 */
export const onPendingDocumentsChange = (callback) => {
  try {
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      where('status', '==', 'PENDING'),
      where('isReference', '==', false),
      orderBy('uploadedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      try {
        const documents = [];
        querySnapshot.forEach((docSnap) => {
          documents.push({
            id: docSnap.id,
            ...docSnap.data(),
          });
        });
        callback({ success: true, documents });
      } catch (error) {
        console.error('Error processing pending documents snapshot:', error?.message || error);
        callback({ success: false, error: error?.message || 'Failed to process documents' });
      }
    }, (error) => {
      console.error('Error in pending documents listener:', error?.message || error);
      callback({ success: false, error: error?.message || 'Permission denied or query failed' });
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up all pending documents listener:', error?.message || error);
    throw error;
  }
};

/**
 * Approve a document (staff action)
 */
export const approveDocument = async (documentId, staffId, notes = '') => {
  try {
    const updates = {
      status: 'VERIFIED',
      verificationNotes: notes,
      reviewedBy: staffId,
      reviewedAt: Timestamp.now(),
    };

    await updateDocument(documentId, updates);
    return { success: true };
  } catch (error) {
    console.error('Error approving document:', error?.message || error);
    throw error;
  }
};

/**
 * Reject a document (staff action)
 */
export const rejectDocument = async (documentId, staffId, notes = '') => {
  try {
    const updates = {
      status: 'REJECTED',
      verificationNotes: notes,
      reviewedBy: staffId,
      reviewedAt: Timestamp.now(),
    };

    await updateDocument(documentId, updates);
    return { success: true };
  } catch (error) {
    console.error('Error rejecting document:', error?.message || error);
    throw error;
  }
};
