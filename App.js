import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as Keychain from 'react-native-keychain';
import { validateEmail } from './utils';
import { isBiometricSupported, authenticateWithBiometrics } from './biometricService';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    // Check if biometric authentication is supported
    isBiometricSupported().then((supported) => {
      setBiometricAvailable(supported);
      if (supported) {
        // Attempt biometric login on app start
        handleBiometricLogin();
      }
    });
  }, []);

  const handleBiometricLogin = async () => {
    try {
      const result = await authenticateWithBiometrics();
      if (result.success) {
        // Retrieve stored credentials
        const credentials = await Keychain.getGenericPassword();
        if (credentials) {
          Alert.alert('Success', `Logged in with biometrics as ${credentials.username}`);
          console.log('Sending to backend:', JSON.stringify({ email: credentials.username }));
        } else {
          Alert.alert('Info', 'No credentials stored. Please log in manually first.');
        }
      } else {
        Alert.alert('Error', 'Biometric authentication failed.');
      }
    } catch (error) {
      Alert.alert('Error', 'Biometric login error: ' + error.message);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    try {
      // Store credentials securely
      await Keychain.setGenericPassword(email, password);
      Alert.alert('Success', `Logged in as ${email}`);
      console.log('Sending to backend:', JSON.stringify({ email, password }));
      // Prompt for biometric enrollment
      if (biometricAvailable) {
        Alert.alert('Enable Biometrics', 'Would you like to enable biometric login?', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: async () => {
              const result = await authenticateWithBiometrics();
              if (result.success) {
                Alert.alert('Success', 'Biometric login enabled!');
              }
            },
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Login error: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MyApp</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={styles.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
      
      {biometricAvailable && (
        <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricLogin}>
          <Text style={styles.biometricButtonText}>Login with Biometrics</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity style={styles.link}>
        <Text style={styles.linkText}>Forgot Password?</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.link}>
        <Text style={styles.linkText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 60,
  },
  toggleButton: {
    position: 'absolute',
    right: 10,
    top: 15,
  },
  toggleText: {
    color: '#007AFF',
    fontSize: 16,
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  biometricButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#28a745',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  biometricButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  link: {
    marginTop: 10,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
