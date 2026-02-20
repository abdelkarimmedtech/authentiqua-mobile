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

const INCOMING_REQUESTS = [
  {
    id: '1',
    name: 'Elena Rodriguez',
    studentId: 'STU-94021',
    documentType: 'Official Academic Transcript',
    time: '14 mins ago',
    isNew: true,
  },
  {
    id: '2',
    name: 'Marcus Chen',
    studentId: 'STU-88231',
    documentType: "Bachelor's Diploma",
    time: '2 hours ago',
    isNew: false,
  },
  {
    id: '3',
    name: 'Sarah Jenkins',
    studentId: 'STU-10294',
    documentType: 'Government ID Verification',
    time: '3 hours ago',
    isNew: false,
  },
];

function InitialsAvatar({ name, size = 44 }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');
  const colors = ['#0E6CFF', '#00C896', '#F5A623', '#FF6B6B', '#A855F7'];
  const colorIndex = name.charCodeAt(0) % colors.length;
  return (
    <View
      style={[
        styles.initialsAvatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors[colorIndex] + '33',
          borderColor: colors[colorIndex],
        },
      ]}
    >
      <Text style={[styles.initialsText, { color: colors[colorIndex] }]}>
        {initials}
      </Text>
    </View>
  );
}

function RequestCard({ request }) {
  return (
    <View style={styles.requestCard}>

      <View style={styles.requestHeader}>
        <InitialsAvatar name={request.name} />
        <View style={styles.requestInfo}>
          <View style={styles.requestNameRow}>
            <Text style={styles.requestName}>{request.name}</Text>
            {request.isNew && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}
          </View>
          <Text style={styles.requestId}>ID: #{request.studentId}</Text>
        </View>
      </View>

      <View style={styles.requestDocRow}>
        <View style={styles.docIconWrap}>
          <MaterialCommunityIcons name="file-document-outline" size={20} color="#0E6CFF" />
        </View>
        <View>
          <Text style={styles.docTypeLabel}>Document Type</Text>
          <Text style={styles.docTypeName}>{request.documentType}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.reviewBtn}>
        <Text style={styles.reviewBtnText}>Review Now</Text>
      </TouchableOpacity>
      <Text style={styles.requestTime}>Submitted {request.time}</Text>
    </View>
  );
}

export default function UniversityDashboardScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#071027" />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.portalIconWrap}>
            <MaterialCommunityIcons name="school-outline" size={26} color="#0E6CFF" />
          </View>
          <View>
            <Text style={styles.portalLabel}>UNIVERSITY PORTAL</Text>
            <Text style={styles.portalName}>Stanford University</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.notifBtn}>
          <MaterialCommunityIcons name="bell-outline" size={24} color="#E6EEF8" />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.pendingCard}>
          <View style={styles.pendingRow}>
            <View>
              <Text style={styles.pendingLabel}>Pending Reviews</Text>
              <View style={styles.pendingCountRow}>
                <Text style={styles.pendingCount}>24</Text>
                <View style={styles.todayBadge}>
                  <Text style={styles.todayText}>+3 today</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>TOTAL RECEIVED</Text>
            <Text style={styles.statValue}>1,482</Text>
          </View>
          <View style={[styles.statCard, styles.statCardHighlight]}>
            <Text style={styles.statLabel}>VERIFIED</Text>
            <Text style={[styles.statValue, styles.statValueHighlight]}>1,458</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Incoming Requests</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {INCOMING_REQUESTS.map((req) => (
          <RequestCard key={req.id} request={req} />
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071027' },

  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  headerLeft:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  portalIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#0A1F3A', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#0E2748' },
  portalLabel:    { color: '#5B7A9A', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 2 },
  portalName:     { color: '#E6EEF8', fontSize: 16, fontWeight: '800' },
  notifBtn:       { position: 'relative' },
  notifDot:       { position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: '#F5A623', borderWidth: 1, borderColor: '#071027' },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },

  pendingCard:     { backgroundColor: '#0A1F3A', borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#0E2748' },
  pendingRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pendingLabel:    { color: '#9AA7C0', fontSize: 13, marginBottom: 8 },
  pendingCountRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pendingCount:    { color: '#E6EEF8', fontSize: 36, fontWeight: '800' },
  todayBadge:      { backgroundColor: 'rgba(245,166,35,0.15)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(245,166,35,0.3)' },
  todayText:       { color: '#F5A623', fontSize: 12, fontWeight: '700' },

  statsRow:           { flexDirection: 'row', gap: 12, marginBottom: 22 },
  statCard:           { flex: 1, backgroundColor: '#0A1F3A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#0E2748' },
  statCardHighlight:  { borderColor: 'rgba(14,108,255,0.3)', backgroundColor: 'rgba(14,108,255,0.07)' },
  statLabel:          { color: '#5B7A9A', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  statValue:          { color: '#E6EEF8', fontSize: 24, fontWeight: '800' },
  statValueHighlight: { color: '#0E6CFF' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle:  { color: '#E6EEF8', fontSize: 17, fontWeight: '800' },
  viewAll:       { color: '#0E6CFF', fontSize: 13, fontWeight: '600' },

  requestCard:   { backgroundColor: '#0A1F3A', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#0E2748' },
  requestHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  initialsAvatar:{ justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  initialsText:  { fontSize: 15, fontWeight: '800' },
  requestInfo:   { flex: 1 },
  requestNameRow:{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  requestName:   { color: '#E6EEF8', fontSize: 15, fontWeight: '700' },
  newBadge:      { backgroundColor: 'rgba(14,108,255,0.2)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(14,108,255,0.4)' },
  newBadgeText:  { color: '#0E6CFF', fontSize: 10, fontWeight: '700' },
  requestId:     { color: '#5B7A9A', fontSize: 12 },

  requestDocRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  docIconWrap:   { width: 36, height: 36, borderRadius: 10, backgroundColor: '#0E2748', justifyContent: 'center', alignItems: 'center' },
  docTypeLabel:  { color: '#5B7A9A', fontSize: 10, fontWeight: '600', marginBottom: 2 },
  docTypeName:   { color: '#9AA7C0', fontSize: 13, fontWeight: '600' },

  reviewBtn:     { backgroundColor: '#0E6CFF', borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginBottom: 10, shadowColor: '#0E6CFF', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  reviewBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  requestTime:   { color: '#5B7A9A', fontSize: 11, textAlign: 'center' },
});
