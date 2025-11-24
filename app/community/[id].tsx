import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Users, TrendingUp, MessageCircle, Shield, Sparkles, Zap, Loader, Heart, Share2, CheckCircle, Crown } from 'lucide-react-native';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useMutation } from '@tanstack/react-query';
import { generateText } from '@rork-ai/toolkit-sdk';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { PulseColors } from '@/constants/colors';
import { useCommunities } from '@/contexts/CommunityContext';
import { mockPosts } from '@/mocks/posts';
import { Post } from '@/types';
import PostCard from '@/components/PostCard';



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
  const [aiGeneratedPosts, setAiGeneratedPosts] = useState<Post[]>([]);
  const [liked, setLiked] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const autoGenerateIntervalRef = useRef<number | null>(null);

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

  const communityPosts = useMemo(() => {
    const filtered = mockPosts.filter(post => 
      post.community?.toLowerCase() === community?.name.toLowerCase() ||
      post.tags.some(tag => tag.toLowerCase() === community?.name.toLowerCase())
    );
    return [...aiGeneratedPosts, ...filtered];
  }, [community, aiGeneratedPosts]);

  const handleJoinToggle = () => {
    if (!community) return;
    if (community.isJoined) {
      leaveCommunity(community.id);
    } else {
      joinCommunity(community.id);
    }
  };

  const handlePostPress = (post: Post) => {
    console.log('[Community] Post pressed:', post.id);
  };

  const handleLike = () => {
    setLiked(prev => !prev);
  };

  const handleShare = async () => {
    console.log('[Community] Share pressed');
  };

  const handleProfilePress = () => {
    console.log('[Community] Profile pressed');
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const generateAIPostMutation = useMutation({
    mutationFn: async () => {
      console.log('[AI Post Generation] Starting for community:', community?.name);
      
      const topics = community?.pointsOfInterest && community.pointsOfInterest.length > 0
        ? community.pointsOfInterest.join(', ')
        : community?.category || community?.name || 'general topics';

      const prompt = `You are an AI content creator for the "${community?.name}" community. 

Community Description: ${community?.description}
Topics: ${topics}

Create an engaging, informative post about recent news or interesting information related to these topics. The post should:
- Be 2-3 paragraphs long
- Include real information (search the web if needed for recent news)
- Be engaging and conversational
- Be relevant to the community's interests
- Include interesting facts or insights

Write the post content only, no title needed:`;

      console.log('[AI Post Generation] Generating with prompt:', prompt.substring(0, 100) + '...');
      const content = await generateText(prompt);
      console.log('[AI Post Generation] Success! Generated content length:', content.length);
      
      return content;
    },
    onSuccess: (content) => {
      console.log('[AI Post Generation] Adding to posts');
      
      const newPost: Post = {
        id: `ai_post_${Date.now()}`,
        user: {
          id: `ai_${community?.id}`,
          username: aiModerator?.name.toLowerCase().replace(/\s+/g, '_') || 'ai_moderator',
          displayName: aiModerator?.name || 'AI Moderator',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${aiModerator?.name}`,
          verified: true,
          isPremium: false,
        },
        type: 'text',
        content,
        timestamp: new Date(),
        votes: Math.floor(Math.random() * 100 + 50),
        comments: Math.floor(Math.random() * 20 + 5),
        shares: Math.floor(Math.random() * 10),
        rating: 'sfw',
        quality: 'high',
        tags: community?.pointsOfInterest?.slice(0, 3) || [community?.category || 'general'],
        community: community?.name,
      };
      
      setAiGeneratedPosts(prev => [newPost, ...prev]);
    },
    onError: (error) => {
      console.error('[AI Post Generation] Error:', error);
    },
  });

  useEffect(() => {
    if (!community || !aiModerator) return;

    console.log('[Auto AI Post] Setting up interval for community:', community.name);
    
    autoGenerateIntervalRef.current = setInterval(() => {
      console.log('[Auto AI Post] Generating post automatically');
      generateAIPostMutation.mutate();
    }, 60 * 60 * 1000) as unknown as number;

    generateAIPostMutation.mutate();

    return () => {
      if (autoGenerateIntervalRef.current) {
        console.log('[Auto AI Post] Cleaning up interval');
        clearInterval(autoGenerateIntervalRef.current);
      }
    };
  }, [community?.id, aiModerator]);

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

  const renderTextPost = (post: Post) => (
    <View style={styles.textPostCard}>
      <TouchableOpacity style={styles.textPostHeader} onPress={handleProfilePress}>
        <Image source={{ uri: post.user.avatar }} style={styles.textPostAvatar} />
        <View style={styles.textPostUserInfo}>
          <View style={styles.textPostNameRow}>
            <Text style={styles.textPostDisplayName}>{post.user.displayName}</Text>
            {post.user.verified && <CheckCircle size={14} color={PulseColors.dark.secondary} fill={PulseColors.dark.secondary} />}
            {post.user.isPremium && <Crown size={14} color={PulseColors.dark.warning} fill={PulseColors.dark.warning} />}
          </View>
          <Text style={styles.textPostUsername}>@{post.user.username}</Text>
        </View>
      </TouchableOpacity>
      
      <Text style={styles.textPostContent}>{post.content}</Text>
      
      {post.tags && post.tags.length > 0 && (
        <View style={styles.textPostTags}>
          {post.tags.slice(0, 3).map((tag) => (
            <Text key={tag} style={styles.textPostTag}>#{tag}</Text>
          ))}
        </View>
      )}
      
      <View style={styles.textPostActions}>
        <TouchableOpacity style={styles.textPostAction} onPress={handleLike}>
          <Heart
            size={20}
            color={liked ? PulseColors.dark.accent : PulseColors.dark.textSecondary}
            fill={liked ? PulseColors.dark.accent : 'transparent'}
          />
          <Text style={styles.textPostActionText}>{formatNumber(post.votes)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.textPostAction}>
          <MessageCircle size={20} color={PulseColors.dark.textSecondary} />
          <Text style={styles.textPostActionText}>{formatNumber(post.comments)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.textPostAction} onPress={handleShare}>
          <Share2 size={20} color={PulseColors.dark.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

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

      {activeTab === 'posts' ? (
        <FlatList
          ref={flatListRef}
          data={communityPosts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            item.type === 'text' ? renderTextPost(item) : (
              <PostCard
                post={item}
                onPress={() => handlePostPress(item)}
                isActive={false}
              />
            )
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.postsListContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MessageCircle size={48} color={PulseColors.dark.textSecondary} />
              <Text style={styles.emptyText}>No posts yet</Text>
              <Text style={styles.emptySubtext}>AI moderator will create posts automatically!</Text>
            </View>
          }
        />
      ) : (
        <ScrollView style={styles.aboutWrapper} showsVerticalScrollIndicator={false}>
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
              onPress={() => generateAIPostMutation.mutate()}
              disabled={generateAIPostMutation.isPending}
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
              {generateAIPostMutation.isPending ? (
                <ActivityIndicator size="small" color={aiModerator.color} />
              ) : (
                <Zap size={20} color={aiModerator.color} />
              )}
            </TouchableOpacity>
          )}

          {aiModerator && generateAIPostMutation.isPending && (
            <View style={styles.generatingBanner}>
              <Loader size={16} color={PulseColors.dark.accent} />
              <Text style={styles.generatingText}>
                {aiModerator.name} is generating a post...
              </Text>
            </View>
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
            style={[styles.tab, false && styles.activeTab]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.tabText, false && styles.activeTabText]}>
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, true && styles.activeTab]}
            onPress={() => setActiveTab('about')}
          >
            <Text style={[styles.tabText, true && styles.activeTabText]}>
              About
            </Text>
          </TouchableOpacity>
        </View>



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
  aboutWrapper: {
    flex: 1,
  },
  aboutScrollWrapper: {
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

  postsListContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
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
  generatingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 0, 87, 0.1)',
    borderRadius: 12,
    marginTop: 12,
    width: '100%',
  },
  generatingText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.text,
  },
  textPostCard: {
    backgroundColor: PulseColors.dark.surface,
    marginHorizontal: 0,
    marginBottom: 1,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
  },
  textPostHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  textPostAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  textPostUserInfo: {
    flex: 1,
  },
  textPostNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  textPostDisplayName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  textPostUsername: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
  },
  textPostContent: {
    fontSize: 15,
    lineHeight: 22,
    color: PulseColors.dark.text,
    marginBottom: 12,
  },
  textPostTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  textPostTag: {
    fontSize: 14,
    color: PulseColors.dark.accent,
    fontWeight: '600' as const,
  },
  textPostActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 48,
    paddingTop: 8,
  },
  textPostAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textPostActionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
  },
});
