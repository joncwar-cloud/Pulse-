import { supabase } from '../supabase';
import { Challenge } from '@/types';

export const challengesService = {
  async createChallenge(challenge: {
    creator_id: string;
    title: string;
    description: string;
    hashtag: string;
    thumbnail_url?: string;
    end_date?: string;
    prize?: string;
  }) {
    console.log('[ChallengesService] Creating challenge:', challenge.title);
    const { data, error } = await supabase
      .from('challenges')
      .insert([{
        ...challenge,
        start_date: new Date().toISOString(),
        is_active: true,
        participant_count: 0,
        view_count: 0,
      }])
      .select()
      .single();

    if (error) {
      console.error('[ChallengesService] Error creating challenge:', JSON.stringify(error, null, 2));
      throw error;
    }
    return data;
  },

  async getChallenge(challengeId: string) {
    console.log('[ChallengesService] Fetching challenge:', challengeId);
    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        creator:users!challenges_creator_id_fkey(*)
      `)
      .eq('id', challengeId)
      .single();

    if (error) {
      console.error('[ChallengesService] Error fetching challenge:', JSON.stringify(error, null, 2));
      throw error;
    }
    return data;
  },

  async getChallenges(limit = 20, offset = 0): Promise<Challenge[]> {
    console.log('[ChallengesService] Fetching challenges');
    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        creator:users!challenges_creator_id_fkey(*)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[ChallengesService] Error fetching challenges:', JSON.stringify(error, null, 2));
      throw error;
    }
    
    return (data || []).map((challenge): Challenge => ({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      hashtag: challenge.hashtag,
      creator: {
        id: challenge.creator.id,
        username: challenge.creator.username,
        displayName: challenge.creator.display_name,
        avatar: challenge.creator.avatar,
        verified: challenge.creator.verified || false,
        isPremium: challenge.creator.is_premium || false,
      },
      thumbnailUrl: challenge.thumbnail_url || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=600&fit=crop',
      participantCount: challenge.participant_count || 0,
      viewCount: challenge.view_count || 0,
      startDate: new Date(challenge.start_date),
      endDate: challenge.end_date ? new Date(challenge.end_date) : undefined,
      prize: challenge.prize || undefined,
      isActive: challenge.is_active,
    }));
  },

  async getActiveChallenges(limit = 20): Promise<Challenge[]> {
    console.log('[ChallengesService] Fetching active challenges');
    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        creator:users!challenges_creator_id_fkey(*)
      `)
      .eq('is_active', true)
      .order('participant_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[ChallengesService] Error fetching active challenges:', JSON.stringify(error, null, 2));
      throw error;
    }
    
    return (data || []).map((challenge): Challenge => ({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      hashtag: challenge.hashtag,
      creator: {
        id: challenge.creator.id,
        username: challenge.creator.username,
        displayName: challenge.creator.display_name,
        avatar: challenge.creator.avatar,
        verified: challenge.creator.verified || false,
        isPremium: challenge.creator.is_premium || false,
      },
      thumbnailUrl: challenge.thumbnail_url || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=600&fit=crop',
      participantCount: challenge.participant_count || 0,
      viewCount: challenge.view_count || 0,
      startDate: new Date(challenge.start_date),
      endDate: challenge.end_date ? new Date(challenge.end_date) : undefined,
      prize: challenge.prize || undefined,
      isActive: challenge.is_active,
    }));
  },

  async getUserChallenges(userId: string, limit = 20) {
    console.log('[ChallengesService] Fetching user challenges:', userId);
    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        creator:users!challenges_creator_id_fkey(*)
      `)
      .eq('creator_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[ChallengesService] Error fetching user challenges:', JSON.stringify(error, null, 2));
      throw error;
    }
    
    return (data || []).map((challenge): Challenge => ({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      hashtag: challenge.hashtag,
      creator: {
        id: challenge.creator.id,
        username: challenge.creator.username,
        displayName: challenge.creator.display_name,
        avatar: challenge.creator.avatar,
        verified: challenge.creator.verified || false,
        isPremium: challenge.creator.is_premium || false,
      },
      thumbnailUrl: challenge.thumbnail_url || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=600&fit=crop',
      participantCount: challenge.participant_count || 0,
      viewCount: challenge.view_count || 0,
      startDate: new Date(challenge.start_date),
      endDate: challenge.end_date ? new Date(challenge.end_date) : undefined,
      prize: challenge.prize || undefined,
      isActive: challenge.is_active,
    }));
  },

  async updateChallenge(challengeId: string, updates: Record<string, any>) {
    console.log('[ChallengesService] Updating challenge:', challengeId);
    const { data, error } = await supabase
      .from('challenges')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', challengeId)
      .select()
      .single();

    if (error) {
      console.error('[ChallengesService] Error updating challenge:', JSON.stringify(error, null, 2));
      throw error;
    }
    return data;
  },

  async deleteChallenge(challengeId: string) {
    console.log('[ChallengesService] Deleting challenge:', challengeId);
    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', challengeId);

    if (error) {
      console.error('[ChallengesService] Error deleting challenge:', JSON.stringify(error, null, 2));
      throw error;
    }
  },

  async incrementViews(challengeId: string) {
    console.log('[ChallengesService] Incrementing views for challenge:', challengeId);
    const { data, error } = await supabase
      .from('challenges')
      .select('view_count')
      .eq('id', challengeId)
      .single();

    if (error) {
      console.error('[ChallengesService] Error fetching views:', JSON.stringify(error, null, 2));
      throw error;
    }

    const newViews = (data.view_count || 0) + 1;
    const { error: updateError } = await supabase
      .from('challenges')
      .update({ view_count: newViews })
      .eq('id', challengeId);

    if (updateError) {
      console.error('[ChallengesService] Error updating views:', JSON.stringify(updateError, null, 2));
      throw updateError;
    }
    return newViews;
  },

  async incrementParticipants(challengeId: string) {
    console.log('[ChallengesService] Incrementing participants for challenge:', challengeId);
    const { data, error } = await supabase
      .from('challenges')
      .select('participant_count')
      .eq('id', challengeId)
      .single();

    if (error) {
      console.error('[ChallengesService] Error fetching participants:', JSON.stringify(error, null, 2));
      throw error;
    }

    const newCount = (data.participant_count || 0) + 1;
    const { error: updateError } = await supabase
      .from('challenges')
      .update({ participant_count: newCount })
      .eq('id', challengeId);

    if (updateError) {
      console.error('[ChallengesService] Error updating participants:', JSON.stringify(updateError, null, 2));
      throw updateError;
    }
    return newCount;
  },
};
