import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function VerificationResultsScreen({ navigation, route }) {
  const verificationId = route?.params?.id || 'AUTH-8829-XJ2';
  const status = route?.params?.status || 'Verified';
  const confidence = route?.params?.confidence || 98;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#071027" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={20} color="#E6EEF8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification Details</Text>
        <TouchableOpacity style={styles.menuBtn}>
          <MaterialCommunityIcons name="dots-vertical" size={20} color="#E6EEF8" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.statusSection}>
          <View style={styles.statusCircle}>
            <View style={styles.statusInner}>
              <MaterialCommunityIcons name="check-circle" size={32} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.statusLabel}>STATUS</Text>
          <Text style={styles.statusText}>{status}</Text>
          <Text style={styles.statusId}>ID: {verificationId}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Confidence Score</Text>
          <View style={styles.scoreContainer}>
            <View style={styles.scoreRingOuter}>
              <View style={styles.scoreRingInner}>
                <Text style={styles.scorePercent}>{confidence}%</Text>
                <Text style={styles.scoreLabel}>MATCH ACCURACY</Text>
              </View>
            </View>
          </View>
          <Text style={styles.scoreDescription}>
            High accuracy detected based on digital watermark and forensic text analysis.
          </Text>
        </View>

        <View style={styles.feedbackCard}>
          <View style={styles.feedbackHeader}>
            <MaterialCommunityIcons name="school-outline" size={16} color="#0E6CFF" />
            <Text style={styles.feedbackHeaderText}>University Feedback</Text>
          </View>
          <Text style={styles.feedbackText}>
            "Your document meets all enrollment criteria for the Fall 2024 Semester. The digital
            signature is valid and cross-referenced with the registrar's database."
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>REVIEWER INFORMATION</Text>
          <View style={styles.reviewerRow}>
            <View style={styles.reviewerAvatar}>
              <Text style={styles.reviewerAvatarText}>SJ</Text>
            </View>
            <View style={styles.reviewerInfo}>
              <Text style={styles.reviewerName}>Dr. Sarah Jenkins</Text>
              <Text style={styles.reviewerRole}>Office of Admissions, Stanford</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.downloadBtn}>
          <MaterialCommunityIcons name="download" size={18} color="#FFFFFF" />
          <Text style={styles.downloadText}>Download Certificate</Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity style={styles.secondaryBtn}>
            <MaterialCommunityIcons name="share-variant" size={16} color="#E6EEF8" />
            <Text style={styles.secondaryText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation?.navigate('AllActivity')}>
            <MaterialCommunityIcons name="history" size={16} color="#E6EEF8" />
            <Text style={styles.secondaryText}>History</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071027' },

  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backBtn:       { width: 36, height: 36, justifyContent: 'center' },
  headerTitle:   { color: '#E6EEF8', fontSize: 18, fontWeight: '700' },
  menuBtn:       { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  statusSection: { alignItems: 'center', paddingVertical: 28 },
  statusCircle:  { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(0,200,150,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  statusInner:   { width: 70, height: 70, borderRadius: 35, backgroundColor: '#00C896', justifyContent: 'center', alignItems: 'center' },
  statusLabel:   { color: '#0E6CFF', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  statusText:    { color: '#E6EEF8', fontSize: 28, fontWeight: '800', marginBottom: 4 },
  statusId:      { color: '#5B7A9A', fontSize: 13 },

  card:          { backgroundColor: '#0A1F3A', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#0E2748' },
  cardTitle:     { color: '#E6EEF8', fontSize: 15, fontWeight: '700', marginBottom: 16 },

  scoreContainer:  { alignItems: 'center', marginBottom: 12 },
  scoreRingOuter:  { width: 120, height: 120, borderRadius: 60, borderWidth: 8, borderColor: '#0E6CFF', justifyContent: 'center', alignItems: 'center' },
  scoreRingInner:  { alignItems: 'center' },
  scorePercent:    { color: '#0E6CFF', fontSize: 26, fontWeight: '800' },
  scoreLabel:      { color: '#5B7A9A', fontSize: 9, fontWeight: '600', letterSpacing: 1 },
  scoreDescription:{ color: '#9AA7C0', fontSize: 13, textAlign: 'center', lineHeight: 20 },

  feedbackCard:       { backgroundColor: 'rgba(14,108,255,0.1)', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(14,108,255,0.3)' },
  feedbackHeader:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  feedbackHeaderText: { color: '#0E6CFF', fontSize: 13, fontWeight: '700' },
  feedbackText:       { color: '#9AA7C0', fontSize: 13, lineHeight: 20, fontStyle: 'italic' },

  sectionLabel:       { color: '#5B7A9A', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 14 },
  reviewerRow:        { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reviewerAvatar:     { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0E2748', justifyContent: 'center', alignItems: 'center' },
  reviewerAvatarText: { color: '#E6EEF8', fontSize: 14, fontWeight: '700' },
  reviewerInfo:       { flex: 1 },
  reviewerName:       { color: '#E6EEF8', fontSize: 14, fontWeight: '600', marginBottom: 2 },
  reviewerRole:       { color: '#9AA7C0', fontSize: 12 },
  verifiedBadge:      { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0E6CFF', justifyContent: 'center', alignItems: 'center' },

  downloadBtn:   { flexDirection: 'row', backgroundColor: '#0E6CFF', borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14, shadowColor: '#0E6CFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  downloadText:  { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  secondaryActions: { flexDirection: 'row', gap: 12 },
  secondaryBtn:     { flex: 1, flexDirection: 'row', backgroundColor: '#0A1F3A', borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#0E2748' },
  secondaryText:    { color: '#E6EEF8', fontSize: 14, fontWeight: '600' },
});
