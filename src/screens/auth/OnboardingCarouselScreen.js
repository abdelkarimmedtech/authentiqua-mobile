import React, { useContext, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';
import { getThemeColors } from '../../utils/themeColors';

const { width } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: 1,
    title: 'Secure AI Scanning',
    description: 'Capture your academic documents with ease. Our AI ensures every detail is captured with high precision for faster verification.',
    icon: 'file-document',
    color: '#0E6CFF',
  },
  {
    id: 2,
    title: 'Verified by Institutions',
    description: 'Directly connected to hundreds of universities worldwide. Your documents are verified instantly by authorized representatives.',
    icon: 'shield-bank',
    color: '#0E6CFF',
  },
  {
    id: 3,
    title: 'Get Results Instantly',
    description: 'Track your status in real-time and download your verified credentials as soon as they are approved.',
    icon: 'check-decagram',
    color: '#00FF99',
  },
];

export default function OnboardingCarouselScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleMomentumScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  const scrollToNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const scrollToPrev = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
    }
  };

  const handleGetStarted = () => {
    navigation.navigate('Signup');
  };

  const handleSkip = () => {
    navigation.navigate('Login');
  };

  const renderPage = ({ item }) => (
    <View style={[styles.page, { width, backgroundColor: colors.bg }]}>
      <View style={styles.topSection}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>SKIP</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <Animated.View
            style={[
              styles.iconCircle,
              {
                backgroundColor: 'rgba(14, 108, 255, 0.1)',
                borderColor: 'rgba(14, 108, 255, 0.2)',
              },
            ]}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={80}
              color={item.color}
            />
          </Animated.View>

          {/* Animated rings */}
          <Animated.View
            style={[
              styles.ring1,
              {
                borderColor: 'rgba(14, 108, 255, 0.15)',
              },
            ]}
          />
          <Animated.View
            style={[
              styles.ring2,
              {
                borderColor: 'rgba(14, 108, 255, 0.1)',
              },
            ]}
          />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {item.description}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        {ONBOARDING_DATA.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              {
                backgroundColor:
                  index === currentIndex
                    ? '#0E6CFF'
                    : 'rgba(14, 108, 255, 0.2)',
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonsContainer}>
        {currentIndex === ONBOARDING_DATA.length - 1 ? (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#0E6CFF' }]}
            onPress={handleGetStarted}
          >
            <Text style={styles.buttonText}>Get Started</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color="#fff"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#0E6CFF' }]}
            onPress={scrollToNext}
          >
            <Text style={styles.buttonText}>
              {currentIndex === 1 ? 'Next Step' : 'Next'}
            </Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color="#fff"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={renderPage}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={32}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  page: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 20 },
  topSection: { paddingVertical: 16, alignItems: 'flex-end' },
  skipButton: { paddingVertical: 8, paddingHorizontal: 16 },
  skipText: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },

  contentContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  ring1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
  },
  ring2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
  },

  title: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
    marginHorizontal: 12,
  },

  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    transition: 'all 0.3s ease',
  },

  buttonsContainer: { paddingBottom: 32, justifyContent: 'flex-end' },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
