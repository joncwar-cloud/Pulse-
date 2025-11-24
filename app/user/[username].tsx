import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, MoreVertical, UserPlus, UserCheck, MessageCircle, Share2, Lock } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PulseColors } from '@/constants/colors';
import { useUser } from '@/contexts/UserContext';
import { usersService } from '@/services/api/users';
import { postsService } from '@/services/api/posts';
import { followsService } from '@/services/api/follows';
import { Post } from '@/types';

const { width } = Dimensions.get('window');
const GRID_ITEM_SIZE = (width - 6) / 3;

type TabType = 'posts' | 'likes';

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const { user: currentUser } = useUser();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('posts');

  const profileQuery = useQuery({
    queryKey: ['user', username],
    queryFn: async () => {
      if (!username) throw new Error('Username required');
      return await usersService.getUserByUsername(username);
    },
    enabled: !!username,
  });

  const postsQuery = useQuery({
    queryKey: ['userPosts', profileQuery.data?.id],
    queryFn: async () => {
      if (!profileQuery.data?.id) return [];
      return await postsService.getUserPosts(profileQuery.data.id);
    },
    enabled: !!profileQuery.data?.id,
  });

  const followStatusQuery = useQuery({
    queryKey: ['followStatus', currentUser?.id, profileQuery.data?.id],
    queryFn: async () => {
      if (!currentUser?.id || !profileQuery.data?.id) return false;
      return await followsService.isFollowing(currentUser.id, profileQuery.data.id);
    },
    enabled: !!currentUser?.id && !!profileQuery.data?.id,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id || !profileQuery.data?.id) {
        throw new Error('User not authenticated');
      }
      if (followStatusQuery.data) {
        await followsService.unfollowUser(currentUser.id, profileQuery.data.id);
      } else {
        await followsService.followUser(currentUser.id, profileQuery.data.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followStatus', currentUser?.id, profileQuery.data?.id] });
      queryClient.invalidateQueries({ queryKey: ['user', username] });
    },
  });

  const profile = profileQuery.data;
  const isOwnProfile = currentUser?.id === profile?.id;
  const isFollowing = followStatusQuery.data;

  const handleFollowPress = () => {
    if (!currentUser) {
      Alert.alert('Sign In Required', 'Please sign in to follow users');
      return;
    }
    followMutation.mutate();
  };

  const handleMessagePress = () => {
    if (!profile) return;
    router.push(`/messages?userId=${profile.id}`);
  };

  const handleShare = async () => {
    Alert.alert('Share Profile', `Share @${username}'s profile`);
  };

  const handlePostPress = (post: Post) => {
    router.push(`/post/${post.id}`);
  };

  if (profileQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PulseColors.dark.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (profileQuery.error || !profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User not found</Text>
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
        <Text style={styles.headerUsername} numberOfLines={1}>@{profile.username}</Text>
        <TouchableOpacity style={styles.headerButton}>
          <MoreVertical size={24} color={PulseColors.dark.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[PulseColors.dark.accent, '#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <View style={styles.avatarInner}>
                <Image
                  source={{ uri: profile.avatar }}
                  style={styles.avatar}
                  contentFit="cover"
                />
              </View>
            </LinearGradient>
          </View>

          <Text style={styles.displayName}>{profile.display_name}</Text>
          <Text style={styles.username}>@{profile.username}</Text>

          {profile.bio && (
            <Text style={styles.bio}>{profile.bio}</Text>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.following || 0}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.followers || 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{postsQuery.data?.length || 0}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
          </View>

          {!isOwnProfile && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.followButton, isFollowing && styles.followingButton]}
                onPress={handleFollowPress}
                disabled={followMutation.isPending}
              >
                {followMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    {isFollowing ? (
                      <UserCheck size={18} color={PulseColors.dark.text} strokeWidth={2.5} />
                    ) : (
                      <UserPlus size={18} color="#FFFFFF" strokeWidth={2.5} />
                    )}
                    <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                      {isFollowing ? 'Following' : 'Follow'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.messageButton} onPress={handleMessagePress}>
                <MessageCircle size={18} color={PulseColors.dark.text} strokeWidth={2.5} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <Share2 size={18} color={PulseColors.dark.text} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          )}
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
            style={[styles.tab, activeTab === 'likes' && styles.activeTab]}
            onPress={() => setActiveTab('likes')}
          >
            <Lock size={14} color={PulseColors.dark.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'likes' && styles.activeTabText]}>
              Likes
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'posts' && (
          <View style={styles.gridContainer}>
            {postsQuery.isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={PulseColors.dark.accent} />
              </View>
            ) : postsQuery.data && postsQuery.data.length > 0 ? (
              <View style={styles.grid}>
                {postsQuery.data.map((post) => (
                  <TouchableOpacity
                    key={post.id}
                    style={styles.gridItem}
                    onPress={() => handlePostPress(post)}
                  >
                    {post.thumbnailUrl || post.mediaUrl ? (
                      <Image
                        source={{ uri: post.thumbnailUrl || post.mediaUrl }}
                        style={styles.gridImage}
                        contentFit="cover"
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
                <Text style={styles.emptyText}>No posts yet</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'likes' && (
          <View style={styles.emptyContainer}>
            <Lock size={48} color={PulseColors.dark.textSecondary} />
            <Text style={styles.emptyText}>Liked posts are private</Text>
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
  headerUsername: {
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
  },
  errorContainer: {
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarGradient: {
    width: 110,
    height: 110,
    borderRadius: 55,
    padding: 3,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 52,
    overflow: 'hidden',
    backgroundColor: PulseColors.dark.background,
    padding: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  displayName: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: PulseColors.dark.text,
    marginBottom: 4,
  },
  username: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: PulseColors.dark.textSecondary,
    marginBottom: 12,
  },
  bio: {
    fontSize: 15,
    color: PulseColors.dark.text,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: PulseColors.dark.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: PulseColors.dark.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: PulseColors.dark.border,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  followButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: PulseColors.dark.accent,
    gap: 6,
  },
  followingButton: {
    backgroundColor: PulseColors.dark.surface,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  followButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  followingButtonText: {
    color: PulseColors.dark.text,
  },
  messageButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: PulseColors.dark.surface,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  shareButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: PulseColors.dark.surface,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
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
    fontSize: 16,
    fontWeight: '500' as const,
    color: PulseColors.dark.textSecondary,
  },
});
