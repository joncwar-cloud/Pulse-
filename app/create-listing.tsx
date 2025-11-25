import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, X, Image as ImageIcon, DollarSign, MapPin, Package, Truck } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PulseColors } from '@/constants/colors';
import { useUser } from '@/contexts/UserContext';
import { marketplaceService } from '@/services/api/marketplace';
import { storageService } from '@/services/api/storage';

const CATEGORIES = [
  'Electronics', 'Fashion', 'Gaming', 'Home & Garden', 'Sports', 
  'Books', 'Art', 'Collectibles', 'Vehicles', 'Other'
];

const CONDITIONS = [
  { value: 'new' as const, label: 'New' },
  { value: 'like-new' as const, label: 'Like New' },
  { value: 'good' as const, label: 'Good' },
  { value: 'fair' as const, label: 'Fair' },
];

export default function CreateListingScreen() {
  const router = useRouter();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState<'new' | 'like-new' | 'good' | 'fair'>('good');
  const [location, setLocation] = useState('');
  const [shippingAvailable, setShippingAvailable] = useState(false);
  const [shippingPrice, setShippingPrice] = useState('');
  const [localPickup, setLocalPickup] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const createListingMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      if (!title || !description || !price || !category || !location) {
        throw new Error('Please fill in all required fields');
      }
      if (images.length === 0) {
        throw new Error('Please add at least one image');
      }

      const priceValue = parseFloat(price);
      if (isNaN(priceValue) || priceValue <= 0) {
        throw new Error('Please enter a valid price');
      }

      console.log('[CreateListing] Creating listing');
      try {
        return await marketplaceService.createListing({
          seller_id: user.id,
          title,
          description,
          price: priceValue,
          images,
          category,
          condition,
          location,
          shipping_available: shippingAvailable,
          shipping_price: shippingPrice ? parseFloat(shippingPrice) : undefined,
          local_pickup: localPickup,
        });
      } catch (error: any) {
        console.error('[CreateListing] Service error:', error);
        if (error.message?.includes('Failed to fetch') || error.message?.includes('Network')) {
          throw new Error('Network error. Please check your internet connection and try again.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      console.log('[CreateListing] Listing created successfully');
      queryClient.invalidateQueries({ queryKey: ['marketplaceListings'] });
      setTitle('');
      setDescription('');
      setPrice('');
      setCategory('');
      setCondition('good');
      setLocation('');
      setShippingAvailable(false);
      setShippingPrice('');
      setLocalPickup(true);
      setImages([]);
      Alert.alert('Success', 'Your listing has been created!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: (error: any) => {
      console.error('[CreateListing] Error:', error);
      Alert.alert('Error', error.message || 'Failed to create listing');
    },
  });

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'You can only add up to 5 images');
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permission');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        try {
          const asset = result.assets[0];
          let uri = asset.uri;
          
          if (Platform.OS !== 'web') {
            try {
              uri = await storageService.uploadMarketplaceImage(asset.uri, user?.id || 'anonymous');
              console.log('[CreateListing] Image uploaded successfully:', uri);
            } catch (uploadError: any) {
              console.error('[CreateListing] Upload error:', uploadError);
              if (uploadError.message?.includes('storage') || uploadError.message?.includes('bucket')) {
                Alert.alert(
                  'Storage Not Configured',
                  'The marketplace storage bucket needs to be created in Supabase. Using local image for now.',
                  [{ text: 'OK' }]
                );
                uri = asset.uri;
              } else {
                throw uploadError;
              }
            }
          }
          
          setImages([...images, uri]);
        } catch (error: any) {
          console.error('[CreateListing] Error:', error);
          Alert.alert('Error', error.message || 'Failed to process image');
        } finally {
          setUploading(false);
        }
      }
    } catch (error: any) {
      console.error('[CreateListing] Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    createListingMutation.mutate();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={PulseColors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Listing</Text>
        <TouchableOpacity 
          style={[styles.createButton, (!title || !description || !price || !category || !location || images.length === 0) && styles.createButtonDisabled]} 
          onPress={handleCreate}
          disabled={createListingMutation.isPending || !title || !description || !price || !category || !location || images.length === 0}
        >
          {createListingMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.createButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageItem}>
                <Image source={{ uri }} style={styles.image} contentFit="cover" />
                <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(index)}>
                  <X size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity style={styles.addImageButton} onPress={pickImage} disabled={uploading}>
                {uploading ? (
                  <ActivityIndicator size="small" color={PulseColors.dark.accent} />
                ) : (
                  <>
                    <ImageIcon size={32} color={PulseColors.dark.textSecondary} />
                    <Text style={styles.addImageText}>Add Photo</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </ScrollView>
          <Text style={styles.helperText}>Add up to 5 photos</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="What are you selling?"
            placeholderTextColor={PulseColors.dark.textTertiary}
            value={title}
            onChangeText={setTitle}
            maxLength={80}
          />
          <Text style={styles.helperText}>{title.length}/80</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your item..."
            placeholderTextColor={PulseColors.dark.textTertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.helperText}>{description.length}/500</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price *</Text>
          <View style={styles.priceInput}>
            <DollarSign size={20} color={PulseColors.dark.textSecondary} style={styles.priceIcon} />
            <TextInput
              style={[styles.input, styles.priceField]}
              placeholder="0.00"
              placeholderTextColor={PulseColors.dark.textTertiary}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Condition *</Text>
          <View style={styles.conditionsRow}>
            {CONDITIONS.map((cond) => (
              <TouchableOpacity
                key={cond.value}
                style={[styles.conditionButton, condition === cond.value && styles.conditionButtonActive]}
                onPress={() => setCondition(cond.value)}
              >
                <Text style={[styles.conditionText, condition === cond.value && styles.conditionTextActive]}>
                  {cond.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location *</Text>
          <View style={styles.locationInput}>
            <MapPin size={20} color={PulseColors.dark.textSecondary} style={styles.locationIcon} />
            <TextInput
              style={[styles.input, styles.locationField]}
              placeholder="City, State"
              placeholderTextColor={PulseColors.dark.textTertiary}
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Options</Text>
          
          <TouchableOpacity 
            style={styles.checkboxRow} 
            onPress={() => setLocalPickup(!localPickup)}
          >
            <View style={[styles.checkbox, localPickup && styles.checkboxActive]}>
              {localPickup && <View style={styles.checkboxDot} />}
            </View>
            <Package size={20} color={PulseColors.dark.text} />
            <Text style={styles.checkboxLabel}>Local Pickup</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.checkboxRow} 
            onPress={() => setShippingAvailable(!shippingAvailable)}
          >
            <View style={[styles.checkbox, shippingAvailable && styles.checkboxActive]}>
              {shippingAvailable && <View style={styles.checkboxDot} />}
            </View>
            <Truck size={20} color={PulseColors.dark.text} />
            <Text style={styles.checkboxLabel}>Shipping Available</Text>
          </TouchableOpacity>

          {shippingAvailable && (
            <View style={styles.shippingPriceContainer}>
              <Text style={styles.shippingPriceLabel}>Shipping Price</Text>
              <View style={styles.priceInput}>
                <DollarSign size={18} color={PulseColors.dark.textSecondary} style={styles.priceIcon} />
                <TextInput
                  style={[styles.input, styles.shippingPriceField]}
                  placeholder="0.00"
                  placeholderTextColor={PulseColors.dark.textTertiary}
                  value={shippingPrice}
                  onChangeText={setShippingPrice}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
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
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: PulseColors.dark.accent,
    minWidth: 70,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
    marginBottom: 12,
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: PulseColors.dark.textTertiary,
    marginTop: 6,
  },
  imagesScroll: {
    marginBottom: 8,
  },
  imageItem: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
    position: 'relative' as const,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute' as const,
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: PulseColors.dark.surface,
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    fontSize: 12,
    color: PulseColors.dark.textSecondary,
    marginTop: 6,
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative' as const,
  },
  priceIcon: {
    position: 'absolute' as const,
    left: 14,
    zIndex: 1,
  },
  priceField: {
    flex: 1,
    paddingLeft: 40,
  },
  categoriesScroll: {
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: PulseColors.dark.surface,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
    marginRight: 8,
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
    color: PulseColors.dark.accent,
  },
  conditionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionButton: {
    flex: 1,
    minWidth: '22%',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: PulseColors.dark.surface,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
    alignItems: 'center',
  },
  conditionButtonActive: {
    backgroundColor: 'rgba(255, 0, 87, 0.2)',
    borderColor: PulseColors.dark.accent,
  },
  conditionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
  },
  conditionTextActive: {
    color: PulseColors.dark.accent,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative' as const,
  },
  locationIcon: {
    position: 'absolute' as const,
    left: 14,
    zIndex: 1,
  },
  locationField: {
    flex: 1,
    paddingLeft: 40,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    borderColor: PulseColors.dark.accent,
    backgroundColor: 'rgba(255, 0, 87, 0.1)',
  },
  checkboxDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: PulseColors.dark.accent,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: PulseColors.dark.text,
  },
  shippingPriceContainer: {
    marginLeft: 36,
    marginTop: 8,
  },
  shippingPriceLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
    marginBottom: 8,
  },
  shippingPriceField: {
    flex: 1,
    paddingLeft: 40,
  },
});
