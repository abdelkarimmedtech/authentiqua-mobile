import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Alert, Linking, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { generateCertificatePdf, getVerificationLink } from '../../utils/certificate';

const SHARE_OPTIONS = [
  { id: 'email', label: 'Share by Email', icon: 'email-outline' },
  { id: 'link', label: 'Copy Verification Link', icon: 'link-variant' },
  { id: 'pdf', label: 'Share Certificate PDF', icon: 'file-pdf-box' },
  { id: 'qr', label: 'Show QR Code', icon: 'qrcode' },
];

export default function ShareVerificationScreen({ navigation, route }) {
  const verificationId = route?.params?.id || 'AUTH-8829-XJ2';
  const status = route?.params?.status || 'Verified';
  const confidence = route?.params?.confidence || 98;
  const meta = route?.params?.meta || null;
  const [showQrModal, setShowQrModal] = useState(false);
  const [busyOption, setBusyOption] = useState(null);
  const verificationLink = getVerificationLink(verificationId);

  const certificateParams = {
    verificationId,
    status,
    confidence,
    university: meta?.staffUniversity || meta?.university || 'University',
  };

  const handleShareByEmail = async () => {
    const subject = encodeURIComponent(`Verification Certificate - ${verificationId}`);
    const body = encodeURIComponent(
      `Verification ID: ${verificationId}\nStatus: ${status}\nConfidence: ${confidence}%\n\nVerify online: ${verificationLink}`
    );
    const mailUrl = `mailto:?subject=${subject}&body=${body}`;
    const canOpen = await Linking.canOpenURL(mailUrl);
    if (!canOpen) {
      Alert.alert('Email unavailable', 'No email app is configured on this device.');
      return;
    }
    await Linking.openURL(mailUrl);
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(verificationLink);
    Alert.alert('Link copied', 'Verification link copied to clipboard.');
  };

  const handleSharePdf = async () => {
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
      return;
    }
    const pdfUri = await generateCertificatePdf(certificateParams);
    await Sharing.shareAsync(pdfUri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share verification certificate',
      UTI: 'com.adobe.pdf',
    });
  };

  const handleOptionPress = async (id) => {
    try {
      setBusyOption(id);
      if (id === 'email') {
        await handleShareByEmail();
      } else if (id === 'link') {
        await handleCopyLink();
      } else if (id === 'pdf') {
        await handleSharePdf();
      } else if (id === 'qr') {
        setShowQrModal(true);
      }
    } catch (error) {
      Alert.alert('Action failed', 'Please try again.');
    } finally {
      setBusyOption(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#071027" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={20} color="#E6EEF8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Verification</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subTitle}>Verification ID: {verificationId}</Text>

        {SHARE_OPTIONS.map((opt) => (
          <TouchableOpacity key={opt.id} style={styles.optionCard} onPress={() => handleOptionPress(opt.id)}>
            <View style={styles.optionLeft}>
              <View style={styles.optionIconWrap}>
                <MaterialCommunityIcons name={opt.icon} size={18} color="#0E6CFF" />
              </View>
              <Text style={styles.optionText}>
                {busyOption === opt.id ? 'Please wait...' : opt.label}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color="#5B7A9A" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={showQrModal} animationType="fade" onRequestClose={() => setShowQrModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Verification QR</Text>
            <View style={styles.qrWrap}>
              <QRCode value={verificationLink} size={180} />
            </View>
            <Text style={styles.modalSub}>{verificationId}</Text>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopyLink}>
              <Text style={styles.copyText}>Copy Link</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowQrModal(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071027' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { color: '#E6EEF8', fontSize: 18, fontWeight: '700' },
  content: { flex: 1, padding: 20 },
  subTitle: { color: '#9AA7C0', fontSize: 12, marginBottom: 16 },
  optionCard: { backgroundColor: '#0A1F3A', borderWidth: 1, borderColor: '#0E2748', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  optionIconWrap: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#0E2748', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  optionText: { color: '#E6EEF8', fontSize: 14, fontWeight: '600' },
  doneBtn: { marginTop: 8, backgroundColor: '#0E6CFF', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  doneText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', backgroundColor: '#0A1F3A', borderRadius: 16, borderWidth: 1, borderColor: '#0E2748', padding: 20, alignItems: 'center' },
  modalTitle: { color: '#E6EEF8', fontSize: 16, fontWeight: '800', marginBottom: 14 },
  qrWrap: { backgroundColor: '#FFFFFF', padding: 10, borderRadius: 12, marginBottom: 10 },
  modalSub: { color: '#9AA7C0', fontSize: 12, marginBottom: 14 },
  copyBtn: { width: '100%', backgroundColor: '#0E6CFF', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 8 },
  copyText: { color: '#FFFFFF', fontWeight: '700' },
  closeBtn: { width: '100%', borderWidth: 1, borderColor: '#0E2748', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  closeText: { color: '#E6EEF8', fontWeight: '600' },
});
