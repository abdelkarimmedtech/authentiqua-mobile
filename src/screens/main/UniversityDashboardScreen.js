import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { onUniversityReferenceDocumentsChange, onPendingDocumentsForUniversityChange } from '../../../backend/firestore';
import { getUserDisplayName } from '../../utils/user';

function ReferenceCard({ refDoc }) {
  const uploadedAt = refDoc?.uploadedAt?.toDate?.() || null;
  return (
    <View style={styles.refCard}>
      <View style={styles.refLeft}>
        <View style={styles.docIconWrap}>
          <MaterialCommunityIcons name="file-document-outline" size={20} color="#0E6CFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.refType}>{refDoc?.documentType || 'REFERENCE'}</Text>
          <Text style={styles.refName} numberOfLines={1}>
            {refDoc?.fileName || 'Document'}
          </Text>
          {uploadedAt ? <Text style={styles.refTime}>Uploaded {uploadedAt.toLocaleDateString()}</Text> : null}
        </View>
      </View>
      <View style={styles.refBadge}>
        <Text style={styles.refBadgeText}>OFFICIAL</Text>
      </View>
    </View>
  );
}

export default function UniversityDashboardScreen({ navigation }) {
  const { user, signOut } = useContext(AuthContext);
  const university = user?.profile?.university || '';
  const displayName = useMemo(() => getUserDisplayName(user), [user]);
  const [referenceDocs, setReferenceDocs] = useState([]);
  const [pendingDocs, setPendingDocs] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!university) return;
    const unsub = onUniversityReferenceDocumentsChange(university, (res) => {
      if (res.success) {
        setReferenceDocs(res.documents || []);
      } else {
        console.error('❌ Error loading university reference documents:', res.error);
        setReferenceDocs([]);
      }
    });
    return () => unsub?.();
  }, [university]);

  useEffect(() => {
    if (!university) return;
    const unsub = onPendingDocumentsForUniversityChange(university, (res) => {
      if (res.success) {
        setPendingDocs(res.documents || []);
      } else {
        console.error('❌ Error loading university pending documents:', res.error);
        setPendingDocs([]);
      }
    });
    return () => unsub?.();
  }, [university]);

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
            <Text style={styles.portalName}>{university || 'Your University'}</Text>
            <Text style={styles.portalSub}>Signed in as {displayName}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.notifBtn} onPress={signOut}>
          <MaterialCommunityIcons name="logout" size={24} color="#E6EEF8" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.pendingCard}>
          <View style={styles.pendingRow}>
            <View>
              <Text style={styles.pendingLabel}>Official reference documents</Text>
              <View style={styles.pendingCountRow}>
                <Text style={styles.pendingCount}>{referenceDocs.length}</Text>
                <View style={styles.todayBadge}>
                  <Text style={styles.todayText}>Library</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={() => navigation.navigate('UniversityReferenceUpload')}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="upload" size={18} color="#FFFFFF" />
              <Text style={styles.uploadBtnText}>Upload</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.pendingCard}>
          <View style={styles.pendingRow}>
            <View>
              <Text style={styles.pendingLabel}>Documents pending review</Text>
              <View style={styles.pendingCountRow}>
                <Text style={styles.pendingCount}>{pendingDocs.length}</Text>
                <View style={[styles.todayBadge, { backgroundColor: 'rgba(245,166,35,0.15)', borderColor: 'rgba(245,166,35,0.3)' }]}>
                  <Text style={[styles.todayText, { color: '#F5A623' }]}>PENDING</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={() => navigation.navigate('StaffDocumentReview')}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="clipboard-check" size={18} color="#FFFFFF" />
              <Text style={styles.uploadBtnText}>Review</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Reference library</Text>
        </View>

        {referenceDocs.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="file-document-outline" size={44} color="#5B7A9A" />
            <Text style={styles.emptyTitle}>No reference documents yet</Text>
            <Text style={styles.emptySub}>Upload at least one official document so normal users can be verified.</Text>
          </View>
        ) : (
          referenceDocs.slice(0, 8).map((d) => <ReferenceCard key={d.id} refDoc={d} />)
        )}

      </ScrollView>

      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              setActiveTab('dashboard');
              navigation.navigate('UniversityDashboard');
            }}
          >
            <MaterialCommunityIcons
              name="home"
              size={24}
              color={activeTab === 'dashboard' ? '#0E6CFF' : '#5B7A9A'}
            />
            <Text
              style={[
                styles.navLabel,
                { color: activeTab === 'dashboard' ? '#0E6CFF' : '#5B7A9A' },
              ]}
            >
              Dashboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              setActiveTab('documents');
              navigation.navigate('Documents');
            }}
          >
            <MaterialCommunityIcons
              name="file-document"
              size={24}
              color={activeTab === 'documents' ? '#0E6CFF' : '#5B7A9A'}
            />
            <Text
              style={[
                styles.navLabel,
                { color: activeTab === 'documents' ? '#0E6CFF' : '#5B7A9A' },
              ]}
            >
              Documents
            </Text>
          </TouchableOpacity>

          <View style={{ width: 70 }} />

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              setActiveTab('history');
              navigation.navigate('AllActivity');
            }}
          >
            <MaterialCommunityIcons
              name="history"
              size={24}
              color={activeTab === 'history' ? '#0E6CFF' : '#5B7A9A'}
            />
            <Text
              style={[
                styles.navLabel,
                { color: activeTab === 'history' ? '#0E6CFF' : '#5B7A9A' },
              ]}
            >
              History
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              setActiveTab('profile');
              navigation.navigate('Profile');
            }}
          >
            <MaterialCommunityIcons
              name="account"
              size={24}
              color={activeTab === 'profile' ? '#0E6CFF' : '#5B7A9A'}
            />
            <Text
              style={[
                styles.navLabel,
                { color: activeTab === 'profile' ? '#0E6CFF' : '#5B7A9A' },
              ]}
            >
              Profile
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => {
            setActiveTab('upload');
            navigation.navigate('UniversityReferenceUpload');
          }}
        >
          <View style={styles.scanIconContainer}>
            <MaterialCommunityIcons name="upload" size={32} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>
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
  portalSub:      { color: '#9AA7C0', fontSize: 11, marginTop: 4 },
  notifBtn:       { position: 'relative' },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },

  pendingCard:     { backgroundColor: '#0A1F3A', borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#0E2748' },
  pendingRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pendingLabel:    { color: '#9AA7C0', fontSize: 13, marginBottom: 8 },
  pendingCountRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pendingCount:    { color: '#E6EEF8', fontSize: 36, fontWeight: '800' },
  todayBadge:      { backgroundColor: 'rgba(245,166,35,0.15)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(245,166,35,0.3)' },
  todayText:       { color: '#F5A623', fontSize: 12, fontWeight: '700' },

  uploadBtn:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#0E6CFF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  uploadBtnText:  { color: '#FFFFFF', fontWeight: '800' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle:  { color: '#E6EEF8', fontSize: 17, fontWeight: '800' },

  docIconWrap:   { width: 36, height: 36, borderRadius: 10, backgroundColor: '#0E2748', justifyContent: 'center', alignItems: 'center' },

  refCard:       { backgroundColor: '#0A1F3A', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#0E2748', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  refLeft:       { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 10 },
  refType:       { color: '#0E6CFF', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  refName:       { color: '#E6EEF8', fontSize: 14, fontWeight: '700', marginTop: 4 },
  refTime:       { color: '#5B7A9A', fontSize: 11, marginTop: 4 },
  refBadge:      { backgroundColor: 'rgba(0,255,153,0.12)', borderWidth: 1, borderColor: 'rgba(0,255,153,0.25)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  refBadgeText:  { color: '#00FF99', fontSize: 10, fontWeight: '900', letterSpacing: 1 },

  emptyState:    { backgroundColor: '#0A1F3A', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#0E2748', alignItems: 'center' },
  emptyTitle:    { color: '#E6EEF8', fontSize: 15, fontWeight: '800', marginTop: 10 },
  emptySub:      { color: '#9AA7C0', fontSize: 12, lineHeight: 18, marginTop: 8, textAlign: 'center' },

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    alignItems: 'flex-end',
    paddingBottom: 0,
    zIndex: 100,
    elevation: 10,
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
    borderTopColor: '#0E2748',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    flex: 1,
    minHeight: 50,
  },
  navLabel: { fontSize: 11, fontWeight: '600', marginTop: 6, height: 14 },
  scanButton: { position: 'absolute', bottom: 44, alignSelf: 'center', zIndex: 101 },
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
    elevation: 15,
  },
});
