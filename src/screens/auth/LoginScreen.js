import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import colors from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { signIn } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email || !password) return 'Email and password are required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Invalid email';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const onSubmit = async () => {
    const v = validate();
    if (v) return setError(v);
    setError(null);
    setLoading(true);
    const res = await signIn(email.trim(), password);
    setLoading(false);
    if (!res.ok) setError(res.message || 'Failed to sign in');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Text style={styles.title}>Authentiqua</Text>
        <Text style={styles.subtitle}>AI-backed authenticity scanner</Text>

        <CustomInput label="Email" value={email} onChangeText={setEmail} placeholder="you@company.com" error={null} />
        <CustomInput label="Password" value={password} onChangeText={setPassword} placeholder="••••••" secureTextEntry />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <CustomButton title={loading ? 'Signing in...' : 'Sign In'} onPress={onSubmit} disabled={loading} style={{ marginTop: 8 }} />

        <View style={styles.row}>
          <Text style={styles.muted}>No account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={{ marginLeft: 8 }}>
            <Text style={styles.link}>Create one</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkBg },
  inner: { padding: 24, flex: 1, justifyContent: 'center' },
  title: { color: colors.accent, fontSize: 34, fontWeight: '800', marginBottom: 6 },
  subtitle: { color: colors.muted, marginBottom: 20 },
  row: { flexDirection: 'row', marginTop: 16, alignItems: 'center' },
  muted: { color: colors.muted },
  link: { color: colors.accent, fontWeight: '700' },
  error: { color: '#FF6B6B', marginTop: 8 }
});
