import React, { useContext, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';
import { onFraudCasesChange } from '../../../backend/firestore';
import { AdminHeader, ScreenState, StatusBadge, formatDate, sharedStyles } from './adminScreenHelpers';

export default function AdminFraudCasesScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('AdminFraudCasesScreen: mounting listener');
    const unsubscribe = onFraudCasesChange((result) => {
      setLoading(false);
      setRefreshing(false);
      if (result.success) {
        setError('');
        setCases(result.data || []);
      } else {
        setError(result.error || 'Failed to load fraud cases');
      }
    });

    return () => unsubscribe?.();
  }, []);

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor: colors.bg }]}>
      <AdminHeader title="Fraud Cases" subtitle={`${cases.length} suspicious records`} navigation={navigation} colors={colors} />
      <ScrollView
        contentContainerStyle={sharedStyles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 700); }} />}
      >
        <ScreenState
          loading={loading}
          error={error}
          empty={!cases.length}
          emptyTitle="No fraud cases"
          emptySubtitle="Suspicious verification activity will appear here."
          colors={colors}
        />

        {!loading && !error ? cases.map((item) => (
          <View key={item.id} style={[sharedStyles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={sharedStyles.row}>
              <View style={sharedStyles.iconWrap}>
                <MaterialCommunityIcons name="alert-circle-outline" size={23} color="#FF6B6B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[sharedStyles.title, { color: colors.text }]} numberOfLines={1}>
                  {item.title || item.reason || item.type || 'Suspicious activity'}
                </Text>
                <Text style={[sharedStyles.sub, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.userEmail || item.userId || item.documentId || 'No linked user'}
                </Text>
              </View>
              <StatusBadge status={item.status || 'OPEN'} />
            </View>
            <View style={sharedStyles.metaGrid}>
              <Text style={[sharedStyles.meta, { color: colors.textSecondary }]}>Severity: {item.severity || 'Not set'}</Text>
              <Text style={[sharedStyles.meta, { color: colors.textSecondary }]}>Document: {item.documentId || 'Not linked'}</Text>
              <Text style={[sharedStyles.meta, { color: colors.textSecondary }]}>Created: {formatDate(item.createdAt || item.updatedAt)}</Text>
            </View>
          </View>
        )) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
