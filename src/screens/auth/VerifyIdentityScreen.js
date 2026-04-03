import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';
import CustomButton from '../../components/CustomButton';

const UNIVERSITIES = [
  { id: '1', name: 'MedTech University', location: 'Tunis, Tunisia' },
  { id: '2', name: 'Manouba School of Business', location: 'Manouba, Tunisia' },
  { id: '3', name: 'ESPRIT', location: 'Tunis, Tunisia' },
  { id: '4', name: 'INSAT', location: 'Tunis, Tunisia' }
];

export default function VerifyIdentityScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('2');

  const filtered = UNIVERSITIES.filter(u => u.name.toLowerCase().includes(query.toLowerCase()));

  const renderItem = ({ item }) => {
    const isSelected = item.id === selected;
    return (
      <TouchableOpacity style={[styles.card, isSelected && styles.cardSelected]} onPress={() => setSelected(item.id)}>
        <View style={styles.cardLeft}>
          <View style={styles.logoPlaceholder} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSub}>{item.location}</Text>
          </View>
        </View>
        {isSelected && <View style={styles.selectedBadge}><Text style={styles.selectedText}>SELECTED</Text></View>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Verify Identity</Text>
        <View style={[styles.stepsRow, { backgroundColor: colors.bg }]}>
          <View style={[styles.stepDot, styles.stepActive]}><Text style={styles.stepNum}>1</Text></View>
          <View style={[styles.stepLine, { backgroundColor: colors.border }]} />
          <View style={[styles.stepDot, { backgroundColor: colors.optionBg }]}><Text style={styles.stepNumMuted}>2</Text></View>
          <View style={[styles.stepLine, { backgroundColor: colors.border }]} />
          <View style={[styles.stepDot, { backgroundColor: colors.optionBg }]}><Text style={styles.stepNumMuted}>3</Text></View>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>University</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Select your institution to proceed with the document verification process.</Text>

        <View style={[styles.searchBox, { backgroundColor: colors.optionBg }]}>
          <TextInput placeholder="Search university name..." placeholderTextColor={colors.textSecondary} value={query} onChangeText={setQuery} style={{ color: colors.text }} />
        </View>

        <FlatList data={filtered} keyExtractor={i => i.id} renderItem={renderItem} style={{ marginTop: 12 }} />

        <View style={styles.actions}>
          <CustomButton title="Take a Photo" onPress={() => navigation.navigate('Camera')} style={styles.primary} />
          <CustomButton title="Upload PDF/Image" onPress={() => navigation.navigate('Scan', { galleryOnly: true })} style={styles.secondary} textStyle={{ color: colors.text }} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 20 },
  headerTitle: { fontWeight: '800', fontSize: 18, alignSelf: 'center', marginTop: 6 },
  stepsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  stepDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  stepActive: { backgroundColor: '#163A6B' },
  stepNum: { color: '#fff', fontWeight: '800' },
  stepNumMuted: { color: '#5E6D7E' },
  stepLine: { width: 28, height: 2, marginHorizontal: 8 },
  title: { fontSize: 22, fontWeight: '800', marginTop: 18 },
  subtitle: { marginTop: 8 },
  searchBox: { marginTop: 14, padding: 12, borderRadius: 10 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 10, marginTop: 10 },
  cardSelected: { borderColor: '#0E6CFF', borderWidth: 1.5 },
  cardLeft: { flexDirection: 'row', alignItems: 'center' },
  logoPlaceholder: { width: 44, height: 44, borderRadius: 8 },
  cardTitle: { fontWeight: '700' },
  cardSub: { marginTop: 4, fontSize: 12 },
  selectedBadge: { backgroundColor: '#0E6CFF', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 12 },
  selectedText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  actions: { marginTop: 18 },
  primary: { backgroundColor: '#0E6CFF', borderRadius: 12, marginBottom: 10 },
  secondary: { backgroundColor: '#0B253B', borderRadius: 12 }
});
