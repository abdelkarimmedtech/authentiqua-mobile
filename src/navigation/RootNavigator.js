import React, { useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { AuthContext } from '../context/AuthContext';
import colors from '../constants/colors';
import SplashScreen from '../screens/SplashScreen';

export default function RootNavigator() {
  const { userToken, loading } = useContext(AuthContext);
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

  return userToken ? <MainNavigator /> : <AuthNavigator />;
}
