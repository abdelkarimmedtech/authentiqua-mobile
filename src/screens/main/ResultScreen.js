import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';
import CustomButton from '../../components/CustomButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ResultScreen({ route, navigation }) {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const { result, documentId, meta } = route.params || { result: { label: 'UNKNOWN', confidence: 0 }, documentId: null, meta: null };

  const isReal = result.label === 'REAL';
  const iconName = isReal ? 'check-circle' : 'close-circle';
  const primaryColor = isReal ? '#00FF99' : '#FF6B6B';

  return (
    <SafeAreaView style={dynamicStyles(colors).safeArea}>
      <View style={dynamicStyles(colors).container}>
        <View style={[dynamicStyles(colors).badge, { backgroundColor: isReal ? 'rgba(0, 255, 153, 0.1)' : 'rgba(255, 107, 107, 0.1)' }]}>
          <MaterialCommunityIcons name={iconName} size={80} color={primaryColor} />
        </View>

        <Text style={dynamicStyles(colors).appName}>Authentiqua</Text>
        <Text style={dynamicStyles(colors).tagline}>TRUSTED VERIFICATION</Text>

        <View style={[dynamicStyles(colors).resultCard, { borderTopColor: primaryColor }]}>
          <Text style={[dynamicStyles(colors).resultLabel, { color: primaryColor }]}>{result.label}</Text>
          <Text style={dynamicStyles(colors).resultConfidence}>{result.confidence}% confidence</Text>
        </View>

        {meta ? (
          <View style={dynamicStyles(colors).metaCard}>
            <Text style={dynamicStyles(colors).metaTitle}>Scanned document</Text>
            <Text style={dynamicStyles(colors).metaRow}>Type: <Text style={dynamicStyles(colors).metaValue}>{meta.documentType}</Text></Text>
            <Text style={dynamicStyles(colors).metaRow}>University: <Text style={dynamicStyles(colors).metaValue}>{meta.university}</Text></Text>
            <Text style={dynamicStyles(colors).metaRow}>File: <Text style={dynamicStyles(colors).metaValue}>{meta.fileName}</Text></Text>
            <Text style={dynamicStyles(colors).metaRow}>Status: <Text style={dynamicStyles(colors).metaValue}>{meta.status}</Text></Text>
          </View>
        ) : null}

        <View style={dynamicStyles(colors).actions}>
          <CustomButton
            title="View Details"
            onPress={() =>
              navigation.navigate('VerificationResults', {
                id: documentId || 'AUTH-XXXX',
                status: result.label === 'REAL' ? 'Verified' : 'Rejected',
                confidence: result.confidence,
                meta: meta || null,
              })
            }
            style={dynamicStyles(colors).primaryBtn}
          />
          <CustomButton title="Scan another" onPress={() => navigation.replace('Scan')} style={dynamicStyles(colors).secondaryBtn} textStyle={dynamicStyles(colors).secondaryBtnText} />
          <CustomButton title="Home" onPress={() => navigation.navigate('Home')} style={dynamicStyles(colors).secondaryBtn} textStyle={dynamicStyles(colors).secondaryBtnText} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const dynamicStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, padding: 24, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  badge: { width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  appName: { color: colors.text, fontSize: 28, fontWeight: '900' },
  tagline: { color: colors.icon, marginTop: 4, letterSpacing: 1.5, fontSize: 11, fontWeight: '600' },
  resultCard: { marginTop: 32, paddingVertical: 28, paddingHorizontal: 24, borderRadius: 16, borderTopWidth: 3, alignItems: 'center', width: '100%', backgroundColor: colors.cardBg },
  resultLabel: { fontSize: 48, fontWeight: '900' },
  resultConfidence: { color: colors.textSecondary, marginTop: 12, fontSize: 14, fontWeight: '600' },
  metaCard: { width: '100%', backgroundColor: colors.cardBg, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, marginTop: 14 },
  metaTitle: { color: colors.text, fontSize: 14, fontWeight: '800', marginBottom: 10 },
  metaRow: { color: colors.textSecondary, fontSize: 12, marginBottom: 6 },
  metaValue: { color: colors.text, fontWeight: '700' },
  actions: { width: '100%', marginTop: 32 },
  primaryBtn: { backgroundColor: '#0E6CFF', borderRadius: 12, marginBottom: 12 },
  secondaryBtn: { backgroundColor: colors.cardBg, borderRadius: 12 },
  secondaryBtnText: { color: colors.text }
});

const styles = { safeArea: {}, container: {}, badge: {}, appName: {}, tagline: {}, resultCard: {}, resultLabel: {}, resultConfidence: {}, metaCard: {}, metaTitle: {}, metaRow: {}, metaValue: {}, actions: {}, primaryBtn: {}, secondaryBtn: {}, secondaryBtnText: {} };
