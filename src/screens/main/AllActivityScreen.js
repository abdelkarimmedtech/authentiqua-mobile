import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const DOCUMENTS = [
  {
    id: '1',
    title: 'Bachelor Transcript',
    institution: 'Stanford University',
    date: 'Oct 12, 2023',
    status: 'VERIFIED',
  },
  {
    id: '2',
    title: "Master's Degree Certificate",
    institution: 'Technical University of Munich',
    date: 'Nov 04, 2023',
    status: 'UNDER REVIEW',
  },
  {
    id: '3',
    title: 'English Proficiency Test',
    institution: 'IELTS Academic',
    date: 'Dec 01, 2023',
    status: 'ACTION REQUIRED',
  },
  {
    id: '4',
    title: 'Statement of Purpose',
    institution: 'Stanford University',
    date: 'Dec 15, 2023',
    status: 'VERIFIED',
  },
];

const STATUS_CONFIG = {
  'VERIFIED':        { color: '#00C896', bg: 'rgba(0,200,150,0.15)',  dot: '#00C896' },
  'UNDER REVIEW':    { color: '#F5A623', bg: 'rgba(245,166,35,0.15)', dot: '#F5A623' },
  'ACTION REQUIRED': { color: '#FF4D4D', bg: 'rgba(255,77,77,0.15)',  dot: '#FF4D4D' },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.VERIFIED;
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.badgeDot, { backgroundColor: config.dot }]} />
      <Text style={[styles.badgeText, { color: config.color }]}>{status}</Text>
    </View>
  );
}

function DocumentCard({ doc, navigation }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <MaterialCommunityIcons name="file-document-outline" size={22} color="#0E6CFF" />
        </View>
        <StatusBadge status={doc.status} />
      </View>
      <Text style={styles.cardTitle}>{doc.title}</Text>
      <Text style={styles.cardInstitution}>{doc.institution}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.cardDate}>
          <MaterialCommunityIcons name="calendar-outline" size={13} color="#5B7A9A" />
          <Text style={styles.cardDateText}>{doc.date}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation?.navigate('VerificationResults')}>
          <Text style={styles.viewDetails}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AllActivityScreen({ navigation }) {
  const [search, setSearch] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#071027" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={20} color="#E6EEF8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan History</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>JD</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={16} color="#5B7A9A" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search documents or universities..."
          placeholderTextColor="#5B7A9A"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 100 }}>
        {DOCUMENTS.map((doc) => (
          <DocumentCard key={doc.id} doc={doc} navigation={navigation} />
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => navigation?.navigate('Scan')}>
        <MaterialCommunityIcons name="qrcode-scan" size={26} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#071027' },

  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backBtn:         { width: 36, height: 36, justifyContent: 'center' },
  headerTitle:     { color: '#E6EEF8', fontSize: 18, fontWeight: '700', letterSpacing: 0.3 },
  avatar:          { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0E2748', justifyContent: 'center', alignItems: 'center' },
  avatarText:      { color: '#E6EEF8', fontSize: 12, fontWeight: '700' },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A1F3A', marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 20, borderWidth: 1, borderColor: '#0E2748' },
  searchInput:     { flex: 1, color: '#E6EEF8', fontSize: 14, marginLeft: 8 },

  list:            { paddingHorizontal: 20 },
  card:            { backgroundColor: '#0A1F3A', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#0E2748' },
  cardHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardIcon:        { width: 38, height: 38, borderRadius: 10, backgroundColor: '#0E2748', justifyContent: 'center', alignItems: 'center' },

  badge:           { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, gap: 5 },
  badgeDot:        { width: 6, height: 6, borderRadius: 3 },
  badgeText:       { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },

  cardTitle:       { color: '#E6EEF8', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  cardInstitution: { color: '#9AA7C0', fontSize: 12, marginBottom: 14 },
  cardFooter:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDate:        { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardDateText:    { color: '#5B7A9A', fontSize: 12 },
  viewDetails:     { color: '#0E6CFF', fontSize: 12, fontWeight: '600' },

  fab:             { position: 'absolute', bottom: 72, alignSelf: 'center', width: 56, height: 56, borderRadius: 28, backgroundColor: '#0E6CFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#0E6CFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
});
