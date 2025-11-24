import { Stack, useRouter } from 'expo-router';
import { X, Camera, User, AtSign, FileText } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PulseColors } from '@/constants/colors';
import { useUser } from '@/contexts/UserContext';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useUser();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to update your profile photo.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as ImagePicker.MediaTypeOptions,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatar(result.assets[0].uri);
        console.log('[EditProfile] Image selected:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('[EditProfile] Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty');
      return;
    }

    if (!username.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }

    if (username.includes(' ')) {
      Alert.alert('Error', 'Username cannot contain spaces');
      return;
    }

    setIsSaving(true);

    try {
      console.log('[EditProfile] Saving profile updates');
      updateProfile({
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        bio: bio.trim(),
        avatar,
      });

      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('[EditProfile] Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X size={24} color={PulseColors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={pickImage}
          >
            <Image
              source={{ uri: avatar }}
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={styles.cameraOverlay}>
              <Camera size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHelper}>Tap to change photo</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <User size={20} color={PulseColors.dark.accent} />
              <Text style={styles.inputLabel}>Display Name</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Your display name"
              placeholderTextColor={PulseColors.dark.textTertiary}
              value={displayName}
              onChangeText={setDisplayName}
              maxLength={50}
            />
            <Text style={styles.charCount}>{displayName.length}/50</Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <AtSign size={20} color={PulseColors.dark.accent} />
              <Text style={styles.inputLabel}>Username</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="your_username"
              placeholderTextColor={PulseColors.dark.textTertiary}
              value={username}
              onChangeText={(text) => setUsername(text.toLowerCase().replace(/\s/g, ''))}
              maxLength={30}
              autoCapitalize="none"
            />
            <Text style={styles.charCount}>{username.length}/30</Text>
            <Text style={styles.helperText}>
              Username must be unique and cannot contain spaces
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <FileText size={20} color={PulseColors.dark.accent} />
              <Text style={styles.inputLabel}>Bio</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us about yourself"
              placeholderTextColor={PulseColors.dark.textTertiary}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              maxLength={150}
            />
            <Text style={styles.charCount}>{bio.length}/150</Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PulseColors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: PulseColors.dark.surface,
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: PulseColors.dark.accent,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    position: 'relative' as const,
    borderWidth: 3,
    borderColor: PulseColors.dark.accent,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  cameraOverlay: {
    position: 'absolute' as const,
    bottom: 0,
    right: 0,
    backgroundColor: PulseColors.dark.accent,
    borderRadius: 20,
    padding: 10,
    borderWidth: 3,
    borderColor: PulseColors.dark.surface,
  },
  avatarHelper: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
    marginTop: 12,
  },
  section: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  input: {
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: PulseColors.dark.text,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  textArea: {
    height: undefined,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: PulseColors.dark.textTertiary,
    textAlign: 'right' as const,
  },
  helperText: {
    fontSize: 12,
    color: PulseColors.dark.textSecondary,
    fontStyle: 'italic' as const,
  },
  bottomPadding: {
    height: 40,
  },
});
