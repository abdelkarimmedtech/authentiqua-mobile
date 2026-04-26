import React, { useContext, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CustomButton from '../../components/CustomButton';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';
import { getUserDisplayName } from '../../utils/user';
import { uploadDocument, logActivity } from '../../../backend/firestore';

const DOC_TYPES = [
  { id: 'TRANSCRIPT', label: 'Transcript', icon: 'file-document-outline' },
  { id: 'DEGREE', label: 'Degree', icon: 'school-outline' },
  { id: 'DIPLOMA', label: 'Diploma', icon: 'certificate-outline' },
  { id: 'CERTIFICATE', label: 'Certificate', icon: 'file-certificate-outline' },
  { id: 'ID', label: 'ID', icon: 'card-account-details-outline' },
  { id: 'OTHER', label: 'Other', icon: 'file-outline' },
];

export default function UniversityReferenceUploadScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const dynamicStyles = createDynamicStyles(colors);
  const university = user?.profile?.university || '';
  const staffName = getUserDisplayName(user);
  const staffRole = user?.profile?.jobTitle || null;

  const [documentType, setDocumentType] = useState('TRANSCRIPT');
  const [fileUri, setFileUri] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);

  const canUpload = useMemo(() => !!fileUri && !!documentType && !!university, [fileUri, documentType, university]);

  const pickImage = async () => {
    try {
      const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (res.status !== 'granted') {
        Alert.alert('Permission Denied', 'Media library permission is required to access your gallery');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsMultiple: false,
      });

      const cancelled = typeof result.cancelled !== 'undefined' ? result.cancelled : result.canceled;
      if (!cancelled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setFileUri(uri);
        setFileName(uri.split('/').pop() || 'reference-image');
      }
    } catch (error) {
      console.error('❌ Reference image pick error:', error?.message || 'Unknown error');
      Alert.alert('Error', 'Could not access gallery. Please try again.');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if (result.type === 'success') {
        const asset = result;
        setFileUri(asset.uri);
        setFileName(asset.name || asset.uri.split('/').pop() || 'reference.pdf');
      }
    } catch (error) {
      console.error('❌ Reference PDF pick error:', error?.message || 'Unknown error');
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const getMimeType = (uri) => {
    if (uri?.toLowerCase().endsWith('.pdf')) return 'application/pdf';
    return 'image/jpeg';
  };

  const onUpload = async () => {
    if (!university) {
      Alert.alert('Missing university', 'Please complete onboarding to set your university.');
      return;
    }
    if (!fileUri) {
      Alert.alert('Missing file', 'Please select a document to upload.');
      return;
    }
    try {
      setLoading(true);
      const uid = user?.uid;
      const fileInfo = await FileSystem.getInfoAsync(fileUri, { size: true });
      const metadata = {
        mimeType: getMimeType(fileUri),
        size: fileInfo?.size || 0,
      };

      const uploadRes = await uploadDocument(uid, {
        documentType,
        fileName: fileName || 'reference',
        fileUri,
        status: 'REFERENCE',
        university,
        isReference: true,
        staffName,
        staffRole,
        metadata,
      });

      await logActivity(uid, {
        type: 'REFERENCE_UPLOAD',
        status: 'SUCCESS',
        description: 'Reference document uploaded',
        details: { university, documentType, documentId: uploadRes.documentId },
      });

      Alert.alert('Uploaded', 'Reference document uploaded successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('❌ Reference upload error:', error?.message || 'Unknown error');
      Alert.alert('Error', 'Failed to upload reference document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={dynamicStyles.safeArea}>
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={dynamicStyles.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={dynamicStyles.headerTitle}>Upload Reference</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={dynamicStyles.card}>
          <Text style={dynamicStyles.cardTitle}>University</Text>
          <Text style={dynamicStyles.cardValue}>{university || 'Not set'}</Text>
        </View>

        <Text style={dynamicStyles.sectionTitle}>Document type</Text>
        <View style={dynamicStyles.typeGrid}>
          {DOC_TYPES.map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setDocumentType(t.id)}
              style={[dynamicStyles.typePill, documentType === t.id && dynamicStyles.typePillActive]}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name={t.icon} size={18} color={documentType === t.id ? '#00FF99' : colors.textSecondary} />
              <Text style={[dynamicStyles.typeText, documentType === t.id && { color: '#00FF99' }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={dynamicStyles.preview}>
          {fileUri ? (
            fileUri.toLowerCase().endsWith('.pdf') ? (
              <View style={dynamicStyles.pdfPreview}>
                <MaterialCommunityIcons name="file-pdf-box" size={72} color="#FF6B6B" />
                <Text style={dynamicStyles.fileName}>{fileName}</Text>
                <Text style={dynamicStyles.fileSub}>PDF ready to upload</Text>
              </View>
            ) : (
              <Image source={{ uri: fileUri }} style={dynamicStyles.imagePreview} />
            )
          ) : (
            <View style={dynamicStyles.emptyPreview}>
              <MaterialCommunityIcons name="upload" size={48} color={colors.textSecondary} />
              <Text style={dynamicStyles.emptyTitle}>Select a reference document</Text>
              <Text style={dynamicStyles.emptySub}>Upload the official document for your university.</Text>
            </View>
          )}
        </View>

        <View style={dynamicStyles.actions}>
          <TouchableOpacity style={dynamicStyles.actionBtn} onPress={pickImage}>
            <MaterialCommunityIcons name="image" size={22} color="#0E6CFF" />
            <Text style={dynamicStyles.actionLabel}>Choose image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={dynamicStyles.actionBtn} onPress={pickDocument}>
            <MaterialCommunityIcons name="file-pdf-box" size={22} color="#0E6CFF" />
            <Text style={dynamicStyles.actionLabel}>Select PDF</Text>
          </TouchableOpacity>
        </View>

        <CustomButton
          title={loading ? 'Uploading...' : 'Upload reference document'}
          onPress={onUpload}
          disabled={loading || !canUpload}
          style={dynamicStyles.uploadBtn}
          textStyle={{ color: colors.text }}
        />
      </View>
    </SafeAreaView>
  );
}

const createDynamicStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.cardBg, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },

  card: { backgroundColor: colors.cardBg, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border, marginTop: 10 },
  cardTitle: { color: colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  cardValue: { color: colors.text, fontSize: 15, fontWeight: '700', marginTop: 8 },

  sectionTitle: { color: colors.text, fontSize: 14, fontWeight: '800', marginTop: 18, marginBottom: 10 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typePill: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border },
  typePillActive: { borderColor: 'rgba(0,255,153,0.35)', backgroundColor: 'rgba(0,255,153,0.07)' },
  typeText: { color: colors.textSecondary, fontWeight: '700', fontSize: 12 },

  preview: { flex: 1, marginTop: 16, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000' },
  imagePreview: { flex: 1, width: '100%' },
  pdfPreview: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.headerBg, padding: 16 },
  fileName: { color: colors.text, fontSize: 14, fontWeight: '700', marginTop: 12, textAlign: 'center' },
  fileSub: { color: colors.textSecondary, marginTop: 6, fontSize: 12 },
  emptyPreview: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.headerBg, padding: 16 },
  emptyTitle: { color: colors.text, fontSize: 15, fontWeight: '800', marginTop: 12 },
  emptySub: { color: colors.textSecondary, marginTop: 6, fontSize: 12, textAlign: 'center' },

  actions: { flexDirection: 'row', gap: 12, marginTop: 14 },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, backgroundColor: colors.cardBg, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  actionLabel: { color: colors.text, fontSize: 11, fontWeight: '700', marginTop: 8 },

  uploadBtn: { backgroundColor: '#0E6CFF', borderRadius: 12, marginTop: 14 },
});

