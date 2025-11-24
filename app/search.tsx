import { useRouter, Stack } from 'expo-router';
import { Search, X, TrendingUp, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { PulseColors } from '@/constants/colors';
import { usersService } from '@/services/api/users';
import { useUser } from '@/contexts/UserContext';

const TRENDING_SEARCHES = [
  'gaming',
  'music',
  'art',
  'fitness',
  'food',
  'travel',
];

export default function SearchScreen() {
  const router = useRouter();
  const { user: currentUser } = useUser();
  const [searchQuery, setSearchQuery] = useState('');

  const searchQuery_ = useQuery({
    queryKey: ['searchUsers', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      return await usersService.searchUsers(searchQuery.trim());
    },
    enabled: searchQuery.trim().length > 0,
  });

  const handleUserPress = (username: string) => {
    router.push(`/user/${username}` as any);
  };

  const handleSearchTrending = (tag: string) => {
    setSearchQuery(tag);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const renderUserItem = ({ item }: { item: any }) => {
    const isCurrentUser = item.id === currentUser?.id;

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => handleUserPress(item.username)}
      >
        <View style={styles.avatarWrapper}>
          <LinearGradient
            colors={[PulseColors.dark.accent, '#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarGradient}
          >
            <View style={styles.avatarInner}>
              <Image
                source={{ uri: item.avatar }}
                style={styles.avatar}
                contentFit="cover"
              />
            </View>
          </LinearGradient>
        </View>

        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName} numberOfLines={1}>
              {item.display_name}
            </Text>
            {item.verified && (
              <Text style={styles.verifiedBadge}>✓</Text>
            )}
          </View>
          <Text style={styles.username} numberOfLines={1}>
            @{item.username}
          </Text>
          {item.bio && (
            <Text style={styles.bio} numberOfLines={2}>
              {item.bio}
            </Text>
          )}
          <View style={styles.stats}>
            <Text style={styles.statText}>
              {item.followers || 0} followers
            </Text>
          </View>
        </View>

        {isCurrentUser && (
          <View style={styles.youBadge}>
            <Text style={styles.youBadgeText}>You</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (searchQuery_.isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={PulseColors.dark.accent} />
        </View>
      );
    }

    if (searchQuery.trim().length > 0 && !searchQuery_.isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <Search size={48} color={PulseColors.dark.textSecondary} />
          <Text style={styles.emptyText}>No users found</Text>
          <Text style={styles.emptySubtext}>Try searching for a different username</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={PulseColors.dark.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={PulseColors.dark.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={20} color={PulseColors.dark.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {searchQuery.trim().length === 0 ? (
        <View style={styles.trendingSection}>
          <View style={styles.trendingHeader}>
            <TrendingUp size={20} color={PulseColors.dark.text} />
            <Text style={styles.trendingTitle}>Trending Searches</Text>
          </View>

          <View style={styles.trendingGrid}>
            {TRENDING_SEARCHES.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={styles.trendingTag}
                onPress={() => handleSearchTrending(tag)}
              >
                <Text style={styles.trendingTagText}>#{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.suggestionsHeader}>
            <Users size={20} color={PulseColors.dark.text} />
            <Text style={styles.suggestionsTitle}>Suggested Users</Text>
          </View>

          <Text style={styles.comingSoon}>Start typing to search for users</Text>
        </View>
      ) : (
        <FlatList
          data={searchQuery_.data || []}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
        />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: PulseColors.dark.text,
  },
  clearButton: {
    padding: 4,
  },
  listContent: {
    paddingVertical: 8,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  avatarWrapper: {
    marginRight: 4,
  },
  avatarGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    padding: 2,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: PulseColors.dark.background,
    padding: 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
    flex: 1,
  },
  verifiedBadge: {
    fontSize: 16,
    color: PulseColors.dark.accent,
  },
  username: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: PulseColors.dark.textSecondary,
  },
  bio: {
    fontSize: 13,
    color: PulseColors.dark.text,
    marginTop: 4,
    lineHeight: 18,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: PulseColors.dark.textSecondary,
  },
  youBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: PulseColors.dark.surface,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  youBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: PulseColors.dark.text,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
    textAlign: 'center',
  },
  trendingSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  trendingTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: PulseColors.dark.text,
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  trendingTag: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: PulseColors.dark.surface,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  trendingTagText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: PulseColors.dark.text,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: PulseColors.dark.text,
  },
  comingSoon: {
    fontSize: 15,
    color: PulseColors.dark.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
