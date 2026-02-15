import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';
import CustomButton from '../../components/CustomButton';

export default function HomeScreen({ navigation }) {
  const { signOut } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Welcome to Authentiqua — scan images to detect authenticity.</Text>

      <CustomButton title="Start Scan" onPress={() => navigation.navigate('Scan')} style={{ marginTop: 20 }} />

      <TouchableOpacity onPress={signOut} style={{ marginTop: 30 }}>
        <Text style={styles.signout}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: colors.darkBg },
  title: { color: colors.accent, fontSize: 32, fontWeight: '800' },
  subtitle: { color: colors.muted, marginTop: 8 }
});
