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

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Extract font family cleanly depending on what token matches the running environment
  const activeFont = (Fonts as any)?.[Platform.OS]?.sans || 'normal';

  const handleLogin = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

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
    }

    if (isValid) {
      console.log('Logging in with:', email, password);
      router.replace('/(tabs)');
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
          <Text style={[styles.subtitleText, { fontFamily: activeFont }]}>Login</Text>
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
              placeholder="••••"
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

          <TouchableOpacity style={styles.forgotContainer} activeOpacity={0.7}>
            <Text style={[styles.forgotText, { fontFamily: activeFont }]}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8}>
            <Text style={[styles.loginButtonText, { fontFamily: activeFont }]}>Login</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signUpContainer} activeOpacity={0.7}>
          <Text style={[styles.signUpText, { fontFamily: activeFont }]}>
            Don't have an account? <Text style={styles.signUpHighlight}>Sign Up</Text>
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
  forgotContainer: ViewStyle;
  forgotText: TextStyle;
  loginButton: ViewStyle;
  loginButtonText: TextStyle;
  signUpContainer: ViewStyle;
  signUpText: TextStyle;
  signUpHighlight: TextStyle;
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
  forgotContainer: {
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  forgotText: {
    color: BRAND_PURPLE,
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: BRAND_PURPLE,
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  signUpContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    color: '#555',
  },
  signUpHighlight: {
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