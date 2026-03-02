import React, { useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import { AuthContext } from '../context/AuthContext';
import colors from '../constants/colors';
import SplashScreen from '../screens/SplashScreen';
import { isOnboardingComplete } from '../utils/user';

export default function RootNavigator() {
  const { userToken, loading, user } = useContext(AuthContext);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1300);
    return () => clearTimeout(t);
  }, []);

  if (showSplash) return <SplashScreen />;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.darkBg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!userToken) return <AuthNavigator />;
  if (!isOnboardingComplete(user)) return <OnboardingNavigator />;
  return <MainNavigator />;
}
