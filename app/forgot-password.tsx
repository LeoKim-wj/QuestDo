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

function getResetError(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
      return 'No account was found for this email.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'Could not send reset email. Please try again.';
  }
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [message, setMessage] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const activeFont = (Fonts as any)?.[Platform.OS]?.sans || 'normal';

  const handleResetPassword = async () => {
    setEmailError('');
    setAuthError('');
    setMessage('');

    if (!email.trim()) {
      setEmailError('*Email is required.*');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('*Please enter a valid email address.*');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (error: any) {
      setAuthError(getResetError(error?.code ?? ''));
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
          <Text style={[styles.subtitleText, { fontFamily: activeFont }]}>Forgot Password</Text>
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
                if (message) setMessage('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {emailError ? <Text style={[styles.errorText, { fontFamily: activeFont }]}>{emailError}</Text> : null}
          </View>

          {authError ? (
            <Text style={[styles.authErrorText, { fontFamily: activeFont }]}>{authError}</Text>
          ) : null}

          {message ? (
            <Text style={[styles.successText, { fontFamily: activeFont }]}>{message}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
            onPress={handleResetPassword}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.primaryButtonText, { fontFamily: activeFont }]}>Send Reset Email</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.secondaryLinkContainer}
          activeOpacity={0.7}
          onPress={() => router.replace('/')}
        >
          <Text style={[styles.secondaryLinkText, { fontFamily: activeFont }]}>
            Back to <Text style={styles.secondaryLinkHighlight}>Login</Text>
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
  successText: {
    color: '#166534',
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
