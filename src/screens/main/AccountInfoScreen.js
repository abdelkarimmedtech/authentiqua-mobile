import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';
import { updateUserProfile } from '../../../backend/firestore';

export default function AccountInfoScreen({ navigation }) {
  const { user, refreshProfile } = useContext(AuthContext);
  const profile = user?.profile || {};
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState(profile.fullName || '');
  const [university, setUniversity] = useState(profile.university || '');
  const [location, setLocation] = useState(profile.location || '');

  const onSave = async () => {
    if (!user?.uid) return;
    if (!fullName.trim()) {
      Alert.alert('Validation', 'Full name is required');
      return;
    }
    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        fullName: fullName.trim(),
        university: university.trim(),
        location: location.trim(),
      });
      await refreshProfile();
      setEditing(false);
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#E6EEF8" />
        </TouchableOpacity>
        <Text style={styles.title}>Account Information</Text>
        {editing ? (
          <TouchableOpacity onPress={onSave} disabled={saving} style={{ padding: 8 }}>
            {saving ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <Text style={{ color: colors.accent, fontWeight: '700' }}>Save</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 28 }} />
        )}
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Name</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Full name"
                placeholderTextColor={colors.muted}
              />
            ) : (
              <Text style={styles.infoValue}>{profile.fullName || '—'}</Text>
            )}
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email Address</Text>
            <Text style={styles.infoValue}>{user?.email || '—'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>University</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={university}
                onChangeText={setUniversity}
                placeholder="University"
                placeholderTextColor={colors.muted}
              />
            ) : (
              <Text style={styles.infoValue}>{profile.university || '—'}</Text>
            )}
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="Location"
                placeholderTextColor={colors.muted}
              />
            ) : (
              <Text style={styles.infoValue}>{profile.location || '—'}</Text>
            )}
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Status</Text>
            <View style={styles.statusBadge}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#00FF99" />
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>
        </View>

        {!editing && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => setEditing(true)}>
            <MaterialCommunityIcons name="pencil" size={20} color="#0E6CFF" />
            <Text style={styles.actionText}>Edit Information</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#071027' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#0F1B2E',
    borderBottomWidth: 1,
    borderBottomColor: '#0E2748'
  },
  backButton: { padding: 8 },
  title: { color: '#E6EEF8', fontSize: 18, fontWeight: '800' },
  container: { flex: 1, padding: 16, backgroundColor: '#071027' },
  infoCard: {
    backgroundColor: '#0A1F3A',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#0E2748'
  },
  infoRow: {
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  infoLabel: { color: '#9AA7C0', fontSize: 14, fontWeight: '600' },
  infoValue: { color: '#E6EEF8', fontSize: 14, fontWeight: '700' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 153, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6
  },
  statusText: { color: '#00FF99', fontSize: 12, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#0E2748' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A1F3A',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#0E6CFF',
    gap: 8
  },
  actionText: { color: '#0E6CFF', fontSize: 14, fontWeight: '700' }
  ,
  input: {
    minWidth: 160,
    textAlign: 'right',
    color: '#E6EEF8',
    paddingVertical: 4,
  },
});
