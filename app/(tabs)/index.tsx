import { Stack } from 'expo-router';
import { Activity, Filter, MapPin, X } from 'lucide-react-native';
import React, { useMemo, useState, useRef, useCallback, memo } from 'react';
import { View, StyleSheet, Text, FlatList, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import PostCard from '@/components/PostCard';
import NativeAdCard from '@/components/NativeAdCard';
import { useContentFilters } from '@/contexts/ContentFilterContext';
import { useUser } from '@/contexts/UserContext';
import { useLocationFilter } from '@/contexts/LocationFilterContext';
import { useMonetization } from '@/contexts/MonetizationContext';
import { mockPosts } from '@/mocks/posts';
import { PulseColors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { ContentType, Post, Ad } from '@/types';
import { AdService } from '@/services/AdService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONTENT_TYPE_ICONS: Record<ContentType, string> = {
  text: '📝',
  image: '🖼️',
  video: '🎥',
};

type FeedItem = 
  | { type: 'post'; data: Post; id: string }
  | { type: 'ad'; data: Ad; id: string };

const MemoizedPostCard = memo(PostCard);
const MemoizedNativeAdCard = memo(NativeAdCard);

export default function FeedScreen() {
  const { filters, toggleContentType } = useContentFilters();
  const { hasOnboarded } = useUser();
  const { selectedLocation, clearLocation } = useLocationFilter();
  const { hasAdFree } = useMonetization();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'foryou' | 'following'>('foryou');
  const [showFilters, setShowFilters] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const { user, isLoading: userLoading } = useUser();

  const feedItems = useMemo(() => {
    try {
      console.log('[FeedScreen] Filtering posts. Active tab:', activeTab);
      let posts = activeTab === 'foryou' 
        ? mockPosts 
        : mockPosts.filter((post) => post.user.verified || post.user.isPremium);

      if (selectedLocation) {
        posts = posts.filter((post) => {
          if (!post.location) return false;
          return post.location.city === selectedLocation.city && 
                 post.location.countryCode === selectedLocation.countryCode;
        });
      }

      posts = posts.filter((post) => {
        if (!filters.contentTypes.includes(post.type)) {
          return false;
        }

        if (filters.childrenMode) {
          return post.rating === 'sfw' && post.quality === 'high';
        }

        if (!filters.showNSFW && post.rating === 'nsfw') {
          return false;
        }

        if (filters.blockBrainrot && post.quality === 'brainrot') {
          return false;
        }

        return true;
      });

      const items: FeedItem[] = [];
      posts.forEach((post, index) => {
        items.push({ type: 'post', data: post, id: post.id });
        
        if (!hasAdFree) {
          const ad = AdService.getNativeAdForFeed(index, hasAdFree);
          if (ad) {
            items.push({ type: 'ad', data: ad, id: ad.id });
          }
        }
      });

      console.log('[FeedScreen] Feed items count:', items.length);
      return items;
    } catch (error) {
      console.error('[FeedScreen] Error creating feed:', error);
      return [];
    }
  }, [filters, activeTab, selectedLocation, hasAdFree]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }, []);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleTabChange = (tab: 'foryou' | 'following') => {
    console.log('[FeedScreen] Changing tab to:', tab);
    setActiveTab(tab);
    try {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    } catch (error) {
      console.error('[FeedScreen] Error scrolling to offset:', error);
    }
  };

  if (userLoading || hasOnboarded === undefined) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Activity size={48} color={PulseColors.dark.accent} />
        <Text style={{ color: PulseColors.dark.textSecondary, marginTop: 16 }}>Loading...</Text>
      </View>
    );
  }

  if (!user || hasOnboarded === false) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <LinearGradient
        colors={[PulseColors.dark.background, 'rgba(10, 10, 11, 0.4)', 'transparent']}
        style={styles.topGradient}
        pointerEvents="none"
      />

      <View style={styles.header}>
        <Activity size={24} color={PulseColors.dark.accent} />
        <Text style={styles.headerTitle}>Pulse</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={PulseColors.dark.text} />
        </TouchableOpacity>
      </View>

      {selectedLocation && (
        <View style={styles.locationBanner}>
          <MapPin size={16} color={PulseColors.dark.accent} />
          <Text style={styles.locationBannerText}>
            {selectedLocation.city}, {selectedLocation.countryCode}
          </Text>
          <TouchableOpacity
            style={styles.clearLocationButton}
            onPress={clearLocation}
          >
            <X size={16} color={PulseColors.dark.text} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'foryou' && styles.tabActive]}
          onPress={() => handleTabChange('foryou')}
        >
          <Text style={[styles.tabText, activeTab === 'foryou' && styles.tabTextActive]}>
            For You
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'following' && styles.tabActive]}
          onPress={() => handleTabChange('following')}
        >
          <Text style={[styles.tabText, activeTab === 'following' && styles.tabTextActive]}>
            Following
          </Text>
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersPanel}>
          <Text style={styles.filtersTitle}>Content Types</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersList}>
            {(['text', 'image', 'video'] as ContentType[]).map((type) => {
              const isSelected = filters.contentTypes.includes(type);
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterChip,
                    isSelected && styles.filterChipActive,
                    !isSelected && styles.filterChipInactive,
                  ]}
                  onPress={() => toggleContentType(type)}
                >
                  <Text style={styles.filterIcon}>{CONTENT_TYPE_ICONS[type]}</Text>
                  <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={feedItems}
        renderItem={({ item, index }) => {
          if (item.type === 'ad') {
            return <MemoizedNativeAdCard ad={item.data} />;
          }
          return <MemoizedPostCard post={item.data} isActive={index === currentIndex} />;
        }}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        removeClippedSubviews
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PulseColors.dark.background,
  },
  topGradient: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    zIndex: 10,
  },
  header: {
    position: 'absolute' as const,
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: PulseColors.dark.text,
    letterSpacing: 1,
  },
  filterButton: {
    position: 'absolute' as const,
    right: 20,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabBar: {
    position: 'absolute' as const,
    top: 95,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    zIndex: 20,
    paddingHorizontal: 20,
  },
  tab: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: 'rgba(255, 0, 87, 0.2)',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.textSecondary,
  },
  tabTextActive: {
    color: PulseColors.dark.accentLight,
  },
  filtersPanel: {
    position: 'absolute' as const,
    top: 135,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 15, 16, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
    zIndex: 15,
  },
  filtersTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: PulseColors.dark.textTertiary,
    marginBottom: 8,
    textTransform: 'uppercase' as const,
  },
  filtersList: {
    flexDirection: 'row',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
    borderWidth: 2,
  },
  filterChipActive: {
    backgroundColor: 'rgba(255, 0, 87, 0.2)',
    borderColor: PulseColors.dark.accent,
  },
  filterChipInactive: {
    backgroundColor: PulseColors.dark.surface,
    borderColor: PulseColors.dark.border,
    opacity: 0.5,
  },
  filterIcon: {
    fontSize: 16,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
  },
  filterTextActive: {
    color: PulseColors.dark.accentLight,
    fontWeight: '700' as const,
  },
  locationBanner: {
    position: 'absolute' as const,
    top: 88,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 0, 87, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: PulseColors.dark.accent,
    zIndex: 25,
  },
  locationBannerText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: PulseColors.dark.accentLight,
  },
  clearLocationButton: {
    marginLeft: 4,
    padding: 2,
  },
});
