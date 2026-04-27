import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';
import { bulkUpdateDocumentStatus, onBulkVerificationDocumentsChange } from '../../../backend/firestore';
import { AdminHeader, ScreenState, StatusBadge, formatDate, getDocumentTitle, sharedStyles } from './adminScreenHelpers';

export default function AdminBulkVerificationScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('AdminBulkVerificationScreen: mounting listener');
    const unsubscribe = onBulkVerificationDocumentsChange((result) => {
      setLoading(false);
      setRefreshing(false);
      if (result.success) {
        setError('');
        setDocuments(result.documents || []);
      } else {
        setError(result.error || 'Failed to load documents for bulk verification');
      }
    });

    return () => unsubscribe?.();
  }, []);

  const selectedIds = useMemo(() => Object.keys(selected).filter((id) => selected[id]), [selected]);

  const toggle = (id) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const confirmBulkAction = (status) => {
    if (!selectedIds.length) {
      Alert.alert('No documents selected', 'Select one or more pending documents first.');
      return;
    }

    Alert.alert(
      `${status === 'APPROVED' ? 'Approve' : 'Reject'} selected documents`,
      `Apply ${status} to ${selectedIds.length} documents?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: status === 'APPROVED' ? 'Approve' : 'Reject',
          style: status === 'REJECTED' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              setSaving(true);
              console.log('AdminBulkVerificationScreen: bulk action', status, selectedIds);
              await bulkUpdateDocumentStatus(selectedIds, status, `Bulk ${status.toLowerCase()} by admin`);
              setSelected({});
              Alert.alert('Success', `${selectedIds.length} documents updated.`);
            } catch (err) {
              console.error('AdminBulkVerificationScreen bulk error:', err?.message || err);
              Alert.alert('Error', err?.message || 'Bulk verification failed.');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor: colors.bg }]}>
      <AdminHeader title="Bulk Verification" subtitle={`${selectedIds.length} selected`} navigation={navigation} colors={colors} />
      <ScrollView
        contentContainerStyle={sharedStyles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 700); }} />}
      >
        <View style={sharedStyles.actions}>
          <TouchableOpacity style={[sharedStyles.actionBtn, { backgroundColor: '#00C781', opacity: saving ? 0.65 : 1 }]} onPress={() => confirmBulkAction('APPROVED')} disabled={saving}>
            <MaterialCommunityIcons name="check-all" size={17} color="#FFFFFF" />
            <Text style={sharedStyles.actionText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[sharedStyles.actionBtn, { backgroundColor: '#FF6B6B', opacity: saving ? 0.65 : 1 }]} onPress={() => confirmBulkAction('REJECTED')} disabled={saving}>
            <MaterialCommunityIcons name="close-box-multiple-outline" size={17} color="#FFFFFF" />
            <Text style={sharedStyles.actionText}>Reject</Text>
          </TouchableOpacity>
        </View>

        <ScreenState
          loading={loading}
          error={error}
          empty={!documents.length}
          emptyTitle="No pending documents"
          emptySubtitle="Documents available for bulk verification will appear here."
          colors={colors}
        />

        {!loading && !error ? documents.map((document) => {
          const active = !!selected[document.id];
          return (
            <TouchableOpacity
              key={document.id}
              style={[sharedStyles.card, { backgroundColor: colors.cardBg, borderColor: active ? '#0E6CFF' : colors.border }]}
              onPress={() => toggle(document.id)}
              activeOpacity={0.85}
            >
              <View style={sharedStyles.row}>
                <MaterialCommunityIcons
                  name={active ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                  size={24}
                  color={active ? '#0E6CFF' : colors.textSecondary}
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[sharedStyles.title, { color: colors.text }]} numberOfLines={1}>{getDocumentTitle(document)}</Text>
                  <Text style={[sharedStyles.sub, { color: colors.textSecondary }]} numberOfLines={1}>
                    {document.uploadedByName || document.uploaderEmail || document.userId || 'Unknown uploader'}
                  </Text>
                </View>
                <StatusBadge status={document.status} />
              </View>
              <View style={sharedStyles.metaGrid}>
                <Text style={[sharedStyles.meta, { color: colors.textSecondary }]}>University: {document.university || 'Not provided'}</Text>
                <Text style={[sharedStyles.meta, { color: colors.textSecondary }]}>Submitted: {formatDate(document.uploadedAt || document.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          );
        }) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
