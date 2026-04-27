import React, { useContext, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';
import { onDocumentTemplatesChange } from '../../../backend/firestore';
import { AdminHeader, ScreenState, formatDate, sharedStyles } from './adminScreenHelpers';

export default function AdminTemplatesScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('AdminTemplatesScreen: mounting listener');
    const unsubscribe = onDocumentTemplatesChange((result) => {
      setLoading(false);
      setRefreshing(false);
      if (result.success) {
        setError('');
        setTemplates(result.data || []);
      } else {
        setError(result.error || 'Failed to load document templates');
      }
    });

    return () => unsubscribe?.();
  }, []);

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor: colors.bg }]}>
      <AdminHeader title="Document Templates" subtitle={`${templates.length} templates`} navigation={navigation} colors={colors} />
      <ScrollView
        contentContainerStyle={sharedStyles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 700); }} />}
      >
        <ScreenState
          loading={loading}
          error={error}
          empty={!templates.length}
          emptyTitle="No templates found"
          emptySubtitle="Official verification templates from Firestore will appear here."
          colors={colors}
        />

        {!loading && !error ? templates.map((template) => (
          <View key={template.id} style={[sharedStyles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={sharedStyles.row}>
              <View style={sharedStyles.iconWrap}>
                <MaterialCommunityIcons name="file-cabinet" size={22} color="#9C27B0" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[sharedStyles.title, { color: colors.text }]} numberOfLines={1}>
                  {template.name || template.title || template.documentType || 'Document template'}
                </Text>
                <Text style={[sharedStyles.sub, { color: colors.textSecondary }]}>
                  {template.university || template.country || 'Global template'}
                </Text>
              </View>
            </View>
            <View style={sharedStyles.metaGrid}>
              <Text style={[sharedStyles.meta, { color: colors.textSecondary }]}>Type: {template.documentType || template.type || 'Not set'}</Text>
              <Text style={[sharedStyles.meta, { color: colors.textSecondary }]}>Status: {template.status || 'ACTIVE'}</Text>
              <Text style={[sharedStyles.meta, { color: colors.textSecondary }]}>Updated: {formatDate(template.updatedAt || template.createdAt)}</Text>
            </View>
          </View>
        )) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
