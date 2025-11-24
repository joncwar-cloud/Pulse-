import { Stack } from 'expo-router';
import {
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  BarChart3,
  Download,
  Crown,
  AlertCircle,
} from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@/contexts/UserContext';
import { useMonetization } from '@/contexts/MonetizationContext';
import { PulseColors } from '@/constants/colors';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { mockPosts } from '@/mocks/posts';

type TimeRange = '7d' | '30d' | '90d' | 'all';
type ChartMetric = 'views' | 'engagement' | 'earnings';

export default function CreatorDashboard() {
  const { user } = useUser();
  const { earnings, creatorSubscriptions } = useMonetization();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedMetric, setSelectedMetric] = useState<ChartMetric>('views');

  const userPosts = useMemo(() => {
    return mockPosts.filter((post) => post.user.id === user?.id).slice(0, 5);
  }, [user]);

  const stats = useMemo(() => {
    const totalViews = userPosts.reduce((sum, post) => sum + post.votes * 10, 0);
    const totalEngagement = userPosts.reduce(
      (sum, post) => sum + post.votes + post.comments + post.shares,
      0
    );
    const avgEngagementRate = userPosts.length > 0 ? totalEngagement / userPosts.length / 100 : 0;

    return {
      totalViews,
      totalEngagement,
      avgEngagementRate: avgEngagementRate.toFixed(1),
      topPost: userPosts.length > 0 ? userPosts[0] : null,
    };
  }, [userPosts]);

  const revenueBreakdown = useMemo(() => {
    const total = earnings.total;
    return [
      {
        label: 'Tips',
        value: earnings.tips,
        percentage: total > 0 ? (earnings.tips / total) * 100 : 0,
        color: PulseColors.dark.accent,
      },
      {
        label: 'Subscriptions',
        value: earnings.subscriptions,
        percentage: total > 0 ? (earnings.subscriptions / total) * 100 : 0,
        color: PulseColors.dark.secondary,
      },
      {
        label: 'Ad Revenue',
        value: earnings.adRevenue,
        percentage: total > 0 ? (earnings.adRevenue / total) * 100 : 0,
        color: PulseColors.dark.warning,
      },
      {
        label: 'Marketplace',
        value: earnings.marketplace,
        percentage: total > 0 ? (earnings.marketplace / total) * 100 : 0,
        color: PulseColors.dark.success,
      },
    ];
  }, [earnings]);

  const projectedMonthlyRevenue = useMemo(() => {
    const subscriberRevenue = creatorSubscriptions.length * 50 * 0.7;
    const estimatedTips = earnings.tips * 1.2;
    const estimatedAdRevenue = stats.totalViews * 0.002;
    return subscriberRevenue + estimatedTips + estimatedAdRevenue;
  }, [creatorSubscriptions, earnings, stats]);

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyState}>
          <TrendingUp size={64} color={PulseColors.dark.textTertiary} />
          <Text style={styles.emptyText}>Please log in to access Creator Dashboard</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (user.followers < 1000) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.emptyState}>
          <Crown size={64} color={PulseColors.dark.warning} />
          <Text style={styles.emptyTitle}>Creator Monetization Locked</Text>
          <Text style={styles.emptyText}>
            You need 1,000 followers to unlock creator monetization and start earning from your content. You can still create posts using the + button!
          </Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(user.followers / 1000) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {user.followers} / 1,000 followers ({Math.round((user.followers / 1000) * 100)}%)
            </Text>
            <Text style={styles.progressSubtext}>
              {1000 - user.followers} more followers to go!
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TrendingUp size={28} color={PulseColors.dark.accent} />
          <Text style={styles.headerTitle}>Creator Monetization</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['rgba(255, 0, 87, 0.3)', 'rgba(138, 43, 226, 0.3)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroHeader}>
            <View style={styles.tierBadge}>
              <Crown size={16} color={PulseColors.dark.warning} />
              <Text style={styles.tierText}>
                {user.creatorTier?.toUpperCase() || 'BASIC'}
              </Text>
            </View>
            <Text style={styles.subscriberCount}>
              {user.subscriberCount || 0} subscribers
            </Text>
          </View>

          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Eye size={24} color={PulseColors.dark.text} />
              <Text style={styles.heroStatValue}>{stats.totalViews.toLocaleString()}</Text>
              <Text style={styles.heroStatLabel}>Total Views</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Heart size={24} color={PulseColors.dark.accent} />
              <Text style={styles.heroStatValue}>{stats.totalEngagement.toLocaleString()}</Text>
              <Text style={styles.heroStatLabel}>Engagement</Text>
            </View>
            <View style={styles.heroStatItem}>
              <TrendingUp size={24} color={PulseColors.dark.secondary} />
              <Text style={styles.heroStatValue}>{stats.avgEngagementRate}%</Text>
              <Text style={styles.heroStatLabel}>Avg Rate</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign size={20} color={PulseColors.dark.warning} />
            <Text style={styles.sectionTitle}>Revenue Overview</Text>
          </View>

          <LinearGradient
            colors={['rgba(255, 193, 7, 0.2)', 'rgba(255, 152, 0, 0.2)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.revenueCard}
          >
            <Text style={styles.revenueLabel}>Total Lifetime Earnings</Text>
            <View style={styles.revenueRow}>
              <Text style={styles.revenueAmount}>${earnings.total.toFixed(2)}</Text>
              <View style={styles.revenueBadge}>
                <TrendingUp size={16} color={PulseColors.dark.success} />
                <Text style={styles.revenueBadgeText}>+12.5%</Text>
              </View>
            </View>
            <Text style={styles.revenueSubtext}>
              Projected this month: ${projectedMonthlyRevenue.toFixed(2)}
            </Text>
          </LinearGradient>

          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Revenue Breakdown</Text>
            {revenueBreakdown.map((item, index) => (
              <View key={index} style={styles.breakdownItem}>
                <View style={styles.breakdownHeader}>
                  <Text style={styles.breakdownLabel}>{item.label}</Text>
                  <Text style={styles.breakdownValue}>${item.value.toFixed(2)}</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.breakdownProgressBar,
                      {
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.breakdownPercentage}>{item.percentage.toFixed(1)}%</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <BarChart3 size={20} color={PulseColors.dark.secondary} />
            <Text style={styles.sectionTitle}>Analytics</Text>
            <View style={styles.spacer} />
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => {
                Alert.alert('Export Data', 'Export your analytics data as CSV or PDF?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Export CSV', onPress: () => console.log('[Creator] Exporting CSV') },
                  { text: 'Export PDF', onPress: () => console.log('[Creator] Exporting PDF') },
                ]);
              }}
            >
              <Download size={16} color={PulseColors.dark.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.timeRangeSelector}
          >
            {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((range) => (
              <TouchableOpacity
                key={range}
                style={[styles.timeRangeButton, timeRange === range && styles.timeRangeButtonActive]}
                onPress={() => setTimeRange(range)}
              >
                <Text
                  style={[
                    styles.timeRangeButtonText,
                    timeRange === range && styles.timeRangeButtonTextActive,
                  ]}
                >
                  {range === 'all' ? 'All Time' : range.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.analyticsGrid}>
            <TouchableOpacity
              style={[
                styles.analyticCard,
                selectedMetric === 'views' && styles.analyticCardActive,
              ]}
              onPress={() => setSelectedMetric('views')}
            >
              <Eye size={24} color={PulseColors.dark.secondary} />
              <Text style={styles.analyticValue}>{stats.totalViews.toLocaleString()}</Text>
              <Text style={styles.analyticLabel}>Views</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.analyticCard,
                selectedMetric === 'engagement' && styles.analyticCardActive,
              ]}
              onPress={() => setSelectedMetric('engagement')}
            >
              <Heart size={24} color={PulseColors.dark.accent} />
              <Text style={styles.analyticValue}>{stats.totalEngagement.toLocaleString()}</Text>
              <Text style={styles.analyticLabel}>Engagement</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.analyticCard,
                selectedMetric === 'earnings' && styles.analyticCardActive,
              ]}
              onPress={() => setSelectedMetric('earnings')}
            >
              <DollarSign size={24} color={PulseColors.dark.warning} />
              <Text style={styles.analyticValue}>${earnings.total.toFixed(0)}</Text>
              <Text style={styles.analyticLabel}>Earnings</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <BarChart3 size={20} color={PulseColors.dark.accent} />
            <Text style={styles.sectionTitle}>Top Performing Content</Text>
          </View>

          {userPosts.length === 0 ? (
            <View style={styles.emptyPostsCard}>
              <AlertCircle size={48} color={PulseColors.dark.textTertiary} />
              <Text style={styles.emptyPostsText}>No posts yet</Text>
              <Text style={styles.emptyPostsSubtext}>Create posts using the + button to see your top performing content here</Text>
            </View>
          ) : (
            userPosts.map((post) => (
              <View key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  {post.mediaUrl && (
                    <Image source={{ uri: post.thumbnailUrl || post.mediaUrl }} style={styles.postThumbnail} />
                  )}
                  <View style={styles.postInfo}>
                    <Text style={styles.postTitle} numberOfLines={2}>
                      {post.title || post.content}
                    </Text>
                    <Text style={styles.postDate}>
                      {new Date(post.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.postStats}>
                  <View style={styles.postStat}>
                    <Eye size={14} color={PulseColors.dark.textSecondary} />
                    <Text style={styles.postStatText}>{(post.votes * 10).toLocaleString()}</Text>
                  </View>
                  <View style={styles.postStat}>
                    <Heart size={14} color={PulseColors.dark.textSecondary} />
                    <Text style={styles.postStatText}>{post.votes.toLocaleString()}</Text>
                  </View>
                  <View style={styles.postStat}>
                    <MessageCircle size={14} color={PulseColors.dark.textSecondary} />
                    <Text style={styles.postStatText}>{post.comments}</Text>
                  </View>
                  <View style={styles.postStat}>
                    <Share2 size={14} color={PulseColors.dark.textSecondary} />
                    <Text style={styles.postStatText}>{post.shares}</Text>
                  </View>
                </View>

                <View style={styles.postActions}>
                  <TouchableOpacity
                    style={styles.postActionButton}
                    onPress={() => {
                      Alert.alert('View Analytics', `Detailed analytics for "${post.title || post.content}"`);
                    }}
                  >
                    <BarChart3 size={16} color={PulseColors.dark.accent} />
                    <Text style={styles.postActionText}>View Analytics</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.postActionButton}
                    onPress={() => {
                      Alert.alert('Earnings', 'View earnings from this post');
                    }}
                  >
                    <DollarSign size={16} color={PulseColors.dark.warning} />
                    <Text style={styles.postActionText}>Earnings</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={20} color={PulseColors.dark.secondary} />
            <Text style={styles.sectionTitle}>Audience Insights</Text>
          </View>

          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Top Locations</Text>
            <View style={styles.insightList}>
              <View style={styles.insightItem}>
                <Text style={styles.insightLabel}>🇺🇸 United States</Text>
                <Text style={styles.insightValue}>45%</Text>
              </View>
              <View style={styles.insightItem}>
                <Text style={styles.insightLabel}>🇬🇧 United Kingdom</Text>
                <Text style={styles.insightValue}>22%</Text>
              </View>
              <View style={styles.insightItem}>
                <Text style={styles.insightLabel}>🇯🇵 Japan</Text>
                <Text style={styles.insightValue}>15%</Text>
              </View>
            </View>
          </View>

          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Peak Activity Times</Text>
            <View style={styles.insightList}>
              <View style={styles.insightItem}>
                <Text style={styles.insightLabel}>🌅 6-9 PM</Text>
                <Text style={styles.insightValue}>38%</Text>
              </View>
              <View style={styles.insightItem}>
                <Text style={styles.insightLabel}>🌞 12-3 PM</Text>
                <Text style={styles.insightValue}>28%</Text>
              </View>
              <View style={styles.insightItem}>
                <Text style={styles.insightLabel}>🌙 9 PM-12 AM</Text>
                <Text style={styles.insightValue}>24%</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <AlertCircle size={20} color={PulseColors.dark.secondary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Creator Monetization Dashboard</Text>
            <Text style={styles.infoText}>
              This dashboard shows your earnings, revenue streams, and analytics. Use the + button in the tab bar to create new posts. Full monetization features like payouts and advanced analytics require backend integration.
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
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
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: PulseColors.dark.text,
  },
  emptyText: {
    fontSize: 16,
    color: PulseColors.dark.textSecondary,
    textAlign: 'center' as const,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: PulseColors.dark.warning,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  progressSubtext: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: PulseColors.dark.text,
  },
  createButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  heroCard: {
    margin: 16,
    padding: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: PulseColors.dark.accent,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PulseColors.dark.warning,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '900' as const,
    color: PulseColors.dark.warning,
  },
  subscriberCount: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  heroStatItem: {
    alignItems: 'center',
    gap: 8,
  },
  heroStatValue: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: PulseColors.dark.text,
  },
  heroStatLabel: {
    fontSize: 12,
    color: PulseColors.dark.textSecondary,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900' as const,
    color: PulseColors.dark.text,
  },
  spacer: {
    flex: 1,
  },
  downloadButton: {
    padding: 8,
  },
  revenueCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: PulseColors.dark.warning,
  },
  revenueLabel: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
    marginBottom: 8,
  },
  revenueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  revenueAmount: {
    fontSize: 40,
    fontWeight: '900' as const,
    color: PulseColors.dark.text,
  },
  revenueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(46, 213, 115, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  revenueBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: PulseColors.dark.success,
  },
  revenueSubtext: {
    fontSize: 13,
    color: PulseColors.dark.textSecondary,
  },
  breakdownCard: {
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
    marginBottom: 16,
  },
  breakdownItem: {
    marginBottom: 16,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: PulseColors.dark.border,
    borderRadius: 3,
    marginBottom: 4,
  },
  breakdownProgressBar: {
    height: '100%',
    borderRadius: 3,
  },
  breakdownPercentage: {
    fontSize: 12,
    color: PulseColors.dark.textTertiary,
    textAlign: 'right' as const,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: PulseColors.dark.surface,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
    marginRight: 8,
  },
  timeRangeButtonActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
    borderColor: PulseColors.dark.secondary,
  },
  timeRangeButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
  },
  timeRangeButtonTextActive: {
    color: PulseColors.dark.secondary,
    fontWeight: '700' as const,
  },
  analyticsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  analyticCard: {
    flex: 1,
    backgroundColor: PulseColors.dark.surface,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
  },
  analyticCardActive: {
    borderColor: PulseColors.dark.accent,
    backgroundColor: 'rgba(255, 0, 87, 0.1)',
  },
  analyticValue: {
    fontSize: 20,
    fontWeight: '900' as const,
    color: PulseColors.dark.text,
  },
  analyticLabel: {
    fontSize: 12,
    color: PulseColors.dark.textSecondary,
  },
  emptyPostsCard: {
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  emptyPostsText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  emptyPostsSubtext: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
    textAlign: 'center' as const,
  },
  createFirstPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: PulseColors.dark.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  createFirstPostButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: PulseColors.dark.background,
  },
  postCard: {
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  postHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  postThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  postInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  postTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.text,
    marginBottom: 4,
  },
  postDate: {
    fontSize: 12,
    color: PulseColors.dark.textTertiary,
  },
  postStats: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: PulseColors.dark.border,
    marginBottom: 12,
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postStatText: {
    fontSize: 13,
    color: PulseColors.dark.textSecondary,
    fontWeight: '600' as const,
  },
  postActions: {
    flexDirection: 'row',
    gap: 8,
  },
  postActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: PulseColors.dark.background,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  postActionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: PulseColors.dark.text,
  },
  insightCard: {
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
    marginBottom: 16,
  },
  insightList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightLabel: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
  },
  insightValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: PulseColors.dark.secondary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: PulseColors.dark.textSecondary,
    lineHeight: 18,
  },
});
