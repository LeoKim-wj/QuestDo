import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Fonts } from '../constants/theme';
import { useAuth } from '../src/context/AuthContext';

function getSignUpError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account already exists with this email.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'Could not create account. Please try again.';
  }
}

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const activeFont = (Fonts as any)?.[Platform.OS]?.sans || 'normal';

  const handleSignUp = async () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setAuthError('');

    if (!email.trim()) {
      setEmailError('*Email is required.*');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('*Please enter a valid email address.*');
      isValid = false;
    }

    if (!password) {
      setPasswordError('*Password is required.*');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('*Password should be at least 6 characters.*');
      isValid = false;
    }

    if (!isValid) return;

    setLoading(true);
    try {
      await signUp(email.trim(), password);
      router.replace('/(tabs)');
    } catch (error: any) {
      setAuthError(getSignUpError(error?.code ?? ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={[styles.brandText, { fontFamily: activeFont }]}>QuestDo</Text>
          <Text style={[styles.subtitleText, { fontFamily: activeFont }]}>Sign Up</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { fontFamily: activeFont }]}>Email</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputInvalid : null]}
              placeholder="youremail@example.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {emailError ? <Text style={[styles.errorText, { fontFamily: activeFont }]}>{emailError}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { fontFamily: activeFont }]}>Password</Text>
            <TextInput
              style={[styles.input, passwordError ? styles.inputInvalid : null]}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError('');
              }}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            {passwordError ? <Text style={[styles.errorText, { fontFamily: activeFont }]}>{passwordError}</Text> : null}
          </View>

          {authError ? (
            <Text style={[styles.authErrorText, { fontFamily: activeFont }]}>{authError}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
            onPress={handleSignUp}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.primaryButtonText, { fontFamily: activeFont }]}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.secondaryLinkContainer}
          activeOpacity={0.7}
          onPress={() => router.replace('/')}
        >
          <Text style={[styles.secondaryLinkText, { fontFamily: activeFont }]}>
            Already have an account? <Text style={styles.secondaryLinkHighlight}>Login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const BRAND_PURPLE = '#8b008b';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
  },
  headerContainer: {
    alignSelf: 'flex-start',
    width: Platform.OS === 'web' ? 420 : '100%',
    marginBottom: 32,
  },
  brandText: {
    fontSize: 24,
    fontWeight: '800',
    color: BRAND_PURPLE,
  },
  subtitleText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#11181C',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e1e4e6',
    width: Platform.OS === 'web' ? 420 : '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#11181C',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e1e4e6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'web' ? 12 : 14,
    fontSize: 15,
    color: '#11181C',
  },
  inputInvalid: {
    borderColor: '#cc0000',
    backgroundColor: '#fff8f8',
  },
  errorText: {
    color: '#cc0000',
    fontSize: 13,
    marginTop: 6,
  },
  authErrorText: {
    color: '#cc0000',
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: BRAND_PURPLE,
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryLinkContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  secondaryLinkText: {
    fontSize: 14,
    color: '#555',
  },
  secondaryLinkHighlight: {
    color: BRAND_PURPLE,
    fontWeight: '600',
  },
});
