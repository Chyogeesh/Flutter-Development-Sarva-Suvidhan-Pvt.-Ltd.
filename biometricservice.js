import { Alert, Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

export const isBiometricSupported = async () => {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) return false;
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return enrolled;
  } catch (error) {
    console.error('Biometric support check failed:', error);
    return false;
  }
};

export const authenticateWithBiometrics = async () => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate with biometrics',
      fallbackLabel: 'Use Password',
      disableDeviceFallback: false,
    });
    return result;
  } catch (error) {
    throw new Error('Biometric authentication failed: ' + error.message);
  }
};
