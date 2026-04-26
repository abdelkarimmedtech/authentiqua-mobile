/**
 * Firestore Data Models/Schemas
 * This file documents the structure of all Firestore collections
 */

/**
 * Users Collection
 * Path: /users/{userId}
 * Description: Stores user profile and account information
 */
export const UserModel = {
  uid: 'string', // Firebase Authentication UID
  email: 'string', // User email address
  fullName: 'string', // Full name of user
  university: 'string', // University name (e.g., "MedTech")
  location: 'string', // User location (e.g., "Tunis, Tunisia")
  verificationStatus: 'string', // UNVERIFIED | IN_REVIEW | VERIFIED
  profileImage: 'string', // URL to profile image in Firebase Storage
  phone: 'string', // Phone number (optional)
  documents: ['string'], // Array of document IDs linked to user
  createdAt: 'timestamp', // Account creation date
  updatedAt: 'timestamp', // Last profile update
};

/**
 * Documents Collection
 * Path: /documents/{documentId}
 * Description: Stores scanned documents and their verification status
 */
export const DocumentModel = {
  userId: 'string', // Reference to user who uploaded document
  documentType: 'string', // Type: IDENTITY | DIPLOMA | TRANSCRIPT | PASSPORT | OTHER
  fileName: 'string', // Original file name
  fileUrl: 'string', // URL to document in Firebase Storage
  status: 'string', // PENDING | VERIFIED | REJECTED | EXPIRED
  verificationNotes: 'string', // Admin notes on verification
  uploadedAt: 'timestamp', // Document upload date
  updatedAt: 'timestamp', // Last status update
  expiryDate: 'timestamp', // Optional expiry date for documents
  reviewedBy: 'string', // Staff ID who reviewed the document
  reviewedAt: 'timestamp', // When the document was reviewed
  metadata: {
    size: 'number', // File size in bytes
    mimeType: 'string', // MIME type (application/pdf, image/jpeg, etc)
    pages: 'number', // Number of pages (if applicable)
    storagePath: 'string', // Path in Firebase Storage
  }
};

/**
 * Activity Collection
 * Path: /activity/{activityId}
 * Description: Logs all verification and document-related activities
 */
export const ActivityModel = {
  userId: 'string', // User who performed the activity
  type: 'string', // VERIFICATION | DOCUMENT_UPLOAD | DOCUMENT_DELETE | STATUS_CHANGE | LOGIN
  documentId: 'string', // Reference to document (if applicable)
  status: 'string', // VERIFIED | PENDING | REJECTED | IN_REVIEW
  description: 'string', // Human-readable description
  details: {}, // Additional context-specific data
  createdAt: 'timestamp', // When activity occurred
};

/**
 * Settings Collection
 * Path: /settings/{userId}
 * Description: Stores user preferences and app settings
 */
export const SettingsModel = {
  userId: 'string', // Reference to user
  notifications: {
    pushEnabled: 'boolean', // Enable push notifications
    emailEnabled: 'boolean', // Enable email notifications
    updateEnabled: 'boolean', // Enable document update notifications
    promoEnabled: 'boolean', // Enable promotional/marketing emails
  },
  appearance: {
    theme: 'string', // dark | light
    textSize: 'string', // small | normal | large (optional)
  },
  biometric: {
    enabled: 'boolean', // Face ID / Fingerprint login enabled
    method: 'string', // faceId | fingerprint (optional)
  },
  twoFactorAuth: {
    enabled: 'boolean', // Two-factor authentication enabled
    method: 'string', // email | sms (optional)
  },
  createdAt: 'timestamp', // Settings created date
  updatedAt: 'timestamp', // Last settings update
};

/**
 * Collection Indexes
 * These indexes should be created in Firestore for optimal query performance
 */
export const requiredIndexes = [
  {
    collection: 'documents',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'uploadedAt', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'documents',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'uploadedAt', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'activity',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'activity',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'type', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'activity',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ]
  }
];

/**
 * Storage Paths
 * Structure for Firebase Cloud Storage
 */
export const storagePaths = {
  profileImages: 'users/{userId}/profile',
  documents: 'users/{userId}/documents/{documentId}',
  tempUploads: 'temp/{userId}/{timestamp}',
};
