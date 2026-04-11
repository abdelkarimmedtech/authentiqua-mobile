import React, { useContext, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';
import { getUserDisplayName, getUserRole } from '../../utils/user';

const ACCOUNT_ITEMS = [
  { id: 'account', icon: 'account-circle-outline', label: 'Account Information',  rightText: null },
  { id: 'security', icon: 'shield-check-outline',   label: 'Security & Biometrics', rightText: 'Face ID On' },
];

const PREFERENCE_ITEMS = [
  { id: 'notifications', icon: 'bell-outline',            label: 'Notification Settings', rightText: null },
  { id: 'appearance', icon: 'theme-light-dark',         label: 'Appearance',            rightText: 'Dark Mode' },
];

function SettingsSection({ title, items, navigation, colors }) {
  const handleItemPress = (itemId) => {
    switch(itemId) {
      case 'account':
        navigation.navigate('AccountInfo');
        break;
      case 'security':
        navigation.navigate('Security');
        break;
      case 'notifications':
        navigation.navigate('Notifications');
        break;
      case 'appearance':
        navigation.navigate('Appearance');
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.settingsRow,
              index < items.length - 1 && { borderBottomColor: colors.border, ...styles.settingsRowBorder },
            ]}
            onPress={() => handleItemPress(item.id)}
          >
            <View style={styles.settingsLeft}>
              <View style={[styles.settingsIconWrap, { backgroundColor: colors.optionBg }]}>
                <MaterialCommunityIcons name={item.icon} size={18} color="#0E6CFF" />
              </View>
              <Text style={[styles.settingsLabel, { color: colors.text }]}>{item.label}</Text>
            </View>

            <View style={styles.settingsRight}>
              {item.rightText && (
                <Text style={[styles.settingsRightText]}>{item.rightText}</Text>
              )}
              <MaterialCommunityIcons name="chevron-right" size={14} color={colors.icon} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('profile');
  const insets = useSafeAreaInsets();
  const { user, signOut } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const displayName = useMemo(() => getUserDisplayName(user), [user]);
  const role = useMemo(() => getUserRole(user), [user]);
  const university = user?.profile?.university || '';
  const email = user?.email || '';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <MaterialCommunityIcons name="account-circle" size={84} color={colors.icon} />
            </View>
            <View style={[styles.verifiedDot, { borderColor: colors.bg }]}>
              <MaterialCommunityIcons name="check" size={12} color="#FFFFFF" />
            </View>
          </View>

          <Text style={[styles.profileName, { color: colors.text }]}>{displayName}</Text>
          <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{email}</Text>
          {university ? <Text style={[styles.profileUniversity, { color: colors.textSecondary }]}>{university}</Text> : null}

          <View style={styles.premiumBadge}>
            <MaterialCommunityIcons name="star" size={12} color="#0E6CFF" />
            <Text style={[styles.premiumText]}>
              {role === 'ADMIN' ? 'ADMIN ACCOUNT' : role === 'STAFF' ? 'STAFF ACCOUNT' : 'USER ACCOUNT'}
            </Text>
          </View>
        </View>

        <SettingsSection title="ACCOUNT"     items={ACCOUNT_ITEMS} navigation={navigation} colors={colors} />
        <SettingsSection title="PREFERENCES" items={PREFERENCE_ITEMS} navigation={navigation} colors={colors} />

        <TouchableOpacity style={[styles.logoutBtn]} onPress={signOut}>
          <MaterialCommunityIcons name="logout" size={18} color="#FF4D4D" />
          <Text style={[styles.logoutText]}>Logout Account</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.textSecondary }]}>Authentiqua v2.4.1 (Build 620)</Text>
      </ScrollView>

      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={[styles.navRow, { backgroundColor: colors.headerBg, borderTopColor: colors.border }]}>
          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('dashboard'); navigation.navigate('Home'); }}>
            <MaterialCommunityIcons name="home" size={24} color={activeTab === 'dashboard' ? '#0E6CFF' : colors.icon} />
            <Text style={[styles.navLabel, { color: activeTab === 'dashboard' ? '#0E6CFF' : colors.icon }]}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('documents'); navigation.navigate('Documents'); }}>
            <MaterialCommunityIcons name="file-document" size={24} color={activeTab === 'documents' ? '#0E6CFF' : colors.icon} />
            <Text style={[styles.navLabel, { color: activeTab === 'documents' ? '#0E6CFF' : colors.icon }]}>Documents</Text>
          </TouchableOpacity>
          <View style={{ width: role === 'USER' ? 70 : 0 }} />
          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('history'); navigation.navigate('AllActivity'); }}>
            <MaterialCommunityIcons name="history" size={24} color={activeTab === 'history' ? '#0E6CFF' : colors.icon} />
            <Text style={[styles.navLabel, { color: activeTab === 'history' ? '#0E6CFF' : colors.icon }]}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => {}}>
            <MaterialCommunityIcons name="account" size={24} color={colors.icon} />
            <Text style={[styles.navLabel, { color: colors.icon }]}>Profile</Text>
          </TouchableOpacity>
        </View>
        {role === 'USER' ? (
          <TouchableOpacity style={styles.scanButton} onPress={() => { setActiveTab('scan'); navigation.navigate('Scan'); }}>
            <View style={styles.scanIconContainer}>
              <MaterialCommunityIcons name="qrcode-scan" size={32} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1 },

  header:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1 },
  backButton:        { padding: 8 },
  headerTitle:       { fontSize: 20, fontWeight: '800' },

  scrollContent:     { paddingHorizontal: 20, paddingBottom: 120 },

  profileCard:       { alignItems: 'center', paddingVertical: 28 },
  avatarContainer:   { position: 'relative', marginBottom: 14 },
  avatar:            { width: 84, height: 84, borderRadius: 42, justifyContent: 'center', alignItems: 'center', borderWidth: 3, overflow: 'hidden' },
  verifiedDot:       { position: 'absolute', bottom: 2, right: 2, width: 24, height: 24, borderRadius: 12, backgroundColor: '#0E6CFF', justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  profileName:       { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  profileEmail:      { fontSize: 13, marginBottom: 12 },
  profileUniversity: { fontSize: 12, marginBottom: 10, fontWeight: '600' },
  premiumBadge:      { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(14,108,255,0.15)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, gap: 5, borderWidth: 1, borderColor: 'rgba(14,108,255,0.3)' },
  premiumText:       { color: '#0E6CFF', fontSize: 11, fontWeight: '700', letterSpacing: 1 },

  section:           { marginBottom: 20 },
  sectionTitle:      { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 },
  sectionCard:       { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  settingsRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  settingsRowBorder: { borderBottomWidth: 1 },
  settingsLeft:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingsIconWrap:  { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  settingsLabel:     { fontSize: 14, fontWeight: '500' },
  settingsRight:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  settingsRightText: { color: '#0E6CFF', fontSize: 13 },
  chevronIcon:       { width: 14, height: 14, tintColor: '#5B7A9A' },

  logoutBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,77,77,0.12)', borderRadius: 14, paddingVertical: 16, gap: 8, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,77,77,0.25)' },
  logoutText:        { color: '#FF4D4D', fontSize: 15, fontWeight: '700' },

  version:           { fontSize: 12, textAlign: 'center', marginBottom: 10 },

  bottomNav: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: 'transparent',
    alignItems: 'flex-end',
    paddingBottom: 0,
    zIndex: 100,
    elevation: 10
  },
  navRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderTopWidth: 1
  },
  navItem: { alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 8, flex: 1, minHeight: 50 },
  navLabel: { fontSize: 11, fontWeight: '600', marginTop: 6, height: 14 },
  scanButton: { position: 'absolute', bottom: 28, alignSelf: 'center', zIndex: 101 },
  scanIconContainer: { 
    width: 70, 
    height: 70, 
    borderRadius: 35, 
    backgroundColor: '#0E6CFF', 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#0E6CFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15
  }
});
