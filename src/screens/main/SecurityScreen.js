import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SecurityScreen({ navigation }) {
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#E6EEF8" />
        </TouchableOpacity>
        <Text style={styles.title}>Security & Biometrics</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BIOMETRIC</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="fingerprint" size={24} color="#0E6CFF" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.settingLabel}>Face ID / Fingerprint</Text>
                  <Text style={styles.settingDesc}>Use biometric authentication</Text>
                </View>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: '#0E2748', true: 'rgba(14, 108, 255, 0.5)' }}
                thumbColor={biometricEnabled ? '#0E6CFF' : '#5B7A9A'}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AUTHENTICATION</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="shield-check" size={24} color="#0E6CFF" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
                  <Text style={styles.settingDesc}>Extra security for your account</Text>
                </View>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={setTwoFactorEnabled}
                trackColor={{ false: '#0E2748', true: 'rgba(14, 108, 255, 0.5)' }}
                thumbColor={twoFactorEnabled ? '#0E6CFF' : '#5B7A9A'}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PASSWORD</Text>
          <TouchableOpacity style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="lock-reset" size={24} color="#0E6CFF" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.settingLabel}>Change Password</Text>
                  <Text style={styles.settingDesc}>Update your password</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#5B7A9A" />
            </View>
          </TouchableOpacity>
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
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingLabel: { color: '#E6EEF8', fontSize: 14, fontWeight: '700' },
  settingDesc: { color: '#9AA7C0', fontSize: 12, marginTop: 4 }
});
