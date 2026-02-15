import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import CustomButton from '../../components/CustomButton';
import colors from '../../constants/colors';
import { scanImage } from '../../services/scanService';

export default function ScanScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (res.status !== 'granted') return alert('Permission required to pick images');

    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.cancelled) setImage(result.uri);
  };

  const onUpload = async () => {
    if (!image) return alert('Select an image first');
    try {
      setLoading(true);
      const result = await scanImage(image);
      setLoading(false);
      navigation.replace('Result', { result });
    } catch (e) {
      setLoading(false);
      alert('Failed to scan image');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan Image</Text>

      <View style={{ alignItems: 'center', marginTop: 20 }}>
        {image ? <Image source={{ uri: image }} style={styles.thumb} /> : <View style={styles.thumbPlaceholder}><Text style={{ color: colors.muted }}>No image selected</Text></View>}
      </View>

      <CustomButton title="Pick Image" onPress={pickImage} style={{ marginTop: 20 }} />
      <CustomButton title={loading ? 'Analyzing...' : 'Upload & Analyze'} onPress={onUpload} style={{ marginTop: 12 }} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: colors.darkBg },
  title: { color: colors.accent, fontSize: 28, fontWeight: '800' },
  thumb: { width: 260, height: 260, borderRadius: 8 },
  thumbPlaceholder: { width: 260, height: 260, borderRadius: 8, backgroundColor: '#071226', alignItems: 'center', justifyContent: 'center' }
});
