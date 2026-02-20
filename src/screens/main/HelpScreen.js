import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  const [expandedId, setExpandedId] = useState(null);

  const FAQItem = ({ item }) => {
    const isExpanded = expandedId === item.id;
    return (
      <View style={styles.faqCard}>
        <TouchableOpacity
          style={styles.faqHeader}
          onPress={() => setExpandedId(isExpanded ? null : item.id)}
        >
          <View style={styles.faqLeft}>
            <Text style={styles.faqCategory}>{item.category}</Text>
            <Text style={styles.faqQuestion}>{item.question}</Text>
          </View>
          <MaterialCommunityIcons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#0E6CFF"
          />
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.faqContent}>
            <Text style={styles.faqAnswer}>{item.answer}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="#E6EEF8" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.helpIntro}>
          <MaterialCommunityIcons name="help-circle-outline" size={48} color="#0E6CFF" />
          <Text style={styles.helpTitle}>Frequently Asked Questions</Text>
          <Text style={styles.helpSubtitle}>Find answers to common questions about Authentiqua</Text>
        </View>

        <FlatList
          data={FAQ_ITEMS}
          keyExtractor={item => item.id}
          renderItem={FAQItem}
          contentContainerStyle={styles.listContent}
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#071027' },
  container: { flex: 1, backgroundColor: '#071027', paddingHorizontal: 16 },
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
    backgroundColor: '#0A1F3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#E6EEF8',
    fontSize: 20,
    fontWeight: '800',
  },
  helpIntro: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 12,
  },
  helpTitle: {
    color: '#E6EEF8',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  helpSubtitle: {
    color: '#9AA7C0',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  faqCard: {
    backgroundColor: '#0A1F3A',
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
    color: '#E6EEF8',
    fontSize: 14,
    fontWeight: '600',
  },
  faqContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#051026',
  },
  faqAnswer: {
    color: '#9AA7C0',
    fontSize: 13,
    lineHeight: 20,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1F3A',
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
});
