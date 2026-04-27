import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const formatDate = (value) => {
  const date = value?.toDate?.() || (value ? new Date(value) : null);
  if (!date || Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleString();
};

export const getDocumentTitle = (document) =>
  document?.title || document?.fileName || document?.documentType || 'Untitled document';

export const getFileType = (document) =>
  document?.metadata?.mimeType || document?.fileType || document?.documentType || 'Unknown';

export const statusColor = (status) => {
  const value = String(status || '').toUpperCase();
  if (value === 'APPROVED' || value === 'VERIFIED') return '#00C781';
  if (value === 'REJECTED') return '#FF6B6B';
  if (value === 'REVIEWED') return '#0E6CFF';
  return '#F5A623';
};

export function AdminHeader({ title, subtitle, navigation, colors, rightIcon, onRightPress }) {
  return (
    <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.cardBg }]}>
        <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
      </TouchableOpacity>
      <View style={styles.headerText}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.headerSub, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      {rightIcon ? (
        <TouchableOpacity onPress={onRightPress} style={[styles.backBtn, { backgroundColor: colors.cardBg }]}>
          <MaterialCommunityIcons name={rightIcon} size={22} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 40 }} />
      )}
    </View>
  );
}

export function StatusBadge({ status }) {
  const color = statusColor(status);
  return (
    <View style={[styles.statusBadge, { backgroundColor: `${color}22`, borderColor: `${color}55` }]}>
      <Text style={[styles.statusText, { color }]}>{status || 'PENDING'}</Text>
    </View>
  );
}

export function FilterChip({ label, active, onPress, colors }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.filterChip,
        { borderColor: active ? '#0E6CFF' : colors.border, backgroundColor: active ? '#0E6CFF' : colors.cardBg },
      ]}
      activeOpacity={0.85}
    >
      <Text style={[styles.filterText, { color: active ? '#FFFFFF' : colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function ScreenState({ loading, error, empty, emptyTitle, emptySubtitle, colors }) {
  if (loading) {
    return (
      <View style={[styles.stateCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <ActivityIndicator size="large" color="#0E6CFF" />
        <Text style={[styles.stateTitle, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.stateCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={40} color="#FF6B6B" />
        <Text style={[styles.stateTitle, { color: colors.text }]}>Something went wrong</Text>
        <Text style={[styles.stateSub, { color: colors.textSecondary }]}>{error}</Text>
      </View>
    );
  }

  if (empty) {
    return (
      <View style={[styles.stateCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <MaterialCommunityIcons name="check-circle-outline" size={40} color="#00C781" />
        <Text style={[styles.stateTitle, { color: colors.text }]}>{emptyTitle}</Text>
        <Text style={[styles.stateSub, { color: colors.textSecondary }]}>{emptySubtitle}</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1, paddingHorizontal: 12 },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  headerSub: { fontSize: 12, marginTop: 3 },
  content: { padding: 16, paddingBottom: 110 },
  card: { borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 42, height: 42, borderRadius: 11, backgroundColor: '#0E2748', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  title: { fontSize: 15, fontWeight: '800' },
  sub: { fontSize: 12, marginTop: 4 },
  metaGrid: { marginTop: 12, gap: 7 },
  meta: { fontSize: 12 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  actionBtn: { flex: 1, minHeight: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  actionText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  filterChip: { borderRadius: 18, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 8 },
  filterText: { fontSize: 12, fontWeight: '800' },
  searchInput: { minHeight: 44, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, marginBottom: 12, fontSize: 14 },
  stateCard: { borderRadius: 14, borderWidth: 1, padding: 22, alignItems: 'center', marginTop: 10 },
  stateTitle: { fontSize: 16, fontWeight: '900', marginTop: 10, textAlign: 'center' },
  stateSub: { fontSize: 12, marginTop: 6, textAlign: 'center', lineHeight: 18 },
});

export const sharedStyles = styles;
