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
  const params = route.params || {};
  const { result, documentId, meta, fullResponse } = params;

  if (!result || !result.label) {
    return (
      <SafeAreaView style={dynamicStyles(colors).safeArea}>
        <View style={dynamicStyles(colors).container}>
          <MaterialCommunityIcons name="alert-circle-outline" size={80} color="#FFB800" />
          <Text style={[dynamicStyles(colors).resultLabel, { color: '#FFB800', marginTop: 24 }]}>No Result</Text>
          <Text style={dynamicStyles(colors).resultConfidence}>
            Verification response received, but result data is missing.
          </Text>
          <View style={dynamicStyles(colors).actions}>
            <CustomButton title="Scan another" onPress={() => navigation.replace('Scan')} style={dynamicStyles(colors).primaryBtn} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const finalDecision = result.finalDecision || (result.label === 'REAL' ? 'authentic' : 'fake');
  const isAuthentic = result.isAuthentic !== undefined ? result.isAuthentic : result.label === 'REAL';
  const displayLabel = isAuthentic ? 'AUTHENTIC' : 'FAKE';
  const displayStatus = isAuthentic ? 'ACCEPTED' : 'REJECTED';
  const confidencePercent = result.confidence ?? 0;
  const riskScore = result.final_orchestration?.orchestration_risk_score;

  const iconName = isAuthentic ? 'check-circle' : 'close-circle';
  const primaryColor = isAuthentic ? '#00FF99' : '#FF6B6B';

  const verificationId = documentId || fullResponse?.filename || 'AUTH-XXXX';
  const docType = result.final_orchestration?.document_type || meta?.documentType || 'Unknown';
  const fileName = fullResponse?.filename || meta?.fileName || 'document';

  return (
    <SafeAreaView style={dynamicStyles(colors).safeArea}>
      <View style={dynamicStyles(colors).container}>
        <View style={[dynamicStyles(colors).badge, { backgroundColor: isAuthentic ? 'rgba(0, 255, 153, 0.1)' : 'rgba(255, 107, 107, 0.1)' }]}>
          <MaterialCommunityIcons name={iconName} size={80} color={primaryColor} />
        </View>

        <Text style={dynamicStyles(colors).appName}>Authentiqua</Text>
        <Text style={dynamicStyles(colors).tagline}>TRUSTED VERIFICATION</Text>

        <View style={[dynamicStyles(colors).resultCard, { borderTopColor: primaryColor }]}>
          <Text style={[dynamicStyles(colors).resultLabel, { color: primaryColor }]}>{displayLabel}</Text>
          <Text style={dynamicStyles(colors).resultConfidence}>{confidencePercent}% confidence</Text>
          <Text style={[dynamicStyles(colors).resultConfidence, { marginTop: 4 }]}>{displayStatus}</Text>
        </View>

        <View style={dynamicStyles(colors).metaCard}>
          <Text style={dynamicStyles(colors).metaTitle}>Scanned document</Text>
          <Text style={dynamicStyles(colors).metaRow}>Type: <Text style={dynamicStyles(colors).metaValue}>{docType}</Text></Text>
          <Text style={dynamicStyles(colors).metaRow}>File: <Text style={dynamicStyles(colors).metaValue}>{fileName}</Text></Text>
          <Text style={dynamicStyles(colors).metaRow}>Status: <Text style={dynamicStyles(colors).metaValue}>{displayStatus}</Text></Text>
          {meta?.university ? (
            <Text style={dynamicStyles(colors).metaRow}>University: <Text style={dynamicStyles(colors).metaValue}>{meta.university}</Text></Text>
          ) : null}
          {riskScore !== undefined && riskScore !== null ? (
            <Text style={dynamicStyles(colors).metaRow}>Risk Score: <Text style={dynamicStyles(colors).metaValue}>{riskScore}</Text></Text>
          ) : null}
        </View>

        <View style={dynamicStyles(colors).actions}>
          <CustomButton
            title="View Details"
            onPress={() =>
              navigation.navigate('VerificationResults', {
                id: verificationId,
                status: displayStatus,
                confidence: confidencePercent,
                meta: {
                  ...meta,
                  documentType: docType,
                  fileName,
                },
                fullResponse,
                final_orchestration: result.final_orchestration,
                evidence: result.final_orchestration,
                isAuthentic,
                displayLabel,
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
