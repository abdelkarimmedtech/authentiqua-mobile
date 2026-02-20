import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ALL_ACTIVITY = [
  { id: '1', title: "Bachelor's Degree", subtitle: 'Stanford University', status: 'VERIFIED' },
  { id: '2', title: 'Transcript 2023', subtitle: 'MIT University', status: 'IN REVIEW' },
  { id: '3', title: 'Identity Card', subtitle: 'Gov Registry', status: 'REJECTED' },
  { id: '6', title: 'Certificate', subtitle: 'University', status: 'VERIFIED' },
  { id: '7', title: 'Diploma', subtitle: 'Harvard University', status: 'VERIFIED' },
  { id: '8', title: 'License', subtitle: 'Professional Board', status: 'REJECTED' },
];

export default function AllActivityScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityLeft}>
        <View style={styles.docIcon}>
          <MaterialCommunityIcons name="file-document" size={24} color="#5B7A9A" />
        </View>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.activityTitle}>{item.title}</Text>
          <Text style={styles.activitySub}>{item.subtitle}</Text>
        </View>
      </View>
      <View style={[styles.statusPill, item.status === 'VERIFIED' ? styles.verified : item.status === 'IN REVIEW' ? styles.review : styles.rejected]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#E6EEF8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Activity</Text>
        <View style={{ width: 28 }} />
      </View>
      <FlatList
        data={ALL_ACTIVITY}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        scrollEnabled={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071027' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#0F1B2E' },
  headerTitle: { color: '#E6EEF8', fontSize: 18, fontWeight: '800' },
  listContent: { padding: 20 },
  activityItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: '#0A1F3A', borderRadius: 12, marginBottom: 10 },
  activityLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  docIcon: { width: 48, height: 48, backgroundColor: '#0E2748', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  activityTitle: { color: '#E6EEF8', fontWeight: '700' },
  activitySub: { color: '#9AA7C0', marginTop: 4, fontSize: 12 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
  statusText: { color: '#fff', fontWeight: '700', fontSize: 11 },
  verified: { backgroundColor: '#173A3C' },
  review: { backgroundColor: '#3D2E18' },
  rejected: { backgroundColor: '#4A1414' }
});
