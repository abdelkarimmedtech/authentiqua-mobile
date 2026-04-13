import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';

export default function PrivacyPolicyScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Privacy Policy</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={[styles.container, { backgroundColor: colors.bg }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Information We Collect</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            Authentiqua collects information necessary to verify academic credentials and provide document authentication services. This includes your name, email address, university affiliation, and uploaded documents for verification purposes.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>2. How We Use Your Information</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            We use the information you provide to:
            {'\n'}• Verify the authenticity of your academic documents
            {'\n'}• Maintain your account and improve our services
            {'\n'}• Send you notifications about verification status
            {'\n'}• Comply with legal and regulatory requirements
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Data Security</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            We implement industry-standard security measures to protect your personal information. Your documents are encrypted and stored securely. However, no method of transmission over the internet is completely secure.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Third-Party Sharing</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            We do not sell or share your personal information with third parties without your explicit consent, except as required by law. University staff may access your reference documents for verification purposes.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Biometric Data</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            If you enable biometric authentication (Face ID/Fingerprint), this data is stored securely on your device and never transmitted to our servers. You can disable this feature at any time in your security settings.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>6. Your Rights</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            You have the right to:
            {'\n'}• Access your personal information
            {'\n'}• Request deletion of your account and data
            {'\n'}• Opt-out of optional notifications
            {'\n'}• Update or correct your information
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>7. Data Retention</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            We retain your information for as long as necessary to provide our services and comply with legal obligations. You can request data deletion at any time.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>8. Contact Us</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            If you have privacy concerns or questions about this policy, please contact us at:
            {'\n'}privacy@authentiqua.com
            {'\n'}
            {'\n'}Last Updated: April 2026
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: { padding: 8 },
  title: { fontSize: 18, fontWeight: '800' },
  container: { flex: 1, padding: 16 },
  content: {
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 12,
    lineHeight: 20,
    fontWeight: '400',
    marginBottom: 12,
  },
});
