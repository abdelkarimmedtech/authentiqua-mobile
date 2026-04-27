import React, { useContext, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';
import { onVerificationActivityChange } from '../../../backend/firestore';
import { AdminHeader, ScreenState, StatusBadge, formatDate, sharedStyles } from './adminScreenHelpers';

const formatConfidence = (score) => {
  if (score === undefined || score === null || score === '') return 'Not available';
  const numeric = Number(score);
  if (Number.isNaN(numeric)) return String(score);
  return numeric <= 1 ? `${Math.round(numeric * 100)}%` : `${Math.round(numeric)}%`;
};

export default function AdminVerificationActivityScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('AdminVerificationActivityScreen: mounting listener');
    const unsubscribe = onVerificationActivityChange((result) => {
      setLoading(false);
      setRefreshing(false);
      if (result.success) {
        setError('');
        setActivity(result.activity || []);
      } else {
        setError(result.error || 'Failed to load verification activity');
      }
    });

    return () => unsubscribe?.();
  }, []);

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor: colors.bg }]}>
      <AdminHeader title="Verification Activity" subtitle="Newest uploads and AI checks" navigation={navigation} colors={colors} />
      <ScrollView
        contentContainerStyle={sharedStyles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 700); }} />}
      >
        <ScreenState
          loading={loading}
          error={error}
          empty={!activity.length}
          emptyTitle="No verification activity"
          emptySubtitle="Recent uploads and AI verification results will appear here."
          colors={colors}
        />

        {!loading && !error ? activity.map((item) => (
          <View key={item.id} style={[sharedStyles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={sharedStyles.row}>
              <View style={sharedStyles.iconWrap}>
                <MaterialCommunityIcons
                  name={item.source === 'verificationResults' ? 'robot-outline' : 'cloud-upload-outline'}
                  size={23}
                  color="#0E6CFF"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[sharedStyles.title, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[sharedStyles.sub, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.userName || item.userEmail || item.userId || 'Unknown user'}
                </Text>
              </View>
              <StatusBadge status={item.status} />
            </View>
            <View style={sharedStyles.metaGrid}>
              <Text style={[sharedStyles.meta, { color: colors.textSecondary }]}>Type: {item.type === 'AI_VERIFICATION' ? 'AI verification' : 'Document upload'}</Text>
              <Text style={[sharedStyles.meta, { color: colors.textSecondary }]}>Confidence: {formatConfidence(item.confidenceScore)}</Text>
              <Text style={[sharedStyles.meta, { color: colors.textSecondary }]}>University: {item.university || 'Not provided'}</Text>
              <Text style={[sharedStyles.meta, { color: colors.textSecondary }]}>Date: {formatDate(item.createdAt)}</Text>
            </View>
          </View>
        )) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
