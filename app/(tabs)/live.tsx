import { Stack, useRouter } from 'expo-router';
import { Radio, Eye, Users, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { PulseColors } from '@/constants/colors';
import { mockLiveStreams } from '@/mocks/livestreams';
import { LiveStream } from '@/types';

export default function LiveScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'Music', 'Dance', 'Tech', 'Gaming', 'Art'];

  const filteredStreams = selectedCategory === 'all' 
    ? mockLiveStreams 
    : mockLiveStreams.filter(s => s.category === selectedCategory);

  const renderLiveStream = ({ item }: { item: LiveStream }) => (
    <TouchableOpacity style={styles.streamCard}>
      <Image 
        source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/400x300' }}
        style={styles.streamThumbnail}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.streamGradient}
      />
      
      <View style={styles.liveBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE</Text>
      </View>

      <View style={styles.viewerCount}>
        <Eye size={14} color="#fff" />
        <Text style={styles.viewerText}>{item.viewerCount.toLocaleString()}</Text>
      </View>

      <View style={styles.streamInfo}>
        <View style={styles.creatorRow}>
          <View style={styles.creatorAvatar}>
            <Users size={16} color={PulseColors.dark.accent} />
          </View>
          <View style={styles.creatorInfo}>
            <Text style={styles.creatorName}>{item.creator.displayName}</Text>
            {item.creator.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedIcon}>✓</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.streamTitle} numberOfLines={2}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Radio size={28} color={PulseColors.dark.accent} />
          <Text style={styles.headerTitle}>Live</Text>
        </View>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X size={24} color={PulseColors.dark.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.categoryRow}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.categoryTextActive,
                ]}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </View>

      {filteredStreams.length > 0 ? (
        <FlatList
          data={filteredStreams}
          renderItem={renderLiveStream}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.streamList}
          numColumns={2}
        />
      ) : (
        <View style={styles.emptyState}>
          <Radio size={64} color={PulseColors.dark.border} />
          <Text style={styles.emptyStateTitle}>No live streams</Text>
          <Text style={styles.emptyStateText}>
            Check back later for live content
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
  closeButton: {
    padding: 8,
  },
  categoryRow: {
    backgroundColor: PulseColors.dark.surface,
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: PulseColors.dark.background,
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
    color: PulseColors.dark.accentLight,
    fontWeight: '700' as const,
  },
  streamList: {
    padding: 12,
  },
  streamCard: {
    flex: 1,
    margin: 4,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: PulseColors.dark.surface,
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
  },
  streamThumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: PulseColors.dark.surface,
  },
  streamGradient: {
    position: 'absolute' as const,
    bottom: 60,
    left: 0,
    right: 0,
    height: 100,
  },
  liveBadge: {
    position: 'absolute' as const,
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: PulseColors.dark.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '900' as const,
    color: '#fff',
    letterSpacing: 0.5,
  },
  viewerCount: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewerText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#fff',
  },
  streamInfo: {
    padding: 12,
    gap: 8,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creatorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 0, 87, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PulseColors.dark.accent,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  verifiedBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: PulseColors.dark.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedIcon: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#fff',
  },
  streamTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
    lineHeight: 20,
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
