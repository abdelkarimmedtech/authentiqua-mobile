import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';
import CustomButton from '../../components/CustomButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { onUserDocumentsChange } from '../../../backend/firestore';
import { getUserDisplayName, getUserRole } from '../../utils/user';
import { useFocusEffect } from '@react-navigation/native';

function formatType(t) {
  if (!t) return 'Document';
  return String(t).replace(/_/g, ' ');
}

export default function HomeScreen({ navigation }) {
  const { signOut, user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const insets = useSafeAreaInsets();
  const role = useMemo(() => getUserRole(user), [user]);
  const displayName = useMemo(() => getUserDisplayName(user), [user]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role && role !== 'USER') {
      navigation.replace('UniversityDashboard');
    }
  }, [role, navigation]);

  useFocusEffect(
    useCallback(() => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const unsub = onUserDocumentsChange(user.uid, (res) => {
        const docs = (res?.documents || []).filter((d) => !d.isReference);
        setDocuments(docs);
        setLoading(false);
      });
      return () => unsub?.();
    }, [user?.uid])
  );

  const totalUploaded = documents.length;
  const verifiedCount = documents.filter((d) => d.status === 'VERIFIED').length;
  const pendingCount = documents.filter((d) => d.status === 'PENDING').length;
  const rejectedCount = documents.filter((d) => d.status === 'REJECTED').length;
  const recent = documents.slice(0, 3).map((d) => ({
    id: d.id,
    title: formatType(d.documentType),
    subtitle: d.university || '',
    status: d.status,
  }));

  const handleSignOut = () => {
    setDrawerVisible(false);
    signOut();
  };

  const renderRecent = ({ item }) => {
    const iconName = item.status === 'VERIFIED' ? 'check-circle' : item.status === 'PENDING' ? 'clock-outline' : 'close-circle';
    return (
      <View style={styles.recentItem}>
        <View style={styles.recentLeft}>
          <View style={[styles.docIcon, { backgroundColor: colors.optionBg }]}>
            <MaterialCommunityIcons name="file-document" size={24} color={colors.icon} />
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={[styles.recentTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.recentSub, { color: colors.textSecondary }]}>{item.subtitle}</Text>
          </View>
        </View>
        <View style={[styles.statusPill, item.status === 'VERIFIED' ? styles.verified : item.status === 'PENDING' ? styles.review : styles.rejected]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcome, { color: colors.textSecondary }]}>WELCOME BACK</Text>
            <Text style={[styles.name, { color: colors.text }]}>{displayName}</Text>
          </View>
          <TouchableOpacity onPress={() => setDrawerVisible(true)} style={styles.menuButton}>
            <MaterialCommunityIcons name="menu" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>

      <View style={styles.topRow}>
        <View style={[styles.totalCard, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total Uploaded</Text>
          <Text style={[styles.totalCount, { color: colors.text }]}>{totalUploaded}</Text>
        </View>
        <View style={styles.smallCards}>
          <View style={[styles.smallCard, { backgroundColor: colors.optionBg }]}><Text style={[styles.smallCount, { color: colors.text }]}>{String(verifiedCount).padStart(2, '0')}</Text><Text style={[styles.smallLabel, { color: colors.textSecondary }]}>VERIFIED</Text></View>
          <View style={[styles.smallCard, { backgroundColor: colors.optionBg }]}><Text style={[styles.smallCount, { color: colors.text }]}>{String(pendingCount).padStart(2, '0')}</Text><Text style={[styles.smallLabel, { color: colors.textSecondary }]}>PENDING</Text></View>
        </View>
      </View>

      <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text><TouchableOpacity onPress={() => navigation.navigate('AllActivity')}><Text style={styles.seeAll}>See All</Text></TouchableOpacity></View>

      <FlatList
        data={recent}
        keyExtractor={(r) => r.id}
        renderItem={renderRecent}
        style={{ marginTop: 8 }}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={[styles.emptyRecent, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.emptyRecentTitle, { color: colors.text }]}>No activity yet</Text>
            <Text style={[styles.emptyRecentSub, { color: colors.textSecondary }]}>Scan and verify a document to see it here.</Text>
          </View>
        }
      />

      <View style={styles.footerActions}>
        <CustomButton title="Upload PDF/Image" onPress={() => navigation.navigate('Scan', { galleryOnly: true })} style={styles.primaryAction} />
      </View>

      <View style={{ height: 20 }} />
      </ScrollView>

      <Modal visible={drawerVisible} transparent animationType="fade" onRequestClose={() => setDrawerVisible(false)}>
        <View style={styles.drawerOverlay}>
          <TouchableOpacity style={styles.drawerBackdrop} onPress={() => setDrawerVisible(false)} />
          <View style={[styles.drawerMenu, { backgroundColor: colors.cardBg }]}>
            <TouchableOpacity style={[styles.drawerItem, { backgroundColor: colors.optionBg }]} onPress={() => { navigation.navigate('Help'); setDrawerVisible(false); }}>
              <MaterialCommunityIcons name="help-circle" size={24} color={colors.text} />
              <Text style={[styles.drawerLabel, { color: colors.text }]}>Help</Text>
            </TouchableOpacity>
            <View style={[styles.drawerDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={[styles.drawerItem, { backgroundColor: colors.optionBg }]} onPress={handleSignOut}>
              <MaterialCommunityIcons name="logout" size={24} color="#FF6B6B" />
              <Text style={[styles.drawerLabel, { color: '#FF6B6B' }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={[styles.navRow, { backgroundColor: colors.headerBg, borderTopColor: colors.border }]}>
          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('dashboard'); navigation.navigate('Home'); }}>
            <MaterialCommunityIcons name="home" size={24} color={activeTab === 'dashboard' ? '#0E6CFF' : colors.icon} />
            <Text style={[styles.navLabel, { color: activeTab === 'dashboard' ? '#0E6CFF' : colors.icon }]}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('documents'); navigation.navigate('Documents'); }}>
            <MaterialCommunityIcons name="file-document" size={24} color={activeTab === 'documents' ? '#0E6CFF' : colors.icon} />
            <Text style={[styles.navLabel, { color: activeTab === 'documents' ? '#0E6CFF' : colors.icon }]}>Documents</Text>
          </TouchableOpacity>
          <View style={{ width: 70 }} />
          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('history'); navigation.navigate('AllActivity'); }}>
            <MaterialCommunityIcons name="history" size={24} color={activeTab === 'history' ? '#0E6CFF' : colors.icon} />
            <Text style={[styles.navLabel, { color: activeTab === 'history' ? '#0E6CFF' : colors.icon }]}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('profile'); navigation.navigate('Profile'); }}>
            <MaterialCommunityIcons name="account" size={24} color={activeTab === 'profile' ? '#0E6CFF' : colors.icon} />
            <Text style={[styles.navLabel, { color: activeTab === 'profile' ? '#0E6CFF' : colors.icon }]}>Profile</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.scanButton} onPress={() => { setActiveTab('scan'); navigation.navigate('Scan'); }}>
          <View style={styles.scanIconContainer}>
            <MaterialCommunityIcons name="qrcode-scan" size={32} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  welcome: { fontSize: 11, letterSpacing: 1.5, fontWeight: '500' },
  name: { fontSize: 28, fontWeight: '800', marginTop: 8 },
  menuButton: { padding: 8 },
  topRow: { flexDirection: 'row', marginTop: 18, alignItems: 'center' },
  totalCard: { flex: 1.6, borderRadius: 12, padding: 16, marginRight: 12 },
  totalLabel: { fontSize: 12 },
  totalCount: { fontSize: 32, fontWeight: '900', marginTop: 8 },
  smallCards: { flex: 1, justifyContent: 'space-between' },
  smallCard: { borderRadius: 12, padding: 12, marginBottom: 8, alignItems: 'center' },
  smallCount: { fontSize: 18, fontWeight: '800' },
  smallLabel: { fontSize: 11, marginTop: 6 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  seeAll: { color: '#4EA1FF' },
  recentItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 10 },
  recentLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  docIcon: { width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  recentTitle: { fontWeight: '700' },
  recentSub: { marginTop: 4, fontSize: 12 },
  emptyRecent: { borderRadius: 12, padding: 16, borderWidth: 1 },
  emptyRecentTitle: { fontWeight: '800', fontSize: 14 },
  emptyRecentSub: { marginTop: 6, fontSize: 12, lineHeight: 18 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
  statusText: { color: '#fff', fontWeight: '700', fontSize: 11 },
  verified: { backgroundColor: '#173A3C' },
  review: { backgroundColor: '#3D2E18' },
  rejected: { backgroundColor: '#4A1414' },
  footerActions: { marginTop: 18 },
  primaryAction: { backgroundColor: '#0E6CFF', borderRadius: 12, marginBottom: 10 },
  drawerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', flexDirection: 'row', justifyContent: 'flex-end' },
  drawerBackdrop: { flex: 1 },
  drawerMenu: { width: '60%', paddingTop: 20, paddingHorizontal: 16 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, marginBottom: 8, borderRadius: 10 },
  drawerLabel: { fontSize: 14, fontWeight: '600', marginLeft: 12 },
  drawerDivider: { height: 1, marginVertical: 12 },
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
    borderTopWidth: 1
  },
  navItem: { alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 8, flex: 1, minHeight: 50 },
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
    elevation: 15
  }
});
