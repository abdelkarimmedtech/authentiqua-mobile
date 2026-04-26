import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import { getThemeColors } from '../../utils/themeColors';
import { updateNotificationSettings, getUserSettings } from '../../../backend/firestore';

export default function NotificationsScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const colors = getThemeColors(theme);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [updateEnabled, setUpdateEnabled] = useState(false);
  const [promoEnabled, setPromoEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load settings from AsyncStorage and Firestore on mount
  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      // First try to load from Firestore
      if (user?.uid) {
        const result = await getUserSettings(user.uid);
        if (result.success && result.data?.notifications) {
          const notifications = result.data.notifications;
          setPushEnabled(notifications.pushEnabled ?? true);
          setEmailEnabled(notifications.emailEnabled ?? true);
          setUpdateEnabled(notifications.updateEnabled ?? false);
          setPromoEnabled(notifications.promoEnabled ?? false);
          // Also save to AsyncStorage for offline access
          await saveToAsyncStorage(notifications);
          setLoading(false);
          return;
        }
      }

      // Fallback to AsyncStorage
      const push = await AsyncStorage.getItem('pushNotificationsEnabled');
      const email = await AsyncStorage.getItem('emailNotificationsEnabled');
      const update = await AsyncStorage.getItem('documentUpdatesEnabled');
      const promo = await AsyncStorage.getItem('promoNotificationsEnabled');
      
      if (push !== null) setPushEnabled(push === 'true');
      if (email !== null) setEmailEnabled(email === 'true');
      if (update !== null) setUpdateEnabled(update === 'true');
      if (promo !== null) setPromoEnabled(promo === 'true');
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveToAsyncStorage = async (notifications) => {
    try {
      await AsyncStorage.setItem('pushNotificationsEnabled', String(notifications.pushEnabled ?? true));
      await AsyncStorage.setItem('emailNotificationsEnabled', String(notifications.emailEnabled ?? true));
      await AsyncStorage.setItem('documentUpdatesEnabled', String(notifications.updateEnabled ?? false));
      await AsyncStorage.setItem('promoNotificationsEnabled', String(notifications.promoEnabled ?? false));
    } catch (error) {
      console.error('Error saving to AsyncStorage:', error);
    }
  };

  const syncToFirestore = async (notifications) => {
    if (!user?.uid) return;
    try {
      await updateNotificationSettings(user.uid, notifications);
    } catch (error) {
      console.error('Error syncing to Firestore:', error);
      Alert.alert('Sync Error', 'Settings saved locally but failed to sync to cloud.');
    }
  };

  const handlePushChange = async (value) => {
    try {
      setPushEnabled(value);
      await AsyncStorage.setItem('pushNotificationsEnabled', String(value));
      await syncToFirestore({
        pushEnabled: value,
        emailEnabled,
        updateEnabled,
        promoEnabled,
      });
    } catch (error) {
      console.error('Error saving push notification setting:', error);
      setPushEnabled(!value);
    }
  };

  const handleEmailChange = async (value) => {
    try {
      setEmailEnabled(value);
      await AsyncStorage.setItem('emailNotificationsEnabled', String(value));
      await syncToFirestore({
        pushEnabled,
        emailEnabled: value,
        updateEnabled,
        promoEnabled,
      });
    } catch (error) {
      console.error('Error saving email notification setting:', error);
      setEmailEnabled(!value);
    }
  };

  const handleUpdateChange = async (value) => {
    try {
      setUpdateEnabled(value);
      await AsyncStorage.setItem('documentUpdatesEnabled', String(value));
      await syncToFirestore({
        pushEnabled,
        emailEnabled,
        updateEnabled: value,
        promoEnabled,
      });
    } catch (error) {
      console.error('Error saving document updates setting:', error);
      setUpdateEnabled(!value);
    }
  };

  const handlePromoChange = async (value) => {
    try {
      setPromoEnabled(value);
      await AsyncStorage.setItem('promoNotificationsEnabled', String(value));
      await syncToFirestore({
        pushEnabled,
        emailEnabled,
        updateEnabled,
        promoEnabled: value,
      });
    } catch (error) {
      console.error('Error saving promo notification setting:', error);
      setPromoEnabled(!value);
    }
  };

  return (
    <SafeAreaView style={dynamicStyles(colors).safeArea}>
      <View style={dynamicStyles(colors).header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={dynamicStyles(colors).backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles(colors).title}>Notification Settings</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={dynamicStyles(colors).container} showsVerticalScrollIndicator={false}>
        <View style={dynamicStyles(colors).section}>
          <Text style={dynamicStyles(colors).sectionTitle}>CHANNELS</Text>
          <View style={dynamicStyles(colors).card}>
            <View style={dynamicStyles(colors).settingRow}>
              <View style={dynamicStyles(colors).settingLeft}>
                <MaterialCommunityIcons name="bell" size={24} color="#0E6CFF" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={dynamicStyles(colors).settingLabel}>Push Notifications</Text>
                  <Text style={dynamicStyles(colors).settingDesc}>In-app alerts and updates</Text>
                </View>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={handlePushChange}
                trackColor={{ false: colors.border, true: 'rgba(14, 108, 255, 0.5)' }}
                thumbColor={pushEnabled ? '#0E6CFF' : colors.icon}
              />
            </View>
            <View style={dynamicStyles(colors).divider} />
            <View style={dynamicStyles(colors).settingRow}>
              <View style={dynamicStyles(colors).settingLeft}>
                <MaterialCommunityIcons name="email" size={24} color="#0E6CFF" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={dynamicStyles(colors).settingLabel}>Email Notifications</Text>
                  <Text style={dynamicStyles(colors).settingDesc}>Important updates via email</Text>
                </View>
              </View>
              <Switch
                value={emailEnabled}
                onValueChange={handleEmailChange}
                trackColor={{ false: colors.border, true: 'rgba(14, 108, 255, 0.5)' }}
                thumbColor={emailEnabled ? '#0E6CFF' : colors.icon}
              />
            </View>
          </View>
        </View>

        <View style={dynamicStyles(colors).section}>
          <Text style={dynamicStyles(colors).sectionTitle}>PREFERENCES</Text>
          <View style={dynamicStyles(colors).card}>
            <View style={dynamicStyles(colors).settingRow}>
              <View style={dynamicStyles(colors).settingLeft}>
                <MaterialCommunityIcons name="sync" size={24} color="#0E6CFF" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={dynamicStyles(colors).settingLabel}>Document Updates</Text>
                  <Text style={dynamicStyles(colors).settingDesc}>Status changes on documents</Text>
                </View>
              </View>
              <Switch
                value={updateEnabled}
                onValueChange={handleUpdateChange}
                trackColor={{ false: colors.border, true: 'rgba(14, 108, 255, 0.5)' }}
                thumbColor={updateEnabled ? '#0E6CFF' : colors.icon}
              />
            </View>
            <View style={dynamicStyles(colors).divider} />
            <View style={dynamicStyles(colors).settingRow}>
              <View style={dynamicStyles(colors).settingLeft}>
                <MaterialCommunityIcons name="gift" size={24} color="#0E6CFF" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={dynamicStyles(colors).settingLabel}>Promotional Offers</Text>
                  <Text style={dynamicStyles(colors).settingDesc}>Special deals and offers</Text>
                </View>
              </View>
              <Switch
                value={promoEnabled}
                onValueChange={handlePromoChange}
                trackColor={{ false: colors.border, true: 'rgba(14, 108, 255, 0.5)' }}
                thumbColor={promoEnabled ? '#0E6CFF' : colors.icon}
              />
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const dynamicStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  backButton: { padding: 8 },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  container: { flex: 1, padding: 16, backgroundColor: colors.bg },
  section: { marginTop: 24 },
  sectionTitle: { color: colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingLabel: { color: colors.text, fontSize: 14, fontWeight: '700' },
  settingDesc: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  divider: { height: 1, backgroundColor: colors.border }
});
