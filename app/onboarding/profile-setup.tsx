import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronRight, Camera, User, Check, CheckCircle, AlertCircle } from 'lucide-react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { PulseColors } from '@/constants/colors';
import { useUser } from '@/contexts/UserContext';
import { authService } from '@/services/api/auth';
import { supabase } from '@/services/supabase';

const AVATAR_PRESETS = [
  'https://i.pravatar.cc/150?img=1',
  'https://i.pravatar.cc/150?img=2',
  'https://i.pravatar.cc/150?img=3',
  'https://i.pravatar.cc/150?img=4',
  'https://i.pravatar.cc/150?img=5',
  'https://i.pravatar.cc/150?img=6',
  'https://i.pravatar.cc/150?img=7',
  'https://i.pravatar.cc/150?img=8',
  'https://i.pravatar.cc/150?img=9',
  'https://i.pravatar.cc/150?img=10',
  'https://i.pravatar.cc/150?img=11',
  'https://i.pravatar.cc/150?img=12',
];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { supabaseUser } = useUser();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATAR_PRESETS[0]);
  const [usernameError, setUsernameError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const checkUsernameAvailability = useCallback(async (username: string) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      if (error) throw error;

      if (data && data.id !== supabaseUser?.id) {
        setUsernameAvailable(false);
        setUsernameError('This username is already taken');
      } else {
        setUsernameAvailable(true);
        setUsernameError('');
      }
    } catch (err) {
      console.error('[ProfileSetup] Username check error:', err);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  }, [supabaseUser?.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (username.length >= 3) {
        checkUsernameAvailability(username);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, checkUsernameAvailability]);

  const validateUsername = (text: string) => {
    const sanitized = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(sanitized);
    setUsernameAvailable(null);
    
    if (sanitized.length < 3 && sanitized.length > 0) {
      setUsernameError('Username must be at least 3 characters');
    } else if (sanitized.length > 20) {
      setUsernameError('Username must be 20 characters or less');
    } else {
      setUsernameError('');
    }
  };

  const handleContinue = async () => {
    if (!username || username.length < 3) {
      Alert.alert('Username Required', 'Please enter a username with at least 3 characters');
      return;
    }

    if (!displayName.trim()) {
      Alert.alert('Display Name Required', 'Please enter your display name');
      return;
    }

    if (!supabaseUser?.id) {
      Alert.alert('Error', 'No user session found. Please sign in again.');
      return;
    }

    setLoading(true);
    console.log('[ProfileSetup] Creating profile for user:', supabaseUser.id);

    try {
      const finalAvatar = avatarUri || selectedAvatar;
      
      if (usernameAvailable === false) {
        Alert.alert('Username Taken', 'This username is already taken. Please choose another.');
        setLoading(false);
        return;
      }
      
      const existingProfile = await authService.getUserProfile(supabaseUser.id);
      
      if (existingProfile) {
        console.log('[ProfileSetup] Profile exists, updating');
        await authService.updateUserProfile(supabaseUser.id, {
          username,
          display_name: displayName,
          avatar: finalAvatar,
        });
      } else {
        console.log('[ProfileSetup] Creating new profile');
        const insertResult = await supabase
          .from('users')
          .insert([{
            id: supabaseUser.id,
            email: supabaseUser.email,
            username,
            display_name: displayName,
            avatar: finalAvatar,
            created_at: new Date().toISOString(),
          }])
          .select()
          .single();
        
        if (insertResult.error) {
          console.error('[ProfileSetup] Insert error:', insertResult.error);
          throw insertResult.error;
        }
        
        console.log('[ProfileSetup] Profile created:', insertResult.data);
      }

      console.log('[ProfileSetup] Profile saved, moving to interests');
      router.push({
        pathname: '/onboarding/interests',
        params: { 
          ...params,
          username,
          displayName,
          avatar: finalAvatar,
        },
      });
    } catch (error: any) {
      console.error('[ProfileSetup] Error saving profile:', error);
      console.error('[ProfileSetup] Error details:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Failed to save profile. Please try again.';
      
      if (error?.code === '42501') {
        errorMessage = 'Permission denied. Please contact support or try signing in again.';
      } else if (error?.code === '23505') {
        errorMessage = 'This username is already taken. Please choose another.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
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
      }
    } catch (err) {
      console.error('[ProfileSetup] Image picker error:', err);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your camera.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error('[ProfileSetup] Camera error:', err);
      Alert.alert('Error', 'Failed to take photo.');
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

  const isValid = username.length >= 3 && displayName.trim().length > 0 && !usernameError && usernameAvailable === true;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create your profile</Text>
            <Text style={styles.subtitle}>
              Choose your username and photo
            </Text>
          </View>

          <View style={styles.avatarSection}>
            <View style={styles.selectedAvatarContainer}>
              <Image 
                source={{ uri: avatarUri || selectedAvatar }} 
                style={styles.selectedAvatar}
                contentFit="cover"
              />
              <TouchableOpacity 
                style={styles.cameraButton}
                onPress={showImageOptions}
                disabled={loading}
              >
                <Camera size={20} color={PulseColors.dark.background} />
              </TouchableOpacity>
            </View>
            <Text style={styles.avatarLabel}>Select a photo or upload your own</Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.avatarGrid}
            >
              {AVATAR_PRESETS.map((avatar, index) => (
                <TouchableOpacity
                  key={index}
style={[
                    styles.avatarPreset,
                    !avatarUri && selectedAvatar === avatar && styles.avatarPresetSelected,
                  ]}
                  onPress={() => {
                    setSelectedAvatar(avatar);
                    setAvatarUri(null);
                  }}
                  disabled={loading}
                >
                  <Image 
                    source={{ uri: avatar }} 
                    style={styles.avatarPresetImage}
                    contentFit="cover"
                  />
{!avatarUri && selectedAvatar === avatar && (
                    <View style={styles.avatarCheckmark}>
                      <Check size={16} color={PulseColors.dark.background} strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <View style={[styles.inputContainer, usernameAvailable === false && styles.inputContainerError, usernameAvailable === true && styles.inputContainerSuccess]}>
                <Text style={styles.inputPrefix}>@</Text>
                <TextInput
                  style={styles.input}
                  placeholder="yourname"
                  placeholderTextColor={PulseColors.dark.textTertiary}
                  value={username}
                  onChangeText={validateUsername}
autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={20}
                  editable={!loading}
                />
                {checkingUsername && <ActivityIndicator size="small" color={PulseColors.dark.accent} />}
                {!checkingUsername && usernameAvailable === true && username.length >= 3 && (
                  <CheckCircle size={20} color="#10B981" />
                )}
                {!checkingUsername && usernameAvailable === false && (
                  <AlertCircle size={20} color={PulseColors.dark.accent} />
                )}
              </View>
              {usernameError ? (
                <Text style={styles.errorText}>{usernameError}</Text>
              ) : usernameAvailable === true && username.length >= 3 ? (
                <Text style={styles.successText}>Username is available!</Text>
              ) : (
                <Text style={styles.helperText}>Letters, numbers, and underscores only</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Display Name</Text>
              <View style={styles.inputContainer}>
                <User size={20} color={PulseColors.dark.textSecondary} />
                <TextInput
                  style={[styles.input, { paddingLeft: 12 }]}
                  placeholder="Your Name"
                  placeholderTextColor={PulseColors.dark.textTertiary}
                  value={displayName}
onChangeText={setDisplayName}
                  maxLength={30}
                  editable={!loading}
                />
              </View>
              <Text style={styles.helperText}>This is how you&apos;ll appear on Pulse</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.progressText}>Step 1 of 3</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.continueButton,
              !isValid && styles.continueButtonDisabled,
            ]}
onPress={handleContinue}
            disabled={!isValid || loading}
>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.continueButtonText}>Continue</Text>
                <ChevronRight size={24} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PulseColors.dark.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '900' as const,
    color: PulseColors.dark.text,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: PulseColors.dark.textSecondary,
    lineHeight: 22,
  },
  avatarSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
    alignItems: 'center',
  },
  selectedAvatarContainer: {
    position: 'relative' as const,
    marginBottom: 16,
  },
  selectedAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: PulseColors.dark.accent,
  },
  cameraButton: {
    position: 'absolute' as const,
    bottom: 0,
    right: 0,
    backgroundColor: PulseColors.dark.accent,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: PulseColors.dark.background,
  },
  avatarLabel: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
    marginBottom: 16,
  },
  avatarGrid: {
    gap: 12,
    paddingVertical: 8,
  },
  avatarPreset: {
    position: 'relative' as const,
    borderWidth: 3,
    borderColor: PulseColors.dark.border,
    borderRadius: 36,
    overflow: 'hidden',
  },
  avatarPresetSelected: {
    borderColor: PulseColors.dark.accent,
  },
  avatarPresetImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarCheckmark: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    backgroundColor: PulseColors.dark.accent,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSection: {
    paddingHorizontal: 24,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputPrefix: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: PulseColors.dark.accent,
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: PulseColors.dark.text,
    paddingVertical: 14,
  },
  helperText: {
    fontSize: 13,
    color: PulseColors.dark.textSecondary,
  },
  errorText: {
    fontSize: 13,
    color: PulseColors.dark.accent,
    fontWeight: '600' as const,
  },
  successText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600' as const,
  },
  inputContainerError: {
    borderColor: PulseColors.dark.accent,
  },
  inputContainerSuccess: {
    borderColor: '#10B981',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: PulseColors.dark.border,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    width: '10%',
    height: '100%',
    backgroundColor: PulseColors.dark.accent,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
    minWidth: 80,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: PulseColors.dark.accent,
    gap: 8,
  },
  continueButtonDisabled: {
    backgroundColor: PulseColors.dark.surface,
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
