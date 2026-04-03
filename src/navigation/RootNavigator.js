import React, { useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { getThemeColors } from '../utils/themeColors';
import SplashScreen from '../screens/SplashScreen';
import { isOnboardingComplete } from '../utils/user';

export default function RootNavigator() {
  const { userToken, loading, user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1300);
    return () => clearTimeout(t);
  }, []);

  if (showSplash) return <SplashScreen />;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0E6CFF" />
      </View>
    );
  }

  if (!userToken) return <AuthNavigator />;
  if (!isOnboardingComplete(user)) return <OnboardingNavigator />;
  return <MainNavigator />;
}
