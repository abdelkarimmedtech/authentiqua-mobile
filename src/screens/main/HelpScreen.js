import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';

const FAQ_ITEMS = [
  {
    id: '1',
    question: 'How do I upload a document?',
    answer: 'You can upload documents from the Scan tab by taking a photo or selecting from your gallery. Click the Verify button when ready.',
    category: 'Getting Started'
  },
  {
    id: '2',
    question: 'What document types are supported?',
    answer: 'We support PDF files, JPEG, PNG images, and other common document formats.',
    category: 'Documents'
  },
  {
    id: '3',
    question: 'How long does verification take?',
    answer: 'Most documents are verified within 24 hours. You\'ll receive a notification when the process is complete.',
    category: 'Verification'
  },
  {
    id: '4',
    question: 'Is my data secure?',
    answer: 'Yes, all your documents are encrypted and stored securely. We comply with international data protection standards.',
    category: 'Security'
  },
  {
    id: '5',
    question: 'Can I delete my documents?',
    answer: 'Yes, you can delete any document from your library. Go to Documents and long-press to delete.',
    category: 'Management'
  },
  {
    id: '6',
    question: 'How do I contact support?',
    answer: 'Email us at support@authentiqua.com or use the in-app chat for immediate assistance.',
    category: 'Support'
  },
];

export default function HelpScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const [expandedId, setExpandedId] = useState(null);

  const FAQItem = ({ item }) => {
    const isExpanded = expandedId === item.id;
    return (
      <View style={dynamicStyles(colors).faqCard}>
        <TouchableOpacity
          style={dynamicStyles(colors).faqHeader}
          onPress={() => setExpandedId(isExpanded ? null : item.id)}
        >
          <View style={dynamicStyles(colors).faqLeft}>
            <Text style={dynamicStyles(colors).faqCategory}>{item.category}</Text>
            <Text style={dynamicStyles(colors).faqQuestion}>{item.question}</Text>
          </View>
          <MaterialCommunityIcons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#0E6CFF"
          />
        </TouchableOpacity>
        {isExpanded && (
          <View style={dynamicStyles(colors).faqContent}>
            <Text style={dynamicStyles(colors).faqAnswer}>{item.answer}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={dynamicStyles(colors).safeArea}>
      <View style={dynamicStyles(colors).container}>
        <View style={dynamicStyles(colors).header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={dynamicStyles(colors).backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={dynamicStyles(colors).headerTitle}>Help & Support</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={dynamicStyles(colors).helpIntro}>
          <MaterialCommunityIcons name="help-circle-outline" size={48} color="#0E6CFF" />
          <Text style={dynamicStyles(colors).helpTitle}>Frequently Asked Questions</Text>
          <Text style={dynamicStyles(colors).helpSubtitle}>Find answers to common questions about Authentiqua</Text>
        </View>

        <FlatList
          data={FAQ_ITEMS}
          keyExtractor={item => item.id}
          renderItem={FAQItem}
          contentContainerStyle={dynamicStyles(colors).listContent}
          scrollEnabled={true}
        />

        <View style={styles.contactCard}>
          <MaterialCommunityIcons name="email-outline" size={24} color="#0E6CFF" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.contactLabel}>Still need help?</Text>
            <Text style={styles.contactEmail}>support@authentiqua.com</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const dynamicStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  helpIntro: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 12,
  },
  helpTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  helpSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  faqCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderLeftWidth: 3,
    borderLeftColor: '#0E6CFF',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  faqLeft: {
    flex: 1,
    marginRight: 12,
  },
  faqCategory: {
    color: '#0E6CFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  faqQuestion: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  faqContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  faqAnswer: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  contactLabel: {
    color: '#E6EEF8',
    fontSize: 14,
    fontWeight: '600',
  },
  contactEmail: {
    color: '#0E6CFF',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
const styles = { safeArea: {}, container: {}, header: {}, backBtn: {}, headerTitle: {}, helpIntro: {}, helpTitle: {}, helpSubtitle: {}, listContent: {}, faqCard: {}, faqHeader: {}, faqLeft: {}, faqCategory: {}, faqQuestion: {}, faqContent: {}, faqAnswer: {}, contactCard: {}
