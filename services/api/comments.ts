import { supabase } from '../supabase';

export const commentsService = {
  async createComment(comment: Record<string, any>) {
    const { data, error } = await supabase
      .from('comments')
      .insert([comment])
      .select(`
        *,
        user:users(*)
      `)
      .single();

    if (error) throw error;

    const { data: post } = await supabase
      .from('posts')
      .select('comments')
      .eq('id', comment.post_id)
      .single();

    if (post) {
      await supabase
        .from('posts')
        .update({ comments: (post.comments || 0) + 1 })
        .eq('id', comment.post_id);
    }

    return data;
  },

  async getPostComments(postId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:users(*)
      `)
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getCommentReplies(commentId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:users(*)
      `)
      .eq('parent_id', commentId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async updateComment(commentId: string, updates: Record<string, any>) {
    const { data, error } = await supabase
      .from('comments')
      .update(updates)
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteComment(commentId: string, postId: string) {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;

    const { data: post } = await supabase
      .from('posts')
      .select('comments')
      .eq('id', postId)
      .single();

    if (post) {
      await supabase
        .from('posts')
        .update({ comments: Math.max((post.comments || 0) - 1, 0) })
        .eq('id', postId);
    }
  },

  async likeComment(commentId: string, increment: number) {
    const { data, error } = await supabase
      .from('comments')
      .select('likes')
      .eq('id', commentId)
      .single();

    if (error) throw error;

    const newLikes = (data.likes || 0) + increment;
    const { error: updateError } = await supabase
      .from('comments')
      .update({ likes: newLikes })
      .eq('id', commentId);

    if (updateError) throw updateError;
    return newLikes;
  },
};
