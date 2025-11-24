import { Stack, useRouter } from 'expo-router';
import { ShoppingBag, Search, Bookmark, MapPin, Eye, Plus } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { PulseColors } from '@/constants/colors';
import { marketplaceService } from '@/services/api/marketplace';

export default function MarketplaceScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const listingsQuery = useQuery({
    queryKey: ['marketplaceListings', searchQuery],
    queryFn: async () => {
      console.log('[Marketplace] Fetching listings', searchQuery);
      try {
        if (searchQuery) {
          return await marketplaceService.searchListings(searchQuery);
        }
        return await marketplaceService.getListings(50);
      } catch (error: any) {
        console.error('[Marketplace] Error in query:', error);
        throw error;
      }
    },
    retry: false,
  });

  const filteredItems = listingsQuery.data || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ShoppingBag size={28} color={PulseColors.dark.accent} />
          <Text style={styles.headerTitle}>Marketplace</Text>
        </View>
        <TouchableOpacity style={styles.createButton} onPress={() => router.push('/create-listing')}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <Search size={20} color={PulseColors.dark.textTertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search marketplace..."
          placeholderTextColor={PulseColors.dark.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {listingsQuery.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PulseColors.dark.accent} />
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ShoppingBag size={64} color={PulseColors.dark.textTertiary} />
            <Text style={styles.emptyText}>No listings found</Text>
            <TouchableOpacity style={styles.createFirstButton} onPress={() => router.push('/create-listing')}>
              <Plus size={18} color="#FFFFFF" />
              <Text style={styles.createFirstText}>Create First Listing</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredItems.map((item) => (
              <TouchableOpacity key={item.id} style={styles.itemCard}>
                <View style={styles.imageContainer}>
                  <Image source={{ uri: item.images[0] }} style={styles.itemImage} />
                  <TouchableOpacity style={styles.saveButton}>
                    <Bookmark
                      size={20}
                      color={item.saved ? PulseColors.dark.warning : PulseColors.dark.text}
                      fill={item.saved ? PulseColors.dark.warning : 'transparent'}
                    />
                  </TouchableOpacity>
                  <View style={styles.conditionBadge}>
                    <Text style={styles.conditionText}>
                      {item.condition === 'new' ? 'New' : 
                       item.condition === 'like-new' ? 'Like New' :
                       item.condition === 'good' ? 'Good' : 'Fair'}
                    </Text>
                  </View>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemPrice}>${item.price.toLocaleString()}</Text>
                  <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                  <View style={styles.locationRow}>
                    <MapPin size={14} color={PulseColors.dark.textTertiary} />
                    <Text style={styles.itemLocation} numberOfLines={1}>{item.location}</Text>
                  </View>
                  <View style={styles.statsRow}>
                    <Eye size={14} color={PulseColors.dark.textTertiary} />
                    <Text style={styles.viewCount}>{item.views.toLocaleString()} views</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: PulseColors.dark.surface,
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: PulseColors.dark.text,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PulseColors.dark.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: PulseColors.dark.surface,
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
    gap: 12,
  },
  searchIcon: {
    position: 'absolute' as const,
    left: 28,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    backgroundColor: PulseColors.dark.background,
    borderRadius: 12,
    padding: 12,
    paddingLeft: 40,
    fontSize: 16,
    color: PulseColors.dark.text,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: PulseColors.dark.accent,
  },
  createFirstText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 12,
  },
  itemCard: {
    width: '47%',
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  imageContainer: {
    position: 'relative' as const,
    width: '100%',
    height: 180,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  saveButton: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    backgroundColor: 'rgba(15, 15, 16, 0.8)',
    borderRadius: 20,
    padding: 8,
  },
  conditionBadge: {
    position: 'absolute' as const,
    bottom: 8,
    left: 8,
    backgroundColor: PulseColors.dark.accent,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  conditionText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  itemInfo: {
    padding: 12,
  },
  itemPrice: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: PulseColors.dark.accent,
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.text,
    marginBottom: 6,
    lineHeight: 18,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  itemLocation: {
    fontSize: 12,
    color: PulseColors.dark.textTertiary,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewCount: {
    fontSize: 11,
    color: PulseColors.dark.textTertiary,
  },
});
