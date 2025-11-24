import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Community } from '@/types';
import { mockCommunities } from '@/mocks/appData';

const STORAGE_KEY_COMMUNITIES = 'user_communities';
const STORAGE_KEY_JOINED = 'joined_communities';

export const [CommunityProvider, useCommunities] = createContextHook(() => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [joinedCommunityIds, setJoinedCommunityIds] = useState<Set<string>>(new Set());

  const communitiesQuery = useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_COMMUNITIES);
        let customCommunities = [];
        if (stored) {
          try {
            customCommunities = JSON.parse(stored);
          } catch (parseError) {
            console.error('[CommunityContext] Error parsing communities:', parseError);
            await AsyncStorage.removeItem(STORAGE_KEY_COMMUNITIES);
          }
        }
        
        const allCommunities = [
          ...mockCommunities.map(c => ({
            ...c,
            creatorId: 'system',
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            isNSFW: false,
            pointsOfInterest: [],
            rules: `Welcome to ${c.name}! Please be respectful and follow community guidelines.`,
          })),
          ...customCommunities,
        ];
        
        return allCommunities;
      } catch (error) {
        console.error('[CommunityContext] Error loading communities:', error);
        return mockCommunities.map(c => ({
          ...c,
          creatorId: 'system',
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          isNSFW: false,
          pointsOfInterest: [],
          rules: `Welcome to ${c.name}! Please be respectful and follow community guidelines.`,
        }));
      }
    },
  });

  const joinedQuery = useQuery({
    queryKey: ['joinedCommunities'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_JOINED);
        if (!stored) return [];
        return JSON.parse(stored);
      } catch (error) {
        console.error('[CommunityContext] Error loading joined communities:', error);
        await AsyncStorage.removeItem(STORAGE_KEY_JOINED);
        return [];
      }
    },
  });

  const saveCommunityMutation = useMutation({
    mutationFn: async (newCommunity: Community) => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_COMMUNITIES);
        let existing = [];
        if (stored) {
          try {
            existing = JSON.parse(stored);
          } catch {
            console.error('[CommunityContext] Error parsing existing communities, resetting');
          }
        }
        const updated = [...existing, newCommunity];
        await AsyncStorage.setItem(STORAGE_KEY_COMMUNITIES, JSON.stringify(updated));
        return updated;
      } catch (error) {
        console.error('[CommunityContext] Error saving community:', error);
        throw error;
      }
    },
  });

  const saveJoinedMutation = useMutation({
    mutationFn: async (communityIds: string[]) => {
      await AsyncStorage.setItem(STORAGE_KEY_JOINED, JSON.stringify(communityIds));
      return communityIds;
    },
  });

  useEffect(() => {
    if (communitiesQuery.data) {
      setCommunities(communitiesQuery.data);
    }
  }, [communitiesQuery.data]);

  useEffect(() => {
    if (joinedQuery.data) {
      setJoinedCommunityIds(new Set(joinedQuery.data));
    }
  }, [joinedQuery.data]);

  const createCommunity = (communityData: Omit<Community, 'id' | 'memberCount' | 'createdAt'>) => {
    const newCommunity: Community = {
      ...communityData,
      id: `community_${Date.now()}`,
      memberCount: 1,
      createdAt: new Date(),
    };
    
    const updatedCommunities = [...communities, newCommunity];
    setCommunities(updatedCommunities);
    saveCommunityMutation.mutate(newCommunity);
    
    joinCommunity(newCommunity.id);
    
    return newCommunity;
  };

  const joinCommunity = (communityId: string) => {
    const newJoinedIds = new Set(joinedCommunityIds);
    newJoinedIds.add(communityId);
    setJoinedCommunityIds(newJoinedIds);
    saveJoinedMutation.mutate(Array.from(newJoinedIds));
    
    const updatedCommunities = communities.map(c =>
      c.id === communityId ? { ...c, memberCount: c.memberCount + 1, isJoined: true } : c
    );
    setCommunities(updatedCommunities);
  };

  const leaveCommunity = (communityId: string) => {
    const newJoinedIds = new Set(joinedCommunityIds);
    newJoinedIds.delete(communityId);
    setJoinedCommunityIds(newJoinedIds);
    saveJoinedMutation.mutate(Array.from(newJoinedIds));
    
    const updatedCommunities = communities.map(c =>
      c.id === communityId ? { ...c, memberCount: Math.max(0, c.memberCount - 1), isJoined: false } : c
    );
    setCommunities(updatedCommunities);
  };

  const getCommunitiesWithJoinStatus = () => {
    return communities.map(c => ({
      ...c,
      isJoined: joinedCommunityIds.has(c.id),
    }));
  };

  const getJoinedCommunities = () => {
    return communities.filter(c => joinedCommunityIds.has(c.id));
  };

  return {
    communities: getCommunitiesWithJoinStatus(),
    joinedCommunities: getJoinedCommunities(),
    createCommunity,
    joinCommunity,
    leaveCommunity,
    isLoading: communitiesQuery.isLoading || joinedQuery.isLoading,
  };
});
