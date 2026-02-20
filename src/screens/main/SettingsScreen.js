import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../constants/colors';

export default function SettingsScreen({ navigation }) {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [biometricEnabled, setBiometricEnabled] = React.useState(false);

  const SettingItem = ({ icon, label, value, onToggle }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name={icon} size={24} color="#0E6CFF" />
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#0A2238', true: '#0E6CFF' }}
        thumbColor={value ? '#00FF99' : '#5B7A9A'}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="#E6EEF8" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingItem
            icon="bell"
            label="Enable Notifications"
            value={notificationsEnabled}
            onToggle={setNotificationsEnabled}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <SettingItem
            icon="fingerprint"
            label="Biometric Login"
            value={biometricEnabled}
            onToggle={setBiometricEnabled}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={[styles.infoItem, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Privacy Policy</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#5B7A9A" />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#071027' },
  container: { flex: 1, backgroundColor: '#071027', padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0A1F3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#E6EEF8',
    fontSize: 20,
    fontWeight: '800',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#9AA7C0',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#0A1F3A',
    borderRadius: 12,
    marginBottom: 10,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#051026',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingLabel: {
    color: '#E6EEF8',
    fontSize: 14,
    fontWeight: '600',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#0A1F3A',
    borderRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#0E2748',
    marginBottom: 10,
  },
  infoLabel: {
    color: '#E6EEF8',
    fontSize: 14,
    fontWeight: '600',
  },
  infoValue: {
    color: '#9AA7C0',
    fontSize: 13,
    fontWeight: '500',
  },
});
