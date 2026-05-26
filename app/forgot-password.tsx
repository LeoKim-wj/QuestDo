import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { Fonts } from '../constants/theme';
import { getAuthErrorMessage, sendPasswordReset } from '../src/services/authService';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const activeFont = (Fonts as any)?.[Platform.OS]?.sans || 'normal';

  const handleReset = async () => {
    setEmailError('');
    setSuccessMessage('');

    if (!email.trim()) {
      setEmailError('*Email is required.*');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('*Please enter a valid email address.*');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordReset(email.trim());
      setSuccessMessage('Check your inbox for a password reset link.');
    } catch (error) {
      setEmailError(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
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
          <Text style={[styles.subtitleText, { fontFamily: activeFont }]}>Reset Password</Text>
          <Text style={[styles.instructionText, { fontFamily: activeFont }]}>
            Enter your email and we'll send you a link to reset your password.
          </Text>
        </View>

        <View style={styles.card}>
          {successMessage ? (
            <View style={styles.successContainer}>
              <Text style={[styles.successText, { fontFamily: activeFont }]}>{successMessage}</Text>
            </View>
          ) : (
            <>
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

              <TouchableOpacity
                style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
                onPress={handleReset}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <Text style={[styles.resetButtonText, { fontFamily: activeFont }]}>
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.backContainer}
          onPress={() => router.replace('/')}
          activeOpacity={0.7}
        >
          <Text style={[styles.backText, { fontFamily: activeFont }]}>
            Back to <Text style={styles.backHighlight}>Login</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { fontFamily: activeFont }]}>QuestDo | Terms | Privacy</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const BRAND_PURPLE = '#8b008b';

interface Styles {
  container: ViewStyle;
  scrollContainer: ViewStyle;
  headerContainer: ViewStyle;
  brandText: TextStyle;
  subtitleText: TextStyle;
  instructionText: TextStyle;
  card: ViewStyle;
  inputGroup: ViewStyle;
  label: TextStyle;
  input: TextStyle;
  inputInvalid: TextStyle;
  errorText: TextStyle;
  successContainer: ViewStyle;
  successText: TextStyle;
  resetButton: ViewStyle;
  resetButtonDisabled: ViewStyle;
  resetButtonText: TextStyle;
  backContainer: ViewStyle;
  backText: TextStyle;
  backHighlight: TextStyle;
  footer: ViewStyle;
  footerText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
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
  instructionText: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e1e4e6',
    width: Platform.OS === 'web' ? 420 : '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
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
  successContainer: {
    backgroundColor: '#f0faf0',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#b2dfb2',
  },
  successText: {
    color: '#2e7d32',
    fontSize: 14,
    lineHeight: 20,
  },
  resetButton: {
    backgroundColor: BRAND_PURPLE,
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  backContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  backText: {
    fontSize: 14,
    color: '#555',
  },
  backHighlight: {
    color: BRAND_PURPLE,
    fontWeight: '600',
  },
  footer: {
    marginTop: 60,
    alignItems: 'center',
    width: Platform.OS === 'web' ? 420 : '100%',
  },
  footerText: {
    fontSize: 12,
    color: '#888',
  },
});
