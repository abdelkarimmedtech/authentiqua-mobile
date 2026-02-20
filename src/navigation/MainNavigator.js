import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/main/HomeScreen';
import ScanScreen from '../screens/main/ScanScreen';
import ResultScreen from '../screens/main/ResultScreen';
import CameraScreen from '../screens/main/CameraScreen';
import AllActivityScreen from '../screens/main/AllActivityScreen';
import DocumentsScreen from '../screens/main/DocumentsScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import HelpScreen from '../screens/main/HelpScreen';
import VerifyIdentityScreen from '../screens/auth/VerifyIdentityScreen';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Scan" component={ScanScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="VerifyIdentity" component={VerifyIdentityScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen name="AllActivity" component={AllActivityScreen} />
      <Stack.Screen name="Documents" component={DocumentsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
    </Stack.Navigator>
  );
}
