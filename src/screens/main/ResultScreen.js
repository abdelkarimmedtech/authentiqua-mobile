import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../constants/colors';
import CustomButton from '../../components/CustomButton';

export default function ResultScreen({ route, navigation }) {
  const { result } = route.params || { result: { label: 'UNKNOWN', confidence: 0 } };

  const isReal = result.label === 'REAL';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Result</Text>

      <View style={[styles.card, { borderColor: isReal ? colors.accent : '#FF6B6B' }]}>
        <Text style={[styles.label, { color: isReal ? colors.accent : '#FF6B6B' }]}>{result.label}</Text>
        <Text style={styles.confidence}>{result.confidence}% confidence</Text>
      </View>

      <CustomButton title="Scan another" onPress={() => navigation.replace('Scan')} style={{ marginTop: 20 }} />
      <CustomButton title="Home" onPress={() => navigation.navigate('Home')} style={{ marginTop: 12 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: colors.darkBg },
  title: { color: colors.accent, fontSize: 28, fontWeight: '800' },
  card: { marginTop: 24, padding: 20, borderRadius: 12, borderWidth: 2, alignItems: 'center' },
  label: { fontSize: 42, fontWeight: '900' },
  confidence: { color: colors.muted, marginTop: 8 }
});
