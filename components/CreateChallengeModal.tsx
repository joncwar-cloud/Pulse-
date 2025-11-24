import { X, Image as ImageIcon, Calendar, Trophy, Hash, Gift } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Modal, Platform } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PulseColors } from '@/constants/colors';
import { useUser } from '@/contexts/UserContext';
import { challengesService } from '@/services/api/challenges';
import { storageService } from '@/services/api/storage';

interface CreateChallengeModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CreateChallengeModal({ visible, onClose }: CreateChallengeModalProps) {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtag, setHashtag] = useState('');
  const [prize, setPrize] = useState('');
  const [endDate, setEndDate] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const createChallengeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      if (!title || !description || !hashtag) {
        throw new Error('Please fill in all required fields');
      }

      const cleanHashtag = hashtag.startsWith('#') ? hashtag.slice(1) : hashtag;
      
      console.log('[CreateChallenge] Creating challenge');
      return await challengesService.createChallenge({
        creator_id: user.id,
        title,
        description,
        hashtag: cleanHashtag,
        thumbnail_url: thumbnailUrl || undefined,
        end_date: endDate ? new Date(endDate).toISOString() : undefined,
        prize: prize || undefined,
      });
    },
    onSuccess: () => {
      console.log('[CreateChallenge] Challenge created successfully');
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['userChallenges'] });
      Alert.alert('Success', 'Your challenge has been created!');
      handleClose();
    },
    onError: (error: any) => {
      console.error('[CreateChallenge] Error:', error);
      Alert.alert('Error', error.message || 'Failed to create challenge');
    },
  });

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permission');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        try {
          const asset = result.assets[0];
          const uri = Platform.OS === 'web' 
            ? asset.uri 
            : await storageService.uploadChallengeImage(asset.uri, user?.id || 'anonymous');
          
          setThumbnailUrl(uri);
        } catch (error: any) {
          console.error('[CreateChallenge] Upload error:', error);
          Alert.alert('Upload Failed', error.message || 'Failed to upload image');
        } finally {
          setUploading(false);
        }
      }
    } catch (error: any) {
      console.error('[CreateChallenge] Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setHashtag('');
    setPrize('');
    setEndDate('');
    setThumbnailUrl('');
    onClose();
  };

  const handleCreate = () => {
    createChallengeMutation.mutate();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Create Challenge</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X size={24} color={PulseColors.dark.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thumbnail</Text>
              {thumbnailUrl ? (
                <View style={styles.thumbnailContainer}>
                  <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} contentFit="cover" />
                  <TouchableOpacity style={styles.changeThumbnailButton} onPress={pickImage}>
                    <Text style={styles.changeThumbnailText}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.addThumbnailButton} onPress={pickImage} disabled={uploading}>
                  {uploading ? (
                    <ActivityIndicator size="small" color={PulseColors.dark.accent} />
                  ) : (
                    <>
                      <ImageIcon size={32} color={PulseColors.dark.textSecondary} />
                      <Text style={styles.addThumbnailText}>Add Thumbnail</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Title *</Text>
              <View style={styles.inputContainer}>
                <Trophy size={18} color={PulseColors.dark.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputWithIcon]}
                  placeholder="Challenge name"
                  placeholderTextColor={PulseColors.dark.textTertiary}
                  value={title}
                  onChangeText={setTitle}
                  maxLength={60}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hashtag *</Text>
              <View style={styles.inputContainer}>
                <Hash size={18} color={PulseColors.dark.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputWithIcon]}
                  placeholder="ChallengeHashtag"
                  placeholderTextColor={PulseColors.dark.textTertiary}
                  value={hashtag}
                  onChangeText={setHashtag}
                  maxLength={30}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your challenge..."
                placeholderTextColor={PulseColors.dark.textTertiary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                maxLength={300}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Prize (Optional)</Text>
              <View style={styles.inputContainer}>
                <Gift size={18} color={PulseColors.dark.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputWithIcon]}
                  placeholder="e.g., $500 cash prize"
                  placeholderTextColor={PulseColors.dark.textTertiary}
                  value={prize}
                  onChangeText={setPrize}
                  maxLength={60}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>End Date (Optional)</Text>
              <View style={styles.inputContainer}>
                <Calendar size={18} color={PulseColors.dark.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputWithIcon]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={PulseColors.dark.textTertiary}
                  value={endDate}
                  onChangeText={setEndDate}
                />
              </View>
              <Text style={styles.helperText}>Leave empty for ongoing challenge</Text>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.createButton, (!title || !description || !hashtag) && styles.createButtonDisabled]} 
              onPress={handleCreate}
              disabled={createChallengeMutation.isPending || !title || !description || !hashtag}
            >
              {createChallengeMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.createButtonText}>Create Challenge</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: PulseColors.dark.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800' as const,
    color: PulseColors.dark.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
    marginBottom: 10,
  },
  thumbnailContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    position: 'relative' as const,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  changeThumbnailButton: {
    position: 'absolute' as const,
    bottom: 12,
    right: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  changeThumbnailText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  addThumbnailButton: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: PulseColors.dark.surface,
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addThumbnailText: {
    fontSize: 13,
    color: PulseColors.dark.textSecondary,
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative' as const,
  },
  inputIcon: {
    position: 'absolute' as const,
    left: 14,
    zIndex: 1,
  },
  input: {
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: PulseColors.dark.text,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  inputWithIcon: {
    flex: 1,
    paddingLeft: 42,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: PulseColors.dark.textTertiary,
    marginTop: 6,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: PulseColors.dark.border,
  },
  createButton: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: PulseColors.dark.accent,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
