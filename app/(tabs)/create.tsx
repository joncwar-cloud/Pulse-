import { Stack, useRouter } from 'expo-router';
import {
  Camera as CameraIcon,
  Image as ImageIcon,
  Type,
  Video as VideoIcon,
  X,
  Check,
  MapPin,
  Hash,
  Smile,
  ImagePlus,
} from 'lucide-react-native';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PulseColors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '@/contexts/UserContext';
import { ContentType } from '@/types';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';

type PostContentType = ContentType;

const POST_TYPES = [
  { type: 'text' as PostContentType, icon: Type, label: 'Text', color: PulseColors.dark.accent },
  {
    type: 'image' as PostContentType,
    icon: ImageIcon,
    label: 'Photo',
    color: PulseColors.dark.secondary,
  },
  { type: 'video' as PostContentType, icon: VideoIcon, label: 'Video', color: PulseColors.dark.warning },
];

export default function CreatePostScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [selectedType, setSelectedType] = useState<PostContentType | null>(null);
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<CameraType>('back');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const handlePost = () => {
    console.log('[CreatePost] Creating post:', { selectedType, content, hashtags, location });
    
    if (!selectedType) {
      Alert.alert('Select Post Type', 'Please select a post type to continue');
      return;
    }

    if (!content.trim() && selectedType === 'text') {
      Alert.alert('Add Content', 'Please add some content to your post');
      return;
    }

    setIsPosting(true);
    
    setTimeout(() => {
      setIsPosting(false);
      Alert.alert(
        'Post Created! 🎉',
        'Your post has been created successfully. With backend integration, it will be saved and appear in your feed.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    }, 1000);
  };

  const handleCancel = () => {
    if (content.trim() || hashtags.length > 0 || location) {
      Alert.alert('Discard Post?', 'Are you sure you want to discard this post?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  };

  const addHashtag = () => {
    Alert.prompt('Add Hashtag', 'Enter hashtag (without #)', (text) => {
      if (text && text.trim()) {
        setHashtags([...hashtags, text.trim()]);
      }
    });
  };

  const removeHashtag = (index: number) => {
    setHashtags(hashtags.filter((_, i) => i !== index));
  };

  const pickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: selectedType === 'video' ? 'videos' as ImagePicker.MediaTypeOptions : 'images' as ImagePicker.MediaTypeOptions,
        allowsMultipleSelection: selectedType === 'image',
        selectionLimit: selectedType === 'image' ? 10 - selectedImages.length : 1,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newImages = result.assets.map(asset => asset.uri);
        setSelectedImages([...selectedImages, ...newImages]);
        console.log('[CreatePost] Images selected:', newImages);
      }
    } catch (error) {
      console.error('[CreatePost] Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    }
    setShowMediaPicker(false);
  };

  const openCamera = async () => {
    if (!cameraPermission) {
      return;
    }

    if (!cameraPermission.granted) {
      const { granted } = await requestCameraPermission();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please allow camera access to take photos.'
        );
        return;
      }
    }

    setShowMediaPicker(false);
    setShowCamera(true);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          setSelectedImages([...selectedImages, photo.uri]);
          console.log('[CreatePost] Photo captured:', photo.uri);
          setShowCamera(false);
        }
      } catch (error) {
        console.error('[CreatePost] Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };

  const toggleCameraFacing = () => {
    setCameraFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleAddMedia = () => {
    if (selectedImages.length >= 10 && selectedType === 'image') {
      Alert.alert('Limit Reached', 'You can upload up to 10 photos');
      return;
    }
    setShowMediaPicker(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleCancel}>
            <X size={24} color={PulseColors.dark.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Post</Text>
          <TouchableOpacity
            style={[styles.headerButton, styles.postButton]}
            onPress={handlePost}
            disabled={isPosting}
          >
            <Text style={styles.postButtonText}>{isPosting ? 'Posting...' : 'Post'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {user && (
            <View style={styles.userInfo}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{user.username.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.username}>@{user.username}</Text>
                <Text style={styles.userStats}>
                  {user.followers} followers · {user.posts} posts
                </Text>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Post Type</Text>
            <View style={styles.postTypeGrid}>
              {POST_TYPES.map(({ type, icon: Icon, label, color }) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.postTypeCard,
                    selectedType === type && styles.postTypeCardActive,
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <LinearGradient
                    colors={
                      selectedType === type
                        ? [color + '40', color + '20']
                        : ['transparent', 'transparent']
                    }
                    style={styles.postTypeGradient}
                  >
                    <Icon
                      size={32}
                      color={selectedType === type ? color : PulseColors.dark.textSecondary}
                    />
                    <Text
                      style={[
                        styles.postTypeLabel,
                        selectedType === type && { color, fontWeight: '700' as const },
                      ]}
                    >
                      {label}
                    </Text>
                    {selectedType === type && (
                      <View style={[styles.checkBadge, { backgroundColor: color }]}>
                        <Check size={12} color={PulseColors.dark.background} strokeWidth={3} />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {selectedType === 'text' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Content</Text>
              <TextInput
                style={styles.textInput}
                placeholder="What's on your mind?"
                placeholderTextColor={PulseColors.dark.textTertiary}
                multiline
                value={content}
                onChangeText={setContent}
                maxLength={2000}
              />
              <Text style={styles.characterCount}>{content.length} / 2000</Text>
            </View>
          )}

          {selectedType === 'image' && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Photos ({selectedImages.length}/10)</Text>
                <TouchableOpacity
                  style={styles.addMoreButton}
                  onPress={handleAddMedia}
                  disabled={selectedImages.length >= 10}
                >
                  <ImagePlus size={20} color={selectedImages.length >= 10 ? PulseColors.dark.textTertiary : PulseColors.dark.accent} />
                  <Text style={[styles.addMoreButtonText, selectedImages.length >= 10 && styles.addMoreButtonTextDisabled]}>Add Photo</Text>
                </TouchableOpacity>
              </View>
              {selectedImages.length === 0 ? (
                <TouchableOpacity
                  style={styles.mediaUploadCard}
                  onPress={handleAddMedia}
                >
                  <ImagePlus size={48} color={PulseColors.dark.textTertiary} />
                  <Text style={styles.mediaUploadText}>Tap to add photos</Text>
                  <Text style={styles.mediaUploadSubtext}>Add up to 10 photos</Text>
                </TouchableOpacity>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
                  <View style={styles.imagesGrid}>
                    {selectedImages.map((image, index) => (
                      <View key={index} style={styles.imagePreviewContainer}>
                        <Image
                          source={{ uri: image }}
                          style={styles.imagePreview}
                          contentFit="cover"
                        />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                        >
                          <X size={16} color={PulseColors.dark.text} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              )}
              <TextInput
                style={styles.captionInput}
                placeholder="Add a caption..."
                placeholderTextColor={PulseColors.dark.textTertiary}
                multiline
                value={content}
                onChangeText={setContent}
                maxLength={300}
              />
            </View>
          )}

          {selectedType === 'video' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Video</Text>
              {selectedImages.length === 0 ? (
                <TouchableOpacity
                  style={styles.mediaUploadCard}
                  onPress={handleAddMedia}
                >
                  <VideoIcon size={48} color={PulseColors.dark.textTertiary} />
                  <Text style={styles.mediaUploadText}>Tap to add video</Text>
                  <Text style={styles.mediaUploadSubtext}>Up to 60 seconds</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.videoPreviewContainer}>
                  <View style={styles.videoPreview}>
                    <VideoIcon size={48} color={PulseColors.dark.textSecondary} />
                    <Text style={styles.videoPreviewText}>Video Selected</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setSelectedImages([])}
                  >
                    <X size={16} color={PulseColors.dark.text} />
                  </TouchableOpacity>
                </View>
              )}
              <TextInput
                style={styles.captionInput}
                placeholder="Add a caption..."
                placeholderTextColor={PulseColors.dark.textTertiary}
                multiline
                value={content}
                onChangeText={setContent}
                maxLength={300}
              />
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hashtags</Text>
            <View style={styles.hashtagContainer}>
              {hashtags.map((tag, index) => (
                <View key={index} style={styles.hashtagChip}>
                  <Text style={styles.hashtagText}>#{tag}</Text>
                  <TouchableOpacity onPress={() => removeHashtag(index)}>
                    <X size={14} color={PulseColors.dark.text} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addHashtagButton} onPress={addHashtag}>
                <Hash size={16} color={PulseColors.dark.accent} />
                <Text style={styles.addHashtagText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => {
                Alert.prompt('Add Location', 'Enter location', (text) => {
                  if (text) setLocation(text);
                });
              }}
            >
              <MapPin size={20} color={PulseColors.dark.secondary} />
              <Text style={styles.locationButtonText}>
                {location || 'Add location (optional)'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <Smile size={20} color={PulseColors.dark.warning} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Everyone Can Post!</Text>
              <Text style={styles.infoText}>
                All users can create posts. Reach 1,000 followers to unlock creator monetization
                and start earning from your content.
              </Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showMediaPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMediaPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.mediaPickerModal}>
            <Text style={styles.modalTitle}>Add {selectedType === 'video' ? 'Video' : 'Photo'}</Text>
            
            <TouchableOpacity
              style={styles.mediaOption}
              onPress={openCamera}
            >
              <View style={styles.mediaOptionIcon}>
                <CameraIcon size={28} color={PulseColors.dark.accent} />
              </View>
              <View style={styles.mediaOptionContent}>
                <Text style={styles.mediaOptionTitle}>Take {selectedType === 'video' ? 'Video' : 'Photo'}</Text>
                <Text style={styles.mediaOptionSubtitle}>Use camera to capture</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mediaOption}
              onPress={pickFromGallery}
            >
              <View style={styles.mediaOptionIcon}>
                <ImageIcon size={28} color={PulseColors.dark.secondary} />
              </View>
              <View style={styles.mediaOptionContent}>
                <Text style={styles.mediaOptionTitle}>Choose from Gallery</Text>
                <Text style={styles.mediaOptionSubtitle}>Select from your library</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowMediaPicker(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCamera}
        animationType="slide"
        onRequestClose={() => setShowCamera(false)}
      >
        <View style={styles.cameraContainer}>
          {Platform.OS !== 'web' ? (
            <CameraView style={styles.camera} facing={cameraFacing} ref={cameraRef}>
              <View style={styles.cameraHeader}>
                <TouchableOpacity
                  style={styles.cameraCloseButton}
                  onPress={() => setShowCamera(false)}
                >
                  <X size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cameraFlipButton}
                  onPress={toggleCameraFacing}
                >
                  <CameraIcon size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.cameraControls}>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={takePicture}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
              </View>
            </CameraView>
          ) : (
            <View style={styles.cameraFallback}>
              <Text style={styles.cameraFallbackText}>
                Camera not available on web. Please use gallery instead.
              </Text>
              <TouchableOpacity
                style={styles.cameraFallbackButton}
                onPress={() => {
                  setShowCamera(false);
                  pickFromGallery();
                }}
              >
                <Text style={styles.cameraFallbackButtonText}>Open Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  postButton: {
    backgroundColor: PulseColors.dark.accent,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: PulseColors.dark.background,
  },
  content: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PulseColors.dark.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: PulseColors.dark.background,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
    marginBottom: 2,
  },
  userStats: {
    fontSize: 12,
    color: PulseColors.dark.textSecondary,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
    marginBottom: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  postTypeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  postTypeCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
    overflow: 'hidden',
  },
  postTypeCardActive: {
    borderWidth: 2,
  },
  postTypeGradient: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
    position: 'relative' as const,
  },
  postTypeLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
  },
  checkBadge: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 12,
    padding: 16,
    color: PulseColors.dark.text,
    fontSize: 16,
    minHeight: 200,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  characterCount: {
    fontSize: 12,
    color: PulseColors.dark.textTertiary,
    textAlign: 'right' as const,
    marginTop: 8,
  },
  mediaUploadCard: {
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
    borderStyle: 'dashed',
  },
  mediaUploadText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: PulseColors.dark.text,
  },
  mediaUploadSubtext: {
    fontSize: 13,
    color: PulseColors.dark.textSecondary,
  },
  captionInput: {
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 12,
    padding: 16,
    color: PulseColors.dark.text,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
    marginTop: 12,
  },
  hashtagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hashtagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 0, 87, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PulseColors.dark.accent,
  },
  hashtagText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.text,
  },
  addHashtagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: PulseColors.dark.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
    borderStyle: 'dashed',
  },
  addHashtagText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.accent,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: PulseColors.dark.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  locationButtonText: {
    fontSize: 15,
    color: PulseColors.dark.text,
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.2)',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: PulseColors.dark.warning,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: PulseColors.dark.textSecondary,
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: PulseColors.dark.surface,
    borderWidth: 2,
    borderColor: PulseColors.dark.accent,
  },
  addMoreButtonText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: PulseColors.dark.accent,
  },
  addMoreButtonTextDisabled: {
    color: PulseColors.dark.textTertiary,
  },
  imagesScroll: {
    marginBottom: 12,
  },
  imagesGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
  },
  imagePreviewContainer: {
    position: 'relative' as const,
  },
  imagePreview: {
    width: 120,
    height: 160,
    borderRadius: 12,
    backgroundColor: PulseColors.dark.surface,
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
  },
  removeImageButton: {
    position: 'absolute' as const,
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PulseColors.dark.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: PulseColors.dark.background,
  },
  videoPreviewContainer: {
    position: 'relative' as const,
    marginBottom: 12,
  },
  videoPreview: {
    height: 200,
    borderRadius: 12,
    backgroundColor: PulseColors.dark.surface,
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  videoPreviewText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: PulseColors.dark.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  mediaPickerModal: {
    backgroundColor: PulseColors.dark.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
    marginBottom: 20,
    textAlign: 'center' as const,
  },
  mediaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PulseColors.dark.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 16,
  },
  mediaOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PulseColors.dark.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
  },
  mediaOptionContent: {
    flex: 1,
  },
  mediaOptionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
    marginBottom: 4,
  },
  mediaOptionSubtitle: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
  },
  cancelButton: {
    backgroundColor: PulseColors.dark.background,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.accent,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: PulseColors.dark.background,
  },
  camera: {
    flex: 1,
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  cameraCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraFlipButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraControls: {
    position: 'absolute' as const,
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
  },
  cameraFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 20,
  },
  cameraFallbackText: {
    fontSize: 16,
    color: PulseColors.dark.text,
    textAlign: 'center' as const,
  },
  cameraFallbackButton: {
    backgroundColor: PulseColors.dark.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  cameraFallbackButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
