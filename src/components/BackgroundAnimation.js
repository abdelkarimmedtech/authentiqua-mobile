import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

const BackgroundAnimation = ({ children }) => {
  const animationRef = useRef(null);
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    // Animation will loop automatically with autoPlay and loop
  }, []);

  return (
    <View style={styles.container}>
      {/* Background Animation - fills entire screen */}
      <View style={[styles.animationWrapper, { width, height }]}>
        <LottieView
          ref={animationRef}
          source={require('../assets/animation/background.json')}
          autoPlay
          loop
          resizeMode="cover"
          style={styles.animation}
        />
      </View>

      {/* Content overlay on top */}
      <View style={styles.contentContainer}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  animationWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
  animation: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 10,
  },
});

export default BackgroundAnimation;
