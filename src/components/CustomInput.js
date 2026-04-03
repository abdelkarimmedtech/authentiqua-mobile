import React, { useContext } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { getThemeColors } from '../utils/themeColors';

export default function CustomInput({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, error }) {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const dynamicStyles = createDynamicStyles(colors);
  
  return (
    <View style={dynamicStyles.container}>
      {label ? <Text style={dynamicStyles.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        style={[dynamicStyles.input, error && dynamicStyles.inputError]}
        autoCapitalize="none"
      />
      {error ? <Text style={dynamicStyles.errorText}>{error}</Text> : null}
    </View>
  );
}

const createDynamicStyles = (colors) => StyleSheet.create({
  container: { marginBottom: 12 },
  label: { color: colors.muted, marginBottom: 6 },
  input: {
    backgroundColor: colors.optionBg,
    color: colors.text,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  inputError: { borderColor: '#FF6B6B' },
  errorText: { color: '#FF6B6B', marginTop: 6 }
});
