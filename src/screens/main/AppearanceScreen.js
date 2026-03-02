import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AppearanceScreen({ navigation }) {
  const [theme, setTheme] = useState('dark');

  const ThemeOption = ({ mode, label, description, icon }) => (
    <TouchableOpacity
      style={[styles.themeOption, theme === mode && styles.themeOptionActive]}
      onPress={() => setTheme(mode)}
    >
      <View style={styles.themeOptionContent}>
        <MaterialCommunityIcons name={icon} size={32} color={theme === mode ? '#0E6CFF' : '#5B7A9A'} />
        <View style={styles.themeInfo}>
          <Text style={styles.themeLabel}>{label}</Text>
          <Text style={styles.themeDesc}>{description}</Text>
        </View>
      </View>
      {theme === mode && (
        <MaterialCommunityIcons name="check-circle" size={24} color="#0E6CFF" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#E6EEF8" />
        </TouchableOpacity>
        <Text style={styles.title}>Appearance</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>THEME</Text>
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
          <Text style={styles.sectionTitle}>DISPLAY</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Always Show Status</Text>
                <Text style={styles.settingDesc}>Display verification status prominently</Text>
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
  safeArea: { flex: 1, backgroundColor: '#071027' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#0F1B2E',
    borderBottomWidth: 1,
    borderBottomColor: '#0E2748'
  },
  backButton: { padding: 8 },
  title: { color: '#E6EEF8', fontSize: 18, fontWeight: '800' },
  container: { flex: 1, padding: 16, backgroundColor: '#071027' },
  section: { marginTop: 24 },
  sectionTitle: { color: '#5B7A9A', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 },
  themeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0A1F3A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  themeOptionActive: { borderColor: '#0E6CFF' },
  themeOptionContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  themeInfo: { marginLeft: 16 },
  themeLabel: { color: '#E6EEF8', fontSize: 14, fontWeight: '700' },
  themeDesc: { color: '#9AA7C0', fontSize: 12, marginTop: 4 },
  card: {
    backgroundColor: '#0A1F3A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0E2748'
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  settingLabel: { color: '#E6EEF8', fontSize: 14, fontWeight: '700' },
  settingDesc: { color: '#9AA7C0', fontSize: 12, marginTop: 4 }
});
