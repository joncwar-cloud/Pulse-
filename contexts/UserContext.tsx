import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { UserProfile, AuthProvider } from '@/types';

const STORAGE_KEY_USER = 'user_profile';
const STORAGE_KEY_ONBOARDED = 'has_onboarded';

export const [UserProvider, useUser] = createContextHook(() => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState<boolean | undefined>(undefined);

  const userQuery = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_USER);
        if (!stored) return null;
        return JSON.parse(stored);
      } catch (error) {
        console.error('[UserContext] Error loading user:', error);
        await AsyncStorage.removeItem(STORAGE_KEY_USER);
        return null;
      }
    },
  });

  const onboardedQuery = useQuery({
    queryKey: ['hasOnboarded'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_ONBOARDED);
        return stored === 'true';
      } catch (error) {
        console.error('[UserContext] Error loading onboarding status:', error);
        return false;
      }
    },
  });

  const saveUserMutation = useMutation({
    mutationFn: async (newUser: UserProfile) => {
      await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
      return newUser;
    },
  });

  const saveOnboardedMutation = useMutation({
    mutationFn: async (value: boolean) => {
      await AsyncStorage.setItem(STORAGE_KEY_ONBOARDED, value.toString());
      return value;
    },
  });

  useEffect(() => {
    if (userQuery.data !== undefined) {
      console.log('[UserContext] User data loaded:', userQuery.data);
      setUser(userQuery.data);
    }
  }, [userQuery.data]);

  useEffect(() => {
    if (onboardedQuery.data !== undefined) {
      console.log('[UserContext] Onboarding status:', onboardedQuery.data);
      setHasOnboarded(onboardedQuery.data);
    } else if (!onboardedQuery.isLoading && onboardedQuery.data === undefined) {
      console.log('[UserContext] No onboarding data, setting to false');
      setHasOnboarded(false);
    }
  }, [onboardedQuery.data, onboardedQuery.isLoading]);

  const signIn = (authProvider: AuthProvider) => {
    console.log('[UserContext] Signing in with:', authProvider);
    const mockUser: UserProfile = {
      id: `user_${Date.now()}`,
      username: `user${Math.floor(Math.random() * 10000)}`,
      displayName: 'Guest User',
      avatar: 'https://i.pravatar.cc/150?img=12',
      verified: false,
      isPremium: false,
      authProvider,
      interests: [],
      following: 128,
      followers: 546,
      posts: 23,
      isCreator: false,
      creatorTier: 'basic',
      walletBalance: 0,
      lifetimeEarnings: 0,
      subscriberCount: 12,
      monthlyRevenue: 0,
      followingUsers: [],
      blockedUsers: [],
    };
    setUser(mockUser);
    saveUserMutation.mutate(mockUser);
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY_USER);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    saveUserMutation.mutate(updated);
  };

  const completeOnboarding = (interests: string[], dateOfBirth: Date) => {
    console.log('[UserContext] Completing onboarding with interests:', interests);
    const age = new Date().getFullYear() - dateOfBirth.getFullYear();
    const shouldActivateChildMode = age < 18;
    console.log('[UserContext] User age:', age, 'Child mode:', shouldActivateChildMode);

    if (user) {
      updateProfile({
        interests,
        dateOfBirth,
      });
    }

    setHasOnboarded(true);
    saveOnboardedMutation.mutate(true);

    return shouldActivateChildMode;
  };

  const resetOnboarding = async () => {
    setHasOnboarded(false);
    await AsyncStorage.removeItem(STORAGE_KEY_ONBOARDED);
  };

  const followUser = (userId: string) => {
    if (!user) return;
    console.log('[UserContext] Following user:', userId);
    const followingUsers = user.followingUsers || [];
    if (followingUsers.includes(userId)) {
      console.log('[UserContext] Already following user');
      return;
    }
    const updated = {
      ...user,
      followingUsers: [...followingUsers, userId],
      following: user.following + 1,
    };
    setUser(updated);
    saveUserMutation.mutate(updated);
  };

  const unfollowUser = (userId: string) => {
    if (!user) return;
    console.log('[UserContext] Unfollowing user:', userId);
    const followingUsers = user.followingUsers || [];
    const updated = {
      ...user,
      followingUsers: followingUsers.filter(id => id !== userId),
      following: Math.max(0, user.following - 1),
    };
    setUser(updated);
    saveUserMutation.mutate(updated);
  };

  const blockUser = (userId: string) => {
    if (!user) return;
    console.log('[UserContext] Blocking user:', userId);
    const blockedUsers = user.blockedUsers || [];
    if (blockedUsers.includes(userId)) {
      console.log('[UserContext] User already blocked');
      return;
    }
    const followingUsers = user.followingUsers || [];
    const updated = {
      ...user,
      blockedUsers: [...blockedUsers, userId],
      followingUsers: followingUsers.filter(id => id !== userId),
      following: followingUsers.includes(userId) ? Math.max(0, user.following - 1) : user.following,
    };
    setUser(updated);
    saveUserMutation.mutate(updated);
  };

  const unblockUser = (userId: string) => {
    if (!user) return;
    console.log('[UserContext] Unblocking user:', userId);
    const blockedUsers = user.blockedUsers || [];
    const updated = {
      ...user,
      blockedUsers: blockedUsers.filter(id => id !== userId),
    };
    setUser(updated);
    saveUserMutation.mutate(updated);
  };

  const isFollowing = (userId: string): boolean => {
    if (!user) return false;
    return (user.followingUsers || []).includes(userId);
  };

  const isBlocked = (userId: string): boolean => {
    if (!user) return false;
    return (user.blockedUsers || []).includes(userId);
  };

  return {
    user,
    hasOnboarded,
    signIn,
    signOut,
    updateProfile,
    completeOnboarding,
    resetOnboarding,
    followUser,
    unfollowUser,
    blockUser,
    unblockUser,
    isFollowing,
    isBlocked,
    isLoading: userQuery.isLoading || onboardedQuery.isLoading,
  };
});
