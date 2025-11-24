import { supabase } from '../supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export const realtimeService = {
  subscribeToUserUpdates(userId: string, callback: (user: any) => void): RealtimeChannel {
    return supabase
      .channel(`user:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();
  },

  subscribeToPostUpdates(postId: string, callback: (post: any) => void): RealtimeChannel {
    return supabase
      .channel(`post:${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts',
          filter: `id=eq.${postId}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();
  },

  subscribeToNewPosts(callback: (post: any) => void): RealtimeChannel {
    return supabase
      .channel('new-posts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();
  },

  subscribeToComments(postId: string, callback: (comment: any) => void): RealtimeChannel {
    return supabase
      .channel(`comments:${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();
  },

  subscribeToMessages(userId: string, callback: (message: any) => void): RealtimeChannel {
    return supabase
      .channel(`messages:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();
  },

  subscribeToCommunityPosts(community: string, callback: (post: any) => void): RealtimeChannel {
    return supabase
      .channel(`community:${community}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: `community=eq.${community}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();
  },

  unsubscribe(channel: RealtimeChannel) {
    supabase.removeChannel(channel);
  },

  unsubscribeAll() {
    supabase.removeAllChannels();
  },
};
