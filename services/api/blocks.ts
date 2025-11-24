import { supabase } from '../supabase';

export const blocksService = {
  async blockUser(blockerId: string, blockedId: string) {
    const { data, error } = await supabase
      .from('blocks')
      .insert([{ blocker_id: blockerId, blocked_id: blockedId }])
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('follows')
      .delete()
      .or(`follower_id.eq.${blockerId},following_id.eq.${blockerId}`)
      .or(`follower_id.eq.${blockedId},following_id.eq.${blockedId}`);

    return data;
  },

  async unblockUser(blockerId: string, blockedId: string) {
    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId);

    if (error) throw error;
  },

  async isBlocked(blockerId: string, blockedId: string) {
    const { data, error } = await supabase
      .from('blocks')
      .select('id')
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },

  async getBlockedUsers(blockerId: string) {
    const { data, error } = await supabase
      .from('blocks')
      .select(`
        blocked_id,
        created_at,
        user:users!blocks_blocked_id_fkey(*)
      `)
      .eq('blocker_id', blockerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
