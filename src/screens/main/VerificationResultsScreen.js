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

const formatEvidenceKey = (key) =>
  String(key)
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const normalizeEvidence = (data) => {
  const source = data || {};

  const rawEvidence =
    source?.evidence ||
    source?.final_orchestration ||
    source?.result?.evidence ||
    source?.result?.final_orchestration ||
    source?.verificationResult?.evidence ||
    source?.verificationResult?.final_orchestration ||
    source?.analysis?.evidence ||
    source?.analysis ||
    source?.fullResponse ||
    null;

  if (Array.isArray(rawEvidence)) {
    return rawEvidence.map((item) => {
      if (typeof item === 'string') {
        return { title: 'Evidence', description: item };
      }
      if (item && typeof item === 'object') {
        return {
          title: item.title || item.name || item.type || item.check || 'Evidence',
          description:
            item.description || item.message || item.status || item.result || JSON.stringify(item),
        };
      }
      return { title: 'Evidence', description: String(item) };
    });
  }

  if (typeof rawEvidence === 'string') {
    return [{ title: 'Evidence', description: rawEvidence }];
  }

  if (rawEvidence && typeof rawEvidence === 'object') {
    return Object.entries(rawEvidence)
      .filter(([key, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => {
        let description = value;

        if (typeof value === 'object') {
          description = JSON.stringify(value);
        }

        if (typeof value === 'number' && (key.toLowerCase().includes('score') || key.toLowerCase().includes('confidence'))) {
          description = `${value}%`;
        }

        return {
          title: formatEvidenceKey(key),
          description: String(description),
        };
      });
  }

  return [];
};

export default function VerificationResultsScreen({ navigation, route }) {
  const [downloading, setDownloading] = useState(false);

  const routeParams = route?.params || {};
  const final_orchestration =
    routeParams.final_orchestration ||
    routeParams.result?.final_orchestration ||
    routeParams.fullResponse?.result?.final_orchestration ||
    routeParams.fullResponse?.final_orchestration ||
    null;
  const isAuthentic =
    routeParams?.isAuthentic ||
    routeParams?.result?.isAuthentic ||
    final_orchestration?.final_decision === 'authentic' ||
    false;
  const displayLabel = routeParams?.displayLabel || (isAuthentic ? 'AUTHENTIC' : 'FAKE');
  const displayStatus = routeParams?.status || (isAuthentic ? 'ACCEPTED' : 'REJECTED');
  const confidence = final_orchestration?.layout_authenticity_score ?? routeParams?.confidence ?? 0;
  const riskScore = final_orchestration?.orchestration_risk_score;
  const docType = final_orchestration?.document_type || routeParams?.meta?.documentType || 'Unknown';
  const fileName = routeParams?.fullResponse?.filename || routeParams?.meta?.fileName || 'document';
  const verificationId = routeParams?.id || routeParams?.fullResponse?.filename || 'AUTH-XXXX';
  const meta = routeParams?.meta || null;
  const evidence = normalizeEvidence(routeParams);

  console.log('[VerificationDetails] route params:', routeParams);
  console.log('[VerificationDetails] full document:', JSON.stringify(routeParams?.fullResponse || {}, null, 2));
  console.log('[VerificationDetails] full result:', JSON.stringify(routeParams?.result || final_orchestration || {}, null, 2));
  console.log('[VerificationDetails] evidence:', evidence);

  const staffName = meta?.staffName || 'Verification Reviewer';
  const staffUniversity = meta?.staffUniversity || meta?.university || 'University';
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
          {evidence.length > 0 ? (
            evidence.map((item, index) => {
              const title = item?.title || item?.name || `Evidence ${index + 1}`;
              const description = item?.description || item?.value || item?.message || item?.status || String(item);
              const iconName = title.toLowerCase().includes('signature')
                ? item?.title?.toLowerCase().includes('not') ? 'pencil-off' : 'pencil'
                : title.toLowerCase().includes('stamp')
                ? item?.title?.toLowerCase().includes('not') ? 'stamp-off' : 'stamp'
                : 'check-circle-outline';

              return (
                <View key={`evidence-${index}`} style={styles.evidenceRow}>
                  <View style={styles.evidenceIcon}>
                    <MaterialCommunityIcons
                      name={iconName}
                      size={20}
                      color={title.toLowerCase().includes('not') ? '#FF6B6B' : '#00C896'}
                    />
                  </View>
                  <View style={styles.evidenceInfo}>
                    <Text style={styles.evidenceLabel}>{title}</Text>
                    <Text style={styles.evidenceValue}>{description}</Text>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={[styles.evidenceValue, { marginTop: 10 }]}>No detailed evidence was returned by the verification engine.</Text>
          )}
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
