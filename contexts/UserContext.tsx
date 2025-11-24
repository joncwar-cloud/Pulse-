import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { UserProfile, AuthProvider } from '@/types';
import { authService } from '@/services/api/auth';
import { User as SupabaseUser } from '@supabase/supabase-js';

const STORAGE_KEY_ONBOARDED = 'has_onboarded';

export const [UserProvider, useUser] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState<boolean | undefined>(undefined);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    console.log('[UserContext] Setting up auth listener');
    setAuthLoading(true);
    
    authService.getSession().then(async (session) => {
      console.log('[UserContext] Initial session:', session ? 'Found' : 'None');
      console.log('[UserContext] Session user ID:', session?.user?.id);
      if (session?.user) {
        setSupabaseUser(session.user);
        try {
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const profile = await authService.getUserProfile(session.user.id);
          console.log('[UserContext] Profile loaded:', profile ? 'Success' : 'Not found');
          console.log('[UserContext] Profile details:', JSON.stringify(profile, null, 2));
          
          if (profile) {
            const userProfile: UserProfile = {
              id: profile.id,
              username: profile.username,
              displayName: profile.display_name,
              email: profile.email,
              avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
              verified: profile.verified || false,
              isPremium: profile.is_premium || false,
              authProvider: (profile.auth_provider || 'email') as AuthProvider,
              interests: profile.interests || [],
              following: profile.following || 0,
              followers: profile.followers || 0,
              posts: profile.posts || 0,
              dateOfBirth: profile.date_of_birth ? new Date(profile.date_of_birth) : undefined,
              isCreator: profile.is_creator || false,
              creatorTier: profile.creator_tier || 'basic',
              walletBalance: profile.wallet_balance || 0,
              lifetimeEarnings: profile.lifetime_earnings || 0,
              subscriberCount: profile.subscriber_count || 0,
              monthlyRevenue: profile.monthly_revenue || 0,
              followingUsers: [],
              blockedUsers: [],
            };
            console.log('[UserContext] Setting user profile in state');
            setUser(userProfile);
          } else {
            console.log('[UserContext] No profile found, user needs to complete setup');
            setUser(null);
          }
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to load profile';
          console.error('[UserContext] Error loading profile:', errorMessage, error);
          console.error('[UserContext] Full error object:', JSON.stringify(error, null, 2));
          setUser(null);
        }
      } else {
        console.log('[UserContext] No session user, setting user to null');
        setUser(null);
      }
      setAuthLoading(false);
    }).catch(error => {
      console.error('[UserContext] Error getting initial session:', error);
      setAuthLoading(false);
      setUser(null);
    });

    const { data: { subscription } } = authService.onAuthStateChange(
      async (_event, session) => {
        console.log('[UserContext] Auth state changed:', _event);
        console.log('[UserContext] Auth state session user ID:', session?.user?.id);
        if (session?.user) {
          setSupabaseUser(session.user);
          try {
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const profile = await authService.getUserProfile(session.user.id);
            console.log('[UserContext] Profile in auth state change:', profile ? 'Found' : 'Not found');
            
            if (profile) {
              const userProfile: UserProfile = {
                id: profile.id,
                username: profile.username,
                displayName: profile.display_name,
                email: profile.email,
                avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
                verified: profile.verified || false,
                isPremium: profile.is_premium || false,
                authProvider: (profile.auth_provider || 'email') as AuthProvider,
                interests: profile.interests || [],
                following: profile.following || 0,
                followers: profile.followers || 0,
                posts: profile.posts || 0,
                dateOfBirth: profile.date_of_birth ? new Date(profile.date_of_birth) : undefined,
                isCreator: profile.is_creator || false,
                creatorTier: profile.creator_tier || 'basic',
                walletBalance: profile.wallet_balance || 0,
                lifetimeEarnings: profile.lifetime_earnings || 0,
                subscriberCount: profile.subscriber_count || 0,
                monthlyRevenue: profile.monthly_revenue || 0,
                followingUsers: [],
                blockedUsers: [],
              };
              console.log('[UserContext] Setting user from auth state change');
              setUser(userProfile);
            } else {
              console.log('[UserContext] No profile found in auth state change');
              setUser(null);
            }
          } catch (error: any) {
            const errorMessage = error?.message || 'Failed to load profile';
            console.error('[UserContext] Error loading profile in auth state change:', errorMessage, error);
            setUser(null);
          }
        } else {
          console.log('[UserContext] No session in auth state change');
          setUser(null);
          setSupabaseUser(null);
        }
        setAuthLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const onboardedQuery = useQuery({
    queryKey: ['hasOnboarded', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      try {
        const stored = await AsyncStorage.getItem(`${STORAGE_KEY_ONBOARDED}_${user.id}`);
        return stored === 'true';
      } catch (error) {
        console.error('[UserContext] Error loading onboarding status:', error);
        return false;
      }
    },
    enabled: !!user?.id,
  });

  const saveUserMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      const userId = user?.id || supabaseUser?.id;
      if (!userId) throw new Error('No user to update');
      const updated = await authService.updateUserProfile(userId, {
        username: updates.username,
        display_name: updates.displayName,
        avatar_url: updates.avatar,
        interests: updates.interests,
        date_of_birth: updates.dateOfBirth?.toISOString(),
        is_creator: updates.isCreator,
        creator_tier: updates.creatorTier,
      });
      return updated;
    },
  });

  const saveOnboardedMutation = useMutation({
    mutationFn: async (value: boolean) => {
      const userId = user?.id || supabaseUser?.id;
      if (!userId) throw new Error('No user to update');
      await AsyncStorage.setItem(`${STORAGE_KEY_ONBOARDED}_${userId}`, value.toString());
      return value;
    },
  });



  useEffect(() => {
    if (onboardedQuery.data !== undefined) {
      console.log('[UserContext] Onboarding status:', onboardedQuery.data);
      setHasOnboarded(onboardedQuery.data);
    } else if (!onboardedQuery.isLoading && onboardedQuery.data === undefined) {
      console.log('[UserContext] No onboarding data, setting to false');
      setHasOnboarded(false);
    }
  }, [onboardedQuery.data, onboardedQuery.isLoading]);

  const refreshUser = async () => {
    console.log('[UserContext] Refreshing user data');
    try {
      const session = await authService.getSession();
      if (session?.user) {
        const profile = await authService.getUserProfile(session.user.id);
        
        if (profile) {
          const userProfile: UserProfile = {
            id: profile.id,
            username: profile.username,
            displayName: profile.display_name,
            email: profile.email,
            avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
            verified: profile.verified || false,
            isPremium: profile.is_premium || false,
            authProvider: (profile.auth_provider || 'email') as AuthProvider,
            interests: profile.interests || [],
            following: profile.following || 0,
            followers: profile.followers || 0,
            posts: profile.posts || 0,
            dateOfBirth: profile.date_of_birth ? new Date(profile.date_of_birth) : undefined,
            isCreator: profile.is_creator || false,
            creatorTier: profile.creator_tier || 'basic',
            walletBalance: profile.wallet_balance || 0,
            lifetimeEarnings: profile.lifetime_earnings || 0,
            subscriberCount: profile.subscriber_count || 0,
            monthlyRevenue: profile.monthly_revenue || 0,
            followingUsers: [],
            blockedUsers: [],
          };
          setUser(userProfile);
        } else {
          setUser(null);
        }
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to refresh user';
      console.error('[UserContext] Error refreshing user:', errorMessage, error);
    }
  };

  const signOut = async () => {
    console.log('[UserContext] Signing out');
    try {
      await authService.signOut();
      setUser(null);
      setSupabaseUser(null);
      queryClient.clear();
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to sign out';
      console.error('[UserContext] Error signing out:', errorMessage, error);
      throw new Error(errorMessage);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user && !supabaseUser) return;
    console.log('[UserContext] Updating profile:', updates);
    
    if (user) {
      const updated = { ...user, ...updates };
      setUser(updated);
    }
    
    try {
      await saveUserMutation.mutateAsync(updates);
      await refreshUser();
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update profile';
      console.error('[UserContext] Error updating profile:', errorMessage, error);
      if (user) {
        setUser(user);
      }
      throw new Error(errorMessage);
    }
  };

  const completeOnboarding = async (interests: string[], dateOfBirth: Date) => {
    console.log('[UserContext] Completing onboarding with interests:', interests);
    const age = new Date().getFullYear() - dateOfBirth.getFullYear();
    const shouldActivateChildMode = age < 18;
    console.log('[UserContext] User age:', age, 'Child mode:', shouldActivateChildMode);

    if (user || supabaseUser) {
      await updateProfile({
        interests,
        dateOfBirth,
      });
    }

    setHasOnboarded(true);
    await saveOnboardedMutation.mutateAsync(true);

    return shouldActivateChildMode;
  };

  const resetOnboarding = async () => {
    if (!user?.id) return;
    setHasOnboarded(false);
    await AsyncStorage.removeItem(`${STORAGE_KEY_ONBOARDED}_${user.id}`);
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
    supabaseUser,
    hasOnboarded,
    signOut,
    updateProfile,
    refreshUser,
    completeOnboarding,
    resetOnboarding,
    followUser,
    unfollowUser,
    blockUser,
    unblockUser,
    isFollowing,
    isBlocked,
    isLoading: authLoading || onboardedQuery.isLoading,
  };
});
