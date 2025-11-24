import { Stack } from 'expo-router';
import { Trophy, Star, Lock } from 'lucide-react-native';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { PulseColors } from '@/constants/colors';
import { mockAchievements } from '@/mocks/achievements';
import { Achievement } from '@/types';

export default function AchievementsScreen() {
  const unlockedCount = mockAchievements.filter(a => a.unlocked).length;
  const totalCount = mockAchievements.length;
  const progressPercent = (unlockedCount / totalCount) * 100;

  const renderAchievement = (achievement: Achievement) => (
    <TouchableOpacity
      key={achievement.id}
      style={[
        styles.achievementCard,
        achievement.unlocked && styles.achievementCardUnlocked,
        !achievement.unlocked && styles.achievementCardLocked,
      ]}
    >
      {achievement.unlocked ? (
        <LinearGradient
          colors={['rgba(255, 215, 0, 0.2)', 'rgba(255, 0, 87, 0.2)']}
          style={styles.achievementGradient}
        />
      ) : null}

      <View style={[
        styles.achievementIcon,
        achievement.unlocked && styles.achievementIconUnlocked,
      ]}>
        {achievement.unlocked ? (
          <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
        ) : (
          <Lock size={24} color={PulseColors.dark.border} />
        )}
      </View>

      <View style={styles.achievementInfo}>
        <Text style={[
          styles.achievementTitle,
          !achievement.unlocked && styles.achievementTitleLocked,
        ]}>
          {achievement.title}
        </Text>
        <Text style={[
          styles.achievementDescription,
          !achievement.unlocked && styles.achievementDescriptionLocked,
        ]}>
          {achievement.description}
        </Text>

        {!achievement.unlocked && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(achievement.progress / achievement.requirement) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {achievement.progress} / {achievement.requirement}
            </Text>
          </View>
        )}

        {achievement.unlocked && achievement.unlockedAt && (
          <Text style={styles.unlockedDate}>
            Unlocked {achievement.unlockedAt.toLocaleDateString()}
          </Text>
        )}

        {achievement.reward && (
          <View style={styles.rewardRow}>
            {achievement.reward.coins && (
              <Text style={styles.rewardText}>🪙 {achievement.reward.coins} coins</Text>
            )}
            {achievement.reward.gems && (
              <Text style={styles.rewardText}>💎 {achievement.reward.gems} gems</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Trophy size={28} color={PulseColors.dark.accent} />
        <Text style={styles.headerTitle}>Achievements</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsCard}>
          <LinearGradient
            colors={['rgba(255, 0, 87, 0.2)', 'rgba(255, 215, 0, 0.2)']}
            style={styles.statsGradient}
          />
          <View style={styles.statsHeader}>
            <Trophy size={48} color={PulseColors.dark.warning} />
            <View style={styles.statsInfo}>
              <Text style={styles.statsValue}>
                {unlockedCount} / {totalCount}
              </Text>
              <Text style={styles.statsLabel}>Achievements Unlocked</Text>
            </View>
          </View>
          
          <View style={styles.progressBarLarge}>
            <View style={[styles.progressFillLarge, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressPercentage}>{Math.round(progressPercent)}% Complete</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Star size={20} color={PulseColors.dark.accent} />
            <Text style={styles.sectionTitle}>All Achievements</Text>
          </View>

          {mockAchievements.map(renderAchievement)}
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
  statsCard: {
    margin: 16,
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: PulseColors.dark.warning,
    overflow: 'hidden',
  },
  statsGradient: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  statsInfo: {
    flex: 1,
  },
  statsValue: {
    fontSize: 36,
    fontWeight: '900' as const,
    color: PulseColors.dark.text,
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
  },
  progressBarLarge: {
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFillLarge: {
    height: '100%',
    backgroundColor: PulseColors.dark.accent,
    borderRadius: 8,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.accent,
    textAlign: 'center' as const,
  },
  section: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: PulseColors.dark.text,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 16,
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
    overflow: 'hidden',
  },
  achievementCardUnlocked: {
    borderColor: PulseColors.dark.warning,
  },
  achievementCardLocked: {
    opacity: 0.6,
  },
  achievementGradient: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  achievementIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
  },
  achievementIconUnlocked: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: PulseColors.dark.warning,
  },
  achievementEmoji: {
    fontSize: 32,
  },
  achievementInfo: {
    flex: 1,
    gap: 6,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  achievementTitleLocked: {
    color: PulseColors.dark.textSecondary,
  },
  achievementDescription: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
    lineHeight: 20,
  },
  achievementDescriptionLocked: {
    color: PulseColors.dark.textTertiary,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: PulseColors.dark.accent,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: PulseColors.dark.textTertiary,
  },
  unlockedDate: {
    fontSize: 12,
    color: PulseColors.dark.textTertiary,
  },
  rewardRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  rewardText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: PulseColors.dark.warning,
  },
});
