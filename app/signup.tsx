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
import { getAuthErrorMessage, signUp } from '../src/services/authService';

export default function SignUpScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const activeFont = (Fonts as any)?.[Platform.OS]?.sans || 'normal';

  const handleSignUp = async () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

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
      setPasswordError('*Password must be at least 6 characters.*');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('*Please confirm your password.*');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('*Passwords do not match.*');
      isValid = false;
    }

    if (!isValid) return;

    setIsLoading(true);
    try {
      await signUp(email.trim(), password);
      router.replace('/(tabs)');
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
          <Text style={[styles.subtitleText, { fontFamily: activeFont }]}>Create Account</Text>
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
              placeholder="Min. 6 characters"
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

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { fontFamily: activeFont }]}>Confirm Password</Text>
            <TextInput
              style={[styles.input, confirmPasswordError ? styles.inputInvalid : null]}
              placeholder="Re-enter your password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (confirmPasswordError) setConfirmPasswordError('');
              }}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            {confirmPasswordError ? <Text style={[styles.errorText, { fontFamily: activeFont }]}>{confirmPasswordError}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]}
            onPress={handleSignUp}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <Text style={[styles.signUpButtonText, { fontFamily: activeFont }]}>
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.loginContainer}
          onPress={() => router.replace('/')}
          activeOpacity={0.7}
        >
          <Text style={[styles.loginText, { fontFamily: activeFont }]}>
            Already have an account? <Text style={styles.loginHighlight}>Login</Text>
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
  card: ViewStyle;
  inputGroup: ViewStyle;
  label: TextStyle;
  input: TextStyle;
  inputInvalid: TextStyle;
  errorText: TextStyle;
  signUpButton: ViewStyle;
  signUpButtonDisabled: ViewStyle;
  signUpButtonText: TextStyle;
  loginContainer: ViewStyle;
  loginText: TextStyle;
  loginHighlight: TextStyle;
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
  signUpButton: {
    backgroundColor: BRAND_PURPLE,
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  signUpButtonDisabled: {
    opacity: 0.6,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  loginContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#555',
  },
  loginHighlight: {
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
