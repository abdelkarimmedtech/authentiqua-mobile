import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';
import CustomButton from '../../components/CustomButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const RECENT = [
  { id: '1', title: "Bachelor's Degree", subtitle: 'Stanford University', status: 'VERIFIED' },
  { id: '2', title: 'Transcript 2023', subtitle: 'MIT University', status: 'IN REVIEW' },
  { id: '3', title: 'Identity Card', subtitle: 'Gov Registry', status: 'REJECTED' }
];

export default function HomeScreen({ navigation }) {
  const { signOut } = useContext(AuthContext);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const insets = useSafeAreaInsets();

  const handleSignOut = () => {
    setDrawerVisible(false);
    signOut();
  };

  const renderRecent = ({ item }) => {
    const iconName = item.status === 'VERIFIED' ? 'check-circle' : item.status === 'IN REVIEW' ? 'clock-outline' : 'close-circle';
    return (
      <View style={styles.recentItem}>
        <View style={styles.recentLeft}>
          <View style={styles.docIcon}>
            <MaterialCommunityIcons name="file-document" size={24} color="#5B7A9A" />
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.recentTitle}>{item.title}</Text>
            <Text style={styles.recentSub}>{item.subtitle}</Text>
          </View>
        </View>
        <View style={[styles.statusPill, item.status === 'VERIFIED' ? styles.verified : item.status === 'IN REVIEW' ? styles.review : styles.rejected]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>WELCOME BACK</Text>
            <Text style={styles.name}>Hadile</Text>
          </View>
          <TouchableOpacity onPress={() => setDrawerVisible(true)} style={styles.menuButton}>
            <MaterialCommunityIcons name="dots-vertical" size={28} color="#E6EEF8" />
          </TouchableOpacity>
        </View>

      <View style={styles.topRow}>
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Uploaded</Text>
          <Text style={styles.totalCount}>12</Text>
        </View>
        <View style={styles.smallCards}>
          <View style={styles.smallCard}><Text style={styles.smallCount}>08</Text><Text style={styles.smallLabel}>VERIFIED</Text></View>
          <View style={styles.smallCard}><Text style={styles.smallCount}>04</Text><Text style={styles.smallLabel}>PENDING</Text></View>
        </View>
      </View>

      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Recent Activity</Text><TouchableOpacity onPress={() => navigation.navigate('AllActivity')}><Text style={styles.seeAll}>See All</Text></TouchableOpacity></View>

      <FlatList data={RECENT} keyExtractor={r => r.id} renderItem={renderRecent} style={{ marginTop: 8 }} scrollEnabled={false} />

      <View style={styles.footerActions}>
        <CustomButton title="Upload PDF/Image" onPress={() => navigation.navigate('Scan', { galleryOnly: true })} style={styles.primaryAction} />
      </View>

      <View style={{ height: 20 }} />
      </ScrollView>

      <Modal visible={drawerVisible} transparent animationType="fade" onRequestClose={() => setDrawerVisible(false)}>
        <View style={styles.drawerOverlay}>
          <TouchableOpacity style={styles.drawerBackdrop} onPress={() => setDrawerVisible(false)} />
          <View style={styles.drawerMenu}>
            <TouchableOpacity style={styles.drawerItem} onPress={() => { navigation.navigate('Settings'); setDrawerVisible(false); }}>
              <MaterialCommunityIcons name="cog" size={24} color="#E6EEF8" />
              <Text style={styles.drawerLabel}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.drawerItem} onPress={() => { navigation.navigate('Help'); setDrawerVisible(false); }}>
              <MaterialCommunityIcons name="help-circle" size={24} color="#E6EEF8" />
              <Text style={styles.drawerLabel}>Help</Text>
            </TouchableOpacity>
            <View style={styles.drawerDivider} />
            <TouchableOpacity style={styles.drawerItem} onPress={handleSignOut}>
              <MaterialCommunityIcons name="logout" size={24} color="#FF6B6B" />
              <Text style={[styles.drawerLabel, { color: '#FF6B6B' }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
          <View style={{ width: 70 }} />
          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('history'); navigation.navigate('AllActivity'); }}>
            <MaterialCommunityIcons name="history" size={24} color={activeTab === 'history' ? '#0E6CFF' : '#5B7A9A'} />
            <Text style={[styles.navLabel, { color: activeTab === 'history' ? '#0E6CFF' : '#5B7A9A' }]}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => {}}>
            <MaterialCommunityIcons name="account" size={24} color="#5B7A9A" />
            <Text style={[styles.navLabel, { color: '#5B7A9A' }]}>Profile</Text>
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
  safeArea: { flex: 1, backgroundColor: '#071027' },
  container: { flex: 1, padding: 20, backgroundColor: '#071027', paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  welcome: { color: '#9AA7C0', fontSize: 11, letterSpacing: 1.5, fontWeight: '500' },
  name: { color: '#E6EEF8', fontSize: 28, fontWeight: '800', marginTop: 8 },
  menuButton: { padding: 8 },
  topRow: { flexDirection: 'row', marginTop: 18, alignItems: 'center' },
  totalCard: { flex: 1.6, backgroundColor: '#0B2C59', borderRadius: 12, padding: 16, marginRight: 12 },
  totalLabel: { color: '#9AA7C0', fontSize: 12 },
  totalCount: { color: '#FFFFFF', fontSize: 32, fontWeight: '900', marginTop: 8 },
  smallCards: { flex: 1, justifyContent: 'space-between' },
  smallCard: { backgroundColor: '#071226', borderRadius: 12, padding: 12, marginBottom: 8, alignItems: 'center' },
  smallCount: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  smallLabel: { color: '#9AA7C0', fontSize: 11, marginTop: 6 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  sectionTitle: { color: '#E6EEF8', fontSize: 16, fontWeight: '700' },
  seeAll: { color: '#4EA1FF' },
  recentItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: '#0A1F3A', borderRadius: 12, marginBottom: 10 },
  recentLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  docIcon: { width: 48, height: 48, backgroundColor: '#0E2748', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  recentTitle: { color: '#E6EEF8', fontWeight: '700' },
  recentSub: { color: '#9AA7C0', marginTop: 4, fontSize: 12 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
  statusText: { color: '#fff', fontWeight: '700', fontSize: 11 },
  verified: { backgroundColor: '#173A3C' },
  review: { backgroundColor: '#3D2E18' },
  rejected: { backgroundColor: '#4A1414' },
  footerActions: { marginTop: 18 },
  primaryAction: { backgroundColor: '#0E6CFF', borderRadius: 12, marginBottom: 10 },
  drawerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', flexDirection: 'row', justifyContent: 'flex-end' },
  drawerBackdrop: { flex: 1 },
  drawerMenu: { width: '60%', backgroundColor: '#0A1F3A', paddingTop: 20, paddingHorizontal: 16 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, marginBottom: 8, borderRadius: 10, backgroundColor: '#051026' },
  drawerLabel: { color: '#E6EEF8', fontSize: 14, fontWeight: '600', marginLeft: 12 },
  drawerDivider: { height: 1, backgroundColor: '#0E2748', marginVertical: 12 },
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
  scanButton: { position: 'absolute', bottom: 43, alignSelf: 'center', zIndex: 101 },
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
