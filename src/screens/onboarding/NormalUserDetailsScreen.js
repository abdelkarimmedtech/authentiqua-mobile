import React, { useContext, useMemo, useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';
import { getUserDisplayName } from '../../utils/user';

export default function NormalUserDetailsScreen() {
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

  const validate = () => {
    if (!fullName?.trim()) return 'Full name is required';
    if (!university?.trim()) return 'University is required';
    return null;
  };

  const onSubmit = async () => {
    const v = validate();
    if (v) return setError(v);
    setError(null);
    setSaving(true);
    const res = await completeOnboarding({
      role: 'USER',
      fullName: fullName.trim(),
      university: university.trim(),
      location: location.trim(),
      department: department.trim(),
    });
    setSaving(false);
    if (!res.ok) setError(res.message || 'Failed to save profile');
  };

  return (
    <SafeAreaView style={dynamicStyles.safeArea}>
      <KeyboardAvoidingView
        style={dynamicStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={dynamicStyles.inner}>
          <Text style={dynamicStyles.title}>Your details</Text>
          <Text style={dynamicStyles.subtitle}>
            You’ll scan documents and verify them against the university you choose for each scan.
          </Text>

          <View style={{ height: 12 }} />

          <CustomInput label="Full name" value={fullName} onChangeText={setFullName} placeholder="e.g. John Doe" />
          <CustomInput label="University" value={university} onChangeText={setUniversity} placeholder="e.g. Stanford University" />
          <CustomInput label="Department (optional)" value={department} onChangeText={setDepartment} placeholder="e.g. Computer Science" />
          <CustomInput label="Location (optional)" value={location} onChangeText={setLocation} placeholder="e.g. Tunisia" />

          {error ? <Text style={dynamicStyles.error}>{error}</Text> : null}

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
  title: { color: colors.text, fontSize: 26, fontWeight: '900' },
  subtitle: { color: colors.textSecondary, marginTop: 10, lineHeight: 20 },
  error: { color: '#FF6B6B', marginTop: 8, marginBottom: 8 },
  primaryBtn: { backgroundColor: '#0E6CFF', borderRadius: 12, marginTop: 10 },
});

