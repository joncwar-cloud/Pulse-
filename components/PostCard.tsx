import { Image } from 'expo-image';
import { Heart, MessageCircle, Share2, CheckCircle, Crown, Bookmark, MapPin, DollarSign, Gift } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Dimensions, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Post } from '@/types';
import { PulseColors } from '@/constants/colors';
import { useMonetization } from '@/contexts/MonetizationContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PostCardProps {
  post: Post;
  onPress?: () => void;
  isActive?: boolean;
}

export default function PostCard({ post, onPress, isActive }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.votes || 0);
  const [showTipModal, setShowTipModal] = useState(false);
  const { wallet, sendTip, spendCoins } = useMonetization();

  const tipAmounts = [10, 25, 50, 100, 250, 500];

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const handleTip = (amount: number) => {
    if (wallet.coins < amount) {
      Alert.alert('Insufficient Coins', `You need ${amount} coins to send this tip. Buy more coins to support creators!`);
      return;
    }

    const success = sendTip({
      fromUserId: 'current_user',
      toUserId: post.user.id,
      postId: post.id,
      amount,
    });

    if (success) {
      Alert.alert('Tip Sent!', `You sent ${amount} coins to ${post.user.displayName}`);
      setShowTipModal(false);
    }
  };

  const handleSubscribe = () => {
    Alert.alert(
      'Subscribe to Creator',
      `Subscribe to ${post.user.displayName} for exclusive content and perks!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Bronze - 50 coins/mo',
          onPress: () => {
            if (spendCoins(50)) {
              Alert.alert('Subscribed!', `You are now subscribed to ${post.user.displayName}`);
            } else {
              Alert.alert('Insufficient Coins', 'Buy more coins to subscribe!');
            }
          },
        },
      ]
    );
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };



  if (!post) {
    return null;
  }

  return (
    <Pressable style={styles.container} onPress={onPress}>
      {post.mediaUrl && (
        <Image
          source={{ uri: post.type === 'video' ? post.thumbnailUrl : post.mediaUrl }}
          style={styles.backgroundMedia}
          contentFit="cover"
          placeholder={undefined}
        />
      )}
      
      <LinearGradient
        colors={['rgba(10, 10, 11, 0)', 'rgba(10, 10, 11, 0.7)', 'rgba(10, 10, 11, 0.95)']}
        style={styles.gradient}
      />

      <View style={styles.rightActions}>
        <View style={styles.actionContainer}>
          <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
        </View>

        <TouchableOpacity style={styles.actionContainer} onPress={handleLike}>
          <Heart
            size={32}
            color={liked ? PulseColors.dark.accent : PulseColors.dark.text}
            fill={liked ? PulseColors.dark.accent : 'transparent'}
          />
          <Text style={styles.actionCount}>{formatNumber(likeCount)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionContainer}>
          <MessageCircle size={32} color={PulseColors.dark.text} />
          <Text style={styles.actionCount}>{formatNumber(post.comments)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionContainer} onPress={() => setSaved(!saved)}>
          <Bookmark
            size={32}
            color={saved ? PulseColors.dark.warning : PulseColors.dark.text}
            fill={saved ? PulseColors.dark.warning : 'transparent'}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionContainer}>
          <Share2 size={32} color={PulseColors.dark.text} />
        </TouchableOpacity>

        {post.user.isPremium && (
          <TouchableOpacity style={styles.actionContainer} onPress={() => setShowTipModal(true)}>
            <Gift size={32} color={PulseColors.dark.warning} />
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showTipModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTipModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowTipModal(false)}>
          <Pressable style={styles.tipModal} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.tipModalTitle}>Send a Tip</Text>
            <Text style={styles.tipModalSubtitle}>
              Support {post.user.displayName} with coins
            </Text>
            <View style={styles.walletInfo}>
              <DollarSign size={16} color={PulseColors.dark.warning} />
              <Text style={styles.walletBalance}>{wallet.coins} coins</Text>
            </View>
            <View style={styles.tipOptions}>
              {tipAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={styles.tipButton}
                  onPress={() => handleTip(amount)}
                >
                  <Gift size={20} color={PulseColors.dark.warning} />
                  <Text style={styles.tipButtonText}>{amount}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {post.user.isPremium && (
              <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
                <Crown size={20} color={PulseColors.dark.warning} />
                <Text style={styles.subscribeButtonText}>Subscribe</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowTipModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <View style={styles.bottomContent}>
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.displayName}>{post.user.displayName}</Text>
              {post.user.verified && <CheckCircle size={16} color={PulseColors.dark.secondary} fill={PulseColors.dark.secondary} />}
              {post.user.isPremium && <Crown size={16} color={PulseColors.dark.warning} fill={PulseColors.dark.warning} />}
            </View>
            <Text style={styles.username}>@{post.user.username}</Text>
          </View>
        </View>

        {post.title && <Text style={styles.title}>{post.title}</Text>}
        <Text style={styles.content} numberOfLines={3}>{post.content}</Text>

        {post.location && (
          <View style={styles.locationBadge}>
            <MapPin size={14} color={PulseColors.dark.accent} />
            <Text style={styles.locationText}>
              {post.location.city}, {post.location.countryCode}
            </Text>
          </View>
        )}

        <View style={styles.tags}>
          {post.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: PulseColors.dark.background,
    position: 'relative' as const,
  },
  backgroundMedia: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  gradient: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  rightActions: {
    position: 'absolute' as const,
    right: 16,
    bottom: 120,
    alignItems: 'center',
    gap: 24,
  },
  actionContainer: {
    alignItems: 'center',
    gap: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: PulseColors.dark.text,
  },
  actionCount: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  bottomContent: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 80,
    padding: 20,
    paddingBottom: 100,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  username: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
  },
  title: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: PulseColors.dark.text,
    marginBottom: 10,
    lineHeight: 28,
    paddingRight: 8,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: PulseColors.dark.text,
    marginBottom: 12,
    paddingRight: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255, 0, 87, 0.35)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: PulseColors.dark.accent,
  },
  tagText: {
    fontSize: 15,
    color: PulseColors.dark.text,
    fontWeight: '800' as const,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 0, 87, 0.15)',
    borderRadius: 12,
    alignSelf: 'flex-start' as const,
    borderWidth: 1,
    borderColor: PulseColors.dark.accent,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: PulseColors.dark.accentLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  tipModal: {
    backgroundColor: PulseColors.dark.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  tipModalTitle: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: PulseColors.dark.text,
    marginBottom: 8,
  },
  tipModalSubtitle: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
    marginBottom: 20,
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 20,
    alignSelf: 'flex-start' as const,
  },
  walletBalance: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.warning,
  },
  tipOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  tipButton: {
    flex: 1,
    minWidth: '28%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: PulseColors.dark.warning,
  },
  tipButtonText: {
    fontSize: 18,
    fontWeight: '900' as const,
    color: PulseColors.dark.warning,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 193, 7, 0.3)',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: PulseColors.dark.warning,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '900' as const,
    color: PulseColors.dark.warning,
  },
  closeButton: {
    backgroundColor: PulseColors.dark.border,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
});
