import React, { useContext, useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/main/HomeScreen';
import ScanScreen from '../screens/main/ScanScreen';
import ResultScreen from '../screens/main/ResultScreen';
import CameraScreen from '../screens/main/CameraScreen';
import AllActivityScreen from '../screens/main/AllActivityScreen';
import DocumentsScreen from '../screens/main/DocumentsScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import HelpScreen from '../screens/main/HelpScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import AccountInfoScreen from '../screens/main/AccountInfoScreen';
import SecurityScreen from '../screens/main/SecurityScreen';
import ChangePasswordScreen from '../screens/main/ChangePasswordScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import AppearanceScreen from '../screens/main/AppearanceScreen';
import PrivacyPolicyScreen from '../screens/main/PrivacyPolicyScreen';
import VerificationResultsScreen from '../screens/main/VerificationResultsScreen';
import DownloadCertificateScreen from '../screens/main/DownloadCertificateScreen';
import ShareVerificationScreen from '../screens/main/ShareVerificationScreen';
import UniversityDashboardScreen from '../screens/main/UniversityDashboardScreen';
import DocumentDetailScreen from '../screens/main/DocumentDetailScreen';
import UniversityReferenceUploadScreen from '../screens/main/UniversityReferenceUploadScreen';
import VerifyIdentityScreen from '../screens/auth/VerifyIdentityScreen';
import { AuthContext } from '../context/AuthContext';
import { getUserRole } from '../utils/user';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  const { user } = useContext(AuthContext);
  const role = useMemo(() => getUserRole(user), [user]);
  const initialRouteName = role === 'USER' ? 'Home' : 'UniversityDashboard';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Scan" component={ScanScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="VerifyIdentity" component={VerifyIdentityScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen name="AllActivity" component={AllActivityScreen} />
      <Stack.Screen name="Documents" component={DocumentsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AccountInfo" component={AccountInfoScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Appearance" component={AppearanceScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="VerificationResults" component={VerificationResultsScreen} />
      <Stack.Screen name="DownloadCertificate" component={DownloadCertificateScreen} />
      <Stack.Screen name="ShareVerification" component={ShareVerificationScreen} />
      <Stack.Screen name="UniversityDashboard" component={UniversityDashboardScreen} />
      <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} />
      <Stack.Screen name="UniversityReferenceUpload" component={UniversityReferenceUploadScreen} />
    </Stack.Navigator>
  );
}
