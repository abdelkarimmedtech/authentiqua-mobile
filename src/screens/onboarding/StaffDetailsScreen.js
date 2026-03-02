import React, { useContext, useMemo, useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { AuthContext } from '../../context/AuthContext';
import { getUserDisplayName } from '../../utils/user';

export default function StaffDetailsScreen({ route }) {
  const selectedRole = route?.params?.role === 'ADMIN' ? 'ADMIN' : 'STAFF';

  const { user, completeOnboarding } = useContext(AuthContext);
  const defaultName = useMemo(() => getUserDisplayName(user), [user]);

  const [fullName, setFullName] = useState(user?.profile?.fullName || defaultName || '');
  const [university, setUniversity] = useState(user?.profile?.university || '');
  const [jobTitle, setJobTitle] = useState(user?.profile?.jobTitle || '');
  const [location, setLocation] = useState(user?.profile?.location || '');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const validate = () => {
    if (!fullName?.trim()) return 'Full name is required';
    if (!university?.trim()) return 'University is required';
    if (!jobTitle?.trim()) return 'Job title is required';
    return null;
  };

  const onSubmit = async () => {
    const v = validate();
    if (v) return setError(v);
    setError(null);
    setSaving(true);
    const res = await completeOnboarding({
      role: selectedRole,
      fullName: fullName.trim(),
      university: university.trim(),
      jobTitle: jobTitle.trim(),
      location: location.trim(),
    });
    setSaving(false);
    if (!res.ok) setError(res.message || 'Failed to save profile');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inner}>
          <Text style={styles.title}>University profile</Text>
          <Text style={styles.subtitle}>
            You will upload official reference documents for your university. Normal users will be verified against them.
          </Text>

          <View style={{ height: 12 }} />

          <CustomInput label="Full name" value={fullName} onChangeText={setFullName} placeholder="e.g. Sarah Jenkins" />
          <CustomInput label="University" value={university} onChangeText={setUniversity} placeholder="e.g. Stanford University" />
          <CustomInput label="Job title" value={jobTitle} onChangeText={setJobTitle} placeholder="e.g. Admissions Officer" />
          <CustomInput label="Location (optional)" value={location} onChangeText={setLocation} placeholder="e.g. USA" />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <CustomButton
            title={saving ? 'Saving...' : selectedRole === 'ADMIN' ? 'Continue as Admin' : 'Continue as Staff'}
            onPress={onSubmit}
            disabled={saving}
            style={styles.primaryBtn}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#071027' },
  container: { flex: 1, backgroundColor: '#071027' },
  inner: { padding: 20, flex: 1, justifyContent: 'center' },
  title: { color: '#E6EEF8', fontSize: 26, fontWeight: '900' },
  subtitle: { color: '#9AA7C0', marginTop: 10, lineHeight: 20 },
  error: { color: '#FF6B6B', marginTop: 8, marginBottom: 8 },
  primaryBtn: { backgroundColor: '#0E6CFF', borderRadius: 12, marginTop: 10 },
});

