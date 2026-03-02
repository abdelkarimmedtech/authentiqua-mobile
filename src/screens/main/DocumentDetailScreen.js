import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import { getDocument } from '../../../backend/firestore';

export default function DocumentDetailScreen({ route, navigation }) {
  const { id } = route.params || {};
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (!id) {
      setError('Missing document id');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await getDocument(id);
        if (!mounted) return;
        if (res.success && res.data) {
          setDoc(res.data);
        } else {
          setError('Document not found');
        }
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load document');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const renderRow = (label, value) => {
    if (value === undefined || value === null || value === '') return null;
    return (
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{String(value)}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#E6EEF8" />
        </TouchableOpacity>
        <Text style={styles.title}>Document Overview</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Loading document...</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <MaterialCommunityIcons name="alert-circle" size={40} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.iconRow}>
              <View style={styles.docIcon}>
                <MaterialCommunityIcons name="file-document" size={32} color="#0E6CFF" />
              </View>
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={styles.docTitle}>{doc.documentType || 'Document'}</Text>
                <Text style={styles.docSub}>{doc.university || ''}</Text>
              </View>
            </View>

            <View style={styles.badgeRow}>
              <View style={[styles.statusPill, doc.status === 'VERIFIED' ? styles.verified : doc.status === 'REFERENCE' ? styles.verified : styles.pending]}>
                <MaterialCommunityIcons
                  name={doc.status === 'VERIFIED' || doc.status === 'REFERENCE' ? 'check-circle' : doc.status === 'REJECTED' ? 'close-circle' : 'clock-outline'}
                  size={18}
                  color={doc.status === 'VERIFIED' || doc.status === 'REFERENCE' ? '#00FF99' : doc.status === 'REJECTED' ? '#FF6B6B' : '#FFB800'}
                />
                <Text style={styles.statusText}>
                  {doc.status === 'REFERENCE' ? 'OFFICIAL' : doc.status || 'PENDING'}
                </Text>
              </View>
            </View>

            {renderRow('File name', doc.fileName)}
            {renderRow('Uploaded at', doc.uploadedAt?.toDate?.().toLocaleString?.() || '')}
            {renderRow('Verification notes', doc.verificationNotes)}
            {renderRow('Owner user id', doc.userId)}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#071027' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#0F1B2E',
    borderBottomWidth: 1,
    borderBottomColor: '#0E2748',
  },
  backButton: { padding: 8 },
  title: { color: '#E6EEF8', fontSize: 18, fontWeight: '800' },
  container: { flex: 1, padding: 16, backgroundColor: '#071027' },
  center: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  loadingText: { color: colors.muted, marginTop: 12 },
  errorText: { color: '#FF6B6B', marginTop: 12, textAlign: 'center' },
  card: {
    backgroundColor: '#0A1F3A',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#0E2748',
  },
  iconRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  docIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#051026',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTitle: { color: '#E6EEF8', fontSize: 18, fontWeight: '800' },
  docSub: { color: '#9AA7C0', fontSize: 13, marginTop: 4 },
  badgeRow: { flexDirection: 'row', marginBottom: 12 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  verified: { backgroundColor: 'rgba(0,255,153,0.12)' },
  pending: { backgroundColor: 'rgba(255,184,0,0.12)' },
  statusText: { color: '#E6EEF8', fontSize: 12, fontWeight: '700', marginLeft: 6 },
  row: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#0E2748',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  label: { color: '#9AA7C0', fontSize: 13, marginRight: 12, flex: 0.5 },
  value: { color: '#E6EEF8', fontSize: 13, flex: 1, textAlign: 'right' },
});

