import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';
import { onAllUsersChange, updateUserRole } from '../../../backend/firestore';
import { AdminHeader, FilterChip, ScreenState, formatDate, sharedStyles } from './adminScreenHelpers';

const ROLES = ['ALL', 'USER', 'UNIVERSITY_STAFF', 'ADMIN'];
const EDITABLE_ROLES = ['USER', 'UNIVERSITY_STAFF', 'ADMIN'];

export default function AdminUsersScreen({ navigation }) {
  const { user: currentUser } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('AdminUsersScreen: mounting listener');
    const unsubscribe = onAllUsersChange((result) => {
      setLoading(false);
      setRefreshing(false);
      if (result.success) {
        setError('');
        setUsers(result.users || []);
      } else {
        setError(result.error || 'Failed to load users');
      }
    });

    return () => unsubscribe?.();
  }, []);

  const filteredUsers = useMemo(
    () => users.filter((user) => filter === 'ALL' || (user.role || 'USER') === filter),
    [users, filter]
  );

  const confirmRoleChange = (targetUser, role) => {
    if (targetUser.id === currentUser?.uid && role !== 'ADMIN') {
      Alert.alert('Protected admin role', 'You cannot remove your own ADMIN role.');
      return;
    }

    Alert.alert(
      'Update user role',
      `Change ${targetUser.displayName || targetUser.email || 'this user'} to ${role}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            try {
              console.log('AdminUsersScreen: role update', targetUser.id, role);
              await updateUserRole(targetUser.id, role);
            } catch (err) {
              console.error('AdminUsersScreen role error:', err?.message || err);
              Alert.alert('Error', err?.message || 'Failed to update user role.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor: colors.bg }]}>
      <AdminHeader title="Users Management" subtitle={`${filteredUsers.length} of ${users.length} users`} navigation={navigation} colors={colors} />
      <ScrollView
        contentContainerStyle={sharedStyles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 700); }} />}
      >
        <View style={sharedStyles.filters}>
          {ROLES.map((role) => (
            <FilterChip key={role} label={role === 'ALL' ? 'All' : role.replace('_', ' ')} active={filter === role} onPress={() => setFilter(role)} colors={colors} />
          ))}
        </View>

        <ScreenState
          loading={loading}
          error={error}
          empty={!filteredUsers.length}
          emptyTitle="No users found"
          emptySubtitle="Users matching this role will appear here."
          colors={colors}
        />

        {!loading && !error ? filteredUsers.map((appUser) => (
          <View key={appUser.id} style={[sharedStyles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={sharedStyles.row}>
              <View style={sharedStyles.iconWrap}>
                <MaterialCommunityIcons name="account-circle-outline" size={24} color="#0E6CFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[sharedStyles.title, { color: colors.text }]} numberOfLines={1}>{appUser.displayName || 'Unnamed user'}</Text>
                <Text style={[sharedStyles.sub, { color: colors.textSecondary }]} numberOfLines={1}>{appUser.email || 'No email'}</Text>
              </View>
              <Text style={{ color: '#0E6CFF', fontSize: 11, fontWeight: '900' }}>{appUser.role || 'USER'}</Text>
            </View>

            <View style={sharedStyles.metaGrid}>
              <Text style={[sharedStyles.meta, { color: colors.textSecondary }]}>University: {appUser.university || 'Not provided'}</Text>
              <Text style={[sharedStyles.meta, { color: colors.textSecondary }]}>Created: {formatDate(appUser.createdAt)}</Text>
            </View>

            <View style={[sharedStyles.filters, { marginTop: 12, marginBottom: 0 }]}>
              {EDITABLE_ROLES.map((role) => (
                <FilterChip
                  key={role}
                  label={role.replace('_', ' ')}
                  active={(appUser.role || 'USER') === role}
                  onPress={() => confirmRoleChange(appUser, role)}
                  colors={colors}
                />
              ))}
            </View>
          </View>
        )) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
