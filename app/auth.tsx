import { Stack, useRouter } from 'expo-router';
import { LogIn, Mail, Chrome, Facebook as FacebookIcon, Camera, Check } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PulseColors } from '@/constants/colors';
import { authService } from '@/services/api/auth';
import { useUser } from '@/contexts/UserContext';

type AuthMode = 'signin' | 'signup';

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/avataaars/png?seed=Felix&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Aneka&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Luna&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Max&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Oliver&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Sophia&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Jack&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Emma&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Charlie&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Mia&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Leo&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Zoe&backgroundColor=ffd5dc',
];

export default function AuthScreen() {
  const router = useRouter();
  const { refreshUser } = useUser();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>(AVATAR_PRESETS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async () => {
    setError(null);
    
    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (mode === 'signup' && (!username || !displayName)) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    console.log('[AuthScreen] Attempting', mode);

    try {
      if (mode === 'signin') {
        await authService.signIn(email, password);
        console.log('[AuthScreen] Sign in successful');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        await refreshUser();
        
        console.log('[AuthScreen] Redirecting to tabs');
        router.replace('/(tabs)');
      } else {
        const profileData = {
          username,
          display_name: displayName,
          avatar_url: avatarUri || selectedPreset,
        };
        await authService.signUp(email, password, profileData);
        console.log('[AuthScreen] Sign up successful');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        await refreshUser();
        
        Alert.alert(
          'Success!',
          'Account created successfully!',
          [{ 
            text: 'OK', 
            onPress: () => {
              console.log('[AuthScreen] Redirecting to tabs after signup');
              router.replace('/(tabs)');
            }
          }]
        );
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Authentication failed. Please try again.';
      console.error('[AuthScreen] Auth error:', errorMessage, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    console.log('[AuthScreen] Google sign in');

    try {
      await authService.signInWithGoogle();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshUser();
      
      console.log('[AuthScreen] Redirecting to tabs after Google sign in');
      router.replace('/(tabs)');
    } catch (err: any) {
      const errorMessage = err?.message || 'Google sign in failed. Please try again.';
      console.error('[AuthScreen] Google auth error:', errorMessage, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setError(null);
    setLoading(true);
    console.log('[AuthScreen] Facebook sign in');

    try {
      await authService.signInWithFacebook();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshUser();
      
      console.log('[AuthScreen] Redirecting to tabs after Facebook sign in');
      router.replace('/(tabs)');
    } catch (err: any) {
      const errorMessage = err?.message || 'Facebook sign in failed. Please try again.';
      console.error('[AuthScreen] Facebook auth error:', errorMessage, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError(null);
    setAvatarUri(null);
    setSelectedPreset(AVATAR_PRESETS[0]);
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'] as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
        console.log('[AuthScreen] Image selected:', result.assets[0].uri);
      }
    } catch (err) {
      console.error('[AuthScreen] Image picker error:', err);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your camera to take a profile picture.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
        console.log('[AuthScreen] Photo taken:', result.assets[0].uri);
      }
    } catch (err) {
      console.error('[AuthScreen] Camera error:', err);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Profile Photo',
      'Choose how to set your profile photo',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={[PulseColors.dark.background, PulseColors.dark.surface]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <LogIn size={48} color={PulseColors.dark.accent} />
              <Text style={styles.title}>
                {mode === 'signin' ? 'Welcome Back' : 'Join Pulse'}
              </Text>
              <Text style={styles.subtitle}>
                {mode === 'signin' 
                  ? 'Sign in to continue to Pulse' 
                  : 'Create your account to get started'}
              </Text>
            </View>

            <View style={styles.form}>
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {mode === 'signup' && (
                <>
                  <View style={styles.avatarSection}>
                    <Text style={styles.label}>Profile Photo</Text>
                    <View style={styles.avatarContainer}>
                      <View style={styles.selectedAvatarWrapper}>
                        <Image 
                          source={{ uri: avatarUri || selectedPreset }} 
                          style={styles.selectedAvatar}
                          contentFit="cover"
                        />
                        <TouchableOpacity 
                          style={styles.cameraButton}
                          onPress={showImageOptions}
                          disabled={loading}
                        >
                          <Camera size={18} color={PulseColors.dark.background} />
                        </TouchableOpacity>
                      </View>
                      
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        style={styles.presetsScroll}
                        contentContainerStyle={styles.presetsContainer}
                      >
                        {AVATAR_PRESETS.map((preset, index) => (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.presetAvatar,
                              !avatarUri && selectedPreset === preset && styles.presetAvatarSelected,
                            ]}
                            onPress={() => {
                              setSelectedPreset(preset);
                              setAvatarUri(null);
                            }}
                            disabled={loading}
                          >
                            <Image 
                              source={{ uri: preset }} 
                              style={styles.presetAvatarImage}
                              contentFit="cover"
                            />
                            {!avatarUri && selectedPreset === preset && (
                              <View style={styles.checkmark}>
                                <Check size={12} color={PulseColors.dark.background} strokeWidth={3} />
                              </View>
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                      style={styles.input}
                      value={username}
                      onChangeText={setUsername}
                      placeholder="Choose a username"
                      placeholderTextColor={PulseColors.dark.textTertiary}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Display Name</Text>
                    <TextInput
                      style={styles.input}
                      value={displayName}
                      onChangeText={setDisplayName}
                      placeholder="Your display name"
                      placeholderTextColor={PulseColors.dark.textTertiary}
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>
                </>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor={PulseColors.dark.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={PulseColors.dark.textTertiary}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleEmailAuth}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={PulseColors.dark.text} />
                ) : (
                  <>
                    <Mail size={20} color={PulseColors.dark.text} />
                    <Text style={styles.primaryButtonText}>
                      {mode === 'signin' ? 'Sign In with Email' : 'Sign Up with Email'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialButtons}>
                <TouchableOpacity
                  style={[styles.socialButton, loading && styles.buttonDisabled]}
                  onPress={handleGoogleSignIn}
                  disabled={loading}
                >
                  <Chrome size={24} color={PulseColors.dark.text} />
                  <Text style={styles.socialButtonText}>Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.socialButton, loading && styles.buttonDisabled]}
                  onPress={handleFacebookSignIn}
                  disabled={loading}
                >
                  <FacebookIcon size={24} color={PulseColors.dark.text} />
                  <Text style={styles.socialButtonText}>Facebook</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.toggleButton}
                onPress={toggleMode}
                disabled={loading}
              >
                <Text style={styles.toggleText}>
                  {mode === 'signin' 
                    ? "Don't have an account? " 
                    : 'Already have an account? '}
                  <Text style={styles.toggleTextBold}>
                    {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: PulseColors.dark.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: PulseColors.dark.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: '#ff3b30',
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
  },
  input: {
    backgroundColor: PulseColors.dark.surface,
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: PulseColors.dark.text,
  },
  primaryButton: {
    backgroundColor: PulseColors.dark.accent,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  primaryButtonText: {
    color: PulseColors.dark.text,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: PulseColors.dark.border,
  },
  dividerText: {
    fontSize: 14,
    color: PulseColors.dark.textTertiary,
    fontWeight: '600' as const,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    backgroundColor: PulseColors.dark.surface,
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  socialButtonText: {
    color: PulseColors.dark.text,
    fontSize: 15,
    fontWeight: '600' as const,
  },
  toggleButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 15,
    color: PulseColors.dark.textSecondary,
  },
  toggleTextBold: {
    fontWeight: '700' as const,
    color: PulseColors.dark.accent,
  },
  avatarSection: {
    gap: 12,
  },
  avatarContainer: {
    gap: 16,
  },
  selectedAvatarWrapper: {
    alignSelf: 'center',
    position: 'relative' as const,
  },
  selectedAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: PulseColors.dark.accent,
    backgroundColor: PulseColors.dark.surface,
  },
  cameraButton: {
    position: 'absolute' as const,
    bottom: 0,
    right: 0,
    backgroundColor: PulseColors.dark.accent,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: PulseColors.dark.background,
  },
  presetsScroll: {
    flexGrow: 0,
  },
  presetsContainer: {
    gap: 12,
    paddingHorizontal: 4,
  },
  presetAvatar: {
    position: 'relative' as const,
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
    borderRadius: 30,
    overflow: 'hidden',
  },
  presetAvatarSelected: {
    borderColor: PulseColors.dark.accent,
    borderWidth: 3,
  },
  presetAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  checkmark: {
    position: 'absolute' as const,
    top: 2,
    right: 2,
    backgroundColor: PulseColors.dark.accent,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
