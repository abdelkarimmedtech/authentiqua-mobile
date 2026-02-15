import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';

export default function CustomInput({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, error }) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        style={[styles.input, error && styles.inputError]}
        autoCapitalize="none"
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { color: colors.muted, marginBottom: 6 },
  input: {
    backgroundColor: '#0B1222',
    color: colors.text,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  inputError: { borderColor: '#FF6B6B' },
  errorText: { color: '#FF6B6B', marginTop: 6 }
});
