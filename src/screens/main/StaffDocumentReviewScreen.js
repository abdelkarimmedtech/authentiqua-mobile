import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';
import { getUserDisplayName, getUserRole } from '../../utils/user';
import {
  onPendingDocumentsForUniversityChange,
  onPendingDocumentsChange,
  approveDocument,
  rejectDocument,
  logActivity
} from '../../../backend/firestore';

function PendingDocumentCard({ document, onApprove, onReject }) {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const uploadedAt = document?.uploadedAt?.toDate?.() || null;

  const getDocIcon = (type) => {
    const icons = {
      TRANSCRIPT: 'file-document-outline',
      DEGREE: 'school-outline',
      DIPLOMA: 'certificate-outline',
      CERTIFICATE: 'file-certificate-outline',
      ID: 'card-account-details-outline',
      OTHER: 'file-outline',
    };
    return icons[type] || 'file-outline';
  };

  return (
    <View style={[styles.docCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <View style={styles.docHeader}>
        <View style={styles.docIconWrap}>
          <MaterialCommunityIcons name={getDocIcon(document.documentType)} size={20} color="#0E6CFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.docType, { color: '#0E6CFF' }]}>{document.documentType || 'DOCUMENT'}</Text>
          <Text style={[styles.docName, { color: colors.text }]} numberOfLines={1}>
            {document.fileName || 'Document'}
          </Text>
          {uploadedAt ? (
            <Text style={[styles.docTime, { color: colors.textSecondary }]}>
              Submitted {uploadedAt.toLocaleDateString()}
            </Text>
          ) : null}
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>PENDING</Text>
        </View>
      </View>

      <View style={styles.docActions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.rejectBtn]}
          onPress={() => onReject(document)}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="close" size={18} color="#FFFFFF" />
          <Text style={styles.actionText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.approveBtn]}
          onPress={() => onApprove(document)}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
          <Text style={styles.actionText}>Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function StaffDocumentReviewScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const dynamicStyles = createDynamicStyles(colors);
  const university = user?.profile?.university || '';
  const displayName = useMemo(() => getUserDisplayName(user), [user]);
  const insets = useSafeAreaInsets();

  const [pendingDocs, setPendingDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [reviewNotes, setReviewNotes] = useState('');
  const role = useMemo(() => getUserRole(user), [user]);

  useEffect(() => {
    if (!user) return;

    let unsubscribe;
    try {
      unsubscribe = role === 'ADMIN'
        ? onPendingDocumentsChange((res) => {
            if (res.success) {
              setPendingDocs(res.documents || []);
            } else {
              console.error('❌ Error loading pending documents:', res.error);
              Alert.alert('Error', 'Failed to load pending documents. Please check your permissions.');
              setPendingDocs([]);
            }
          })
        : onPendingDocumentsForUniversityChange(university, (res) => {
            if (res.success) {
              setPendingDocs(res.documents || []);
            } else {
              console.error('❌ Error loading pending documents:', res.error);
              Alert.alert('Error', 'Failed to load pending documents. Please check your permissions.');
              setPendingDocs([]);
            }
          });
    } catch (error) {
      console.error('❌ Error setting up document listener:', error?.message || error);
      Alert.alert('Error', 'Failed to load pending documents. Please try again.');
      setPendingDocs([]);
    }

    return () => unsubscribe?.();
  }, [user, university, role]);

  const handleApprove = (document) => {
    setSelectedDoc(document);
    setActionType('approve');
    setReviewNotes('');
    setModalVisible(true);
  };

  const handleReject = (document) => {
    setSelectedDoc(document);
    setActionType('reject');
    setReviewNotes('');
    setModalVisible(true);
  };

  const executeAction = async () => {
    if (!selectedDoc) return;

    try {
      setLoading(true);
      const staffId = user?.uid;

      if (actionType === 'approve') {
        await approveDocument(selectedDoc.id, staffId, reviewNotes);
      } else {
        await rejectDocument(selectedDoc.id, staffId, reviewNotes);
      }

      // Log activity
      await logActivity(staffId, {
        type: 'DOCUMENT_REVIEW',
        status: actionType === 'approve' ? 'VERIFIED' : 'REJECTED',
        description: `${actionType === 'approve' ? 'Approved' : 'Rejected'} document review`,
        details: {
          documentId: selectedDoc.id,
          documentType: selectedDoc.documentType,
          university,
          notes: reviewNotes,
        },
      });

      Alert.alert('Success', `Document ${actionType === 'approve' ? 'approved' : 'rejected'} successfully.`);
      setModalVisible(false);
      setSelectedDoc(null);
      setReviewNotes('');
    } catch (error) {
      console.error('❌ Review action error:', error?.message || 'Unknown error');
      Alert.alert('Error', `Failed to ${actionType} document. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={dynamicStyles.safeArea}>
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={dynamicStyles.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={dynamicStyles.headerTitle}>Document Review</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={dynamicStyles.statsCard}>
          <View style={dynamicStyles.statsRow}>
            <View>
              <Text style={dynamicStyles.statsLabel}>Pending reviews</Text>
              <View style={dynamicStyles.countRow}>
                <Text style={dynamicStyles.count}>{pendingDocs.length}</Text>
                <View style={dynamicStyles.badge}>
                  <Text style={dynamicStyles.badgeText}>NEEDS REVIEW</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={dynamicStyles.scrollContent}>
          {pendingDocs.length === 0 ? (
            <View style={dynamicStyles.emptyState}>
              <MaterialCommunityIcons name="check-circle-outline" size={44} color="#00FF99" />
              <Text style={dynamicStyles.emptyTitle}>All caught up!</Text>
              <Text style={dynamicStyles.emptySub}>No documents pending review at this time.</Text>
            </View>
          ) : (
            pendingDocs.map((doc) => (
              <PendingDocumentCard
                key={doc.id}
                document={doc}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))
          )}
        </ScrollView>

        {/* Review Modal */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={dynamicStyles.modalOverlay}>
            <View style={dynamicStyles.modalContent}>
              <View style={dynamicStyles.modalHeader}>
                <Text style={dynamicStyles.modalTitle}>
                  {actionType === 'approve' ? 'Approve Document' : 'Reject Document'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <MaterialCommunityIcons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {selectedDoc && (
                <View style={dynamicStyles.docPreview}>
                  <Text style={dynamicStyles.docPreviewTitle}>{selectedDoc.documentType}</Text>
                  <Text style={dynamicStyles.docPreviewName}>{selectedDoc.fileName}</Text>
                </View>
              )}

              <Text style={dynamicStyles.notesLabel}>Review Notes (Optional)</Text>
              <TextInput
                style={dynamicStyles.notesInput}
                placeholder="Add notes about this review..."
                placeholderTextColor={colors.textSecondary}
                value={reviewNotes}
                onChangeText={setReviewNotes}
                multiline={true}
                numberOfLines={3}
              />

              <View style={dynamicStyles.modalActions}>
                <TouchableOpacity
                  style={[dynamicStyles.modalBtn, dynamicStyles.cancelBtn]}
                  onPress={() => setModalVisible(false)}
                  disabled={loading}
                >
                  <Text style={dynamicStyles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    dynamicStyles.modalBtn,
                    actionType === 'approve' ? dynamicStyles.approveModalBtn : dynamicStyles.rejectModalBtn
                  ]}
                  onPress={executeAction}
                  disabled={loading}
                >
                  <Text style={[
                    dynamicStyles.modalBtnText,
                    actionType === 'approve' ? { color: '#FFFFFF' } : { color: '#FFFFFF' }
                  ]}>
                    {loading ? 'Processing...' : (actionType === 'approve' ? 'Approve' : 'Reject')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const createDynamicStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.cardBg, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },

  statsCard: { backgroundColor: colors.cardBg, borderRadius: 16, padding: 18, marginHorizontal: 20, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statsLabel: { color: colors.textSecondary, fontSize: 13, marginBottom: 8 },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  count: { color: colors.text, fontSize: 36, fontWeight: '800' },
  badge: { backgroundColor: 'rgba(245,166,35,0.15)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(245,166,35,0.3)' },
  badgeText: { color: '#F5A623', fontSize: 12, fontWeight: '700' },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },

  docCard: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  docHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  docIconWrap: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#0E2748', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  docType: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  docName: { fontSize: 14, fontWeight: '700', marginTop: 4 },
  docTime: { fontSize: 11, marginTop: 4 },
  statusBadge: { backgroundColor: 'rgba(245,166,35,0.15)', borderWidth: 1, borderColor: 'rgba(245,166,35,0.3)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  statusText: { color: '#F5A623', fontSize: 10, fontWeight: '900', letterSpacing: 1 },

  docActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12 },
  rejectBtn: { backgroundColor: '#FF6B6B' },
  approveBtn: { backgroundColor: '#00FF99' },
  actionText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },

  emptyState: { backgroundColor: colors.cardBg, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: colors.border, alignItems: 'center', marginTop: 20 },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 12 },
  emptySub: { color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },

  docPreview: { backgroundColor: colors.cardBg, borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  docPreviewTitle: { color: '#0E6CFF', fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  docPreviewName: { color: colors.text, fontSize: 14, fontWeight: '700', marginTop: 4 },

  notesLabel: { color: colors.text, fontSize: 14, fontWeight: '800', marginBottom: 8 },
  notesInput: { backgroundColor: colors.cardBg, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border, color: colors.text, fontSize: 14, minHeight: 80, textAlignVertical: 'top' },

  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border },
  cancelBtnText: { color: colors.text, fontWeight: '800' },
  approveModalBtn: { backgroundColor: '#00FF99' },
  rejectModalBtn: { backgroundColor: '#FF6B6B' },
  modalBtnText: { fontWeight: '800', fontSize: 14 },
});