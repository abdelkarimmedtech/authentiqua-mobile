import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import colors from '../../constants/colors';

export default function CameraScreen({ navigation }) {
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
        console.warn(e);
      } finally {
        setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ color: colors.muted, marginTop: 12 }}>Opening camera...</Text>
      </View>
    );
  }

  if (!photo) return null;

  return (
    <View style={styles.container}>
      <Image source={{ uri: photo }} style={styles.preview} />
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => navigation.replace('Result', { result: { label: 'UNKNOWN', confidence: 0 }, image: photo })} style={styles.button}>
          <Text style={styles.btnText}>Use Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.replace('Scan')} style={[styles.button, { backgroundColor: '#0B253B' }]}>
          <Text style={[styles.btnText, { color: colors.text }]}>Retake</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#071027' },
  preview: { flex: 1, width: '100%' },
  actions: { padding: 18, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#071027' },
  button: { flex: 1, marginHorizontal: 6, backgroundColor: '#0E6CFF', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '800' }
});
