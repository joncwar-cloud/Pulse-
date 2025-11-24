import { Stack, useRouter } from 'expo-router';
import { Users, TrendingUp, Plus } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PulseColors } from '@/constants/colors';
import { useCommunities } from '@/contexts/CommunityContext';

export default function CommunitiesScreen() {
  const router = useRouter();
  const { communities, joinCommunity, leaveCommunity } = useCommunities();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCommunities = communities.filter((community) =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinToggle = (communityId: string, isJoined: boolean) => {
    if (isJoined) {
      leaveCommunity(communityId);
    } else {
      joinCommunity(communityId);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Users size={28} color={PulseColors.dark.accent} />
        <Text style={styles.headerTitle}>Communities</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/create-community')}
        >
          <Plus size={20} color='#FFFFFF' />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search communities..."
          placeholderTextColor={PulseColors.dark.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color={PulseColors.dark.accent} />
            <Text style={styles.sectionTitle}>Popular Communities</Text>
          </View>

          {filteredCommunities.map((community) => (
            <TouchableOpacity key={community.id} style={styles.communityCard}>
              <View style={styles.communityIcon}>
                <Text style={styles.communityIconText}>{community.icon}</Text>
              </View>
              <View style={styles.communityInfo}>
                <Text style={styles.communityName}>{community.name}</Text>
                <Text style={styles.communityDescription} numberOfLines={1}>
                  {community.description}
                </Text>
                <Text style={styles.communityStats}>
                  {community.memberCount.toLocaleString()} members {' • '} {community.category}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.joinButton,
                  community.isJoined && styles.joinedButton,
                ]}
                onPress={() => handleJoinToggle(community.id, community.isJoined || false)}
              >
                <Text style={[
                  styles.joinButtonText,
                  community.isJoined && styles.joinedButtonText,
                ]}>
                  {community.isJoined ? 'Joined' : 'Join'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
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
  searchSection: {
    padding: 16,
    backgroundColor: PulseColors.dark.surface,
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
  },
  searchInput: {
    backgroundColor: PulseColors.dark.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: PulseColors.dark.text,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  communityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
    gap: 12,
  },
  communityIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 0, 87, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityIconText: {
    fontSize: 28,
  },
  communityInfo: {
    flex: 1,
  },
  communityName: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
    marginBottom: 4,
  },
  communityDescription: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
    marginBottom: 4,
  },
  communityStats: {
    fontSize: 12,
    color: PulseColors.dark.textTertiary,
  },
  joinButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: PulseColors.dark.accent,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  createButton: {
    position: 'absolute' as const,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PulseColors.dark.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinedButton: {
    backgroundColor: PulseColors.dark.surface,
    borderWidth: 2,
    borderColor: PulseColors.dark.accent,
  },
  joinedButtonText: {
    color: PulseColors.dark.accent,
  },
});
