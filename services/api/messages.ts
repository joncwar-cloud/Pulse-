import { supabase } from '../supabase';

export const messagesService = {
  async sendMessage(message: Record<string, any>) {
    const { data, error } = await supabase
      .from('messages')
      .insert([message])
      .select(`
        *,
        sender:users!messages_sender_id_fkey(*),
        recipient:users!messages_recipient_id_fkey(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async getConversation(userId1: string, userId2: string, limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(*),
        recipient:users!messages_recipient_id_fkey(*)
      `)
      .or(`and(sender_id.eq.${userId1},recipient_id.eq.${userId2}),and(sender_id.eq.${userId2},recipient_id.eq.${userId1})`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  },

  async getConversations(userId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(*),
        recipient:users!messages_recipient_id_fkey(*)
      `)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const conversationsMap = new Map();
    data.forEach(msg => {
      const otherId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
      if (!conversationsMap.has(otherId)) {
        conversationsMap.set(otherId, msg);
      }
    });

    return Array.from(conversationsMap.values());
  },

  async markAsRead(messageId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId);

    if (error) throw error;
  },

  async markConversationAsRead(userId: string, otherUserId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('sender_id', otherUserId)
      .eq('recipient_id', userId)
      .eq('read', false);

    if (error) throw error;
  },

  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  },

  subscribeToMessages(userId: string, callback: (message: any) => void) {
    return supabase
      .channel('messages')
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
};
