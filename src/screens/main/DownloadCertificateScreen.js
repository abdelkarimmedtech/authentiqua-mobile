import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function DownloadCertificateScreen({ navigation, route }) {
  const verificationId = route?.params?.id || 'AUTH-8829-XJ2';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#071027" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={20} color="#E6EEF8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Download Certificate</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name="certificate-outline" size={36} color="#0E6CFF" />
          </View>
          <Text style={styles.title}>Verification Certificate Ready</Text>
          <Text style={styles.subtitle}>ID: {verificationId}</Text>
          <Text style={styles.note}>
            Your certificate is ready to download and can be used for official submission.
          </Text>

          <TouchableOpacity style={styles.primaryBtn}>
            <MaterialCommunityIcons name="download" size={18} color="#FFFFFF" />
            <Text style={styles.primaryText}>Download PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.secondaryText}>Back to Verification Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071027' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { color: '#E6EEF8', fontSize: 18, fontWeight: '700' },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  card: { backgroundColor: '#0A1F3A', borderRadius: 16, borderWidth: 1, borderColor: '#0E2748', padding: 20 },
  iconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(14,108,255,0.15)', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 14 },
  title: { color: '#E6EEF8', fontSize: 18, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: '#5B7A9A', fontSize: 12, textAlign: 'center', marginTop: 6 },
  note: { color: '#9AA7C0', fontSize: 13, textAlign: 'center', lineHeight: 20, marginTop: 12, marginBottom: 20 },
  primaryBtn: { backgroundColor: '#0E6CFF', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 },
  primaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  secondaryBtn: { borderRadius: 12, borderWidth: 1, borderColor: '#0E2748', paddingVertical: 12, alignItems: 'center' },
  secondaryText: { color: '#E6EEF8', fontSize: 13, fontWeight: '600' },
});
