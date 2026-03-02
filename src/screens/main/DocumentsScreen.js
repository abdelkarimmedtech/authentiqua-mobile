import React, { useContext, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { getUserRole } from '../../utils/user';
import { onUserDocumentsChange, onUniversityReferenceDocumentsChange } from '../../../backend/firestore';

function formatType(t) {
  if (!t) return 'Document';
  return String(t).replace(/_/g, ' ');
}

export default function DocumentsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('documents');
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const role = useMemo(() => getUserRole(user), [user]);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    if (role === 'USER') {
      const unsub = onUserDocumentsChange(user.uid, (res) => {
        const docs = (res?.documents || []).filter((d) => !d.isReference);
        setDocuments(docs);
      });
      return () => unsub?.();
    }

    const uni = user?.profile?.university;
    if (!uni) return;
    const unsub = onUniversityReferenceDocumentsChange(uni, (res) => {
      setDocuments(res?.documents || []);
    });
    return () => unsub?.();
  }, [user?.uid, user?.profile?.university, role]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.docCard}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('DocumentDetail', { id: item.id })}
    >
      <View style={styles.docLeft}>
        <View style={styles.docIcon}>
          <MaterialCommunityIcons name="file-document" size={28} color="#0E6CFF" />
        </View>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.docTitle}>{formatType(item.documentType)}</Text>
          <Text style={styles.docSub}>{item.university || ''}</Text>
          <Text style={styles.docDate}>
            {(item.uploadedAt?.toDate?.() ? item.uploadedAt.toDate() : item.uploadedAt)
              ? new Date(item.uploadedAt?.toDate?.() ? item.uploadedAt.toDate() : item.uploadedAt).toLocaleDateString()
              : ''}
          </Text>
        </View>
      </View>
      <View style={[styles.statusBadge, item.status === 'VERIFIED' ? styles.verified : item.status === 'REFERENCE' ? styles.verified : styles.review]}>
        <MaterialCommunityIcons 
          name={item.status === 'VERIFIED' || item.status === 'REFERENCE' ? 'check-circle' : 'clock-outline'} 
          size={16} 
          color={item.status === 'VERIFIED' || item.status === 'REFERENCE' ? '#00FF99' : '#FFB800'}
        />
        <Text style={[styles.badgeText, { color: item.status === 'VERIFIED' || item.status === 'REFERENCE' ? '#00FF99' : '#FFB800' }]}>
          {item.status === 'REFERENCE' ? 'OFFICIAL' : item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="#E6EEF8" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{role === 'USER' ? 'My Documents' : 'Reference Documents'}</Text>
          <View style={{ width: 28 }} />
        </View>

        <Text style={styles.sublabel}>
          {role === 'USER' ? 'Total Scanned' : 'Total Reference Docs'}: {documents.length}
        </Text>

        {documents.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="file-document-outline" size={52} color="#5B7A9A" />
            <Text style={styles.emptyTitle}>
              {role === 'USER' ? 'No documents scanned yet' : 'No reference documents yet'}
            </Text>
            <Text style={styles.emptySub}>
              {role === 'USER'
                ? 'Scan your first document to see it here.'
                : 'Upload official documents so normal users can be verified.'}
            </Text>
            {role !== 'USER' ? (
              <TouchableOpacity
                style={styles.emptyAction}
                onPress={() => navigation.navigate('UniversityReferenceUpload')}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="upload" size={18} color="#FFFFFF" />
                <Text style={styles.emptyActionText}>Upload reference</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <FlatList
            data={documents}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            scrollEnabled={true}
          />
        )}
      </View>

      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('dashboard'); navigation.navigate('Home'); }}>
            <MaterialCommunityIcons name="home" size={24} color={activeTab === 'dashboard' ? '#0E6CFF' : '#5B7A9A'} />
            <Text style={[styles.navLabel, { color: activeTab === 'dashboard' ? '#0E6CFF' : '#5B7A9A' }]}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('documents'); }}>
            <MaterialCommunityIcons name="file-document" size={24} color={activeTab === 'documents' ? '#0E6CFF' : '#5B7A9A'} />
            <Text style={[styles.navLabel, { color: activeTab === 'documents' ? '#0E6CFF' : '#5B7A9A' }]}>Documents</Text>
          </TouchableOpacity>
          <View style={{ width: role === 'USER' ? 70 : 0 }} />
          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('history'); navigation.navigate('AllActivity'); }}>
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
    paddingBottom: 120,
  },
  emptyState: {
    flex: 1,
    backgroundColor: '#0A1F3A',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#0E2748',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  emptyTitle: { color: '#E6EEF8', fontSize: 15, fontWeight: '800', marginTop: 12, textAlign: 'center' },
  emptySub: { color: '#9AA7C0', fontSize: 12, marginTop: 8, lineHeight: 18, textAlign: 'center' },
  emptyAction: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#0E6CFF', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  emptyActionText: { color: '#FFFFFF', fontWeight: '800' },
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
