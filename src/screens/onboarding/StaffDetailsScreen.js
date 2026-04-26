import React, { useContext, useMemo, useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';
import { getUserDisplayName } from '../../utils/user';

export default function StaffDetailsScreen({ route, navigation }) {
  const selectedRole = route?.params?.role === 'ADMIN' ? 'ADMIN' : 'STAFF';

  const { user, completeOnboarding } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const defaultName = useMemo(() => getUserDisplayName(user), [user]);

  const [fullName, setFullName] = useState(user?.profile?.fullName || defaultName || '');
  const [university, setUniversity] = useState(user?.profile?.university || '');
  const [jobTitle, setJobTitle] = useState(user?.profile?.jobTitle || '');
  const [location, setLocation] = useState(user?.profile?.location || '');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [submitInProgress, setSubmitInProgress] = useState(false);

  const validate = () => {
    if (!fullName?.trim()) return 'Full name is required';
    if (!university?.trim()) return 'University is required';
    if (!jobTitle?.trim()) return 'Job title is required';
    return null;
  };

  const onSubmit = async () => {
    if (submitInProgress) {
      console.log('Submit already in progress, ignoring duplicate click');
      return;
    }

    console.log('=== ' + selectedRole + ' USER ONBOARDING ===');
    console.log('User UID:', user?.uid);
    console.log('Continue clicked', { selectedRole, fullName, university, jobTitle });
    
    const v = validate();
    if (v) {
      console.log('❌ Validation error:', v);
      Alert.alert('Validation Error', v);
      setError(v);
      return;
    }
    
    console.log('✅ Validation passed, saving profile for role:', selectedRole);
    setError(null);
    setSaving(true);
    setSubmitInProgress(true);
    
    try {
      const profileData = {
        role: selectedRole,
        fullName: fullName.trim(),
        university: university.trim(),
        jobTitle: jobTitle.trim(),
        location: location.trim(),
      };
      console.log('Calling completeOnboarding with data:', profileData);
      const res = await completeOnboarding(profileData);
      
      console.log('completeOnboarding response:', res);
      if (res.ok) {
        const dashboardName = selectedRole === 'ADMIN' ? 'AdminDashboard' : 'UniversityDashboard';
        console.log('✅ Profile saved successfully, navigating to', dashboardName);
        navigation.reset({
          index: 0,
          routes: [{ name: dashboardName }],
        });
      } else {
        console.log('❌ completeOnboarding failed:', res.message);
        Alert.alert('Error', res.message || 'Failed to save profile. Please try again.');
        setError(res.message || 'Failed to save profile');
      }
    } catch (error) {
      console.error('❌ Onboarding exception:', error?.message || error);
      Alert.alert('Error', error?.message || 'An unexpected error occurred. Please try again.');
      setError(error?.message || 'An unexpected error occurred');
    } finally {
      setSaving(false);
      setSubmitInProgress(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.bg }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inner}>
          <View style={styles.header}>
            <CustomButton
              title="← Back"
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>University profile</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            You will upload official reference documents for your university. Normal users will be verified against them.
          </Text>

          <View style={{ height: 12 }} />

          <CustomInput label="Full name" value={fullName} onChangeText={setFullName} placeholder="e.g. Sarah Jenkins" />
          <CustomInput label="University" value={university} onChangeText={setUniversity} placeholder="e.g. Stanford University" />
          <CustomInput label="Job title" value={jobTitle} onChangeText={setJobTitle} placeholder="e.g. Admissions Officer" />
          <CustomInput label="Location (optional)" value={location} onChangeText={setLocation} placeholder="e.g. USA" />

          {error ? <Text style={[styles.error, { color: '#FF6B6B' }]}>{error}</Text> : null}

          <CustomButton
            title={saving ? 'Saving...' : selectedRole === 'ADMIN' ? 'Continue as Admin' : 'Continue as Staff'}
            onPress={onSubmit}
            disabled={saving || submitInProgress}
            style={styles.primaryBtn}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  inner: { padding: 20, flex: 1, justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: { backgroundColor: 'transparent', borderRadius: 8, paddingHorizontal: 0, paddingVertical: 8 },
  title: { fontSize: 26, fontWeight: '900' },
  subtitle: { marginTop: 10, lineHeight: 20 },
  error: { marginTop: 8, marginBottom: 8 },
  primaryBtn: { backgroundColor: '#0E6CFF', borderRadius: 12, marginTop: 10 },
});

