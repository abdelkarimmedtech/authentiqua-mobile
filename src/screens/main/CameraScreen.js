import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';

export default function CameraScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const [loading, setLoading] = useState(true);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          alert('Camera permission required');
          navigation.goBack();
          return;
        }

        const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaType.Images, quality: 0.7, allowsEditing: false });
        if (!mounted) return;
        const cancelled = typeof result.cancelled !== 'undefined' ? result.cancelled : result.canceled;
        if (cancelled) {
          navigation.goBack();
          return;
        }

        const uri = result.uri ?? (result.assets && result.assets[0] && result.assets[0].uri);
        setPhoto(uri);
      } catch (e) {
        console.error('❌ Camera error:', e?.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <View style={dynamicStyles(colors).center}>
        <ActivityIndicator size="large" color="#0E6CFF" />
        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Opening camera...</Text>
      </View>
    );
  }

  if (!photo) return null;

  return (
    <View style={dynamicStyles(colors).container}>
      <Image source={{ uri: photo }} style={dynamicStyles(colors).preview} />
      <View style={dynamicStyles(colors).actions}>
        <TouchableOpacity onPress={() => navigation.replace('Result', { result: { label: 'UNKNOWN', confidence: 0 }, image: photo })} style={dynamicStyles(colors).button}>
          <Text style={dynamicStyles(colors).btnText}>Use Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.replace('Scan')} style={[dynamicStyles(colors).button, { backgroundColor: colors.border }]}>
          <Text style={[dynamicStyles(colors).btnText, { color: colors.text }]}>Retake</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const dynamicStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  preview: { flex: 1, width: '100%' },
  actions: { padding: 18, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.bg },
  button: { flex: 1, marginHorizontal: 6, backgroundColor: '#0E6CFF', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '800' }
});

const styles = { container: {}, center: {}, preview: {}, actions: {}, button: {}, btnText: {} };
