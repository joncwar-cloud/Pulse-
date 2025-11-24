import { supabase } from '../supabase';

export const followsService = {
  async followUser(followerId: string, followingId: string) {
    const { data, error } = await supabase
      .from('follows')
      .insert([{ follower_id: followerId, following_id: followingId }])
      .select()
      .single();

    if (error) throw error;

    const [{ data: followingUser }, { data: followerUser }] = await Promise.all([
      supabase.from('users').select('followers').eq('id', followingId).single(),
      supabase.from('users').select('following').eq('id', followerId).single(),
    ]);

    await Promise.all([
      supabase.from('users').update({ followers: (followingUser?.followers || 0) + 1 }).eq('id', followingId),
      supabase.from('users').update({ following: (followerUser?.following || 0) + 1 }).eq('id', followerId),
    ]);

    return data;
  },

  async unfollowUser(followerId: string, followingId: string) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;

    const [{ data: followingUser }, { data: followerUser }] = await Promise.all([
      supabase.from('users').select('followers').eq('id', followingId).single(),
      supabase.from('users').select('following').eq('id', followerId).single(),
    ]);

    await Promise.all([
      supabase.from('users').update({ followers: Math.max((followingUser?.followers || 0) - 1, 0) }).eq('id', followingId),
      supabase.from('users').update({ following: Math.max((followerUser?.following || 0) - 1, 0) }).eq('id', followerId),
    ]);
  },

  async isFollowing(followerId: string, followingId: string) {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },

  async getFollowers(userId: string, limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        follower_id,
        created_at,
        user:users!follows_follower_id_fkey(*)
      `)
      .eq('following_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  },

  async getFollowing(userId: string, limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        following_id,
        created_at,
        user:users!follows_following_id_fkey(*)
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  },

  async getMutualFollows(userId1: string, userId2: string) {
    const [following1, following2] = await Promise.all([
      this.getFollowing(userId1),
      this.getFollowing(userId2),
    ]);

    const set1 = new Set(following1.map(f => f.following_id));
    const mutuals = following2.filter(f => set1.has(f.following_id));

    return mutuals;
  },
};
