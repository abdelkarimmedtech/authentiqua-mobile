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
  Timestamp
} from 'firebase/firestore';
import { db } from '../config';

const DOCUMENTS_COLLECTION = 'documents';

/**
 * Upload scanned document
 */
export const uploadDocument = async (userId, documentData) => {
  try {
    const docRef = await addDoc(collection(db, DOCUMENTS_COLLECTION), {
      userId,
      documentType: documentData.documentType || 'OTHER',
      fileName: documentData.fileName || 'document',
      fileUrl: documentData.fileUrl || '',
      status: documentData.status || 'PENDING',
      verificationNotes: documentData.verificationNotes || '',
      university: documentData.university || null,
      isReference: !!documentData.isReference,
      uploadedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      metadata: {
        size: documentData.metadata?.size || 0,
        mimeType: documentData.metadata?.mimeType || 'application/octet-stream',
        pages: documentData.metadata?.pages || 0,
      },
    });

    return { success: true, documentId: docRef.id };
  } catch (error) {
    console.error('❌ Error uploading document:', error.message);
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

    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data(),
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
    } else {
      return { success: false, data: null };
    }
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
      where('userId', '==', userId),
      orderBy('uploadedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data(),
        });
      });
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

    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data(),
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

    querySnapshot.forEach((d) => {
      const data = d.data();
      if (data?.isReference) {
        documents.push({
          id: d.id,
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
      const documents = [];
      querySnapshot.forEach((d) => {
        const data = d.data();
        if (data?.isReference) {
          documents.push({
            id: d.id,
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
    querySnapshot.forEach((d) => {
      if (!reference) {
        reference = { id: d.id, ...d.data() };
      }
    });
    return { success: true, exists: !querySnapshot.empty, reference };
  } catch (error) {
    console.error('Error checking reference document:', error?.message || error);
    throw error;
  }
};
