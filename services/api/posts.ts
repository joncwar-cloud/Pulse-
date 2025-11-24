import { supabase } from '../supabase';
import { Post } from '@/types';

export const postsService = {
  async createPost(post: Record<string, any>) {
    const { data, error } = await supabase
      .from('posts')
      .insert([post])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPost(postId: string) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(*)
      `)
      .eq('id', postId)
      .single();

    if (error) throw error;
    return data;
  },

  async getFeed(limit = 20, offset = 0): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users!posts_user_id_fkey(*)
      `)
      .order('created_at', { ascending: false })
      .limit(limit * 3);

    if (error) throw error;
    
    const posts = (data || []).map((post): Post => ({
      id: post.id,
      user: {
        id: post.user.id,
        username: post.user.username,
        displayName: post.user.display_name,
        avatar: post.user.avatar,
        verified: post.user.verified || false,
        isPremium: post.user.is_premium || false,
      },
      type: post.type,
      title: post.title,
      content: post.content,
      mediaUrl: post.media_url,
      mediaUrls: post.media_urls,
      thumbnailUrl: post.thumbnail_url,
      community: post.community,
      location: post.location,
      timestamp: new Date(post.created_at),
      votes: post.votes || 0,
      comments: post.comments || 0,
      shares: post.shares || 0,
      rating: post.rating,
      quality: post.quality,
      tags: post.tags || [],
      isDuet: post.is_duet,
      originalPost: post.original_post,
      soundId: post.sound_id,
      soundName: post.sound_name,
      challengeId: post.challenge_id,
    }));

    const sortedPosts = posts.sort((a, b) => {
      const now = Date.now();
      const hoursSinceA = (now - a.timestamp.getTime()) / (1000 * 60 * 60);
      const hoursSinceB = (now - b.timestamp.getTime()) / (1000 * 60 * 60);
      
      const engagementA = (a.votes * 3) + (a.comments * 5) + (a.shares * 10);
      const engagementB = (b.votes * 3) + (b.comments * 5) + (b.shares * 10);
      
      const recencyA = Math.max(0, 100 - hoursSinceA);
      const recencyB = Math.max(0, 100 - hoursSinceB);
      
      const qualityBoostA = a.quality === 'high' ? 50 : a.quality === 'medium' ? 20 : 0;
      const qualityBoostB = b.quality === 'high' ? 50 : b.quality === 'medium' ? 20 : 0;
      
      const premiumBoostA = a.user.verified ? 30 : a.user.isPremium ? 15 : 0;
      const premiumBoostB = b.user.verified ? 30 : b.user.isPremium ? 15 : 0;
      
      const scoreA = engagementA + recencyA + qualityBoostA + premiumBoostA;
      const scoreB = engagementB + recencyB + qualityBoostB + premiumBoostB;
      
      return scoreB - scoreA;
    });

    return sortedPosts.slice(offset, offset + limit);
  },

  async getUserPosts(userId: string, limit = 20, offset = 0): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users!posts_user_id_fkey(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    
    return (data || []).map((post): Post => ({
      id: post.id,
      user: {
        id: post.user.id,
        username: post.user.username,
        displayName: post.user.display_name,
        avatar: post.user.avatar,
        verified: post.user.verified || false,
        isPremium: post.user.is_premium || false,
      },
      type: post.type,
      title: post.title,
      content: post.content,
      mediaUrl: post.media_url,
      mediaUrls: post.media_urls,
      thumbnailUrl: post.thumbnail_url,
      community: post.community,
      location: post.location,
      timestamp: new Date(post.created_at),
      votes: post.votes || 0,
      comments: post.comments || 0,
      shares: post.shares || 0,
      rating: post.rating,
      quality: post.quality,
      tags: post.tags || [],
      isDuet: post.is_duet,
      originalPost: post.original_post,
      soundId: post.sound_id,
      soundName: post.sound_name,
      challengeId: post.challenge_id,
    }));
  },

  async getCommunityPosts(community: string, limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(*)
      `)
      .eq('community', community)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  },

  async updatePost(postId: string, updates: Record<string, any>) {
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePost(postId: string) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
  },

  async votePost(postId: string, increment: number) {
    const { data, error } = await supabase
      .from('posts')
      .select('votes')
      .eq('id', postId)
      .single();

    if (error) throw error;

    const newVotes = (data.votes || 0) + increment;
    const { error: updateError } = await supabase
      .from('posts')
      .update({ votes: newVotes })
      .eq('id', postId);

    if (updateError) throw updateError;
    return newVotes;
  },

  async searchPosts(query: string, limit = 20) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(*)
      `)
      .or(`content.ilike.%${query}%,title.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getPostsByTag(tag: string, limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(*)
      `)
      .contains('tags', [tag])
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  },

  async getTrendingPosts(limit = 20): Promise<Post[]> {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users!posts_user_id_fkey(*)
      `)
      .gte('created_at', oneDayAgo.toISOString())
      .order('votes', { ascending: false })
      .limit(limit * 2);

    if (error) throw error;
    
    const posts = (data || []).map((post): Post => ({
      id: post.id,
      user: {
        id: post.user.id,
        username: post.user.username,
        displayName: post.user.display_name,
        avatar: post.user.avatar,
        verified: post.user.verified || false,
        isPremium: post.user.is_premium || false,
      },
      type: post.type,
      title: post.title,
      content: post.content,
      mediaUrl: post.media_url,
      mediaUrls: post.media_urls,
      thumbnailUrl: post.thumbnail_url,
      community: post.community,
      location: post.location,
      timestamp: new Date(post.created_at),
      votes: post.votes || 0,
      comments: post.comments || 0,
      shares: post.shares || 0,
      rating: post.rating,
      quality: post.quality,
      tags: post.tags || [],
      isDuet: post.is_duet,
      originalPost: post.original_post,
      soundId: post.sound_id,
      soundName: post.sound_name,
      challengeId: post.challenge_id,
    }));

    const trendingPosts = posts.sort((a, b) => {
      const engagementA = (a.votes * 2) + (a.comments * 3) + (a.shares * 5);
      const engagementB = (b.votes * 2) + (b.comments * 3) + (b.shares * 5);
      return engagementB - engagementA;
    });

    return trendingPosts.slice(0, limit);
  },

  async getTrendingTags(limit = 10): Promise<{ tag: string; count: number }[]> {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data, error } = await supabase
      .from('posts')
      .select('tags')
      .gte('created_at', oneDayAgo.toISOString())
      .not('tags', 'is', null);

    if (error) throw error;

    const tagCounts: Record<string, number> = {};
    (data || []).forEach((post) => {
      const tags = post.tags || [];
      tags.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const sortedTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return sortedTags;
  },
};
