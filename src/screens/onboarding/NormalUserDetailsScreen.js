import React, { useContext, useMemo, useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';
import { getUserDisplayName } from '../../utils/user';

export default function NormalUserDetailsScreen({ navigation }) {
  const { user, completeOnboarding } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const dynamicStyles = createDynamicStyles(colors);
  const defaultName = useMemo(() => getUserDisplayName(user), [user]);

  const [fullName, setFullName] = useState(user?.profile?.fullName || defaultName || '');
  const [university, setUniversity] = useState(user?.profile?.university || '');
  const [location, setLocation] = useState(user?.profile?.location || '');
  const [department, setDepartment] = useState(user?.profile?.department || '');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [submitInProgress, setSubmitInProgress] = useState(false);

  const validate = () => {
    if (!fullName?.trim()) return 'Full name is required';
    if (!university?.trim()) return 'University is required';
    return null;
  };

  const onSubmit = async () => {
    if (submitInProgress) {
      console.log('Submit already in progress, ignoring duplicate click');
      return;
    }

    console.log('=== NORMAL USER ONBOARDING ===');
    console.log('User UID:', user?.uid);
    console.log('Continue button pressed', { fullName, university, location, department });
    
    const v = validate();
    if (v) {
      console.log('❌ Validation failed:', v);
      Alert.alert('Validation Error', v);
      setError(v);
      return;
    }
    
    console.log('✅ Validation passed');
    setError(null);
    setSaving(true);
    setSubmitInProgress(true);
    
    try {
      const profileData = {
        role: 'USER',
        fullName: fullName.trim(),
        university: university.trim(),
        location: location.trim(),
        department: department.trim(),
      };
      console.log('Calling completeOnboarding with data:', profileData);
      const res = await completeOnboarding(profileData);
      
      console.log('completeOnboarding response:', res);
      if (res.ok) {
        console.log('✅ Profile saved successfully, navigating to Home');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
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
    <SafeAreaView style={dynamicStyles.safeArea}>
      <KeyboardAvoidingView
        style={dynamicStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={dynamicStyles.inner}>
          <View style={dynamicStyles.header}>
            <CustomButton
              title="← Back"
              onPress={() => navigation.goBack()}
              style={dynamicStyles.backBtn}
            />
          </View>
          <Text style={dynamicStyles.title}>Your details</Text>
          <Text style={[dynamicStyles.subtitle, { color: colors.textSecondary }]}>
            You’ll scan documents and verify them against the university you choose for each scan.
          </Text>

          <View style={{ height: 12 }} />

          <CustomInput label="Full name" value={fullName} onChangeText={setFullName} placeholder="e.g. John Doe" />
          <CustomInput label="University" value={university} onChangeText={setUniversity} placeholder="e.g. Stanford University" />
          <CustomInput label="Department (optional)" value={department} onChangeText={setDepartment} placeholder="e.g. Computer Science" />
          <CustomInput label="Location (optional)" value={location} onChangeText={setLocation} placeholder="e.g. Tunisia" />

          {error ? <Text style={[dynamicStyles.error, { color: '#FF6B6B' }]}>{error}</Text> : null}

          <CustomButton
            title={saving ? 'Saving...' : 'Continue'}
            onPress={onSubmit}
            disabled={saving}
            style={dynamicStyles.primaryBtn}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createDynamicStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { padding: 20, flex: 1, justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: { backgroundColor: 'transparent', borderRadius: 8, paddingHorizontal: 0, paddingVertical: 8 },
  title: { color: colors.text, fontSize: 26, fontWeight: '900' },
  subtitle: { color: colors.textSecondary, marginTop: 10, lineHeight: 20 },
  error: { color: '#FF6B6B', marginTop: 8, marginBottom: 8 },
  primaryBtn: { backgroundColor: '#0E6CFF', borderRadius: 12, marginTop: 10 },
});

