import { Stack, useRouter } from 'expo-router';
import { X, AlertCircle, Camera } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PulseColors } from '@/constants/colors';
import { useCommunities } from '@/contexts/CommunityContext';
import { useUser } from '@/contexts/UserContext';

const CATEGORIES = [
  'Technology',
  'Gaming',
  'Entertainment',
  'Health',
  'Creative',
  'Lifestyle',
  'Education',
  'Sports',
  'Music',
  'Other',
];

const POINTS_OF_INTEREST_OPTIONS = [
  'AI',
  'Mobile',
  'Web Development',
  'PC Gaming',
  'Console',
  'Mobile Games',
  'Weightlifting',
  'Cardio',
  'Nutrition',
  'Digital Art',
  'Traditional Art',
  'Design',
  'Recipes',
  'Restaurants',
  'Baking',
  'Adventure',
  'Culture',
  'Photography',
  'Music Production',
  'Live Shows',
  'Podcasts',
];

export default function CreateCommunityScreen() {
  const router = useRouter();
  const { createCommunity } = useCommunities();
  const { user } = useUser();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🌟');
  const [category, setCategory] = useState('');
  const [rules, setRules] = useState('');
  const [isNSFW, setIsNSFW] = useState(false);
  const [selectedPOIs, setSelectedPOIs] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customImage, setCustomImage] = useState<string | null>(null);

  const togglePOI = (poi: string) => {
    setSelectedPOIs((prev) =>
      prev.includes(poi) ? prev.filter((p) => p !== poi) : [...prev, poi]
    );
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to upload a community image.'
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
        setCustomImage(result.assets[0].uri);
        console.log('[CreateCommunity] Image selected:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('[CreateCommunity] Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a community name');
      return;
    }

    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a community');
      return;
    }

    setIsSubmitting(true);

    try {
      createCommunity({
        name: name.trim(),
        description: description.trim(),
        icon: customImage || icon,
        category,
        rules: rules.trim() || 'Be respectful and follow community guidelines',
        isNSFW,
        pointsOfInterest: selectedPOIs,
        creatorId: user.id,
        coverImage: customImage || undefined,
      });

      Alert.alert('Success', 'Community created successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create community. Please try again.');
      console.error('[CreateCommunity] Error creating community:', error);
    } finally {
      setIsSubmitting(false);
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
        <Text style={styles.headerTitle}>Create Community</Text>
        <TouchableOpacity
          style={[
            styles.createButton,
            isSubmitting && styles.createButtonDisabled,
          ]}
          onPress={handleCreate}
          disabled={isSubmitting}
        >
          <Text style={styles.createButtonText}>
            {isSubmitting ? 'Creating...' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Icon</Text>
          <View style={styles.iconSelector}>
            <TouchableOpacity 
              style={styles.iconDisplay}
              onPress={pickImage}
            >
              {customImage ? (
                <Image
                  source={{ uri: customImage }}
                  style={styles.customImage}
                  contentFit="cover"
                />
              ) : (
                <Text style={styles.iconText}>{icon}</Text>
              )}
              <View style={styles.cameraOverlay}>
                <Camera size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.iconList}
            >
              {['🌟', '💻', '🎮', '🎨', '💪', '🍳', '✈️', '📚', '🎵', '⚽', '🎬', '📸'].map(
                (emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.iconOption,
                      icon === emoji && !customImage && styles.iconOptionActive,
                    ]}
                    onPress={() => {
                      setCustomImage(null);
                      setIcon(emoji);
                    }}
                  >
                    <Text style={styles.iconOptionText}>{emoji}</Text>
                  </TouchableOpacity>
                )
              )}
            </ScrollView>
          </View>
          <Text style={styles.iconHelper}>Tap the icon to upload a custom image</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter community name"
            placeholderTextColor={PulseColors.dark.textTertiary}
            value={name}
            onChangeText={setName}
            maxLength={50}
          />
          <Text style={styles.charCount}>{name.length}/50</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="What's this community about?"
            placeholderTextColor={PulseColors.dark.textTertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={200}
          />
          <Text style={styles.charCount}>{description.length}/200</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryList}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === cat && styles.categoryTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Points of Interest</Text>
          <Text style={styles.sectionSubtitle}>Select topics your community focuses on</Text>
          <View style={styles.poiGrid}>
            {POINTS_OF_INTEREST_OPTIONS.map((poi) => (
              <TouchableOpacity
                key={poi}
                style={[
                  styles.poiChip,
                  selectedPOIs.includes(poi) && styles.poiChipActive,
                ]}
                onPress={() => togglePOI(poi)}
              >
                <Text
                  style={[
                    styles.poiText,
                    selectedPOIs.includes(poi) && styles.poiTextActive,
                  ]}
                >
                  {poi}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Rules</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Set guidelines for your community"
            placeholderTextColor={PulseColors.dark.textTertiary}
            value={rules}
            onChangeText={setRules}
            multiline
            numberOfLines={6}
            maxLength={500}
          />
          <Text style={styles.charCount}>{rules.length}/500</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.nsfwContainer}>
            <View style={styles.nsfwInfo}>
              <View style={styles.nsfwHeader}>
                <AlertCircle size={20} color={PulseColors.dark.accent} />
                <Text style={styles.nsfwTitle}>NSFW Content</Text>
              </View>
              <Text style={styles.nsfwDescription}>
                Mark this community if it contains mature or sensitive content
              </Text>
            </View>
            <Switch
              value={isNSFW}
              onValueChange={setIsNSFW}
              trackColor={{
                false: PulseColors.dark.border,
                true: PulseColors.dark.accent,
              }}
              thumbColor={PulseColors.dark.text}
            />
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
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: PulseColors.dark.accent,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
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
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
    marginBottom: 12,
  },
  iconSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconDisplay: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PulseColors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
    overflow: 'hidden',
    position: 'relative' as const,
  },
  customImage: {
    width: '100%',
    height: '100%',
  },
  cameraOverlay: {
    position: 'absolute' as const,
    bottom: 0,
    right: 0,
    backgroundColor: PulseColors.dark.accent,
    borderRadius: 12,
    padding: 6,
    borderWidth: 2,
    borderColor: PulseColors.dark.surface,
  },
  iconHelper: {
    fontSize: 12,
    color: PulseColors.dark.textSecondary,
    marginTop: 8,
  },
  iconText: {
    fontSize: 40,
  },
  iconList: {
    flex: 1,
  },
  iconOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: PulseColors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
  },
  iconOptionActive: {
    borderColor: PulseColors.dark.accent,
    backgroundColor: 'rgba(255, 0, 87, 0.15)',
  },
  iconOptionText: {
    fontSize: 28,
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
    textAlign: 'right',
    marginTop: 4,
  },
  categoryList: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: PulseColors.dark.surface,
    marginRight: 8,
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
  },
  categoryChipActive: {
    backgroundColor: 'rgba(255, 0, 87, 0.2)',
    borderColor: PulseColors.dark.accent,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
  },
  categoryTextActive: {
    color: PulseColors.dark.accentLight,
    fontWeight: '700' as const,
  },
  poiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  poiChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: PulseColors.dark.surface,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  poiChipActive: {
    backgroundColor: 'rgba(255, 0, 87, 0.2)',
    borderColor: PulseColors.dark.accent,
  },
  poiText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
  },
  poiTextActive: {
    color: PulseColors.dark.accentLight,
    fontWeight: '700' as const,
  },
  nsfwContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  nsfwInfo: {
    flex: 1,
    marginRight: 16,
  },
  nsfwHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  nsfwTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  nsfwDescription: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
  },
  bottomPadding: {
    height: 40,
  },
});
