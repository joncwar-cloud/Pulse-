import { supabase } from '../supabase';

export const communitiesService = {
  async createCommunity(community: Record<string, any>) {
    const { data, error } = await supabase
      .from('communities')
      .insert([community])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getCommunity(communityId: string) {
    const { data, error } = await supabase
      .from('communities')
      .select(`
        *,
        creator:users(*)
      `)
      .eq('id', communityId)
      .single();

    if (error) throw error;
    return data;
  },

  async getCommunityByName(name: string) {
    const { data, error } = await supabase
      .from('communities')
      .select(`
        *,
        creator:users(*)
      `)
      .eq('name', name)
      .single();

    if (error) throw error;
    return data;
  },

  async getAllCommunities(limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .order('member_count', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  },

  async searchCommunities(query: string, limit = 20) {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async updateCommunity(communityId: string, updates: Record<string, any>) {
    const { data, error } = await supabase
      .from('communities')
      .update(updates)
      .eq('id', communityId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCommunity(communityId: string) {
    const { error } = await supabase
      .from('communities')
      .delete()
      .eq('id', communityId);

    if (error) throw error;
  },

  async getCommunitiesByCategory(category: string) {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .eq('category', category)
      .order('member_count', { ascending: false });

    if (error) throw error;
    return data;
  },
};
