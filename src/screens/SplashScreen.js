import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import colors from '../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SplashScreen() {
  const [progress] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 100,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  }, []);

  const progressWidth = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <MaterialCommunityIcons name="check-circle" size={64} color="#0E6CFF" />
      </View>
      <Text style={styles.appName}>Authentiqua</Text>
      <Text style={styles.tagline}>TRUSTED VERIFICATION</Text>
      <View style={styles.progress}>
        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
      </View>
      <Text style={styles.footer}>Powered by SecureScan Technology</Text>
      <Text style={styles.footerSmall}>E2E end-to-end encrypted protocol</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071027', alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  logoBox: { width: 120, height: 120, backgroundColor: '#0E6CFF', borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  appName: { color: '#E6EEF8', fontSize: 32, fontWeight: '900', marginTop: 12 },
  tagline: { color: '#5B7A9A', marginTop: 8, letterSpacing: 2, fontSize: 12, fontWeight: '600' },
  progress: { width: '50%', height: 8, backgroundColor: '#0A2238', borderRadius: 8, marginTop: 32, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#0E6CFF', borderRadius: 8 },
  footer: { color: '#7B8EA6', fontSize: 12, marginTop: 24, fontWeight: '600' },
  footerSmall: { color: '#5B7A9A', fontSize: 10, marginTop: 8 }
});
