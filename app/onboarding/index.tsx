import { useRouter } from 'expo-router';
import { Activity, Apple, Chrome } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PulseColors } from '@/constants/colors';
import { useUser } from '@/contexts/UserContext';
import { AuthProvider } from '@/types';

export default function WelcomeScreen() {
  const router = useRouter();
  const { signIn } = useUser();
  const [isLoading, setIsLoading] = useState<AuthProvider | null>(null);

  const handleAuth = async (provider: AuthProvider) => {
    setIsLoading(provider);
    await new Promise(resolve => setTimeout(resolve, 800));
    signIn(provider);
    setIsLoading(null);
    router.push('/onboarding/profile-setup');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[PulseColors.dark.background, '#1a0a15', PulseColors.dark.background]}
        style={styles.gradient}
      />

      <View style={styles.content}>
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Activity size={64} color={PulseColors.dark.accent} />
          </View>
          <Text style={styles.title}>Pulse</Text>
          <Text style={styles.subtitle}>
            The all-in-one social platform{'\n'}for everything you need
          </Text>
        </View>

        <View style={styles.authButtons}>
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[styles.authButton, styles.appleButton]}
              onPress={() => handleAuth('apple')}
              disabled={isLoading !== null}
            >
              <Apple size={24} color="#FFFFFF" />
              <Text style={styles.authButtonText}>
                {isLoading === 'apple' ? 'Signing in...' : 'Continue with Apple'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.authButton, styles.googleButton]}
            onPress={() => handleAuth('google')}
            disabled={isLoading !== null}
          >
            <Chrome size={24} color="#FFFFFF" />
            <Text style={styles.authButtonText}>
              {isLoading === 'google' ? 'Signing in...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.authButton, styles.facebookButton]}
            onPress={() => handleAuth('facebook')}
            disabled={isLoading !== null}
          >
            <View style={styles.facebookIcon}>
              <Text style={styles.facebookIconText}>f</Text>
            </View>
            <Text style={styles.authButtonText}>
              {isLoading === 'facebook' ? 'Signing in...' : 'Continue with Facebook'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          By continuing, you agree to our Terms of Service{'\n'}and Privacy Policy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PulseColors.dark.background,
  },
  gradient: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: 120,
    paddingBottom: 60,
  },
  logoSection: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 0, 87, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: PulseColors.dark.accent,
  },
  title: {
    fontSize: 56,
    fontWeight: '900' as const,
    color: PulseColors.dark.text,
    letterSpacing: 2,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: PulseColors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  authButtons: {
    gap: 16,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  authButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  facebookIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  facebookIconText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1877F2',
  },
  disclaimer: {
    fontSize: 13,
    color: PulseColors.dark.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
