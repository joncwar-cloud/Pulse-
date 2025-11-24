import { Stack, useRouter } from 'expo-router';
import {
  Shield,
  Eye,
  EyeOff,
  Brain,
  Baby,
  LogOut,
  User,
  DollarSign,
  TrendingUp,
  Crown,
  Wallet,
  Star,
  ShoppingBag,
  PlusCircle,
  Bell,
  Bookmark,
  BarChart3,
  Radio,
  Trophy,
  MessageCircle,
  Grid3X3,
  Heart,
  MessageSquare,
  Edit3,
} from 'lucide-react-native';
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useContentFilters } from '@/contexts/ContentFilterContext';
import { useUser } from '@/contexts/UserContext';
import { useMonetization } from '@/contexts/MonetizationContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { PulseColors } from '@/constants/colors';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { mockPosts } from '@/mocks/posts';
import { Post } from '@/types';

export default function ProfileScreen() {
  const router = useRouter();
  const { filters, toggleNSFW, toggleBrainrot, toggleChildrenMode } = useContentFilters();
  const { user, signOut } = useUser();
  const { wallet, subscription, earnings, isPremium, upgradeSubscription, purchaseCoins } = useMonetization();
  const { pushToken, notificationPermission, requestPermission, sendLocalNotification, badgeCount, clearBadgeCount } = useNotifications();

  const canAccessCreatorDashboard = user && user.followers >= 1000;

  const userPosts = useMemo<Post[]>(() => {
    if (!user) return [];
    return mockPosts.filter(post => post.user.id === user.id);
  }, [user]);


  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyState}>
          <User size={64} color={PulseColors.dark.textTertiary} />
          <Text style={styles.emptyText}>Please log in to view your profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false}} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <Text style={styles.displayName}>{user.displayName}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          {user.bio && (
            <Text style={styles.bio}>{user.bio}</Text>
          )}
          
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.posts}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => router.push('/edit-profile')}
            >
              <Edit3 size={20} color={PulseColors.dark.accent} />
              <Text style={styles.editProfileButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.createPostButton}
              onPress={() => {
                Alert.alert('Create Post', 'Choose content type:', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Text Post', onPress: () => console.log('[Profile] Creating text post') },
                  { text: 'Image Post', onPress: () => console.log('[Profile] Creating image post') },
                  { text: 'Video Post', onPress: () => console.log('[Profile] Creating video post') },
                ]);
              }}
            >
              <PlusCircle size={20} color={PulseColors.dark.background} />
              <Text style={styles.createPostButtonText}>Create Post</Text>
            </TouchableOpacity>

            {canAccessCreatorDashboard && (
              <TouchableOpacity
                style={styles.creatorDashboardButton}
                onPress={() => {
                  router.push('/creator');
                }}
              >
                <TrendingUp size={20} color={PulseColors.dark.accent} />
                <Text style={styles.creatorDashboardButtonText}>Studio</Text>
              </TouchableOpacity>
            )}

            {!canAccessCreatorDashboard && user.followers < 1000 && (
              <View style={styles.creatorProgressCard}>
                <Crown size={16} color={PulseColors.dark.warning} />
                <Text style={styles.creatorProgressText}>
                  {1000 - user.followers} more followers to unlock Creator Studio
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Grid3X3 size={20} color={PulseColors.dark.accent} />
            <Text style={styles.sectionTitle}>My Posts</Text>
            <Text style={styles.postCount}>({userPosts.length})</Text>
          </View>

          {userPosts.length === 0 ? (
            <View style={styles.emptyPostsCard}>
              <Text style={styles.emptyPostsText}>You haven&apos;t posted anything yet</Text>
              <TouchableOpacity
                style={styles.emptyPostsButton}
                onPress={() => router.push('/create')}
              >
                <Text style={styles.emptyPostsButtonText}>Create Your First Post</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.postsGrid}>
                {userPosts.map((post) => (
                  <TouchableOpacity key={post.id} style={styles.postCard}>
                    {post.mediaUrl && (
                      <Image source={{ uri: post.mediaUrl }} style={styles.postThumbnail} contentFit="cover" />
                    )}
                    {post.type === 'text' && !post.mediaUrl && (
                      <View style={styles.textPostPreview}>
                        <Text style={styles.textPostContent} numberOfLines={4}>
                          {post.content}
                        </Text>
                      </View>
                    )}
                    <View style={styles.postOverlay}>
                      <View style={styles.postStats}>
                        <View style={styles.postStat}>
                          <Heart size={14} color="#FFFFFF" />
                          <Text style={styles.postStatText}>{post.votes}</Text>
                        </View>
                        <View style={styles.postStat}>
                          <MessageSquare size={14} color="#FFFFFF" />
                          <Text style={styles.postStatText}>{post.comments}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Star size={20} color={PulseColors.dark.accent} />
            <Text style={styles.sectionTitle}>Quick Access</Text>  
          </View>

          <View style={styles.quickAccessGrid}>
            <TouchableOpacity
              style={styles.quickAccessButton}
              onPress={() => router.push('/notifications')}
            >
              <Bell size={24} color={PulseColors.dark.accent} />
              <Text style={styles.quickAccessText}>Notifications</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAccessButton}
              onPress={() => router.push('/saved')}
            >
              <Bookmark size={24} color={PulseColors.dark.accent} />
              <Text style={styles.quickAccessText}>Saved</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAccessButton}
              onPress={() => router.push('/live')}
            >
              <Radio size={24} color={PulseColors.dark.accent} />
              <Text style={styles.quickAccessText}>Live</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAccessButton}
              onPress={() => router.push('/achievements')}
            >
              <Trophy size={24} color={PulseColors.dark.accent} />
              <Text style={styles.quickAccessText}>Achievements</Text>
            </TouchableOpacity>

            {canAccessCreatorDashboard && (
              <TouchableOpacity
                style={styles.quickAccessButton}
                onPress={() => router.push('/analytics')}
              >
                <BarChart3 size={24} color={PulseColors.dark.accent} />
                <Text style={styles.quickAccessText}>Analytics</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.quickAccessButton}
              onPress={() => router.push('/messages')}
            >
              <MessageCircle size={24} color={PulseColors.dark.accent} />
              <Text style={styles.quickAccessText}>Messages</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Wallet size={20} color={PulseColors.dark.warning} />
            <Text style={styles.sectionTitle}>Wallet & Subscription</Text>
          </View>

          <LinearGradient
            colors={['rgba(255, 193, 7, 0.2)', 'rgba(255, 0, 87, 0.2)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.walletCard}
          >
            <View style={styles.walletHeader}>
              <View style={styles.walletInfo}>
                <Text style={styles.walletLabel}>Your Balance</Text>
                <View style={styles.coinRow}>
                  <DollarSign size={28} color={PulseColors.dark.warning} />
                  <Text style={styles.walletAmount}>{wallet.coins}</Text>
                  <Text style={styles.walletCurrency}>coins</Text>
                </View>
              </View>
              {isPremium && <Crown size={32} color={PulseColors.dark.warning} />}
            </View>
            <View style={styles.walletActions}>
              <TouchableOpacity
                style={styles.walletButton}
                onPress={() => {
                  Alert.alert(
                    'Buy Coins',
                    'Choose a coin package:',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: '100 coins - $0.99', onPress: () => purchaseCoins(100, 0.99) },
                      { text: '500 coins - $3.99', onPress: () => purchaseCoins(500, 3.99) },
                      { text: '1000 coins - $6.99', onPress: () => purchaseCoins(1000, 6.99) },
                    ]
                  );
                }}
              >
                <ShoppingBag size={18} color={PulseColors.dark.warning} />
                <Text style={styles.walletButtonText}>Buy Coins</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.walletButton}
                onPress={() => {
                  Alert.alert(
                    'Upgrade Subscription',
                    'Choose your plan:',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Basic - $4.99/mo', onPress: () => upgradeSubscription('basic') },
                      { text: 'Premium - $9.99/mo', onPress: () => upgradeSubscription('premium') },
                      { text: 'VIP - $19.99/mo', onPress: () => upgradeSubscription('vip') },
                    ]
                  );
                }}
              >
                <Star size={18} color={PulseColors.dark.accent} />
                <Text style={styles.walletButtonText}>Upgrade</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionHeader}>
              <Crown size={24} color={subscription.tier === 'free' ? PulseColors.dark.textTertiary : PulseColors.dark.warning} />
              <Text style={styles.subscriptionTier}>
                {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)} Plan
              </Text>
            </View>
            <View style={styles.featuresList}>
              {subscription.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.featureBullet}>•</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {canAccessCreatorDashboard && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={20} color={PulseColors.dark.secondary} />
              <Text style={styles.sectionTitle}>Creator Stats</Text>
            </View>

            <LinearGradient
              colors={['rgba(0, 229, 255, 0.2)', 'rgba(138, 43, 226, 0.2)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.earningsCard}
            >
              <Text style={styles.earningsLabel}>Total Earnings</Text>
              <View style={styles.earningsRow}>
                <DollarSign size={32} color={PulseColors.dark.secondary} />
                <Text style={styles.earningsAmount}>
                  {earnings.total.toFixed(2)}
                </Text>
              </View>
              <View style={styles.earningsBreakdown}>
                <View style={styles.earningsItem}>
                  <Text style={styles.earningsItemLabel}>Tips</Text>
                  <Text style={styles.earningsItemValue}>${earnings.tips.toFixed(2)}</Text>
                </View>
                <View style={styles.earningsItem}>
                  <Text style={styles.earningsItemLabel}>Subscriptions</Text>
                  <Text style={styles.earningsItemValue}>${earnings.subscriptions.toFixed(2)}</Text>
                </View>
                <View style={styles.earningsItem}>
                  <Text style={styles.earningsItemLabel}>Ads</Text>
                  <Text style={styles.earningsItemValue}>${earnings.adRevenue.toFixed(2)}</Text>
                </View>
                <View style={styles.earningsItem}>
                  <Text style={styles.earningsItemLabel}>Marketplace</Text>
                  <Text style={styles.earningsItemValue}>${earnings.marketplace.toFixed(2)}</Text>
                </View>
              </View>
            </LinearGradient>

            {user.creatorTier && (
              <View style={styles.creatorTierCard}>
                <Text style={styles.creatorTierLabel}>Creator Tier</Text>
                <Text style={styles.creatorTierValue}>
                  {user.creatorTier.charAt(0).toUpperCase() + user.creatorTier.slice(1)}
                </Text>
                <Text style={styles.creatorTierDescription}>
                  {user.creatorTier === 'basic' && 'Keep growing! Reach 1K followers for Pro tier.'}
                  {user.creatorTier === 'pro' && 'Great work! Reach 10K followers for Elite tier.'}
                  {user.creatorTier === 'elite' && 'You are among the top creators on Pulse!'}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color={PulseColors.dark.accent} />
            <Text style={styles.sectionTitle}>Push Notifications</Text>
          </View>

          <View style={styles.notificationCard}>
            <Text style={styles.notificationLabel}>Permission Status</Text>
            <Text style={styles.notificationStatus}>
              {notificationPermission?.granted ? '✓ Enabled' : '✗ Disabled'}
            </Text>
            
            {badgeCount > 0 && (
              <View style={styles.badgeInfo}>
                <Text style={styles.badgeInfoText}>
                  You have {badgeCount} unread notification{badgeCount > 1 ? 's' : ''}
                </Text>
                <TouchableOpacity onPress={clearBadgeCount} style={styles.clearBadgeButton}>
                  <Text style={styles.clearBadgeText}>Clear Badge</Text>
                </TouchableOpacity>
              </View>
            )}

            {!notificationPermission?.granted && (
              <TouchableOpacity
                style={styles.enableNotificationsButton}
                onPress={async () => {
                  const granted = await requestPermission();
                  if (granted) {
                    Alert.alert(
                      'Success!',
                      'Push notifications are now enabled. You\'ll receive notifications for likes, comments, and more.',
                      [{ text: 'OK' }]
                    );
                  } else {
                    Alert.alert(
                      'Permission Denied',
                      'Please enable notifications in your device settings to receive push notifications.',
                      [{ text: 'OK' }]
                    );
                  }
                }}
              >
                <Bell size={20} color={PulseColors.dark.background} />
                <Text style={styles.enableNotificationsButtonText}>Enable Push Notifications</Text>
              </TouchableOpacity>
            )}

            {notificationPermission?.granted && pushToken && (
              <View style={styles.notificationTestSection}>
                <Text style={styles.notificationTestLabel}>Test Notifications</Text>
                <TouchableOpacity
                  style={styles.testNotificationButton}
                  onPress={() => {
                    sendLocalNotification(
                      'Test Notification',
                      'This is a test notification from Pulse!',
                      { test: true }
                    );
                    Alert.alert('Sent!', 'Check your notifications.');
                  }}
                >
                  <Text style={styles.testNotificationButtonText}>Send Test Notification</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={20} color={PulseColors.dark.accent} />
            <Text style={styles.sectionTitle}>Content Filters</Text>
          </View>

          <View style={styles.filterDescription}>
            <Text style={styles.filterDescriptionText}>
              AI-powered content filtering to keep your feed clean and engaging
            </Text>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                {filters.showNSFW ? (
                  <Eye size={20} color={PulseColors.dark.error} />
                ) : (
                  <EyeOff size={20} color={PulseColors.dark.textSecondary} />
                )}
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>NSFW Content</Text>
                  <Text style={styles.settingDescription}>
                    {filters.showNSFW ? 'Showing adult content' : 'Hiding adult content'}
                  </Text>
                </View>
              </View>
              <Switch
                value={filters.showNSFW}
                onValueChange={toggleNSFW}
                disabled={filters.childrenMode}
                trackColor={{ false: PulseColors.dark.border, true: PulseColors.dark.error }}
                thumbColor={PulseColors.dark.text}
              />
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Brain size={20} color={PulseColors.dark.accent} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>AI Brainrot Blocker</Text>
                  <Text style={styles.settingDescription}>
                    {filters.blockBrainrot
                      ? 'AI filtering low-quality content'
                      : 'Showing all content types'}
                  </Text>
                </View>
              </View>
              <Switch
                value={filters.blockBrainrot}
                onValueChange={toggleBrainrot}
                trackColor={{ false: PulseColors.dark.border, true: PulseColors.dark.accent }}
                thumbColor={PulseColors.dark.text}
              />
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Baby size={20} color={PulseColors.dark.secondary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Children&apos;s Mode</Text>
                  <Text style={styles.settingDescription}>
                    {filters.childrenMode
                      ? 'Kid-safe content only'
                      : 'All ages content allowed'}
                  </Text>
                </View>
              </View>
              <Switch
                value={filters.childrenMode}
                onValueChange={toggleChildrenMode}
                trackColor={{ false: PulseColors.dark.border, true: PulseColors.dark.secondary }}
                thumbColor={PulseColors.dark.text}
              />
            </View>
          </View>

          {filters.childrenMode && (
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                Children&apos;s mode automatically enables Brainrot Blocker and disables NSFW content
                for a safe browsing experience.
              </Text>
            </View>
          )}

          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={() => console.log('[Settings] Privacy Policy')}>              <Text style={styles.legalLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.legalSeparator}>•</Text>
            <TouchableOpacity onPress={() => console.log('[Settings] Terms of Service')}>              <Text style={styles.legalLinkText}>Terms of Service</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={signOut}
          >
            <LogOut size={20} color={PulseColors.dark.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: PulseColors.dark.textSecondary,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: PulseColors.dark.accent,
    marginBottom: 16,
  },
  displayName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: PulseColors.dark.textSecondary,
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: PulseColors.dark.text,
    textAlign: 'center' as const,
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  statLabel: {
    fontSize: 13,
    color: PulseColors.dark.textSecondary,
    marginTop: 4,
  },
  actionButtons: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: PulseColors.dark.surface,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: PulseColors.dark.accent,
  },
  editProfileButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.accent,
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: PulseColors.dark.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  createPostButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.background,
  },
  creatorDashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: PulseColors.dark.surface,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: PulseColors.dark.accent,
  },
  creatorDashboardButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.accent,
  },
  creatorProgressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  creatorProgressText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: PulseColors.dark.warning,
    textAlign: 'center' as const,
  },
  filterDescription: {
    backgroundColor: 'rgba(255, 0, 87, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 87, 0.2)',
  },
  filterDescriptionText: {
    fontSize: 13,
    color: PulseColors.dark.accentLight,
    lineHeight: 18,
  },
  section: {
    padding: 16,
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
  settingCard: {
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: PulseColors.dark.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: PulseColors.dark.textSecondary,
  },
  infoCard: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  infoText: {
    fontSize: 13,
    color: PulseColors.dark.secondaryLight,
    lineHeight: 18,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: PulseColors.dark.error,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: PulseColors.dark.error,
  },
  walletCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: PulseColors.dark.warning,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
    marginBottom: 8,
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletAmount: {
    fontSize: 36,
    fontWeight: '900' as const,
    color: PulseColors.dark.text,
  },
  walletCurrency: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
    marginTop: 12,
  },
  walletActions: {
    flexDirection: 'row',
    gap: 12,
  },
  walletButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(10, 10, 11, 0.8)',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  walletButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  subscriptionCard: {
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  subscriptionTier: {
    fontSize: 20,
    fontWeight: '900' as const,
    color: PulseColors.dark.text,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 8,
  },
  featureBullet: {
    fontSize: 16,
    color: PulseColors.dark.accent,
    fontWeight: '700' as const,
  },
  featureText: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
    flex: 1,
  },
  earningsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: PulseColors.dark.secondary,
  },
  earningsLabel: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
    marginBottom: 8,
  },
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: '900' as const,
    color: PulseColors.dark.text,
  },
  earningsBreakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  earningsItem: {
    flex: 1,
    minWidth: '40%',
  },
  earningsItemLabel: {
    fontSize: 12,
    color: PulseColors.dark.textSecondary,
    marginBottom: 4,
  },
  earningsItemValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  creatorTierCard: {
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
    alignItems: 'center',
  },
  creatorTierLabel: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
    marginBottom: 8,
  },
  creatorTierValue: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: PulseColors.dark.secondary,
    marginBottom: 8,
  },
  creatorTierDescription: {
    fontSize: 13,
    color: PulseColors.dark.textSecondary,
    textAlign: 'center' as const,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAccessButton: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  quickAccessText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
    textAlign: 'center' as const,
  },
  postCount: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
    marginLeft: 'auto' as const,
  },
  postsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  postCard: {
    width: 160,
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: PulseColors.dark.surface,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  postThumbnail: {
    width: '100%',
    height: '100%',
  },
  textPostPreview: {
    width: '100%',
    height: '100%',
    padding: 16,
    backgroundColor: PulseColors.dark.surface,
  },
  textPostContent: {
    fontSize: 14,
    color: PulseColors.dark.text,
    lineHeight: 20,
  },
  postOverlay: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  postStats: {
    flexDirection: 'row',
    gap: 12,
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postStatText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  emptyPostsCard: {
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  emptyPostsText: {
    fontSize: 16,
    color: PulseColors.dark.textSecondary,
    marginBottom: 16,
    textAlign: 'center' as const,
  },
  emptyPostsButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: PulseColors.dark.accent,
  },
  emptyPostsButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  notificationCard: {
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
    gap: 16,
  },
  notificationLabel: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
    fontWeight: '600' as const,
  },
  notificationStatus: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  badgeInfo: {
    backgroundColor: 'rgba(255, 0, 87, 0.1)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 87, 0.2)',
  },
  badgeInfoText: {
    fontSize: 14,
    color: PulseColors.dark.text,
    marginBottom: 8,
  },
  clearBadgeButton: {
    alignSelf: 'flex-start' as const,
  },
  clearBadgeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.accent,
  },
  enableNotificationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: PulseColors.dark.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  enableNotificationsButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.background,
  },
  notificationTestSection: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    gap: 12,
  },
  notificationTestLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.secondaryLight,
  },
  testNotificationButton: {
    backgroundColor: PulseColors.dark.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  testNotificationButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.text,
    textAlign: 'center' as const,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: PulseColors.dark.border,
  },
  legalLinkText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
  },
  legalSeparator: {
    fontSize: 13,
    color: PulseColors.dark.textTertiary,
  },
});
