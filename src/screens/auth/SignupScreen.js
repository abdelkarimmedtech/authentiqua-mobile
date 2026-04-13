import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import BackgroundAnimation from '../../components/BackgroundAnimation';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';
import { AuthContext } from '../../context/AuthContext';
import { emailToDisplayName } from '../../utils/user';

export default function SignupScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const { signUp } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email || !password || !confirm) return 'All fields are required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Invalid email';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirm) return 'Passwords do not match';
    return null;
  };

  const onSubmit = async () => {
    const v = validate();
    if (v) return setError(v);
    setError(null);
    setLoading(true);
    const trimmedEmail = email.trim();
    const res = await signUp(trimmedEmail, password, { fullName: emailToDisplayName(trimmedEmail) });
    setLoading(false);
    if (!res.ok) setError(res.message || 'Failed to sign up');
  };

  return (
    <BackgroundAnimation>
      <KeyboardAvoidingView style={dynamicSignupStyles(colors).container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={dynamicSignupStyles(colors).inner}>
          <Text style={dynamicSignupStyles(colors).title}>Create account</Text>

          <CustomInput label="Email" value={email} onChangeText={setEmail} placeholder="you@company.com" error={null} />
          <CustomInput label="Password" value={password} onChangeText={setPassword} placeholder="••••••" secureTextEntry />
          <CustomInput label="Confirm" value={confirm} onChangeText={setConfirm} placeholder="••••••" secureTextEntry />

          {error ? <Text style={dynamicSignupStyles(colors).error}>{error}</Text> : null}

          <CustomButton title={loading ? 'Creating...' : 'Sign Up'} onPress={onSubmit} disabled={loading} style={{ marginTop: 8 }} />

          <View style={dynamicSignupStyles(colors).row}>
            <Text style={dynamicSignupStyles(colors).muted}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginLeft: 8 }}>
              <Text style={dynamicSignupStyles(colors).link}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </BackgroundAnimation>
  );
}

const dynamicSignupStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  inner: { padding: 24, flex: 1, justifyContent: 'center' },
  title: { color: '#00FF99', fontSize: 28, fontWeight: '800', marginBottom: 20 },
  row: { flexDirection: 'row', marginTop: 16, alignItems: 'center' },
  muted: { color: colors.textSecondary },
  link: { color: '#0E6CFF', fontWeight: '700' },
  error: { color: '#FF6B6B', marginTop: 8 }
});
