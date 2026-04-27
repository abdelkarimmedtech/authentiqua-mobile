import React, { useContext, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';
import { fetchAdminStats } from '../../../backend/firestore';
import { AdminHeader, ScreenState, sharedStyles } from './adminScreenHelpers';

const STAT_DEFS = [
  ['totalUsers', 'Total users', 'account-group', '#0E6CFF'],
  ['totalDocuments', 'Total documents', 'file-document-multiple-outline', '#7C4DFF'],
  ['pendingDocuments', 'Pending documents', 'clock-outline', '#F5A623'],
  ['approvedDocuments', 'Approved documents', 'check-circle-outline', '#00C781'],
  ['rejectedDocuments', 'Rejected documents', 'close-circle-outline', '#FF6B6B'],
  ['universityStaffCount', 'University staff', 'school-outline', '#00A8E8'],
];

export default function AdminReportsScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadStats = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      console.log('AdminReportsScreen: fetching stats');
      const result = await fetchAdminStats();
      if (!result.success) throw new Error(result.error || 'Failed to load reports');
      setStats(result.stats || {});
      setError('');
    } catch (err) {
      console.error('AdminReportsScreen stats error:', err?.message || err);
      setError(err?.message || 'Failed to load reports');
      Alert.alert('Error', err?.message || 'Failed to load reports.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor: colors.bg }]}>
      <AdminHeader title="Reports" subtitle="Live administrative analytics" navigation={navigation} colors={colors} />
      <ScrollView
        contentContainerStyle={sharedStyles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadStats(true)} />}
      >
        <ScreenState loading={loading} error={error} empty={false} colors={colors} />

        {!loading && !error ? STAT_DEFS.map(([key, label, icon, color]) => (
          <View key={key} style={[sharedStyles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={sharedStyles.row}>
              <View style={[sharedStyles.iconWrap, { backgroundColor: `${color}22` }]}>
                <MaterialCommunityIcons name={icon} size={24} color={color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[sharedStyles.sub, { color: colors.textSecondary }]}>{label}</Text>
                <Text style={{ color: colors.text, fontSize: 28, fontWeight: '900', marginTop: 3 }}>
                  {(stats[key] || 0).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        )) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
