import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import colors from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';

export default function SignupScreen({ navigation }) {
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
    const res = await signUp(email.trim(), password);
    setLoading(false);
    if (!res.ok) setError(res.message || 'Failed to sign up');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Text style={styles.title}>Create account</Text>

        <CustomInput label="Email" value={email} onChangeText={setEmail} placeholder="you@company.com" />
        <CustomInput label="Password" value={password} onChangeText={setPassword} placeholder="••••••" secureTextEntry />
        <CustomInput label="Confirm" value={confirm} onChangeText={setConfirm} placeholder="••••••" secureTextEntry />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <CustomButton title={loading ? 'Creating...' : 'Sign Up'} onPress={onSubmit} disabled={loading} style={{ marginTop: 8 }} />

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkBg },
  inner: { padding: 24, flex: 1, justifyContent: 'center' },
  title: { color: colors.accent, fontSize: 28, fontWeight: '800', marginBottom: 14 },
  error: { color: '#FF6B6B', marginTop: 8 }
});
