import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { generateCertificatePdf, saveCertificateToLocalStorage } from '../../utils/certificate';

export default function VerificationResultsScreen({ navigation, route }) {
  const [downloading, setDownloading] = useState(false);

  const final_orchestration = route?.params?.final_orchestration || null;
  const isAuthentic = route?.params?.isAuthentic || false;
  const displayLabel = route?.params?.displayLabel || (isAuthentic ? 'AUTHENTIC' : 'FAKE');
  const displayStatus = route?.params?.status || (isAuthentic ? 'ACCEPTED' : 'REJECTED');
  const confidence = final_orchestration?.layout_authenticity_score ?? route?.params?.confidence ?? 0;
  const riskScore = final_orchestration?.orchestration_risk_score;
  const docType = final_orchestration?.document_type || route?.params?.meta?.documentType || 'Unknown';
  const fileName = route?.params?.fullResponse?.filename || route?.params?.meta?.fileName || 'document';
  const verificationId = route?.params?.id || route?.params?.fullResponse?.filename || 'AUTH-XXXX';
  const meta = route?.params?.meta || null;

  const staffName = meta?.staffName || 'Verification Reviewer';
  const staffUniversity = meta?.staffUniversity || meta?.university || 'University';

  const hasSignature = final_orchestration?.has_signature;
  const signatureConfidence = final_orchestration?.signature_confidence;
  const hasStamp = final_orchestration?.has_stamp;
  const stampConfidence = final_orchestration?.stamp_confidence;
  const fusionReasons = final_orchestration?.fusion_reasons || [];
  const layoutReasons = final_orchestration?.layout_reasons || [];

  const statusIconColor = isAuthentic ? '#00C896' : '#FF6B6B';
  const statusCircleBg = isAuthentic ? 'rgba(0,200,150,0.15)' : 'rgba(255,107,107,0.15)';
  const statusIconName = isAuthentic ? 'check-circle' : 'close-circle';

  const navParams = { id: verificationId, status: displayStatus, confidence, meta };
  const certificateParams = {
    verificationId,
    status: displayStatus,
    confidence,
    university: staffUniversity,
  };

  const handleDownloadCertificate = async () => {
    try {
      setDownloading(true);
      const savedPath = await saveCertificateToLocalStorage(certificateParams);
      Alert.alert('Certificate downloaded', `Saved to:\n${savedPath}`);
    } catch (error) {
      try {
        const pdfUri = await generateCertificatePdf(certificateParams);
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(pdfUri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Save certificate to Files',
            UTI: 'com.adobe.pdf',
          });
          Alert.alert('Share opened', 'Choose "Save to Files" to keep it locally.');
          return;
        }
      } catch (fallbackError) {}
      Alert.alert(
        'Download failed',
        `Could not save certificate locally.${error?.message ? `\n\nReason: ${error.message}` : ''}`
      );
    } finally {
      setDownloading(false);
    }
  };

  if (!final_orchestration) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#071027" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
            <MaterialCommunityIcons name="chevron-left" size={20} color="#E6EEF8" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verification Details</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.errorState}>
          <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#FFB800" />
          <Text style={styles.errorTitle}>Result Data Missing</Text>
          <Text style={styles.errorText}>
            Verification response received, but result data is missing.
          </Text>
          <TouchableOpacity
            style={styles.errorBackBtn}
            onPress={() => navigation?.goBack()}
          >
            <Text style={styles.errorBackText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#071027" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={20} color="#E6EEF8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification Details</Text>
        <TouchableOpacity style={styles.menuBtn}>
          <MaterialCommunityIcons name="dots-vertical" size={20} color="#E6EEF8" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.statusSection}>
          <View style={[styles.statusCircle, { backgroundColor: statusCircleBg }]}>
            <View style={[styles.statusInner, { backgroundColor: statusIconColor }]}>
              <MaterialCommunityIcons name={statusIconName} size={32} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.statusLabel}>STATUS</Text>
          <Text style={styles.statusText}>{displayStatus}</Text>
          <Text style={[styles.statusDecision, { color: isAuthentic ? '#00FF99' : '#FF6B6B' }]}>
            {displayLabel}
          </Text>
          <Text style={styles.statusId}>ID: {verificationId}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Confidence Score</Text>
          <View style={styles.scoreContainer}>
            <View style={[styles.scoreRingOuter, { borderColor: isAuthentic ? '#00C896' : '#FF6B6B' }]}>
              <View style={styles.scoreRingInner}>
                <Text style={[styles.scorePercent, { color: isAuthentic ? '#00C896' : '#FF6B6B' }]}>{confidence}%</Text>
                <Text style={styles.scoreLabel}>MATCH ACCURACY</Text>
              </View>
            </View>
          </View>
          <Text style={styles.scoreDescription}>
            Document type: {docType}. File: {fileName}.
            {riskScore !== undefined && riskScore !== null
              ? ` Risk score: ${riskScore} (lower is safer).`
              : ''}
          </Text>
        </View>

        {(layoutReasons.length > 0 || fusionReasons.length > 0) ? (
          <View style={styles.feedbackCard}>
            <View style={styles.feedbackHeader}>
              <MaterialCommunityIcons name="information-outline" size={16} color="#0E6CFF" />
              <Text style={styles.feedbackHeaderText}>Verification Analysis</Text>
            </View>
            {layoutReasons.length > 0 ? (
              <View style={styles.reasonsSection}>
                <Text style={styles.reasonsSectionTitle}>Layout Analysis</Text>
                {layoutReasons.map((reason, index) => (
                  <View key={`layout-${index}`} style={styles.reasonItem}>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={14}
                      color="#5B7A9A"
                    />
                    <Text style={styles.reasonText}>{reason}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            {fusionReasons.length > 0 ? (
              <View style={styles.reasonsSection}>
                <Text style={styles.reasonsSectionTitle}>Fusion Analysis</Text>
                {fusionReasons.map((reason, index) => (
                  <View key={`fusion-${index}`} style={styles.reasonItem}>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={14}
                      color="#5B7A9A"
                    />
                    <Text style={styles.reasonText}>{reason}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>EVIDENCE</Text>
          {hasSignature !== undefined ? (
            <View style={styles.evidenceRow}>
              <View style={styles.evidenceIcon}>
                <MaterialCommunityIcons
                  name={hasSignature ? 'pencil' : 'pencil-off'}
                  size={20}
                  color={hasSignature ? '#00C896' : '#FF6B6B'}
                />
              </View>
              <View style={styles.evidenceInfo}>
                <Text style={styles.evidenceLabel}>Signature</Text>
                <Text style={styles.evidenceValue}>
                  {hasSignature ? 'Detected' : 'Not detected'}
                  {signatureConfidence !== undefined
                    ? ` (${Math.round(signatureConfidence * 100)}% confidence)`
                    : ''}
                </Text>
              </View>
            </View>
          ) : null}
          {hasStamp !== undefined ? (
            <View style={styles.evidenceRow}>
              <View style={styles.evidenceIcon}>
                <MaterialCommunityIcons
                  name={hasStamp ? 'stamp' : 'stamp-off'}
                  size={20}
                  color={hasStamp ? '#00C896' : '#FF6B6B'}
                />
              </View>
              <View style={styles.evidenceInfo}>
                <Text style={styles.evidenceLabel}>Stamp</Text>
                <Text style={styles.evidenceValue}>
                  {hasStamp ? 'Detected' : 'Not detected'}
                  {stampConfidence !== undefined
                    ? ` (${Math.round(stampConfidence * 100)}% confidence)`
                    : ''}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.downloadBtn}
          onPress={handleDownloadCertificate}
          disabled={downloading}
        >
          <MaterialCommunityIcons name={downloading ? 'progress-clock' : 'download'} size={18} color="#FFFFFF" />
          <Text style={styles.downloadText}>{downloading ? 'Downloading...' : 'Download Certificate'}</Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() =>
              navigation?.push
                ? navigation.push('ShareVerification', navParams)
                : navigation?.navigate('ShareVerification', navParams)
            }
          >
            <MaterialCommunityIcons name="share-variant" size={16} color="#E6EEF8" />
            <Text style={styles.secondaryText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation?.navigate('AllActivity')}>
            <MaterialCommunityIcons name="history" size={16} color="#E6EEF8" />
            <Text style={styles.secondaryText}>History</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071027' },

  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backBtn:       { width: 36, height: 36, justifyContent: 'center' },
  headerTitle:   { color: '#E6EEF8', fontSize: 18, fontWeight: '700' },
  menuBtn:       { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },

  errorState:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  errorTitle:    { color: '#FFB800', fontSize: 22, fontWeight: '800', marginTop: 16, marginBottom: 8 },
  errorText:     { color: '#9AA7C0', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  errorBackBtn:  { paddingHorizontal: 32, paddingVertical: 14, backgroundColor: '#0E6CFF', borderRadius: 12 },
  errorBackText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  statusSection: { alignItems: 'center', paddingVertical: 28 },
  statusCircle:  { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  statusInner:   { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center' },
  statusLabel:   { color: '#0E6CFF', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  statusText:    { color: '#E6EEF8', fontSize: 28, fontWeight: '800', marginBottom: 4 },
  statusDecision:{ fontSize: 18, fontWeight: '700', marginBottom: 4 },
  statusId:      { color: '#5B7A9A', fontSize: 13 },

  card:          { backgroundColor: '#0A1F3A', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#0E2748' },
  cardTitle:     { color: '#E6EEF8', fontSize: 15, fontWeight: '700', marginBottom: 16 },

  scoreContainer:  { alignItems: 'center', marginBottom: 12 },
  scoreRingOuter:  { width: 120, height: 120, borderRadius: 60, borderWidth: 8, justifyContent: 'center', alignItems: 'center' },
  scoreRingInner:  { alignItems: 'center' },
  scorePercent:    { fontSize: 26, fontWeight: '800' },
  scoreLabel:      { color: '#5B7A9A', fontSize: 9, fontWeight: '600', letterSpacing: 1 },
  scoreDescription:{ color: '#9AA7C0', fontSize: 13, textAlign: 'center', lineHeight: 20 },

  feedbackCard:       { backgroundColor: 'rgba(14,108,255,0.1)', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(14,108,255,0.3)' },
  feedbackHeader:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  feedbackHeaderText: { color: '#0E6CFF', fontSize: 13, fontWeight: '700' },

  reasonsSection:    { marginTop: 8 },
  reasonsSectionTitle: { color: '#E6EEF8', fontSize: 12, fontWeight: '700', marginBottom: 8 },
  reasonItem:        { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 6 },
  reasonText:        { color: '#9AA7C0', fontSize: 13, lineHeight: 20, flex: 1 },

  sectionLabel:       { color: '#5B7A9A', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 14 },
  evidenceRow:        { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  evidenceIcon:       { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0E2748', justifyContent: 'center', alignItems: 'center' },
  evidenceInfo:       { flex: 1 },
  evidenceLabel:      { color: '#E6EEF8', fontSize: 14, fontWeight: '600', marginBottom: 2 },
  evidenceValue:      { color: '#9AA7C0', fontSize: 13 },

  reviewerRow:        { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reviewerAvatar:     { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0E2748', justifyContent: 'center', alignItems: 'center' },
  reviewerAvatarText: { color: '#E6EEF8', fontSize: 14, fontWeight: '700' },
  reviewerInfo:       { flex: 1 },
  reviewerName:       { color: '#E6EEF8', fontSize: 14, fontWeight: '600', marginBottom: 2 },
  reviewerRole:       { color: '#9AA7C0', fontSize: 12 },
  verifiedBadge:      { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0E6CFF', justifyContent: 'center', alignItems: 'center' },

  downloadBtn:   { flexDirection: 'row', backgroundColor: '#0E6CFF', borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14, shadowColor: '#0E6CFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  downloadText:  { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  secondaryActions: { flexDirection: 'row', gap: 12 },
  secondaryBtn:     { flex: 1, flexDirection: 'row', backgroundColor: '#0A1F3A', borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#0E2748' },
  secondaryText:    { color: '#E6EEF8', fontSize: 14, fontWeight: '600' },
});
