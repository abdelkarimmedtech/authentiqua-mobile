import React, { useMemo, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';
import { AuthContext } from '../../context/AuthContext';
import { getUserDisplayName } from '../../utils/user';

function RoleCard({ title, subtitle, icon, onPress, colors }) {
  return (
    <TouchableOpacity style={dynamicStyles(colors).roleCard} onPress={onPress} activeOpacity={0.85}>
      <View style={dynamicStyles(colors).roleIcon}>
        <MaterialCommunityIcons name={icon} size={26} color="#0E6CFF" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={dynamicStyles(colors).roleTitle}>{title}</Text>
        <Text style={dynamicStyles(colors).roleSubtitle}>{subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={22} color={colors.icon} />
    </TouchableOpacity>
  );
}

export default function RoleSelectionScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const { user } = useContext(AuthContext);
  const name = useMemo(() => getUserDisplayName(user), [user]);

  return (
    <SafeAreaView style={dynamicStyles(colors).safeArea}>
      <View style={dynamicStyles(colors).container}>
        <Text style={dynamicStyles(colors).kicker}>WELCOME</Text>
        <Text style={dynamicStyles(colors).title}>Hi {name}</Text>
        <Text style={dynamicStyles(colors).subtitle}>
          Choose how you will use Authentiqua. This helps us show the right dashboard and forms.
        </Text>

        <View style={{ height: 14 }} />

        <RoleCard
          title="Normal user"
          subtitle="Scan documents and verify authenticity"
          icon="account"
          onPress={() => navigation.navigate('NormalUserDetails')}
          colors={colors}
        />
        <RoleCard
          title="University staff"
          subtitle="Upload official reference documents for your university"
          icon="school"
          onPress={() => navigation.navigate('StaffDetails', { role: 'STAFF' })}
          colors={colors}
        />
        <RoleCard
          title="Administrator"
          subtitle="Manage official reference documents (admin access)"
          icon="shield-account"
          onPress={() => navigation.navigate('StaffDetails', { role: 'ADMIN' })}
          colors={colors}
        />
      </View>
    </SafeAreaView>
  );
}

const dynamicStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, padding: 20, backgroundColor: colors.bg },
  kicker: { color: colors.icon, fontSize: 11, letterSpacing: 2, fontWeight: '700', marginTop: 10 },
  title: { color: colors.text, fontSize: 28, fontWeight: '900', marginTop: 10 },
  subtitle: { color: colors.textSecondary, marginTop: 10, lineHeight: 20 },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    gap: 12,
  },
  roleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  roleSubtitle: { color: colors.textSecondary, marginTop: 4, fontSize: 12, lineHeight: 18 },
});

const styles = { safeArea: {}, container: {}, kicker: {}, title: {}, subtitle: {}, roleCard: {}, roleIcon: {}, roleTitle: {}, roleSubtitle: {} };

