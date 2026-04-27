import React, { useContext, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';
import { onAdminPendingDocumentsChange, updateDocumentStatus } from '../../../backend/firestore';
import {
  AdminHeader,
  ScreenState,
  StatusBadge,
  formatDate,
  getDocumentTitle,
  getFileType,
  sharedStyles,
} from './adminScreenHelpers';

function PendingDocumentCard({ document, colors, navigation, onStatusChange }) {
  const confirmStatus = (status) => {
    const verb = status === 'APPROVED' ? 'Approve' : 'Reject';
    Alert.alert(
      `${verb} document`,
      `Are you sure you want to ${verb.toLowerCase()} "${getDocumentTitle(document)}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: verb, style: status === 'REJECTED' ? 'destructive' : 'default', onPress: () => onStatusChange(document, status) },
      ]
    );
  };

  return (
    <View style={[sharedStyles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <View style={sharedStyles.row}>
        <View style={sharedStyles.iconWrap}>
          <MaterialCommunityIcons name="file-document-outline" size={22} color="#0E6CFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[sharedStyles.title, { color: colors.text }]} numberOfLines={1}>{getDocumentTitle(document)}</Text>
          <Text style={[sharedStyles.sub, { color: colors.textSecondary }]}>By {document.uploadedByName}</Text>
        </View>
        <StatusBadge status={document.status} />
      </View>

      <View style={sharedStyles.metaGrid}>
        <Text style={[sharedStyles.meta, { color: colors.textSecondary }]}>University: {document.university || 'Not provided'}</Text>
        <Text style={[sharedStyles.meta, { color: colors.textSecondary }]}>Created: {formatDate(document.uploadedAt || document.createdAt)}</Text>
        <Text style={[sharedStyles.meta, { color: colors.textSecondary }]}>File type: {getFileType(document)}</Text>
      </View>

      <View style={sharedStyles.actions}>
        <TouchableOpacity style={[sharedStyles.actionBtn, { backgroundColor: '#0E6CFF' }]} onPress={() => navigation.navigate('DocumentDetail', { id: document.id })}>
          <MaterialCommunityIcons name="eye-outline" size={17} color="#FFFFFF" />
          <Text style={sharedStyles.actionText}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[sharedStyles.actionBtn, { backgroundColor: '#FF6B6B' }]} onPress={() => confirmStatus('REJECTED')}>
          <MaterialCommunityIcons name="close" size={17} color="#FFFFFF" />
          <Text style={sharedStyles.actionText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[sharedStyles.actionBtn, { backgroundColor: '#00C781' }]} onPress={() => confirmStatus('APPROVED')}>
          <MaterialCommunityIcons name="check" size={17} color="#FFFFFF" />
          <Text style={sharedStyles.actionText}>Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AdminPendingDocumentsScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('AdminPendingDocumentsScreen: mounting listener');
    const unsubscribe = onAdminPendingDocumentsChange((result) => {
      setLoading(false);
      setRefreshing(false);
      if (result.success) {
        setError('');
        setDocuments(result.documents || []);
      } else {
        setError(result.error || 'Failed to load pending documents');
      }
    });

    return () => unsubscribe?.();
  }, []);

  const onStatusChange = async (document, status) => {
    try {
      console.log('AdminPendingDocumentsScreen: status update', document.id, status);
      await updateDocumentStatus(document.id, status);
      Alert.alert('Success', `Document ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully.`);
    } catch (err) {
      console.error('AdminPendingDocumentsScreen status error:', err?.message || err);
      Alert.alert('Error', err?.message || 'Failed to update document status.');
    }
  };

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor: colors.bg }]}>
      <AdminHeader title="Pending Documents" subtitle={`${documents.length} waiting for review`} navigation={navigation} colors={colors} />
      <ScrollView
        contentContainerStyle={sharedStyles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 700); }} />}
      >
        <ScreenState
          loading={loading}
          error={error}
          empty={!documents.length}
          emptyTitle="No pending documents"
          emptySubtitle="New uploads that need admin review will appear here."
          colors={colors}
        />
        {!loading && !error ? documents.map((document) => (
          <PendingDocumentCard
            key={document.id}
            document={document}
            colors={colors}
            navigation={navigation}
            onStatusChange={onStatusChange}
          />
        )) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
