import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function NotificationsScreen({ navigation }) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [updateEnabled, setUpdateEnabled] = useState(false);
  const [promoEnabled, setPromoEnabled] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#E6EEF8" />
        </TouchableOpacity>
        <Text style={styles.title}>Notification Settings</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CHANNELS</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="bell" size={24} color="#0E6CFF" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.settingLabel}>Push Notifications</Text>
                  <Text style={styles.settingDesc}>In-app alerts and updates</Text>
                </View>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: '#0E2748', true: 'rgba(14, 108, 255, 0.5)' }}
                thumbColor={pushEnabled ? '#0E6CFF' : '#5B7A9A'}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="email" size={24} color="#0E6CFF" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.settingLabel}>Email Notifications</Text>
                  <Text style={styles.settingDesc}>Important updates via email</Text>
                </View>
              </View>
              <Switch
                value={emailEnabled}
                onValueChange={setEmailEnabled}
                trackColor={{ false: '#0E2748', true: 'rgba(14, 108, 255, 0.5)' }}
                thumbColor={emailEnabled ? '#0E6CFF' : '#5B7A9A'}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="sync" size={24} color="#0E6CFF" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.settingLabel}>Document Updates</Text>
                  <Text style={styles.settingDesc}>Status changes on documents</Text>
                </View>
              </View>
              <Switch
                value={updateEnabled}
                onValueChange={setUpdateEnabled}
                trackColor={{ false: '#0E2748', true: 'rgba(14, 108, 255, 0.5)' }}
                thumbColor={updateEnabled ? '#0E6CFF' : '#5B7A9A'}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="gift" size={24} color="#0E6CFF" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.settingLabel}>Promotional Offers</Text>
                  <Text style={styles.settingDesc}>Special deals and offers</Text>
                </View>
              </View>
              <Switch
                value={promoEnabled}
                onValueChange={setPromoEnabled}
                trackColor={{ false: '#0E2748', true: 'rgba(14, 108, 255, 0.5)' }}
                thumbColor={promoEnabled ? '#0E6CFF' : '#5B7A9A'}
              />
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
    alignItems: 'center',
    paddingVertical: 12
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingLabel: { color: '#E6EEF8', fontSize: 14, fontWeight: '700' },
  settingDesc: { color: '#9AA7C0', fontSize: 12, marginTop: 4 },
  divider: { height: 1, backgroundColor: '#0E2748' }
});
