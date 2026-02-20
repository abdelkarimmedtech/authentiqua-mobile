import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const DOCUMENTS = [
  { id: '1', title: "Bachelor's Degree", subtitle: 'Stanford University', status: 'VERIFIED', date: '2024-02-15' },
  { id: '2', title: 'Transcript 2023', subtitle: 'MIT University', status: 'IN REVIEW', date: '2024-02-10' },
  { id: '3', title: 'Identity Card', subtitle: 'Gov Registry', status: 'VERIFIED', date: '2024-02-08' },
  { id: '6', title: 'Certificate', subtitle: 'University', status: 'VERIFIED', date: '2024-01-28' },
  { id: '7', title: 'Diploma', subtitle: 'Harvard University', status: 'VERIFIED', date: '2024-01-20' },
];

export default function DocumentsScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <View style={styles.docCard}>
      <View style={styles.docLeft}>
        <View style={styles.docIcon}>
          <MaterialCommunityIcons name="file-document" size={28} color="#0E6CFF" />
        </View>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.docTitle}>{item.title}</Text>
          <Text style={styles.docSub}>{item.subtitle}</Text>
          <Text style={styles.docDate}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
      </View>
      <View style={[styles.statusBadge, item.status === 'VERIFIED' ? styles.verified : styles.review]}>
        <MaterialCommunityIcons 
          name={item.status === 'VERIFIED' ? 'check-circle' : 'clock-outline'} 
          size={16} 
          color={item.status === 'VERIFIED' ? '#00FF99' : '#FFB800'}
        />
        <Text style={[styles.badgeText, { color: item.status === 'VERIFIED' ? '#00FF99' : '#FFB800' }]}>
          {item.status}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="#E6EEF8" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Documents</Text>
          <View style={{ width: 28 }} />
        </View>

        <Text style={styles.sublabel}>Total Scanned: {DOCUMENTS.length}</Text>

        <FlatList
          data={DOCUMENTS}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#071027' },
  container: { flex: 1, backgroundColor: '#071027', padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0A1F3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#E6EEF8',
    fontSize: 20,
    fontWeight: '800',
  },
  sublabel: {
    color: '#9AA7C0',
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 0,
  },
  docCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#0A1F3A',
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#0E6CFF',
  },
  docLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  docIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#051026',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTitle: {
    color: '#E6EEF8',
    fontWeight: '700',
    fontSize: 14,
  },
  docSub: {
    color: '#9AA7C0',
    fontSize: 12,
    marginTop: 4,
  },
  docDate: {
    color: '#5B7A9A',
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 255, 153, 0.1)',
  },
  verified: {
    backgroundColor: 'rgba(0, 255, 153, 0.1)',
  },
  review: {
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
});
