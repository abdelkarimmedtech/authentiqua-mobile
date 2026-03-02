import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoleSelectionScreen from '../screens/onboarding/RoleSelectionScreen';
import NormalUserDetailsScreen from '../screens/onboarding/NormalUserDetailsScreen';
import StaffDetailsScreen from '../screens/onboarding/StaffDetailsScreen';

const Stack = createNativeStackNavigator();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="NormalUserDetails" component={NormalUserDetailsScreen} />
      <Stack.Screen name="StaffDetails" component={StaffDetailsScreen} />
    </Stack.Navigator>
  );
}

