import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';

export default function AppearanceScreen({ navigation }) {
  const { theme, setTheme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  const colors = getThemeColors(theme);

  const handleThemeChange = async (mode) => {
    if (theme === mode) return; // Already on this theme
    
    setLoading(true);
    try {
      await AsyncStorage.setItem('selectedTheme', mode);
      setTheme(mode);
      
      const themeName = mode === 'light' ? 'Light Mode' : 'Dark Mode';
      Alert.alert('Theme Changed', `Switched to ${themeName}`);
    } catch (error) {
      console.error('Error saving theme:', error);
      Alert.alert('Error', 'Failed to change theme');
    } finally {
      setLoading(false);
    }
  };

  const ThemeOption = ({ mode, label, description, icon }) => {
    const isSelected = theme === mode;
    
    return (
      <TouchableOpacity
        style={[
          styles.themeOption,
          { backgroundColor: colors.optionBg, borderColor: colors.border },
          isSelected && { borderColor: '#0E6CFF', borderWidth: 2 }
        ]}
        onPress={() => handleThemeChange(mode)}
        disabled={loading}
        activeOpacity={0.7}
      >
        <View style={styles.themeOptionContent}>
          <MaterialCommunityIcons
            name={icon}
            size={32}
            color={isSelected ? '#0E6CFF' : colors.icon}
          />
          <View style={styles.themeInfo}>
            <Text style={[styles.themeLabel, { color: colors.text }]}>{label}</Text>
            <Text style={[styles.themeDesc, { color: colors.textSecondary }]}>
              {description}
            </Text>
          </View>
        </View>
        {isSelected && (
          <MaterialCommunityIcons name="check-circle" size={24} color="#0E6CFF" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Appearance</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={[styles.container, { backgroundColor: colors.bg }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>THEME</Text>
          <ThemeOption
            mode="dark"
            label="Dark Mode"
            description="Easy on the eyes, clean interface"
            icon="moon-waning-crescent"
          />
          <ThemeOption
            mode="light"
            label="Light Mode"
            description="Bright and vibrant display"
            icon="white-balance-sunny"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DISPLAY</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Always Show Status
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Display verification status prominently
                </Text>
              </View>
              <MaterialCommunityIcons name="check" size={20} color="#0E6CFF" />
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1
  },
  backButton: { padding: 8 },
  title: { fontSize: 18, fontWeight: '800' },
  container: { flex: 1, padding: 16 },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 },
  themeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  themeOptionActive: { borderColor: '#0E6CFF' },
  themeOptionContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  themeInfo: { marginLeft: 16 },
  themeLabel: { fontSize: 14, fontWeight: '700' },
  themeDesc: { fontSize: 12, marginTop: 4 },
  card: { borderRadius: 12, padding: 16, borderWidth: 1 },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  settingLabel: { fontSize: 14, fontWeight: '700' },
  settingDesc: { fontSize: 12, marginTop: 4 }
});