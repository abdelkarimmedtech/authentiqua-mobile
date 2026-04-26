/**
 * Firestore Services Index
 * Export all services from one location for easy imports
 */

// Config
export { auth, db, app as firebaseApp } from './config';

// Auth Service
export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  onAuthStateChange,
  sendResetEmail,
  updateUserEmail,
  updateUserPassword,
} from './services/authService';

// User Service
export {
  setUserProfile,
  getUserProfile,
  getUserByEmail,
  updateUserProfile,
  onUserProfileChange,
  getUserVerificationStatus,
} from './services/userService';

// Document Service
export {
  uploadDocument,
  uploadFileToStorage,
  getUserDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  onUserDocumentsChange,
  getDocumentsByStatus,
  getUniversityReferenceDocuments,
  onUniversityReferenceDocumentsChange,
  hasReferenceDocument,
  getPendingDocuments,
  onPendingDocumentsForUniversityChange,
  onPendingDocumentsChange,
  approveDocument,
  rejectDocument,
} from './services/documentService';

// Activity Service
export {
  logActivity,
  getUserActivity,
  getActivityByType,
  getActivityByStatus,
  onUserActivityChange,
  getVerificationSummary,
} from './services/activityService';

// Settings Service
export {
  initializeSettings,
  getUserSettings,
  updateNotificationSettings,
  updateAppearanceSettings,
  updateBiometricSettings,
  updateTwoFactorAuthSettings,
  onUserSettingsChange,
  getNotificationSetting,
  updateAllSettings,
} from './services/settingsService';

// Initialization Service
export {
  initializeFirestoreCollections,
} from './services/initService';

// Admin Service
export {
  fetchAdminStats,
} from './services/adminService';

// Data Models
export { UserModel, DocumentModel, ActivityModel, SettingsModel, requiredIndexes, storagePaths } from './models/dataModels';
