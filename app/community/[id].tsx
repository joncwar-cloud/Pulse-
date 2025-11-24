import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Users, TrendingUp, MessageCircle, Shield, Sparkles, ChevronRight } from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { PulseColors } from '@/constants/colors';
import { useCommunities } from '@/contexts/CommunityContext';
import { mockPosts } from '@/mocks/posts';
import { Post } from '@/types';

const { width } = Dimensions.get('window');
const GRID_ITEM_SIZE = (width - 6) / 3;

interface AIModeratorInfo {
  name: string;
  personality: string;
  avatar: string;
  color: string;
}

const AI_MODERATORS: Record<string, AIModeratorInfo> = {
  '1': { name: 'TechBot', personality: 'Professional & Informative', avatar: '🤖', color: '#3B82F6' },
  '2': { name: 'GameMaster AI', personality: 'Fun & Competitive', avatar: '🎯', color: '#8B5CF6' },
  '3': { name: 'FitBot Coach', personality: 'Motivational & Supportive', avatar: '💪', color: '#10B981' },
  '4': { name: 'ArtBot Curator', personality: 'Creative & Inspiring', avatar: '🎨', color: '#F59E0B' },
  '5': { name: 'ChefBot', personality: 'Friendly & Helpful', avatar: '👨‍🍳', color: '#EF4444' },
  '6': { name: 'TravelBot', personality: 'Adventurous & Knowledgeable', avatar: '🌍', color: '#06B6D4' },
};

type TabType = 'posts' | 'about';

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { communities, joinCommunity, leaveCommunity } = useCommunities();
  const [activeTab, setActiveTab] = useState<TabType>('posts');

  const community = useMemo(() => 
    communities.find(c => c.id === id),
    [communities, id]
  );

  const aiModerator = useMemo(() => 
    community && AI_MODERATORS[community.id] 
      ? AI_MODERATORS[community.id] 
      : null,
    [community]
  );

  const communityPosts = useMemo(() => 
    mockPosts.filter(post => 
      post.community?.toLowerCase() === community?.name.toLowerCase() ||
      post.tags.some(tag => tag.toLowerCase() === community?.name.toLowerCase())
    ).slice(0, 12),
    [community]
  );

  const handleJoinToggle = () => {
    if (!community) return;
    if (community.isJoined) {
      leaveCommunity(community.id);
    } else {
      joinCommunity(community.id);
    }
  };

  const handlePostPress = (post: Post) => {
    router.push(`/post/${post.id}`);
  };

  if (!community) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Community not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={PulseColors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{community.name}</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[aiModerator?.color || PulseColors.dark.accent, 'rgba(0,0,0,0)']}
          style={styles.coverGradient}
        />

        <View style={styles.communityHeader}>
          <View style={styles.communityIconContainer}>
            <Text style={styles.communityIconLarge}>{community.icon}</Text>
          </View>

          <Text style={styles.communityName}>{community.name}</Text>
          <Text style={styles.communityDescription}>{community.description}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Users size={20} color={PulseColors.dark.accent} />
              <Text style={styles.statValue}>{community.memberCount.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <TrendingUp size={20} color={PulseColors.dark.accent} />
              <Text style={styles.statValue}>{communityPosts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
          </View>

          {aiModerator && (
            <TouchableOpacity 
              style={[styles.moderatorCard, { borderColor: aiModerator.color }]}
              onPress={() => {}}
            >
              <View style={[styles.moderatorAvatar, { backgroundColor: aiModerator.color }]}>
                <Text style={styles.moderatorAvatarText}>{aiModerator.avatar}</Text>
              </View>
              <View style={styles.moderatorInfo}>
                <View style={styles.moderatorTitleRow}>
                  <Shield size={16} color={aiModerator.color} />
                  <Text style={styles.moderatorLabel}>AI Moderator</Text>
                  <Sparkles size={14} color={PulseColors.dark.warning} />
                </View>
                <Text style={styles.moderatorName}>{aiModerator.name}</Text>
                <Text style={styles.moderatorPersonality}>{aiModerator.personality}</Text>
              </View>
              <ChevronRight size={20} color={PulseColors.dark.textSecondary} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.joinButton, community.isJoined && styles.joinedButton]}
            onPress={handleJoinToggle}
          >
            <Users size={20} color={community.isJoined ? PulseColors.dark.text : '#FFFFFF'} />
            <Text style={[styles.joinButtonText, community.isJoined && styles.joinedButtonText]}>
              {community.isJoined ? 'Joined' : 'Join Community'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'about' && styles.activeTab]}
            onPress={() => setActiveTab('about')}
          >
            <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
              About
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'posts' && (
          <View style={styles.gridContainer}>
            {communityPosts.length > 0 ? (
              <View style={styles.grid}>
                {communityPosts.map((post) => (
                  <TouchableOpacity
                    key={post.id}
                    style={styles.gridItem}
                    onPress={() => handlePostPress(post)}
                  >
                    {post.thumbnailUrl || post.mediaUrl ? (
                      <Image
                        source={{ uri: post.thumbnailUrl || post.mediaUrl }}
                        style={styles.gridImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.gridImage, styles.gridPlaceholder]}>
                        <Text style={styles.gridPlaceholderText} numberOfLines={3}>
                          {post.content}
                        </Text>
                      </View>
                    )}
                    <View style={styles.gridOverlay}>
                      <Text style={styles.gridStats}>❤️ {post.votes}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <MessageCircle size={48} color={PulseColors.dark.textSecondary} />
                <Text style={styles.emptyText}>No posts yet</Text>
                <Text style={styles.emptySubtext}>Be the first to post in this community!</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'about' && (
          <View style={styles.aboutContainer}>
            <View style={styles.aboutSection}>
              <Text style={styles.aboutTitle}>Category</Text>
              <Text style={styles.aboutText}>{community.category}</Text>
            </View>

            <View style={styles.aboutSection}>
              <Text style={styles.aboutTitle}>Description</Text>
              <Text style={styles.aboutText}>{community.description}</Text>
            </View>

            {community.pointsOfInterest && community.pointsOfInterest.length > 0 && (
              <View style={styles.aboutSection}>
                <Text style={styles.aboutTitle}>Topics</Text>
                <View style={styles.tagsContainer}>
                  {community.pointsOfInterest.map((topic, index) => (
                    <View key={index} style={styles.topicTag}>
                      <Text style={styles.topicTagText}>{topic}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {community.rules && (
              <View style={styles.aboutSection}>
                <Text style={styles.aboutTitle}>Community Rules</Text>
                <Text style={styles.aboutText}>{community.rules}</Text>
              </View>
            )}

            {aiModerator && (
              <View style={styles.aboutSection}>
                <Text style={styles.aboutTitle}>AI Moderation</Text>
                <Text style={styles.aboutText}>
                  This community is moderated by {aiModerator.name}, an AI assistant that helps maintain a 
                  positive environment by filtering spam, enforcing rules, and providing helpful responses.
                </Text>
              </View>
            )}

            <View style={styles.aboutSection}>
              <Text style={styles.aboutTitle}>Created</Text>
              <Text style={styles.aboutText}>
                {new Date(community.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
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
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: PulseColors.dark.surface,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: PulseColors.dark.text,
  },
  coverGradient: {
    height: 200,
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    opacity: 0.3,
  },
  communityHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
  },
  communityIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: PulseColors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: PulseColors.dark.accent,
  },
  communityIconLarge: {
    fontSize: 48,
  },
  communityName: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: PulseColors.dark.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  communityDescription: {
    fontSize: 15,
    color: PulseColors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: PulseColors.dark.text,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: PulseColors.dark.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: PulseColors.dark.border,
  },
  moderatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    gap: 12,
  },
  moderatorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moderatorAvatarText: {
    fontSize: 28,
  },
  moderatorInfo: {
    flex: 1,
  },
  moderatorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  moderatorLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: PulseColors.dark.textSecondary,
    textTransform: 'uppercase' as const,
  },
  moderatorName: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: PulseColors.dark.text,
    marginBottom: 2,
  },
  moderatorPersonality: {
    fontSize: 13,
    color: PulseColors.dark.textSecondary,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: PulseColors.dark.accent,
    gap: 8,
  },
  joinedButton: {
    backgroundColor: PulseColors.dark.surface,
    borderWidth: 2,
    borderColor: PulseColors.dark.accent,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  joinedButtonText: {
    color: PulseColors.dark.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: PulseColors.dark.accent,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
  },
  activeTabText: {
    color: PulseColors.dark.text,
    fontWeight: '800' as const,
  },
  gridContainer: {
    minHeight: 400,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    position: 'relative' as const,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridPlaceholder: {
    backgroundColor: PulseColors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  gridPlaceholderText: {
    fontSize: 12,
    color: PulseColors.dark.textSecondary,
    textAlign: 'center',
  },
  gridOverlay: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  gridStats: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
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
    fontWeight: '700' as const,
    color: PulseColors.dark.textSecondary,
  },
  emptySubtext: {
    fontSize: 14,
    color: PulseColors.dark.textTertiary,
    textAlign: 'center',
  },
  aboutContainer: {
    padding: 20,
    gap: 24,
  },
  aboutSection: {
    gap: 8,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: PulseColors.dark.text,
  },
  aboutText: {
    fontSize: 15,
    lineHeight: 22,
    color: PulseColors.dark.textSecondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicTag: {
    backgroundColor: PulseColors.dark.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  topicTagText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.text,
  },
});
