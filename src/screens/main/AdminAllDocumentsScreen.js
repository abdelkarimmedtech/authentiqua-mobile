import React, { useContext, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';
import { onAllDocumentsChange } from '../../../backend/firestore';
import {
  AdminHeader,
  FilterChip,
  ScreenState,
  StatusBadge,
  formatDate,
  getDocumentTitle,
  getFileType,
  sharedStyles,
} from './adminScreenHelpers';

const FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

export default function AdminAllDocumentsScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const [documents, setDocuments] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('AdminAllDocumentsScreen: mounting listener');
    const unsubscribe = onAllDocumentsChange((result) => {
      setLoading(false);
      setRefreshing(false);
      if (result.success) {
        setError('');
        setDocuments(result.documents || []);
      } else {
        setError(result.error || 'Failed to load documents');
      }
    });

    return () => unsubscribe?.();
  }, []);

  const filteredDocuments = useMemo(() => {
    const term = search.trim().toLowerCase();
    return documents.filter((document) => {
      const status = document.status === 'VERIFIED' ? 'APPROVED' : document.status;
      const matchesFilter = filter === 'ALL' || status === filter;
      const haystack = `${getDocumentTitle(document)} ${document.uploadedByName || ''} ${document.uploaderEmail || ''}`.toLowerCase();
      return matchesFilter && (!term || haystack.includes(term));
    });
  }, [documents, filter, search]);

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor: colors.bg }]}>
      <AdminHeader title="All Documents" subtitle={`${filteredDocuments.length} of ${documents.length} documents`} navigation={navigation} colors={colors} />
      <ScrollView
        contentContainerStyle={sharedStyles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 700); }} />}
      >
        <View style={sharedStyles.filters}>
          {FILTERS.map((item) => (
            <FilterChip key={item} label={item === 'ALL' ? 'All' : item[0] + item.slice(1).toLowerCase()} active={filter === item} onPress={() => setFilter(item)} colors={colors} />
          ))}
        </View>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search title or uploader"
          placeholderTextColor={colors.textSecondary}
          style={[sharedStyles.searchInput, { backgroundColor: colors.cardBg, borderColor: colors.border, color: colors.text }]}
        />

        <ScreenState
          loading={loading}
          error={error}
          empty={!filteredDocuments.length}
          emptyTitle="No documents found"
          emptySubtitle="Try another filter or search term."
          colors={colors}
        />

        {!loading && !error ? filteredDocuments.map((document) => (
          <TouchableOpacity
            key={document.id}
            style={[sharedStyles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
            onPress={() => navigation.navigate('DocumentDetail', { id: document.id })}
            activeOpacity={0.85}
          >
            <View style={sharedStyles.row}>
              <View style={sharedStyles.iconWrap}>
                <MaterialCommunityIcons name="file-document-multiple-outline" size={22} color="#0E6CFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[sharedStyles.title, { color: colors.text }]} numberOfLines={1}>{getDocumentTitle(document)}</Text>
                <Text style={[sharedStyles.sub, { color: colors.textSecondary }]}>By {document.uploadedByName}</Text>
              </View>
              <StatusBadge status={document.status === 'VERIFIED' ? 'APPROVED' : document.status} />
            </View>
            <View style={sharedStyles.metaGrid}>
              <Text style={[sharedStyles.meta, { color: colors.textSecondary }]}>University: {document.university || 'Not provided'}</Text>
              <Text style={[sharedStyles.meta, { color: colors.textSecondary }]}>Created: {formatDate(document.uploadedAt || document.createdAt)}</Text>
              <Text style={[sharedStyles.meta, { color: colors.textSecondary }]}>File type: {getFileType(document)}</Text>
            </View>
          </TouchableOpacity>
        )) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
