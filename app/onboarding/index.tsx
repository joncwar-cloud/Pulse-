import { useRouter } from 'expo-router';
import { Activity, LogIn } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PulseColors } from '@/constants/colors';
import { useUser } from '@/contexts/UserContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, hasOnboarded } = useUser();

  useEffect(() => {
    console.log('[WelcomeScreen] Auth state - user:', !!user, 'hasOnboarded:', hasOnboarded);
    
    if (!user) {
      console.log('[WelcomeScreen] No user, showing welcome screen');
      return;
    }
    
    if (hasOnboarded === undefined) {
      console.log('[WelcomeScreen] Onboarding status loading...');
      return;
    }
    
    if (hasOnboarded === true) {
      console.log('[WelcomeScreen] User onboarded, redirecting to tabs');
      router.replace('/(tabs)');
    } else if (hasOnboarded === false) {
      console.log('[WelcomeScreen] User not onboarded, redirecting to profile setup');
      router.replace('/onboarding/profile-setup');
    }
  }, [user, hasOnboarded, router]);

  const handleGetStarted = () => {
    console.log('[WelcomeScreen] Redirecting to auth screen (signup)');
    router.push('/auth?mode=signup');
  };

  const handleSignIn = () => {
    console.log('[WelcomeScreen] Redirecting to auth screen (signin)');
    router.push('/auth?mode=signin');
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

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
          >
            <Text style={styles.getStartedText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleSignIn}
          >
            <LogIn size={20} color={PulseColors.dark.text} />
            <Text style={styles.signInText}>Sign In</Text>
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
  actionContainer: {
    gap: 16,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 16,
    backgroundColor: PulseColors.dark.accent,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '900' as const,
    color: '#FFFFFF',
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
    gap: 8,
  },
  signInText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  disclaimer: {
    fontSize: 13,
    color: PulseColors.dark.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
