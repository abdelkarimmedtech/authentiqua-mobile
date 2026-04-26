import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';
import { getUserDisplayName } from '../../utils/user';
import { fetchAdminStats } from '../../../backend/firestore';

function StatCard({ title, value, icon, color = '#0E6CFF' }) {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);

  return (
    <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <View style={[styles.statIconWrap, { backgroundColor: `${color}20` }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
      </View>
    </View>
  );
}

function ActionCard({ title, subtitle, icon, onPress, color = '#0E6CFF' }) {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);

  return (
    <TouchableOpacity
      style={[styles.actionCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.actionIconWrap, { backgroundColor: `${color}20` }]}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.actionTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

export default function AdminDashboardScreen({ navigation }) {
  const { user, signOut } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const displayName = useMemo(() => getUserDisplayName(user), [user]);
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDocuments: 0,
    pendingReviews: 0,
    verifiedDocuments: 0,
  });

  useEffect(() => {
    refreshStats();
  }, []);

  const refreshStats = async () => {
    try {
      setRefreshing(true);
      console.log('Fetching admin stats...');
      const response = await fetchAdminStats();
      if (response.success) {
        console.log('Admin stats loaded:', response.stats);
        setStats(response.stats);
      } else {
        console.error('Admin stats response failed:', response.error);
        Alert.alert('Error', 'Failed to load admin statistics. Please try again.');
      }
    } catch (error) {
      console.error('❌ Admin stats fetch error:', error?.message || error);
      Alert.alert('Permission Error', 'Unable to load admin statistics. Please check your permissions or try logging out and back in.');
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    await refreshStats();
  };

  const handleFraudCases = () => {
    Alert.alert('Fraud Cases', 'Review suspicious documents in the pending queue below.');
  };

  const handleSystemStats = () => {
    Alert.alert('System Statistics', `Total Users: ${stats.totalUsers}\nTotal Documents: ${stats.totalDocuments}\nPending Reviews: ${stats.pendingReviews}\nVerified Documents: ${stats.verifiedDocuments}`);
  };

  const handleTemplates = () => {
    Alert.alert('Coming Soon', 'Document template management will be available in the next update.');
  };

  const handleStaffManagement = () => {
    Alert.alert('Coming Soon', 'Staff management interface will be available in the next update.');
  };

  const handleBulkVerification = () => {
    Alert.alert('Coming Soon', 'Bulk document verification will be available in the next update.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.portalIconWrap}>
            <MaterialCommunityIcons name="shield-account" size={26} color="#0E6CFF" />
          </View>
          <View>
            <Text style={styles.portalLabel}>ADMIN PORTAL</Text>
            <Text style={styles.portalName}>System Dashboard</Text>
            <Text style={styles.portalSub}>Signed in as {displayName}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.notifBtn} onPress={signOut}>
          <MaterialCommunityIcons name="logout" size={24} color="#E6EEF8" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>System Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers.toLocaleString()}
              icon="account-group"
              color="#0E6CFF"
            />
            <StatCard
              title="Total Documents"
              value={stats.totalDocuments.toLocaleString()}
              icon="file-document-multiple"
              color="#00FF99"
            />
            <StatCard
              title="Pending Reviews"
              value={stats.pendingReviews.toString()}
              icon="clock-outline"
              color="#F5A623"
            />
            <StatCard
              title="Verified Documents"
              value={stats.verifiedDocuments.toLocaleString()}
              icon="check-circle"
              color="#00FF99"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Management Tools</Text>
          <ActionCard
            title="Review Pending Documents"
            subtitle="Approve or reject verification requests"
            icon="clipboard-check"
            onPress={() => navigation.navigate('StaffDocumentReview')}
            color="#4CAF50"
          />
          <ActionCard
            title="System Statistics"
            subtitle="Detailed analytics and reports"
            icon="chart-line"
            onPress={handleSystemStats}
            color="#0E6CFF"
          />
          <ActionCard
            title="Fraud Cases"
            subtitle="Review and manage suspicious activities"
            icon="alert-circle"
            onPress={handleFraudCases}
            color="#FF6B6B"
          />
          <ActionCard
            title="Document Templates"
            subtitle="Manage verification templates"
            icon="file-cabinet"
            onPress={handleTemplates}
            color="#9C27B0"
          />
          <ActionCard
            title="Staff Management"
            subtitle="Manage university staff accounts"
            icon="account-cog"
            onPress={handleStaffManagement}
            color="#FF9800"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Bulk Operations</Text>
          <ActionCard
            title="Bulk Verification"
            subtitle="Process multiple documents at once"
            icon="checkbox-multiple-marked"
            onPress={handleBulkVerification}
            color="#4CAF50"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071027' },

  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  headerLeft:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  portalIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#0A1F3A', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#0E2748' },
  portalLabel:    { color: '#5B7A9A', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 2 },
  portalName:     { color: '#E6EEF8', fontSize: 16, fontWeight: '800' },
  portalSub:      { color: '#9AA7C0', fontSize: 11, marginTop: 4 },
  notifBtn:       { position: 'relative' },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '800', marginBottom: 14 },

  statsGrid: { gap: 12 },
  statCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A1F3A', borderRadius: 16, padding: 16, borderWidth: 1 },
  statIconWrap: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  statValue: { fontSize: 24, fontWeight: '800' },
  statTitle: { fontSize: 12, fontWeight: '700', marginTop: 4 },

  actionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A1F3A', borderRadius: 16, padding: 16, marginBottom: 8, borderWidth: 1 },
  actionIconWrap: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  actionTitle: { fontSize: 15, fontWeight: '700' },
  actionSubtitle: { fontSize: 12, marginTop: 2 },
});