import { Stack } from 'expo-router';
import { BarChart3, TrendingUp, Users, Eye, Heart, MessageCircle, DollarSign, Calendar } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { PulseColors } from '@/constants/colors';
import { useUser } from '@/contexts/UserContext';
import { Analytics } from '@/types';

const mockAnalytics: Analytics = {
  period: 'week',
  views: 125680,
  likes: 34520,
  comments: 8903,
  shares: 5621,
  followers: 1234,
  revenue: 3450.75,
  engagement: 27.8,
  demographics: {
    age: {
      '13-17': 15,
      '18-24': 45,
      '25-34': 25,
      '35-44': 10,
      '45+': 5,
    },
    gender: {
      'Male': 48,
      'Female': 50,
      'Other': 2,
    },
    location: {
      'United States': 35,
      'United Kingdom': 15,
      'Canada': 12,
      'Germany': 10,
      'Other': 28,
    },
  },
};

export default function AnalyticsScreen() {
  const { user } = useUser();
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');

  if (!user?.isCreator) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.emptyState}>
          <BarChart3 size={64} color={PulseColors.dark.border} />
          <Text style={styles.emptyStateTitle}>Creator Access Only</Text>
          <Text style={styles.emptyStateText}>
            You need to be a creator to access analytics
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <BarChart3 size={28} color={PulseColors.dark.accent} />
        <Text style={styles.headerTitle}>Analytics</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.periodSelector}>
          {(['day', 'week', 'month', 'year'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodButton, period === p && styles.periodButtonActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(255, 0, 87, 0.15)', 'rgba(255, 0, 87, 0.05)']}
              style={styles.statGradient}
            />
            <Eye size={24} color={PulseColors.dark.accent} />
            <Text style={styles.statValue}>{mockAnalytics.views.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Views</Text>
            <View style={styles.statChange}>
              <TrendingUp size={14} color="#00FF87" />
              <Text style={styles.statChangeText}>+12.5%</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(255, 0, 87, 0.15)', 'rgba(255, 0, 87, 0.05)']}
              style={styles.statGradient}
            />
            <Heart size={24} color={PulseColors.dark.accent} />
            <Text style={styles.statValue}>{mockAnalytics.likes.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Likes</Text>
            <View style={styles.statChange}>
              <TrendingUp size={14} color="#00FF87" />
              <Text style={styles.statChangeText}>+8.3%</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(255, 0, 87, 0.15)', 'rgba(255, 0, 87, 0.05)']}
              style={styles.statGradient}
            />
            <MessageCircle size={24} color={PulseColors.dark.accent} />
            <Text style={styles.statValue}>{mockAnalytics.comments.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Comments</Text>
            <View style={styles.statChange}>
              <TrendingUp size={14} color="#00FF87" />
              <Text style={styles.statChangeText}>+15.7%</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(255, 0, 87, 0.15)', 'rgba(255, 0, 87, 0.05)']}
              style={styles.statGradient}
            />
            <Users size={24} color={PulseColors.dark.accent} />
            <Text style={styles.statValue}>{mockAnalytics.followers.toLocaleString()}</Text>
            <Text style={styles.statLabel}>New Followers</Text>
            <View style={styles.statChange}>
              <TrendingUp size={14} color="#00FF87" />
              <Text style={styles.statChangeText}>+23.1%</Text>
            </View>
          </View>
        </View>

        <View style={styles.revenueCard}>
          <LinearGradient
            colors={['rgba(255, 215, 0, 0.2)', 'rgba(255, 215, 0, 0.05)']}
            style={styles.revenueGradient}
          />
          <View style={styles.revenueHeader}>
            <DollarSign size={32} color="#FFD700" />
            <View style={styles.revenueInfo}>
              <Text style={styles.revenueLabel}>Total Revenue</Text>
              <Text style={styles.revenueValue}>${mockAnalytics.revenue.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.revenueDivider} />
          <View style={styles.revenueBreakdown}>
            <View style={styles.revenueItem}>
              <Text style={styles.revenueItemLabel}>Tips</Text>
              <Text style={styles.revenueItemValue}>$1,245.30</Text>
            </View>
            <View style={styles.revenueItem}>
              <Text style={styles.revenueItemLabel}>Subscriptions</Text>
              <Text style={styles.revenueItemValue}>$1,876.45</Text>
            </View>
            <View style={styles.revenueItem}>
              <Text style={styles.revenueItemLabel}>Ad Revenue</Text>
              <Text style={styles.revenueItemValue}>$329.00</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Engagement Rate</Text>
          <View style={styles.engagementCard}>
            <Text style={styles.engagementValue}>{mockAnalytics.engagement}%</Text>
            <View style={styles.engagementBar}>
              <View style={[styles.engagementFill, { width: `${mockAnalytics.engagement}%` }]} />
            </View>
            <Text style={styles.engagementLabel}>Above average for your category</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Locations</Text>
          <View style={styles.demographicsCard}>
            {Object.entries(mockAnalytics.demographics.location).map(([location, percentage]) => (
              <View key={location} style={styles.demographicRow}>
                <Text style={styles.demographicLabel}>{location}</Text>
                <View style={styles.demographicBarContainer}>
                  <View style={[styles.demographicBar, { width: `${percentage}%` }]} />
                </View>
                <Text style={styles.demographicValue}>{percentage}%</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Age Demographics</Text>
          <View style={styles.demographicsCard}>
            {Object.entries(mockAnalytics.demographics.age).map(([age, percentage]) => (
              <View key={age} style={styles.demographicRow}>
                <Text style={styles.demographicLabel}>{age}</Text>
                <View style={styles.demographicBarContainer}>
                  <View style={[styles.demographicBar, { width: `${percentage}%` }]} />
                </View>
                <Text style={styles.demographicValue}>{percentage}%</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, { marginBottom: 40 }]}>
          <Text style={styles.sectionTitle}>Best Posting Times</Text>
          <View style={styles.timingCard}>
            <View style={styles.timingRow}>
              <Calendar size={20} color={PulseColors.dark.accent} />
              <View style={styles.timingInfo}>
                <Text style={styles.timingDay}>Weekdays</Text>
                <Text style={styles.timingTime}>2:00 PM - 5:00 PM</Text>
              </View>
            </View>
            <View style={styles.timingRow}>
              <Calendar size={20} color={PulseColors.dark.accent} />
              <View style={styles.timingInfo}>
                <Text style={styles.timingDay}>Weekends</Text>
                <Text style={styles.timingTime}>10:00 AM - 1:00 PM</Text>
              </View>
            </View>
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
  },
  periodSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: PulseColors.dark.surface,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: 'rgba(255, 0, 87, 0.2)',
    borderColor: PulseColors.dark.accent,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
  },
  periodTextActive: {
    color: PulseColors.dark.accentLight,
    fontWeight: '700' as const,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
    overflow: 'hidden',
  },
  statGradient: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: PulseColors.dark.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
    marginTop: 4,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  statChangeText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#00FF87',
  },
  revenueCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
    overflow: 'hidden',
  },
  revenueGradient: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  revenueInfo: {
    flex: 1,
  },
  revenueLabel: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#FFD700',
  },
  revenueDivider: {
    height: 1,
    backgroundColor: PulseColors.dark.border,
    marginVertical: 16,
  },
  revenueBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  revenueItem: {
    flex: 1,
  },
  revenueItemLabel: {
    fontSize: 12,
    color: PulseColors.dark.textSecondary,
    marginBottom: 4,
  },
  revenueItemValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: PulseColors.dark.text,
    marginBottom: 12,
  },
  engagementCard: {
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
    alignItems: 'center',
  },
  engagementValue: {
    fontSize: 48,
    fontWeight: '900' as const,
    color: PulseColors.dark.accent,
    marginBottom: 16,
  },
  engagementBar: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  engagementFill: {
    height: '100%',
    backgroundColor: PulseColors.dark.accent,
    borderRadius: 6,
  },
  engagementLabel: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
  },
  demographicsCard: {
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
    gap: 12,
  },
  demographicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  demographicLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.text,
    width: 100,
  },
  demographicBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  demographicBar: {
    height: '100%',
    backgroundColor: PulseColors.dark.accent,
    borderRadius: 4,
  },
  demographicValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: PulseColors.dark.accentLight,
    width: 45,
    textAlign: 'right' as const,
  },
  timingCard: {
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
    gap: 16,
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timingInfo: {
    flex: 1,
  },
  timingDay: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
    marginBottom: 4,
  },
  timingTime: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
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
