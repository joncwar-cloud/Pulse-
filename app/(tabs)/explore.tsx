import { Stack, useRouter } from 'expo-router';
import { ShoppingBag, MapPin, Compass, Search, Users, Hash, TrendingUp, X, Trophy, Newspaper } from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { PulseColors } from '@/constants/colors';
import { mockPosts } from '@/mocks/posts';
import { mockCommunities } from '@/mocks/appData';
import { User } from '@/types';

type SearchResultType = 'user' | 'topic' | 'community';

interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  avatar?: string;
  verified?: boolean;
  memberCount?: number;
  postCount?: number;
  data?: any;
}

export default function ExploreScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'discover' | 'search'>('discover');

  const allUsers = useMemo(() => {
    const usersMap = new Map<string, User>();
    mockPosts.forEach(post => {
      if (!usersMap.has(post.user.id)) {
        usersMap.set(post.user.id, post.user);
      }
    });
    return Array.from(usersMap.values());
  }, []);

  const trendingTopics = useMemo(() => {
    const topicsMap = new Map<string, number>();
    mockPosts.forEach(post => {
      post.tags.forEach(tag => {
        topicsMap.set(tag, (topicsMap.get(tag) || 0) + 1);
      });
    });
    return Array.from(topicsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    allUsers.forEach(user => {
      if (
        user.username.toLowerCase().includes(query) ||
        user.displayName.toLowerCase().includes(query)
      ) {
        const userPosts = mockPosts.filter(p => p.user.id === user.id);
        results.push({
          id: user.id,
          type: 'user',
          title: user.displayName,
          subtitle: `@${user.username} · ${userPosts.length} posts`,
          avatar: user.avatar,
          verified: user.verified,
          data: user,
        });
      }
    });

    trendingTopics.forEach(({ tag, count }) => {
      if (tag.toLowerCase().includes(query)) {
        results.push({
          id: tag,
          type: 'topic',
          title: `#${tag}`,
          subtitle: `${count} posts`,
          postCount: count,
        });
      }
    });

    mockCommunities.forEach(community => {
      if (
        community.name.toLowerCase().includes(query) ||
        community.description.toLowerCase().includes(query)
      ) {
        results.push({
          id: community.id,
          type: 'community',
          title: community.name,
          subtitle: `${(community.memberCount / 1000).toFixed(1)}K members`,
          avatar: community.icon,
          memberCount: community.memberCount,
          data: community,
        });
      }
    });

    return results;
  }, [searchQuery, allUsers, trendingTopics]);

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity style={styles.searchResultCard}>
      <View style={styles.searchResultIcon}>
        {item.type === 'user' && item.avatar ? (
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Users size={24} color={PulseColors.dark.accent} />
            </View>
          </View>
        ) : item.type === 'topic' ? (
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 0, 87, 0.2)' }]}>
            <Hash size={24} color={PulseColors.dark.accent} />
          </View>
        ) : (
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(0, 153, 255, 0.2)' }]}>
            <Text style={styles.communityIcon}>{item.avatar}</Text>
          </View>
        )}
      </View>

      <View style={styles.searchResultInfo}>
        <View style={styles.searchResultTitleRow}>
          <Text style={styles.searchResultTitle}>{item.title}</Text>
          {item.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>
          )}
        </View>
        <Text style={styles.searchResultSubtitle}>{item.subtitle}</Text>
      </View>

      {item.type === 'user' && (
        <TouchableOpacity style={styles.followButton}>
          <Text style={styles.followButtonText}>Follow</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Compass size={28} color={PulseColors.dark.accent} />
        <Text style={styles.headerTitle}>Explore</Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color={PulseColors.dark.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search people, topics, communities..."
            placeholderTextColor={PulseColors.dark.textTertiary}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (text.trim()) {
                setActiveTab('search');
              } else {
                setActiveTab('discover');
              }
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              setActiveTab('discover');
            }}>
              <X size={20} color={PulseColors.dark.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {activeTab === 'search' && searchQuery.trim() ? (
        <View style={styles.searchResults}>
          {searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => `${item.type}-${item.id}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.searchResultsList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Search size={64} color={PulseColors.dark.border} />
              <Text style={styles.emptyStateTitle}>No results found</Text>
              <Text style={styles.emptyStateText}>
                Try searching for different keywords
              </Text>
            </View>
          )}
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.trendingSection}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={20} color={PulseColors.dark.accent} />
              <Text style={styles.sectionTitle}>Trending Topics</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topicsList}>
              {trendingTopics.map(({ tag, count }) => (
                <TouchableOpacity key={tag} style={styles.topicCard}>
                  <Text style={styles.topicTag}>#{tag}</Text>
                  <Text style={styles.topicCount}>{count} posts</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.quickAccess}>
            <Text style={styles.sectionTitleMain}>Quick Access</Text>
            <TouchableOpacity 
              style={styles.card}
              onPress={() => router.push('/pulse-news')}
            >
              <LinearGradient
                colors={['rgba(255, 0, 87, 0.15)', 'rgba(255, 0, 87, 0.05)']}
                style={styles.cardGradient}
              />
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <Newspaper size={32} color={PulseColors.dark.accent} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>Pulse News</Text>
                  <Text style={styles.cardDescription}>
                    AI-powered real-time news and trending topics
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.card}
              onPress={() => router.push('/challenges')}
            >
              <LinearGradient
                colors={['rgba(255, 193, 7, 0.15)', 'rgba(255, 193, 7, 0.05)']}
                style={styles.cardGradient}
              />
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <Trophy size={32} color={PulseColors.dark.warning} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>Challenges</Text>
                  <Text style={styles.cardDescription}>
                    Join viral challenges and win prizes
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.card}
              onPress={() => router.push('/marketplace')}
            >
              <LinearGradient
                colors={['rgba(255, 0, 87, 0.15)', 'rgba(255, 0, 87, 0.05)']}
                style={styles.cardGradient}
              />
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <ShoppingBag size={32} color={PulseColors.dark.accent} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>Marketplace</Text>
                  <Text style={styles.cardDescription}>
                    Discover local deals, buy and sell items
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.card}
              onPress={() => router.push('/pulse-map')}
            >
              <LinearGradient
                colors={['rgba(255, 0, 87, 0.15)', 'rgba(255, 0, 87, 0.05)']}
                style={styles.cardGradient}
              />
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <MapPin size={32} color={PulseColors.dark.accent} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>Pulse Map</Text>
                  <Text style={styles.cardDescription}>
                    Explore trending locations worldwide
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.popularPeople}>
            <Text style={styles.sectionTitleMain}>Popular Creators</Text>
            {allUsers.filter(u => u.verified).slice(0, 5).map(user => (
              <TouchableOpacity key={user.id} style={styles.userCard}>
                <View style={styles.userAvatar}>
                  <Users size={20} color={PulseColors.dark.accent} />
                </View>
                <View style={styles.userInfo}>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userName}>{user.displayName}</Text>
                    {user.verified && (
                      <View style={styles.verifiedBadgeSmall}>
                        <Text style={styles.verifiedIconSmall}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.userUsername}>@{user.username}</Text>
                </View>
                <TouchableOpacity style={styles.followButtonSmall}>
                  <Text style={styles.followButtonTextSmall}>Follow</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: PulseColors.dark.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
  },
  cardGradient: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 0, 87, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: PulseColors.dark.accent,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: PulseColors.dark.text,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
    lineHeight: 20,
  },
  infoSection: {
    marginTop: 24,
    padding: 20,
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: PulseColors.dark.text,
    marginBottom: 16,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PulseColors.dark.accent,
  },
  infoText: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: PulseColors.dark.surface,
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PulseColors.dark.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: PulseColors.dark.text,
  },
  searchResults: {
    flex: 1,
  },
  searchResultsList: {
    padding: 16,
  },
  searchResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  searchResultIcon: {
    width: 48,
    height: 48,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 0, 87, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: PulseColors.dark.accent,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: PulseColors.dark.accent,
  },
  communityIcon: {
    fontSize: 24,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  searchResultTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  searchResultSubtitle: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
  },
  verifiedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: PulseColors.dark.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedIcon: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: PulseColors.dark.accent,
    borderRadius: 20,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
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
  },
  trendingSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  sectionTitleMain: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: PulseColors.dark.text,
    marginBottom: 16,
  },
  topicsList: {
    flexDirection: 'row',
  },
  topicCard: {
    backgroundColor: 'rgba(255, 0, 87, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: PulseColors.dark.accent,
    minWidth: 120,
  },
  topicTag: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.accentLight,
    marginBottom: 4,
  },
  topicCount: {
    fontSize: 12,
    color: PulseColors.dark.textSecondary,
  },
  quickAccess: {
    marginBottom: 24,
  },
  popularPeople: {
    marginBottom: 24,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 0, 87, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: PulseColors.dark.accent,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  userUsername: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
  },
  verifiedBadgeSmall: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: PulseColors.dark.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedIconSmall: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  followButtonSmall: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: PulseColors.dark.accent,
    borderRadius: 16,
  },
  followButtonTextSmall: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
});
