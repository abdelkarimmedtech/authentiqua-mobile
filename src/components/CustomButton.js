import React, { useContext } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { getThemeColors } from '../utils/themeColors';

export default function CustomButton({ title, onPress, style, textStyle, disabled }) {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const dynamicStyles = createDynamicStyles(colors);
  
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[dynamicStyles.button, style, disabled && dynamicStyles.disabled]}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Text style={[dynamicStyles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const createDynamicStyles = (colors) => StyleSheet.create({
  button: {
    backgroundColor: colors.primary || '#0E6CFF',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    color: colors.text,
    fontWeight: '700'
  },
  disabled: {
    opacity: 0.5
  }
});
