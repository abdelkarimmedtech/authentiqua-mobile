import React, { useContext, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';
import { onUserActivityChange } from '../../../backend/firestore';
import { getUserRole } from '../../utils/user';

function formatType(t) {
  if (!t) return 'Activity';
  return String(t).replace(/_/g, ' ');
}

export default function AllActivityScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('history');
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const role = useMemo(() => getUserRole(user), [user]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onUserActivityChange(user.uid, (res) => {
      const list = (res?.activities || []).filter((a) => a.type !== 'LOGIN' && a.type !== 'LOGOUT');
      setActivities(list);
    });
    return () => unsub?.();
  }, [user?.uid]);

  const renderActivity = ({ item }) => {
    const statusColor = item.status === 'VERIFIED' || item.status === 'SUCCESS' ? '#00FF99' : item.status === 'PENDING' ? '#FFB946' : '#FF6B6B';
    const statusBg = item.status === 'VERIFIED' || item.status === 'SUCCESS' ? '#173A3C' : item.status === 'PENDING' ? '#3D2E18' : '#4A1414';
    const icon = item.status === 'VERIFIED' || item.status === 'SUCCESS' ? 'check-circle' : item.status === 'PENDING' ? 'clock-outline' : 'close-circle';
    const createdAt = item.createdAt?.toDate?.() || null;
    const university = item.details?.university || '';
    const docType = item.details?.documentType || '';

    return (
      <View style={styles.activityItem}>
        <View style={styles.activityLeft}>
          <View style={styles.docIcon}>
            <MaterialCommunityIcons name="file-document" size={24} color="#5B7A9A" />
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.activityTitle}>
              {docType ? `Verification • ${docType}` : formatType(item.type)}
            </Text>
            <Text style={styles.activitySub}>{university || item.description || ''}</Text>
            <Text style={styles.activityDate}>{createdAt ? createdAt.toLocaleString() : ''}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
          <MaterialCommunityIcons name={icon} size={18} color={statusColor} />
          <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#E6EEF8" />
        </TouchableOpacity>
        <Text style={styles.title}>History</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        renderItem={renderActivity}
        style={styles.list}
        contentContainerStyle={activities.length === 0 ? styles.emptyContainer : styles.listContent}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="history" size={52} color="#5B7A9A" />
            <Text style={styles.emptyTitle}>No activity yet</Text>
            <Text style={styles.emptySub}>
              {role === 'USER'
                ? 'Scan and verify a document to see your verification history.'
                : 'Upload a reference document to see your activity here.'}
            </Text>
          </View>
        }
      />

      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('dashboard'); navigation.navigate('Home'); }}>
            <MaterialCommunityIcons name="home" size={24} color={activeTab === 'dashboard' ? '#0E6CFF' : '#5B7A9A'} />
            <Text style={[styles.navLabel, { color: activeTab === 'dashboard' ? '#0E6CFF' : '#5B7A9A' }]}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('documents'); navigation.navigate('Documents'); }}>
            <MaterialCommunityIcons name="file-document" size={24} color={activeTab === 'documents' ? '#0E6CFF' : '#5B7A9A'} />
            <Text style={[styles.navLabel, { color: activeTab === 'documents' ? '#0E6CFF' : '#5B7A9A' }]}>Documents</Text>
          </TouchableOpacity>
          <View style={{ width: role === 'USER' ? 70 : 0 }} />
          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('history'); }}>
            <MaterialCommunityIcons name="history" size={24} color={activeTab === 'history' ? '#0E6CFF' : '#5B7A9A'} />
            <Text style={[styles.navLabel, { color: activeTab === 'history' ? '#0E6CFF' : '#5B7A9A' }]}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('profile'); navigation.navigate('Profile'); }}>
            <MaterialCommunityIcons name="account" size={24} color={activeTab === 'profile' ? '#0E6CFF' : '#5B7A9A'} />
            <Text style={[styles.navLabel, { color: activeTab === 'profile' ? '#0E6CFF' : '#5B7A9A' }]}>Profile</Text>
          </TouchableOpacity>
        </View>
        {role === 'USER' ? (
          <TouchableOpacity style={styles.scanButton} onPress={() => { setActiveTab('scan'); navigation.navigate('Scan'); }}>
            <View style={styles.scanIconContainer}>
              <MaterialCommunityIcons name="qrcode-scan" size={32} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
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
    borderBottomColor: '#0E2748'
  },
  backButton: { padding: 8 },
  title: { color: '#E6EEF8', fontSize: 18, fontWeight: '800' },
  list: { flex: 1, backgroundColor: '#071027' },
  listContent: { padding: 16, paddingBottom: 120 },
  emptyContainer: { padding: 16, paddingBottom: 120, flexGrow: 1, justifyContent: 'center' },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#0A1F3A',
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0E6CFF'
  },
  activityLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  docIcon: { width: 48, height: 48, backgroundColor: '#0E2748', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  activityTitle: { color: '#E6EEF8', fontWeight: '700', fontSize: 14 },
  activitySub: { color: '#9AA7C0', marginTop: 4, fontSize: 12 },
  activityDate: { color: '#5B7A9A', marginTop: 4, fontSize: 10 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statusText: { fontWeight: '700', fontSize: 10, marginTop: 4 },

  emptyState: { backgroundColor: '#0A1F3A', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#0E2748', alignItems: 'center' },
  emptyTitle: { color: '#E6EEF8', fontSize: 15, fontWeight: '800', marginTop: 12, textAlign: 'center' },
  emptySub: { color: '#9AA7C0', fontSize: 12, marginTop: 8, lineHeight: 18, textAlign: 'center' },
  
  bottomNav: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: 'transparent',
    alignItems: 'flex-end',
    paddingBottom: 0,
    zIndex: 100,
    elevation: 10
  },
  navRow: {
    width: '100%',
    backgroundColor: '#0F1B2E',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: '#0E2748'
  },
  navItem: { alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 8, flex: 1, minHeight: 50 },
  navLabel: { fontSize: 11, fontWeight: '600', marginTop: 6, height: 14 },
  scanButton: { position: 'absolute', bottom: 28, alignSelf: 'center', zIndex: 101 },
  scanIconContainer: { 
    width: 70, 
    height: 70, 
    borderRadius: 35, 
    backgroundColor: '#0E6CFF', 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#0E6CFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15
  }
});
