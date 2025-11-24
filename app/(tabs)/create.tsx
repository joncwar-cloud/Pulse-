import { Stack, useRouter } from 'expo-router';
import {
  Camera,
  Image as ImageIcon,
  Type,
  Video,
  X,
  Check,
  MapPin,
  Hash,
  Smile,
} from 'lucide-react-native';
import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PulseColors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '@/contexts/UserContext';
import { ContentType } from '@/types';

type PostContentType = ContentType;

const POST_TYPES = [
  { type: 'text' as PostContentType, icon: Type, label: 'Text', color: PulseColors.dark.accent },
  {
    type: 'image' as PostContentType,
    icon: ImageIcon,
    label: 'Photo',
    color: PulseColors.dark.secondary,
  },
  { type: 'video' as PostContentType, icon: Video, label: 'Video', color: PulseColors.dark.warning },
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
                  onPress={() => {
                    if (selectedImages.length >= 10) {
                      Alert.alert('Limit Reached', 'You can upload up to 10 photos');
                      return;
                    }
                    Alert.alert(
                      'Add Photo',
                      'Photo upload requires backend integration. For now, using placeholder.',
                      [{
                        text: 'OK',
                        onPress: () => {
                          const placeholders = [
                            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
                            'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
                            'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
                            'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800',
                            'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800',
                          ];
                          const randomImage = placeholders[Math.floor(Math.random() * placeholders.length)];
                          setSelectedImages([...selectedImages, randomImage]);
                        }
                      }]
                    );
                  }}
                  disabled={selectedImages.length >= 10}
                >
                  <Camera size={20} color={selectedImages.length >= 10 ? PulseColors.dark.textTertiary : PulseColors.dark.accent} />
                  <Text style={[styles.addMoreButtonText, selectedImages.length >= 10 && styles.addMoreButtonTextDisabled]}>Add Photo</Text>
                </TouchableOpacity>
              </View>
              {selectedImages.length === 0 ? (
                <TouchableOpacity
                  style={styles.mediaUploadCard}
                  onPress={() => {
                    Alert.alert(
                      'Add Photo',
                      'Photo upload requires backend integration. For now, using placeholder.',
                      [{
                        text: 'OK',
                        onPress: () => {
                          setSelectedImages(['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800']);
                        }
                      }]
                    );
                  }}
                >
                  <Camera size={48} color={PulseColors.dark.textTertiary} />
                  <Text style={styles.mediaUploadText}>Tap to add photos</Text>
                  <Text style={styles.mediaUploadSubtext}>Add up to 10 photos</Text>
                </TouchableOpacity>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
                  <View style={styles.imagesGrid}>
                    {selectedImages.map((image, index) => (
                      <View key={index} style={styles.imagePreviewContainer}>
                        <View style={styles.imagePreview}>
                          <Text style={styles.imagePreviewPlaceholder}>Photo {index + 1}</Text>
                        </View>
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
              <TouchableOpacity
                style={styles.mediaUploadCard}
                onPress={() => {
                  Alert.alert(
                    'Add Video',
                    'Video upload requires backend integration',
                    [{ text: 'OK' }]
                  );
                }}
              >
                <Video size={48} color={PulseColors.dark.textTertiary} />
                <Text style={styles.mediaUploadText}>Tap to add video</Text>
                <Text style={styles.mediaUploadSubtext}>Up to 60 seconds</Text>
              </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviewPlaceholder: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
    fontWeight: '600' as const,
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
});
