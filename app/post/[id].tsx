import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Heart, MessageCircle, Share2, Bookmark, Play, Volume2, VolumeX } from 'lucide-react-native';
import React, { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Image } from 'expo-image';
import { PulseColors } from '@/constants/colors';
import { mockPosts } from '@/mocks/posts';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const videoRef = useRef<Video>(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const post = useMemo(() => mockPosts.find(p => p.id === id), [id]);

  if (!post) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Post not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handlePlayPause = async () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = async () => {
    if (!videoRef.current) return;
    await videoRef.current.setIsMutedAsync(!isMuted);
    setIsMuted(!isMuted);
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={PulseColors.dark.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push(`/user/${post.user.username}`)}>
          <View style={styles.headerUserInfo}>
            <Image source={{ uri: post.user.avatar }} style={styles.headerAvatar} />
            <Text style={styles.headerUsername}>@{post.user.username}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.mediaContainer}>
          {post.type === 'video' && post.mediaUrl ? (
            <Pressable style={styles.videoWrapper} onPress={handlePlayPause}>
              <Video
                ref={videoRef}
                source={{ uri: post.mediaUrl }}
                style={styles.media}
                resizeMode={ResizeMode.COVER}
                isLooping
                shouldPlay={false}
                isMuted={isMuted}
                onPlaybackStatusUpdate={onPlaybackStatusUpdate}
              />
              <LinearGradient
                colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.6)']}
                style={styles.videoOverlay}
              />
              {!isPlaying && (
                <View style={styles.playButtonOverlay}>
                  <View style={styles.playButton}>
                    <Play size={40} color="#FFFFFF" fill="#FFFFFF" />
                  </View>
                </View>
              )}
              <TouchableOpacity style={styles.muteButton} onPress={handleMuteToggle}>
                {isMuted ? (
                  <VolumeX size={24} color="#FFFFFF" />
                ) : (
                  <Volume2 size={24} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </Pressable>
          ) : post.mediaUrl ? (
            <Image
              source={{ uri: post.mediaUrl }}
              style={styles.media}
              contentFit="cover"
            />
          ) : (
            <View style={styles.noMedia}>
              <Text style={styles.noMediaText}>Text Post</Text>
            </View>
          )}
        </View>

        <View style={styles.actionsBar}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setLiked(!liked)}
          >
            <Heart
              size={28}
              color={liked ? PulseColors.dark.accent : PulseColors.dark.text}
              fill={liked ? PulseColors.dark.accent : 'transparent'}
            />
            <Text style={styles.actionCount}>{post.votes + (liked ? 1 : 0)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={28} color={PulseColors.dark.text} />
            <Text style={styles.actionCount}>{post.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setSaved(!saved)}
          >
            <Bookmark
              size={28}
              color={saved ? PulseColors.dark.warning : PulseColors.dark.text}
              fill={saved ? PulseColors.dark.warning : 'transparent'}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={28} color={PulseColors.dark.text} />
            <Text style={styles.actionCount}>{post.shares}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentSection}>
          <TouchableOpacity 
            style={styles.userSection}
            onPress={() => router.push(`/user/${post.user.username}`)}
          >
            <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
            <View style={styles.userInfo}>
              <Text style={styles.displayName}>{post.user.displayName}</Text>
              <Text style={styles.username}>@{post.user.username}</Text>
            </View>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {post.title && (
            <Text style={styles.title}>{post.title}</Text>
          )}

          <Text style={styles.content}>{post.content}</Text>

          {post.tags.length > 0 && (
            <View style={styles.tags}>
              {post.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {post.location && (
            <View style={styles.locationSection}>
              <Text style={styles.locationText}>
                📍 {post.location.city}, {post.location.country}
              </Text>
            </View>
          )}

          <View style={styles.metaSection}>
            <Text style={styles.timestamp}>
              {new Date(post.timestamp).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments</Text>
          <View style={styles.emptyComments}>
            <MessageCircle size={48} color={PulseColors.dark.textSecondary} />
            <Text style={styles.emptyCommentsText}>No comments yet</Text>
            <Text style={styles.emptyCommentsSubtext}>Be the first to comment!</Text>
          </View>
        </View>
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
  headerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headerUsername: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  scrollView: {
    flex: 1,
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
  mediaContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.33,
    backgroundColor: PulseColors.dark.surface,
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative' as const,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  playButtonOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  muteButton: {
    position: 'absolute' as const,
    bottom: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noMedia: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noMediaText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 24,
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCount: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  contentSection: {
    padding: 20,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: PulseColors.dark.text,
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: PulseColors.dark.accent,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  title: {
    fontSize: 22,
    fontWeight: '900' as const,
    color: PulseColors.dark.text,
    marginBottom: 12,
    lineHeight: 30,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: PulseColors.dark.text,
    marginBottom: 16,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: 'rgba(255, 0, 87, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PulseColors.dark.accent,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: PulseColors.dark.accentLight,
  },
  locationSection: {
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
  },
  metaSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: PulseColors.dark.border,
  },
  timestamp: {
    fontSize: 13,
    color: PulseColors.dark.textTertiary,
  },
  commentsSection: {
    padding: 20,
    borderTopWidth: 8,
    borderTopColor: PulseColors.dark.border,
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: PulseColors.dark.text,
    marginBottom: 20,
  },
  emptyComments: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyCommentsText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
  },
  emptyCommentsSubtext: {
    fontSize: 14,
    color: PulseColors.dark.textTertiary,
  },
});
