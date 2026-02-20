import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../../components/CustomButton';
import colors from '../../constants/colors';
import { scanImage } from '../../services/scanService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ScanScreen({ navigation, route }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  // Auto-open camera or gallery based on route params
  useEffect(() => {
    if (route?.params?.openCamera) {
      setTimeout(() => openCamera(), 300);
    } else if (route?.params?.galleryOnly) {
      setTimeout(() => pickImage(), 300);
    }
  }, [route?.params?.openCamera, route?.params?.galleryOnly]);

  // Request camera permission on mount
  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, []);

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
        allowsMultiple: false
      });

      if (!result.cancelled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
        setShowCamera(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not access gallery. Please try again.');
      console.log('Gallery error:', error);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf'
      });

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const openCamera = async () => {
    try {
      if (!permission?.granted) {
        const result = await requestPermission();
        if (!result.granted) {
          Alert.alert('Camera Permission Required', 'Please enable camera access in your device settings');
          return;
        }
      }
      setShowCamera(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera');
      console.log('Camera error:', error);
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
        exif: false
      });
      if (photo && photo.uri) {
        setImage(photo.uri);
        setShowCamera(false);
      }
    } catch (error) {
      Alert.alert('Camera Error', 'Failed to capture photo. Please try again.');
      console.log('Camera capture error:', error);
    }
  };

  const onUpload = async () => {
    if (!image) return Alert.alert('Please pick or take a photo first');
    try {
      setLoading(true);
      const result = await scanImage(image);
      setLoading(false);
      navigation.replace('Result', { result });
    } catch (e) {
      setLoading(false);
      Alert.alert('Error', 'Failed to scan image');
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
            flashMode={flashOn ? 'on' : 'off'}
          />
          
          <View style={styles.cameraOverlay}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowCamera(false)}
            >
              <MaterialCommunityIcons name="chevron-left" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => setFlashOn(!flashOn)}
            >
              <MaterialCommunityIcons 
                name={flashOn ? 'flash' : 'flash-off'} 
                size={28} 
                color={flashOn ? '#00FF99' : '#E6EEF8'} 
              />
              <Text style={[styles.controlLabel, flashOn && { color: '#00FF99' }]}>
                {flashOn ? 'Flash On' : 'Flash Off'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureBtn}
              onPress={takePicture}
            >
              <View style={styles.captureInner} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlBtn}
              onPress={pickImage}
            >
              <MaterialCommunityIcons name="folder-image" size={28} color="#E6EEF8" />
              <Text style={styles.controlLabel}>Gallery</Text>
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
          <Text style={styles.title}>Authentiqua Scan</Text>
        </View>

        <View style={styles.previewBox}>
          {image ? (
            image.toLowerCase().endsWith('.pdf') ? (
              <View style={styles.pdfPreview}>
                <MaterialCommunityIcons name="file-pdf-box" size={80} color="#FF6B6B" />
                <Text style={styles.pdfFileName}>{image.split('/').pop()}</Text>
                <Text style={styles.pdfSubtext}>PDF Document ready to verify</Text>
              </View>
            ) : (
              <Image source={{ uri: image }} style={styles.preview} />
            )
          ) : (
            <View style={styles.placeholder}>
              <MaterialCommunityIcons name="file-document" size={60} color="#5B7A9A" />
              <Text style={styles.placeholderText}>No document selected</Text>
              <Text style={styles.placeholderSub}>Take a photo or upload from your device</Text>
            </View>
          )}
        </View>

        {!image && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionBtn} onPress={openCamera}>
              <MaterialCommunityIcons name="camera" size={24} color="#0E6CFF" />
              <Text style={styles.actionLabel}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={pickImage}>
              <MaterialCommunityIcons name="image" size={24} color="#0E6CFF" />
              <Text style={styles.actionLabel}>Choose Image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={pickDocument}>
              <MaterialCommunityIcons name="file-pdf-box" size={24} color="#0E6CFF" />
              <Text style={styles.actionLabel}>Select PDF</Text>
            </TouchableOpacity>
          </View>
        )}

        {image && (
          <View style={styles.imageActions}>
            <TouchableOpacity 
              style={styles.verifyBtnContainer}
              onPress={onUpload}
              disabled={loading}
            >
              <View style={styles.verifyIconCircle}>
                <MaterialCommunityIcons 
                  name="check-circle" 
                  size={48} 
                  color="#00FF99" 
                />
              </View>
              <Text style={styles.verifyBtnText}>
                {loading ? 'Verifying...' : 'Verify Document'}
              </Text>
            </TouchableOpacity>
            
            <CustomButton
              title="Choose Different"
              onPress={() => setImage(null)}
              style={styles.secondaryBtn}
              textStyle={{ color: colors.text }}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A0F1A' },
  container: { flex: 1, backgroundColor: '#0A0F1A' },
  header: { padding: 18, alignItems: 'center', backgroundColor: '#0F1B2E' },
  title: { color: '#E6EEF8', fontSize: 18, fontWeight: '800' },
  
  previewBox: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000'
  },
  preview: { flex: 1, width: '100%' },
  pdfPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F1B2E'
  },
  pdfFileName: { color: '#E6EEF8', fontSize: 16, fontWeight: '700', marginTop: 16, textAlign: 'center' },
  pdfSubtext: { color: '#9AA7C0', fontSize: 12, marginTop: 8 },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#142844'
  },
  placeholderText: { color: colors.muted, fontSize: 16, fontWeight: '700', marginTop: 12 },
  placeholderSub: { color: colors.muted, fontSize: 12, marginTop: 6 },
  
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  actionBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0F1B2E',
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 6
  },
  actionLabel: { color: '#E6EEF8', fontSize: 11, fontWeight: '600', marginTop: 8 },
  
  imageActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10
  },
  verifyBtnContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(14, 108, 255, 0.1)',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#0E6CFF'
  },
  verifyIconCircle: {
    marginBottom: 12
  },
  verifyBtnText: {
    color: '#00FF99',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  primaryBtn: { backgroundColor: '#0E6CFF', borderRadius: 12 },
  secondaryBtn: { backgroundColor: '#0B253B', borderRadius: 12 },

  // Camera styles
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cameraControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: 'rgba(15, 27, 46, 0.95)',
    paddingBottom: 24
  },
  controlBtn: { alignItems: 'center' },
  controlLabel: { color: '#E6EEF8', fontSize: 12, fontWeight: '600', marginTop: 6 },
  captureBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E6EEF8',
    alignItems: 'center',
    justifyContent: 'center'
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0A0F1A'
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  permissionBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0E6CFF',
    borderRadius: 10
  }
});
