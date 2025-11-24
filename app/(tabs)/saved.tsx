import { Stack } from 'expo-router';
import { Bookmark, Filter } from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PulseColors } from '@/constants/colors';
import { mockPosts } from '@/mocks/posts';
import PostCard from '@/components/PostCard';
import { ContentType } from '@/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SavedScreen() {
  const [filterType, setFilterType] = useState<'all' | ContentType>('all');
  const [currentIndex, setCurrentIndex] = useState(0);

  const savedPosts = useMemo(() => {
    const posts = mockPosts.slice(0, 8);
    if (filterType === 'all') return posts;
    return posts.filter(post => post.type === filterType);
  }, [filterType]);

  const onViewableItemsChanged = React.useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }, []);

  const viewabilityConfig = React.useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Bookmark size={28} color={PulseColors.dark.accent} />
        <Text style={styles.headerTitle}>Saved</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={PulseColors.dark.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'text', 'image', 'video'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.filterChip, filterType === type && styles.filterChipActive]}
            onPress={() => setFilterType(type)}
          >
            <Text style={[styles.filterText, filterType === type && styles.filterTextActive]}>
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {savedPosts.length > 0 ? (
        <FlatList
          data={savedPosts}
          renderItem={({ item, index }) => (
            <PostCard post={item} isActive={index === currentIndex} />
          )}
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
      ) : (
        <View style={styles.emptyState}>
          <Bookmark size={64} color={PulseColors.dark.border} />
          <Text style={styles.emptyStateTitle}>No saved posts</Text>
          <Text style={styles.emptyStateText}>
            Posts you save will appear here
          </Text>
        </View>
      )}
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
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: PulseColors.dark.surface,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
    position: 'relative' as const,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: PulseColors.dark.text,
  },
  filterButton: {
    position: 'absolute' as const,
    right: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: PulseColors.dark.surface,
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: PulseColors.dark.background,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  filterChipActive: {
    backgroundColor: 'rgba(255, 0, 87, 0.2)',
    borderColor: PulseColors.dark.accent,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
    marginTop: 8,
    textAlign: 'center' as const,
  },
});
