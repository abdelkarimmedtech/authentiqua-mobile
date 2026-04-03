import React, { useContext, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';
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
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
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
      style={[styles.docCard, { backgroundColor: colors.cardBg }]}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('DocumentDetail', { id: item.id })}
    >
      <View style={styles.docLeft}>
        <View style={[styles.docIcon, { backgroundColor: colors.optionBg }]}>
          <MaterialCommunityIcons name="file-document" size={28} color="#0E6CFF" />
        </View>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={[styles.docTitle, { color: colors.text }]}>{formatType(item.documentType)}</Text>
          <Text style={[styles.docSub, { color: colors.textSecondary }]}>{item.university || ''}</Text>
          <Text style={[styles.docDate, { color: colors.icon }]}>
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.cardBg }]}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{role === 'USER' ? 'My Documents' : 'Reference Documents'}</Text>
          <View style={{ width: 28 }} />
        </View>

        <Text style={[styles.sublabel, { color: colors.textSecondary }]}>
          {role === 'USER' ? 'Total Scanned' : 'Total Reference Docs'}: {documents.length}
        </Text>

        {documents.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="file-document-outline" size={52} color={colors.icon} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {role === 'USER' ? 'No documents scanned yet' : 'No reference documents yet'}
            </Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
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
        <View style={[styles.navRow, { backgroundColor: colors.headerBg, borderTopColor: colors.border }]}>
          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('dashboard'); navigation.navigate('Home'); }}>
            <MaterialCommunityIcons name="home" size={24} color={activeTab === 'dashboard' ? '#0E6CFF' : colors.icon} />
            <Text style={[styles.navLabel, { color: activeTab === 'dashboard' ? '#0E6CFF' : colors.icon }]}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('documents'); }}>
            <MaterialCommunityIcons name="file-document" size={24} color={activeTab === 'documents' ? '#0E6CFF' : colors.icon} />
            <Text style={[styles.navLabel, { color: activeTab === 'documents' ? '#0E6CFF' : colors.icon }]}>Documents</Text>
          </TouchableOpacity>
          <View style={{ width: role === 'USER' ? 70 : 0 }} />
          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('history'); navigation.navigate('AllActivity'); }}>
            <MaterialCommunityIcons name="history" size={24} color={activeTab === 'history' ? '#0E6CFF' : colors.icon} />
            <Text style={[styles.navLabel, { color: activeTab === 'history' ? '#0E6CFF' : colors.icon }]}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('profile'); navigation.navigate('Profile'); }}>
            <MaterialCommunityIcons name="account" size={24} color={activeTab === 'profile' ? '#0E6CFF' : colors.icon} />
            <Text style={[styles.navLabel, { color: activeTab === 'profile' ? '#0E6CFF' : colors.icon }]}>Profile</Text>
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
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  sublabel: {
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
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  emptyTitle: { fontSize: 15, fontWeight: '800', marginTop: 12, textAlign: 'center' },
  emptySub: { fontSize: 12, marginTop: 8, lineHeight: 18, textAlign: 'center' },
  emptyAction: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#0E6CFF', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  emptyActionText: { color: '#FFFFFF', fontWeight: '800' },
  docCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
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
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTitle: {
    fontWeight: '700',
    fontSize: 14,
  },
  docSub: {
    fontSize: 12,
    marginTop: 4,
  },
  docDate: {
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderTopWidth: 1,
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
