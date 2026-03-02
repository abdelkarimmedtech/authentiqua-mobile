import React, { useMemo, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';
import { getUserDisplayName } from '../../utils/user';

function RoleCard({ title, subtitle, icon, onPress }) {
  return (
    <TouchableOpacity style={styles.roleCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.roleIcon}>
        <MaterialCommunityIcons name={icon} size={26} color="#0E6CFF" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.roleTitle}>{title}</Text>
        <Text style={styles.roleSubtitle}>{subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={22} color="#5B7A9A" />
    </TouchableOpacity>
  );
}

export default function RoleSelectionScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const name = useMemo(() => getUserDisplayName(user), [user]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.kicker}>WELCOME</Text>
        <Text style={styles.title}>Hi {name}</Text>
        <Text style={styles.subtitle}>
          Choose how you will use Authentiqua. This helps us show the right dashboard and forms.
        </Text>

        <View style={{ height: 14 }} />

        <RoleCard
          title="Normal user"
          subtitle="Scan documents and verify authenticity"
          icon="account"
          onPress={() => navigation.navigate('NormalUserDetails')}
        />
        <RoleCard
          title="University staff"
          subtitle="Upload official reference documents for your university"
          icon="school"
          onPress={() => navigation.navigate('StaffDetails', { role: 'STAFF' })}
        />
        <RoleCard
          title="Administrator"
          subtitle="Manage official reference documents (admin access)"
          icon="shield-account"
          onPress={() => navigation.navigate('StaffDetails', { role: 'ADMIN' })}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#071027' },
  container: { flex: 1, padding: 20, backgroundColor: '#071027' },
  kicker: { color: '#5B7A9A', fontSize: 11, letterSpacing: 2, fontWeight: '700', marginTop: 10 },
  title: { color: '#E6EEF8', fontSize: 28, fontWeight: '900', marginTop: 10 },
  subtitle: { color: '#9AA7C0', marginTop: 10, lineHeight: 20 },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1F3A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0E2748',
    marginBottom: 12,
    gap: 12,
  },
  roleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0E2748',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTitle: { color: '#E6EEF8', fontSize: 16, fontWeight: '800' },
  roleSubtitle: { color: colors.muted, marginTop: 4, fontSize: 12, lineHeight: 18 },
});

