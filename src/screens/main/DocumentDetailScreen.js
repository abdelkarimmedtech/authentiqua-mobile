import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';
import { getDocument } from '../../../backend/firestore';

export default function DocumentDetailScreen({ route, navigation }) {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
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
    <SafeAreaView style={dynamicStyles(colors).safeArea}>
      <View style={dynamicStyles(colors).header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={dynamicStyles(colors).backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles(colors).title}>Document Overview</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={dynamicStyles(colors).container} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={dynamicStyles(colors).center}>
            <ActivityIndicator size="large" color="#0E6CFF" />
            <Text style={dynamicStyles(colors).loadingText}>Loading document...</Text>
          </View>
        ) : error ? (
          <View style={dynamicStyles(colors).center}>
            <MaterialCommunityIcons name="alert-circle" size={40} color="#FF6B6B" />
            <Text style={dynamicStyles(colors).errorText}>{error}</Text>
          </View>
        ) : (
          <View style={dynamicStyles(colors).card}>
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

const dynamicStyles = (colors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.bg },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: colors.headerBg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: { padding: 8 },
    title: { color: colors.text, fontSize: 18, fontWeight: '800' },
    container: { flex: 1, padding: 16, backgroundColor: colors.bg },
    center: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
    loadingText: { color: colors.textSecondary, marginTop: 12 },
    errorText: { color: '#FF6B6B', marginTop: 12, textAlign: 'center' },
    card: {
      backgroundColor: colors.cardBg,
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });

const styles = StyleSheet.create({
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

