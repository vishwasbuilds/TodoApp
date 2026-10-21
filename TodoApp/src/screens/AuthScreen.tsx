// Renders the login or registration form; App owns its state and submission logic.
import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Field from '../components/Field';
import { colors, styles } from '../theme';

type AuthMode = 'login' | 'register';

type AuthScreenProps = {
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  authName: string;
  setAuthName: (value: string) => void;
  authEmail: string;
  setAuthEmail: (value: string) => void;
  authPassword: string;
  setAuthPassword: (value: string) => void;
  authBusy: boolean;
  onSubmit: () => void;
};

export default function AuthScreen({
  authMode,
  setAuthMode,
  authName,
  setAuthName,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authBusy,
  onSubmit,
}: AuthScreenProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.authWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.logo}>
          <Text style={styles.logoText}>✓</Text>
        </View>
        <Text style={styles.brand}>To-Do</Text>
        <Text style={styles.tagline}>A little progress, every day.</Text>
        <View style={styles.authCard}>
          <Text style={styles.heading}>
            {authMode === 'login' ? 'Welcome back' : 'Create account'}
          </Text>
          <Text style={styles.muted}>
            {authMode === 'login'
              ? 'Log in to pick up where you left off.'
              : 'Organize your day with a new account.'}
          </Text>
          {authMode === 'register' && (
            <Field
              label="YOUR NAME"
              value={authName}
              onChangeText={setAuthName}
              placeholder="Your name"
            />
          )}
          <Field
            label="EMAIL ADDRESS"
            value={authEmail}
            onChangeText={setAuthEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            label="PASSWORD"
            value={authPassword}
            onChangeText={setAuthPassword}
            placeholder="At least 6 characters"
            secureTextEntry
          />
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onSubmit}
            disabled={authBusy}
          >
            {authBusy ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.primaryText}>
                {authMode === 'login' ? 'Log in' : 'Create account'} →
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              setAuthMode(authMode === 'login' ? 'register' : 'login')
            }
            style={styles.switchAuth}
          >
            <Text style={styles.switchText}>
              {authMode === 'login'
                ? 'New here?  '
                : 'Already have an account?  '}
              <Text style={{ color: colors.purple, fontWeight: '800' }}>
                {authMode === 'login' ? 'Create account' : 'Log in'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.footer}>YOUR TIME. YOUR PRIORITIES.</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
