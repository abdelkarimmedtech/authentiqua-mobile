import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomInput from '../../components/CustomInput';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';
import { scanImage } from '../../services/scanService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { getUserRole } from '../../utils/user';
import { uploadDocument, logActivity, hasReferenceDocument } from '../../../backend/firestore';

const DOC_TYPES = [
  { id: 'TRANSCRIPT', label: 'Transcript' },
  { id: 'DEGREE', label: 'Degree' },
  { id: 'DIPLOMA', label: 'Diploma' },
  { id: 'CERTIFICATE', label: 'Certificate' },
  { id: 'ID', label: 'ID' },
  { id: 'OTHER', label: 'Other' },
];

export default function ScanScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const role = useMemo(() => getUserRole(user), [user]);
  const defaultUniversity = user?.profile?.university || '';

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [flashOn, setFlashOn] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [university, setUniversity] = useState(defaultUniversity);
  const [documentType, setDocumentType] = useState('TRANSCRIPT');

  useEffect(() => {
    if (route?.params?.openCamera) {
      setTimeout(() => openCamera(), 300);
    } else if (route?.params?.galleryOnly) {
      setTimeout(() => pickFile(), 300);
    }
  }, [route?.params?.openCamera, route?.params?.galleryOnly]);

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const getFileName = (uri, fallback = 'document') => {
    if (!uri) return fallback;
    const cleanUri = uri.split('?')[0];
    return decodeURIComponent(cleanUri.split('/').pop() || fallback);
  };

  const getMimeType = (file) => {
    const explicitType = file?.mimeType || file?.type;
    const name = (file?.name || file?.uri || '').toLowerCase();

    if (explicitType === 'application/pdf' || name.endsWith('.pdf')) {
      return 'application/pdf';
    }

    if (explicitType?.startsWith('image/')) {
      return explicitType;
    }

    if (name.endsWith('.png')) return 'image/png';
    if (name.endsWith('.webp')) return 'image/webp';
    if (name.endsWith('.heic')) return 'image/heic';
    return 'image/jpeg';
  };

  const isPdfFile = (file) => getMimeType(file) === 'application/pdf';

  const pickFile = async () => {
    try {
      console.log('[ScanScreen] Opening document picker...');

      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.length) {
        console.log('[ScanScreen] File picker cancelled');
        return;
      }

      const asset = result.assets[0];
      const file = {
        uri: asset.uri,
        name: asset.name || getFileName(asset.uri),
        mimeType: asset.mimeType || getMimeType(asset),
      };

      if (!file.mimeType.startsWith('image/') && file.mimeType !== 'application/pdf') {
        Alert.alert('Unsupported file', 'Please select an image or PDF document.');
        return;
      }

      console.log('[ScanScreen] File selected:', {
        name: file.name,
        mimeType: file.mimeType,
        uri: file.uri,
      });

      setSelectedFile(file);
      setShowCamera(false);
    } catch (error) {
      console.error('[ScanScreen] File picker error:', error?.message || error);
      Alert.alert('Error', 'Could not select the document. Please try again.');
    }
  };

  const openCamera = async () => {
    try {
      console.log('[ScanScreen] Opening camera...');
      if (!permission?.granted) {
        const result = await requestPermission();
        if (!result.granted) {
          Alert.alert('Camera Permission Required', 'Please enable camera access in your device settings');
          return;
        }
      }
      setShowCamera(true);
    } catch (error) {
      console.error('[ScanScreen] Camera open error:', error?.message || error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) {
      Alert.alert('Error', 'Camera is not ready');
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
        exif: false,
      });

      if (photo?.uri) {
        setSelectedFile({
          uri: photo.uri,
          name: getFileName(photo.uri, 'camera-photo.jpg'),
          mimeType: 'image/jpeg',
        });
        setShowCamera(false);
      }
    } catch (error) {
      console.error('[ScanScreen] Camera capture error:', error?.message || error);
      Alert.alert('Camera Error', 'Failed to capture photo. Please try again.');
    }
  };

  const buildFinalResultPayload = (baseResult, uni, fileName, documentType, reference, uploadRes) => {
    const final_orchestration = baseResult.final_orchestration;

    if (!final_orchestration) {
      return null;
    }

    const finalDecision = final_orchestration.final_decision;
    const isAuthentic = finalDecision === "authentic";
    const aiLabel = isAuthentic ? "REAL" : "FAKE";
    const aiConfidence = final_orchestration.layout_authenticity_score ?? 0;
    const hasRef = !!reference;
    const finalLabel = hasRef ? "REAL" : aiLabel;
    const confidence = hasRef ? Math.max(aiConfidence, 85) : aiConfidence;
    const status = finalLabel === "REAL" ? "VERIFIED" : "REJECTED";

    return {
      finalLabel,
      confidence,
      status,
      navigationPayload: {
        result: {
          label: finalLabel,
          confidence,
          modelVersion: baseResult.modelVersion,
          notes: baseResult.notes,
          finalDecision: baseResult.finalDecision,
          isAuthentic: baseResult.isAuthentic,
          final_orchestration: baseResult.final_orchestration,
        },
        documentId: uploadRes?.documentId || null,
        meta: {
          university: uni,
          documentType,
          fileName,
          status,
          staffName: reference?.staffName || null,
          staffUniversity: reference?.university || null,
          filename: baseResult.filename || fileName,
        },
        fullResponse: baseResult.rawResponse,
      },
    };
  };

  const onUpload = async () => {
    if (!selectedFile?.uri) return Alert.alert('Please pick or take a photo first');
    if (role !== 'USER') {
      Alert.alert('Not available', 'University staff should upload reference documents instead of scanning.');
      navigation.navigate('UniversityReferenceUpload');
      return;
    }
    if (!university?.trim()) return Alert.alert('Missing university', 'Please enter the university for this document.');
    if (!documentType) return Alert.alert('Missing type', 'Please choose a document type.');

    try {
      setLoading(true);
      setStatusMessage('Verifying...');

      const uni = university.trim();
      const fileName = selectedFile.name || getFileName(selectedFile.uri);
      const uid = user?.uid;
      const mimeType = getMimeType(selectedFile);

      const scanUri = selectedFile.uri;
      const baseResult = await scanImage(scanUri, { documentType, university: uni });

      if (!baseResult || baseResult.success === false) {
        const message = baseResult?.error || 'Verification failed: no response received from verification service.';
        console.error('[ScanScreen] Verification failed:', message, baseResult);
        Alert.alert('Verification failed', message);
        return;
      }

      if (!baseResult.rawResponse || !baseResult.final_orchestration) {
        console.error('[ScanScreen] Verification response incomplete:', baseResult);
        Alert.alert('Verification failed', 'Verification failed: no response received from verification service.');
        return;
      }

      console.log('[Verification] API raw response:', baseResult.rawResponse);
      console.log('[Verification] Returned data:', baseResult);

      const refCheck = await hasReferenceDocument(uni, documentType);
      const hasRef = !!refCheck?.exists;
      const reference = refCheck?.reference || null;

      const resultData = buildFinalResultPayload(baseResult, uni, fileName, documentType, reference, null);

      if (!resultData) {
        Alert.alert("Verification Error", "Verification response received, but result data is missing.");
        return;
      }

      const { finalLabel, confidence, status, navigationPayload } = resultData;

      const uploadRes = await uploadDocument(uid, {
        documentType,
        fileName,
        fileUri: selectedFile.uri,
        status,
        verificationNotes: hasRef
          ? 'Matched against official university reference document and verified by AI.'
          : resultData.finalLabel === 'REAL'
          ? 'AI model identified the document as authentic. No official reference record found.'
          : 'AI model identified the document as fraudulent.',
        university: uni,
        isReference: false,
        evidence: baseResult.final_orchestration || null,
        final_orchestration: baseResult.final_orchestration || null,
        signatureDetected: baseResult.final_orchestration?.has_signature ?? baseResult.final_orchestration?.signatureDetected ?? null,
        signatureConfidence: baseResult.final_orchestration?.signature_confidence ?? baseResult.final_orchestration?.signatureConfidence ?? null,
        stampDetected: baseResult.final_orchestration?.has_stamp ?? baseResult.final_orchestration?.stampDetected ?? null,
        stampConfidence: baseResult.final_orchestration?.stamp_confidence ?? baseResult.final_orchestration?.stampConfidence ?? null,
        riskScore: baseResult.final_orchestration?.orchestration_risk_score ?? null,
        metadata: {
          mimeType,
          scanSource: isPdfFile(selectedFile) ? 'pdf' : 'image',
        },
      });

      navigationPayload.documentId = uploadRes?.documentId || null;

      await logActivity(uid, {
        type: 'VERIFICATION',
        status,
        documentId: uploadRes?.documentId || null,
        description: 'Document verification completed',
        details: {
          university: uni,
          documentType,
          label: finalLabel,
          confidence,
          aiLabel: resultData.finalLabel === 'REAL' ? 'REAL' : 'FAKE',
          aiConfidence: baseResult.final_orchestration?.layout_authenticity_score ?? 0,
          referenceId: reference?.id || null,
          referenceOwnerId: reference?.userId || null,
        },
      });

      navigation.replace("Result", navigationPayload);
    } catch (error) {
      console.error('[ScanScreen] Verification error:', error?.message || error);
      Alert.alert('Error', error?.message || 'Unable to process this document. Please try again.');
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  if (showCamera) {
    if (!permission?.granted) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.center}>
            <Text style={{ color: colors.text, marginBottom: 16 }}>Camera permission is required</Text>
            <TouchableOpacity onPress={() => requestPermission()} style={styles.permissionBtn}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Grant Permission</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowCamera(false)} style={[styles.permissionBtn, { backgroundColor: '#0B253B', marginTop: 10 }]}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            enableTorch={flashOn}
            onCameraReady={() => setCameraReady(true)}
          />

          <View style={styles.cameraOverlay}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCamera(false)}>
              <MaterialCommunityIcons name="chevron-left" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => {
                console.log('[ScanScreen] Toggling torch:', !flashOn);
                setFlashOn(!flashOn);
              }}
            >
              <MaterialCommunityIcons
                name={flashOn ? 'flash' : 'flash-off'}
                size={28}
                color={flashOn ? '#00FF99' : '#E6EEF8'}
              />
              <Text style={[styles.controlLabel, flashOn && { color: '#00FF99' }]}>
                {flashOn ? 'Torch On' : 'Torch Off'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.captureBtn} onPress={takePicture} disabled={!cameraReady}>
              <View style={styles.captureInner} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlBtn} onPress={pickFile}>
              <MaterialCommunityIcons name="folder-image" size={28} color="#E6EEF8" />
              <Text style={styles.controlLabel}>Files</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Authentiqua Scan</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.previewBox}>
          {selectedFile ? (
            isPdfFile(selectedFile) ? (
              <View style={styles.pdfPreview}>
                <MaterialCommunityIcons name="file-pdf-box" size={80} color="#FF6B6B" />
                <Text style={styles.pdfFileName}>{selectedFile.name}</Text>
                <Text style={styles.pdfSubtext}>PDF document ready to verify</Text>
              </View>
            ) : (
              <Image source={{ uri: selectedFile.uri }} style={styles.preview} />
            )
          ) : (
            <View style={styles.placeholder}>
              <MaterialCommunityIcons name="file-document" size={60} color="#5B7A9A" />
              <Text style={styles.placeholderText}>No document selected</Text>
              <Text style={styles.placeholderSub}>Take a photo or upload from your device</Text>
            </View>
          )}
        </View>

        {!selectedFile && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionBtn} onPress={openCamera}>
              <MaterialCommunityIcons name="camera" size={24} color="#0E6CFF" />
              <Text style={styles.actionLabel}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={pickFile}>
              <MaterialCommunityIcons name="file-document" size={24} color="#0E6CFF" />
              <Text style={styles.actionLabel}>Choose File</Text>
            </TouchableOpacity>
          </View>
        )}

        {selectedFile && (
          <View style={styles.imageActions}>
            <View style={styles.metaCard}>
              <Text style={styles.metaTitle}>Verification details</Text>
              <CustomInput
                label="University (required)"
                value={university}
                onChangeText={setUniversity}
                placeholder="e.g. MedTech University"
              />
              <Text style={styles.metaLabel}>Document type</Text>
              <View style={styles.typeRow}>
                {DOC_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[styles.typePill, documentType === type.id && styles.typePillActive]}
                    onPress={() => setDocumentType(type.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.typeText, documentType === type.id && styles.typeTextActive]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {role !== 'USER' ? (
                <Text style={styles.roleHint}>
                  Staff/Admin accounts upload reference documents instead of scanning.
                </Text>
              ) : null}
            </View>

            <TouchableOpacity style={styles.verifyBtnContainer} onPress={onUpload} disabled={loading}>
              <View style={styles.verifyIconCircle}>
                <MaterialCommunityIcons name="check-circle" size={48} color="#00FF99" />
              </View>
              <Text style={styles.verifyBtnText}>
                {loading ? statusMessage || 'Verifying...' : 'Verify Document'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setSelectedFile(null)}
              disabled={loading}
            >
              <Text style={styles.secondaryBtnText}>Choose Different</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A0F1A' },
  container: { flex: 1, backgroundColor: '#0A0F1A' },
  header: {
    padding: 18,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    backgroundColor: '#0F1B2E',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(14, 108, 255, 0.1)',
  },
  backBtn: { padding: 8 },
  title: { color: '#E6EEF8', fontSize: 18, fontWeight: '800' },
  previewBox: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  preview: { flex: 1, width: '100%' },
  pdfPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F1B2E',
    paddingHorizontal: 20,
  },
  pdfFileName: { color: '#E6EEF8', fontSize: 16, fontWeight: '700', marginTop: 16, textAlign: 'center' },
  pdfSubtext: { color: '#9AA7C0', fontSize: 12, marginTop: 8 },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#142844',
  },
  placeholderText: { color: '#9AA7C0', fontSize: 16, fontWeight: '700', marginTop: 12 },
  placeholderSub: { color: '#9AA7C0', fontSize: 12, marginTop: 6 },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0F1B2E',
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 6,
  },
  actionLabel: { color: '#E6EEF8', fontSize: 11, fontWeight: '600', marginTop: 8 },
  imageActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  metaCard: {
    backgroundColor: '#0F1B2E',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#0E2748',
  },
  metaTitle: { color: '#E6EEF8', fontWeight: '800', marginBottom: 10 },
  metaLabel: { color: '#9AA7C0', fontSize: 12, fontWeight: '700', marginTop: 2, marginBottom: 10 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#0A1F3A',
    borderWidth: 1,
    borderColor: '#0E2748',
  },
  typePillActive: { borderColor: 'rgba(0,255,153,0.35)', backgroundColor: 'rgba(0,255,153,0.07)' },
  typeText: { color: '#9AA7C0', fontSize: 12, fontWeight: '700' },
  typeTextActive: { color: '#00FF99' },
  roleHint: { color: '#FFB800', marginTop: 10, fontSize: 12, fontWeight: '600' },
  verifyBtnContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(14, 108, 255, 0.1)',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#0E6CFF',
  },
  verifyIconCircle: {
    marginBottom: 12,
  },
  verifyBtnText: {
    color: '#00FF99',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    backgroundColor: '#0B253B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#E6EEF8', fontWeight: '700' },

  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: 'rgba(15, 27, 46, 0.95)',
    paddingBottom: 24,
  },
  controlBtn: { alignItems: 'center' },
  controlLabel: { color: '#E6EEF8', fontSize: 12, fontWeight: '600', marginTop: 6 },
  captureBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E6EEF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0A0F1A',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  permissionBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0E6CFF',
    borderRadius: 10,
  },
});
