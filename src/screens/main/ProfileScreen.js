import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ACCOUNT_ITEMS = [
  { icon: 'account-circle-outline', label: 'Account Information',  rightText: null },
  { icon: 'shield-check-outline',   label: 'Security & Biometrics', rightText: 'Face ID On' },
];

const PREFERENCE_ITEMS = [
  { icon: 'bell-outline',            label: 'Notification Settings', rightText: null },
  { icon: 'theme-light-dark',         label: 'Appearance',            rightText: 'Dark Mode' },
];

const RESOURCE_ITEMS = [
  { icon: 'help-circle-outline',     label: 'Help & Support',        rightText: null },
];

function SettingsSection({ title, items }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.settingsRow,
              index < items.length - 1 && styles.settingsRowBorder,
            ]}
          >
            <View style={styles.settingsLeft}>
              <View style={styles.settingsIconWrap}>
                <MaterialCommunityIcons name={item.icon} size={18} color="#0E6CFF" />
              </View>
              <Text style={styles.settingsLabel}>{item.label}</Text>
            </View>

            <View style={styles.settingsRight}>
              {item.rightText && (
                <Text style={styles.settingsRightText}>{item.rightText}</Text>
              )}
              <MaterialCommunityIcons name="chevron-right" size={14} color="#5B7A9A" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.editBtn}>
          <MaterialCommunityIcons name="pencil-outline" size={16} color="#0E6CFF" />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="account-circle" size={84} color="#5B7A9A" />
            </View>
            <View style={styles.verifiedDot}>
              <MaterialCommunityIcons name="check" size={12} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.profileName}>Johnathan Doe</Text>
          <Text style={styles.profileEmail}>j.doe@university.edu</Text>

          <View style={styles.premiumBadge}>
            <MaterialCommunityIcons name="star" size={12} color="#0E6CFF" />
            <Text style={styles.premiumText}>PREMIUM ACCOUNT</Text>
          </View>
        </View>

        <SettingsSection title="ACCOUNT"     items={ACCOUNT_ITEMS} />
        <SettingsSection title="PREFERENCES" items={PREFERENCE_ITEMS} />
        <SettingsSection title="RESOURCES"   items={RESOURCE_ITEMS} />

        <TouchableOpacity style={styles.logoutBtn}>
          <MaterialCommunityIcons name="logout" size={18} color="#FF4D4D" />
          <Text style={styles.logoutText}>Logout Account</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Authentiqua v2.4.1 (Build 620)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#071027' },

  header:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle:       { color: '#E6EEF8', fontSize: 20, fontWeight: '800' },
  editBtn:           { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editBtnText:       { color: '#0E6CFF', fontSize: 15, fontWeight: '600' },

  scrollContent:     { paddingHorizontal: 20, paddingBottom: 100 },

  profileCard:       { alignItems: 'center', paddingVertical: 28 },
  avatarContainer:   { position: 'relative', marginBottom: 14 },
  avatar:            { width: 84, height: 84, borderRadius: 42, backgroundColor: '#0A1F3A', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#0E2748', overflow: 'hidden' },
  verifiedDot:       { position: 'absolute', bottom: 2, right: 2, width: 24, height: 24, borderRadius: 12, backgroundColor: '#0E6CFF', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#071027' },
  profileName:       { color: '#E6EEF8', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  profileEmail:      { color: '#9AA7C0', fontSize: 13, marginBottom: 12 },
  premiumBadge:      { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(14,108,255,0.15)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, gap: 5, borderWidth: 1, borderColor: 'rgba(14,108,255,0.3)' },
  premiumText:       { color: '#0E6CFF', fontSize: 11, fontWeight: '700', letterSpacing: 1 },

  section:           { marginBottom: 20 },
  sectionTitle:      { color: '#5B7A9A', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 },
  sectionCard:       { backgroundColor: '#0A1F3A', borderRadius: 16, borderWidth: 1, borderColor: '#0E2748', overflow: 'hidden' },
  settingsRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  settingsRowBorder: { borderBottomWidth: 1, borderBottomColor: '#0E2748' },
  settingsLeft:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingsIconWrap:  { width: 36, height: 36, borderRadius: 10, backgroundColor: '#0E2748', justifyContent: 'center', alignItems: 'center' },
  settingsLabel:     { color: '#E6EEF8', fontSize: 14, fontWeight: '500' },
  settingsRight:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  settingsRightText: { color: '#0E6CFF', fontSize: 13 },
  chevronIcon:       { width: 14, height: 14, tintColor: '#5B7A9A' },

  logoutBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,77,77,0.12)', borderRadius: 14, paddingVertical: 16, gap: 8, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,77,77,0.25)' },
  logoutText:        { color: '#FF4D4D', fontSize: 15, fontWeight: '700' },

  version:           { color: '#5B7A9A', fontSize: 12, textAlign: 'center', marginBottom: 10 },
});
