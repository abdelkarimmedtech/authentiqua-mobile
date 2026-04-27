import React, { useContext, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';
import { deleteFeedback, onFeedbackChange, updateFeedbackStatus } from '../../../backend/firestore';
import { AdminHeader, ScreenState, StatusBadge, formatDate, sharedStyles } from './adminScreenHelpers';

export default function AdminFeedbackScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('AdminFeedbackScreen: mounting listener');
    const unsubscribe = onFeedbackChange((result) => {
      setLoading(false);
      setRefreshing(false);
      if (result.success) {
        setError('');
        setFeedback(result.feedback || []);
      } else {
        setError(result.error || 'Failed to load feedback');
      }
    });

    return () => unsubscribe?.();
  }, []);

  const markReviewed = async (item) => {
    try {
      console.log('AdminFeedbackScreen: mark reviewed', item.id);
      await updateFeedbackStatus(item.id, 'REVIEWED');
    } catch (err) {
      console.error('AdminFeedbackScreen review error:', err?.message || err);
      Alert.alert('Error', err?.message || 'Failed to update feedback.');
    }
  };

  const confirmDelete = (item) => {
    Alert.alert('Delete feedback', 'This feedback item will be permanently deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            console.log('AdminFeedbackScreen: delete feedback', item.id);
            await deleteFeedback(item.id);
          } catch (err) {
            console.error('AdminFeedbackScreen delete error:', err?.message || err);
            Alert.alert('Error', err?.message || 'Failed to delete feedback.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor: colors.bg }]}>
      <AdminHeader title="Feedback" subtitle={`${feedback.length} feedback items`} navigation={navigation} colors={colors} />
      <ScrollView
        contentContainerStyle={sharedStyles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 700); }} />}
      >
        <ScreenState
          loading={loading}
          error={error}
          empty={!feedback.length}
          emptyTitle="No feedback yet"
          emptySubtitle="User feedback will appear here when submitted."
          colors={colors}
        />

        {!loading && !error ? feedback.map((item) => (
          <View key={item.id} style={[sharedStyles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={sharedStyles.row}>
              <View style={sharedStyles.iconWrap}>
                <MaterialCommunityIcons name="message-text-outline" size={22} color="#0E6CFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[sharedStyles.title, { color: colors.text }]} numberOfLines={1}>
                  {item.userName || item.name || item.email || item.userEmail || 'Anonymous user'}
                </Text>
                <Text style={[sharedStyles.sub, { color: colors.textSecondary }]}>{item.email || item.userEmail || 'No email provided'}</Text>
              </View>
              <StatusBadge status={item.status || 'NEW'} />
            </View>
            <Text style={{ color: colors.text, marginTop: 12, lineHeight: 20 }}>{item.message || item.feedback || 'No message'}</Text>
            <View style={sharedStyles.metaGrid}>
              <Text style={[sharedStyles.meta, { color: colors.textSecondary }]}>Rating: {item.rating || 'No rating'}</Text>
              <Text style={[sharedStyles.meta, { color: colors.textSecondary }]}>Created: {formatDate(item.createdAt)}</Text>
            </View>
            <View style={sharedStyles.actions}>
              <TouchableOpacity style={[sharedStyles.actionBtn, { backgroundColor: '#0E6CFF' }]} onPress={() => markReviewed(item)}>
                <MaterialCommunityIcons name="check-circle-outline" size={17} color="#FFFFFF" />
                <Text style={sharedStyles.actionText}>Reviewed</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[sharedStyles.actionBtn, { backgroundColor: '#FF6B6B' }]} onPress={() => confirmDelete(item)}>
                <MaterialCommunityIcons name="delete-outline" size={17} color="#FFFFFF" />
                <Text style={sharedStyles.actionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
