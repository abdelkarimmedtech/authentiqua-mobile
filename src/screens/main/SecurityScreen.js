import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';

export default function SecurityScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const biometric = await AsyncStorage.getItem('biometricEnabled');
      const twoFactor = await AsyncStorage.getItem('twoFactorEnabled');
      
      if (biometric !== null) setBiometricEnabled(biometric === 'true');
      if (twoFactor !== null) setTwoFactorEnabled(twoFactor === 'true');
    } catch (error) {
      console.error('Error loading security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricChange = async (value) => {
    try {
      setBiometricEnabled(value);
      await AsyncStorage.setItem('biometricEnabled', String(value));
      
      if (value) {
        Alert.alert('Face ID / Fingerprint', 'Biometric authentication has been enabled for your account.');
      } else {
        Alert.alert('Face ID / Fingerprint', 'Biometric authentication has been disabled.');
      }
    } catch (error) {
      console.error('Error saving biometric setting:', error);
      Alert.alert('Error', 'Failed to save biometric setting');
      setBiometricEnabled(!value); // Revert on error
    }
  };

  const handleTwoFactorChange = async (value) => {
    try {
      setTwoFactorEnabled(value);
      await AsyncStorage.setItem('twoFactorEnabled', String(value));
      
      if (value) {
        Alert.alert('Two-Factor Authentication', 'Two-factor authentication has been enabled. You will receive verification codes via email.');
      } else {
        Alert.alert('Two-Factor Authentication', 'Two-factor authentication has been disabled.');
      }
    } catch (error) {
      console.error('Error saving 2FA setting:', error);
      Alert.alert('Error', 'Failed to save two-factor setting');
      setTwoFactorEnabled(!value); // Revert on error
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Security & Biometrics</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>BIOMETRIC</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="fingerprint" size={24} color="#0E6CFF" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Face ID / Fingerprint</Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Use biometric authentication</Text>
                </View>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={handleBiometricChange}
                trackColor={{ false: colors.border, true: 'rgba(14, 108, 255, 0.5)' }}
                thumbColor={biometricEnabled ? '#0E6CFF' : colors.icon}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>AUTHENTICATION</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="shield-check" size={24} color="#0E6CFF" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Two-Factor Authentication</Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Extra security for your account</Text>
                </View>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={handleTwoFactorChange}
                trackColor={{ false: colors.border, true: 'rgba(14, 108, 255, 0.5)' }}
                thumbColor={twoFactorEnabled ? '#0E6CFF' : colors.icon}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PASSWORD</Text>
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
            onPress={() => navigation.navigate('ChangePassword')}
            activeOpacity={0.7}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="lock-reset" size={24} color="#0E6CFF" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Change Password</Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Update your password</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.icon} />
            </View>
          </TouchableOpacity>
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
    borderBottomWidth: 1,
  },
  backButton: { padding: 8 },
  title: { fontSize: 18, fontWeight: '800' },
  container: { flex: 1, padding: 16 },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingLabel: { fontSize: 14, fontWeight: '700' },
  settingDesc: { fontSize: 12, marginTop: 4 }
});
