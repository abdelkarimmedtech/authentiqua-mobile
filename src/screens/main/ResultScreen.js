import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import CustomButton from '../../components/CustomButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ResultScreen({ route, navigation }) {
  const { result } = route.params || { result: { label: 'UNKNOWN', confidence: 0 } };

  const isReal = result.label === 'REAL';
  const iconName = isReal ? 'check-circle' : 'close-circle';
  const primaryColor = isReal ? '#00FF99' : '#FF6B6B';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.badge, { backgroundColor: isReal ? 'rgba(0, 255, 153, 0.1)' : 'rgba(255, 107, 107, 0.1)' }]}>
          <MaterialCommunityIcons name={iconName} size={80} color={primaryColor} />
        </View>

        <Text style={styles.appName}>Authentiqua</Text>
        <Text style={styles.tagline}>TRUSTED VERIFICATION</Text>

        <View style={[styles.resultCard, { borderTopColor: primaryColor }]}>
          <Text style={[styles.resultLabel, { color: primaryColor }]}>{result.label}</Text>
          <Text style={styles.resultConfidence}>{result.confidence}% confidence</Text>
        </View>

        <View style={styles.actions}>
          <CustomButton title="View Details" onPress={() => navigation.navigate('VerificationResults', { id: 'AUTH-8829-XJ2', status: result.label === 'REAL' ? 'Verified' : 'Rejected', confidence: result.confidence })} style={styles.primaryBtn} />
          <CustomButton title="Scan another" onPress={() => navigation.replace('Scan')} style={styles.secondaryBtn} textStyle={{ color: colors.text }} />
          <CustomButton title="Home" onPress={() => navigation.navigate('Home')} style={styles.secondaryBtn} textStyle={{ color: colors.text }} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#071027' },
  container: { flex: 1, padding: 24, backgroundColor: '#071027', alignItems: 'center', justifyContent: 'center' },
  badge: { width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  appName: { color: '#E6EEF8', fontSize: 28, fontWeight: '900' },
  tagline: { color: '#5B7A9A', marginTop: 4, letterSpacing: 1.5, fontSize: 11, fontWeight: '600' },
  resultCard: { marginTop: 32, paddingVertical: 28, paddingHorizontal: 24, borderRadius: 16, borderTopWidth: 3, alignItems: 'center', width: '100%', backgroundColor: '#0A1F3A' },
  resultLabel: { fontSize: 48, fontWeight: '900' },
  resultConfidence: { color: colors.muted, marginTop: 12, fontSize: 14, fontWeight: '600' },
  actions: { width: '100%', marginTop: 32 },
  primaryBtn: { backgroundColor: '#0E6CFF', borderRadius: 12, marginBottom: 12 },
  secondaryBtn: { backgroundColor: '#0A1F3A', borderRadius: 12 }
});
