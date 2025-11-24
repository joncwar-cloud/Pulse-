import { Stack } from 'expo-router';
import { Flame, Trophy, Users, Eye, Calendar, Gift, Play } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { PulseColors } from '@/constants/colors';
import { mockChallenges } from '@/mocks/challenges';
import { Challenge } from '@/types';

export default function ChallengesScreen() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'ending'>('all');

  const filteredChallenges = mockChallenges.filter(challenge => {
    if (activeFilter === 'active') return challenge.isActive;
    if (activeFilter === 'ending') {
      const daysLeft = challenge.endDate 
        ? Math.ceil((challenge.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 999;
      return daysLeft <= 7 && challenge.isActive;
    }
    return true;
  });

  const renderChallengeCard = ({ item }: { item: Challenge }) => {
    const daysLeft = item.endDate 
      ? Math.ceil((item.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    return (
      <TouchableOpacity style={styles.challengeCard}>
        <View style={styles.challengeImageContainer}>
          <Image source={{ uri: item.thumbnailUrl }} style={styles.challengeImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.9)']}
            style={styles.challengeGradient}
          />
          {item.isActive && (
            <View style={styles.liveBadge}>
              <Flame size={14} color="#FF0057" />
              <Text style={styles.liveBadgeText}>ACTIVE</Text>
            </View>
          )}
          {item.prize && (
            <View style={styles.prizeBadge}>
              <Gift size={14} color="#FFC107" />
            </View>
          )}
          <View style={styles.challengeOverlay}>
            <View style={styles.creatorInfo}>
              <Image source={{ uri: item.creator.avatar }} style={styles.creatorAvatar} />
              <Text style={styles.creatorName}>{item.creator.displayName}</Text>
              {item.creator.verified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedIcon}>✓</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.challengeInfo}>
          <Text style={styles.challengeTitle}>{item.title}</Text>
          <Text style={styles.challengeHashtag}>#{item.hashtag}</Text>
          <Text style={styles.challengeDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.challengeStats}>
            <View style={styles.statItem}>
              <Users size={16} color={PulseColors.dark.accent} />
              <Text style={styles.statText}>
                {(item.participantCount / 1000).toFixed(1)}K
              </Text>
            </View>
            <View style={styles.statItem}>
              <Eye size={16} color={PulseColors.dark.secondary} />
              <Text style={styles.statText}>
                {(item.viewCount / 1000000).toFixed(1)}M
              </Text>
            </View>
            {daysLeft !== null && (
              <View style={styles.statItem}>
                <Calendar size={16} color={PulseColors.dark.warning} />
                <Text style={styles.statText}>{daysLeft}d left</Text>
              </View>
            )}
          </View>

          {item.prize && (
            <View style={styles.prizeInfo}>
              <Gift size={16} color={PulseColors.dark.warning} />
              <Text style={styles.prizeText} numberOfLines={1}>
                {item.prize}
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.joinButton}>
            <Play size={18} color={PulseColors.dark.background} />
            <Text style={styles.joinButtonText}>Join Challenge</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Trophy size={28} color={PulseColors.dark.warning} />
        <Text style={styles.headerTitle}>Challenges</Text>
      </View>

      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'active' && styles.filterChipActive]}
            onPress={() => setActiveFilter('active')}
          >
            <Flame size={16} color={activeFilter === 'active' ? PulseColors.dark.accent : PulseColors.dark.textSecondary} />
            <Text style={[styles.filterText, activeFilter === 'active' && styles.filterTextActive]}>
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'ending' && styles.filterChipActive]}
            onPress={() => setActiveFilter('ending')}
          >
            <Calendar size={16} color={activeFilter === 'ending' ? PulseColors.dark.accent : PulseColors.dark.textSecondary} />
            <Text style={[styles.filterText, activeFilter === 'ending' && styles.filterTextActive]}>
              Ending Soon
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={filteredChallenges}
        renderItem={renderChallengeCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
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
  filterSection: {
    backgroundColor: PulseColors.dark.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: PulseColors.dark.background,
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
  },
  filterChipActive: {
    backgroundColor: 'rgba(255, 0, 87, 0.2)',
    borderColor: PulseColors.dark.accent,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
  },
  filterTextActive: {
    color: PulseColors.dark.accentLight,
    fontWeight: '700' as const,
  },
  list: {
    padding: 16,
    gap: 16,
  },
  challengeCard: {
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
  },
  challengeImageContainer: {
    position: 'relative' as const,
    width: '100%',
    height: 200,
  },
  challengeImage: {
    width: '100%',
    height: '100%',
  },
  challengeGradient: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  liveBadge: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 0, 87, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#FFF',
  },
  prizeBadge: {
    position: 'absolute' as const,
    top: 12,
    left: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 193, 7, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeOverlay: {
    position: 'absolute' as const,
    bottom: 12,
    left: 12,
    right: 12,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creatorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: PulseColors.dark.accent,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: PulseColors.dark.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedIcon: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  challengeInfo: {
    padding: 16,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: PulseColors.dark.text,
    marginBottom: 4,
  },
  challengeHashtag: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: PulseColors.dark.accent,
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  challengeStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: PulseColors.dark.text,
  },
  prizeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  prizeText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600' as const,
    color: PulseColors.dark.warning,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PulseColors.dark.accent,
    paddingVertical: 14,
    borderRadius: 12,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.background,
  },
});
