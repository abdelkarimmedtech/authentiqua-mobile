/**
 * Firestore creates collections automatically when real app data is written.
 * Do not create client-side _system documents here, because production rules
 * commonly block those writes and produce noisy permission errors at startup.
 */
export const initializeFirestoreCollections = async () => {
  console.log('[Firestore] Collection initialization skipped; collections are created on first write.');
  return true;
};
