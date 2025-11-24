import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Heart, CheckCircle, Crown, Send, X } from 'lucide-react-native';
import { PulseColors } from '@/constants/colors';
import { Comment } from '@/types';
import { mockComments } from '@/mocks/comments';

interface CommentViewerProps {
  postId: string;
  onClose: () => void;
}

export default function CommentViewer({ postId, onClose }: CommentViewerProps) {
  const [comments, setComments] = useState<Comment[]>(mockComments[postId] || []);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  const handleLikeComment = (commentId: string) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          hasLiked: !comment.hasLiked,
          likes: comment.hasLiked ? comment.likes - 1 : comment.likes + 1,
        };
      }
      
      if (comment.replies) {
        return {
          ...comment,
          replies: comment.replies.map(reply => {
            if (reply.id === commentId) {
              return {
                ...reply,
                hasLiked: !reply.hasLiked,
                likes: reply.hasLiked ? reply.likes - 1 : reply.likes + 1,
              };
            }
            return reply;
          }),
        };
      }
      
      return comment;
    }));
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: `new_comment_${Date.now()}`,
      postId,
      user: {
        id: 'current_user',
        username: 'you',
        displayName: 'You',
        avatar: 'https://i.pravatar.cc/150?img=10',
        verified: false,
        isPremium: false,
      },
      content: commentText,
      timestamp: new Date(),
      likes: 0,
      replies: [],
      hasLiked: false,
    };

    if (replyingTo) {
      setComments(prev => prev.map(comment => {
        if (comment.id === replyingTo.id) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newComment],
          };
        }
        return comment;
      }));
      setReplyingTo(null);
    } else {
      setComments(prev => [newComment, ...prev]);
    }

    setCommentText('');
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return `${Math.floor(diffInSeconds / 604800)}w`;
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <View key={comment.id} style={[styles.commentContainer, isReply && styles.replyContainer]}>
      <Image source={{ uri: comment.user.avatar }} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <View style={styles.commentUserInfo}>
            <Text style={styles.commentDisplayName}>{comment.user.displayName}</Text>
            {comment.user.verified && (
              <CheckCircle size={12} color={PulseColors.dark.secondary} fill={PulseColors.dark.secondary} />
            )}
            {comment.user.isPremium && (
              <Crown size={12} color={PulseColors.dark.warning} fill={PulseColors.dark.warning} />
            )}
            <Text style={styles.commentTimestamp}>{formatTimestamp(comment.timestamp)}</Text>
          </View>
        </View>
        <Text style={styles.commentText}>{comment.content}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity 
            style={styles.commentActionButton} 
            onPress={() => handleLikeComment(comment.id)}
          >
            <Heart
              size={14}
              color={comment.hasLiked ? PulseColors.dark.accent : PulseColors.dark.textSecondary}
              fill={comment.hasLiked ? PulseColors.dark.accent : 'transparent'}
            />
            <Text style={[styles.commentActionText, comment.hasLiked && styles.commentActionTextLiked]}>
              {formatNumber(comment.likes)}
            </Text>
          </TouchableOpacity>
          {!isReply && (
            <TouchableOpacity 
              style={styles.commentActionButton}
              onPress={() => setReplyingTo(comment)}
            >
              <Text style={styles.commentActionText}>Reply</Text>
            </TouchableOpacity>
          )}
        </View>
        {comment.replies && comment.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {comment.replies.map(reply => renderComment(reply, true))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <View style={styles.headerDragHandle} />
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              Comments {comments.length > 0 && `(${comments.length})`}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={24} color={PulseColors.dark.text} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={comments}
          renderItem={({ item }) => renderComment(item)}
          keyExtractor={(item) => item.id}
          style={styles.commentsList}
          contentContainerStyle={styles.commentsListContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No comments yet</Text>
              <Text style={styles.emptySubtext}>Be the first to comment!</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputContainer}>
          {replyingTo && (
            <View style={styles.replyingToBar}>
              <Text style={styles.replyingToText}>
                Replying to @{replyingTo.user.username}
              </Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <X size={16} color={PulseColors.dark.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder={replyingTo ? `Reply to @${replyingTo.user.username}...` : "Add a comment..."}
              placeholderTextColor={PulseColors.dark.textTertiary}
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
              onPress={handleSendComment}
              disabled={!commentText.trim()}
            >
              <Send 
                size={20} 
                color={commentText.trim() ? PulseColors.dark.accent : PulseColors.dark.textTertiary} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PulseColors.dark.surface,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
  },
  headerDragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: PulseColors.dark.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: PulseColors.dark.text,
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: PulseColors.dark.background,
  },
  commentsList: {
    flex: 1,
  },
  commentsListContent: {
    paddingVertical: 12,
  },
  commentContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  replyContainer: {
    paddingLeft: 0,
    marginTop: 8,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  commentUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentDisplayName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  commentTimestamp: {
    fontSize: 12,
    color: PulseColors.dark.textSecondary,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 21,
    color: PulseColors.dark.text,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  commentActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentActionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
  },
  commentActionTextLiked: {
    color: PulseColors.dark.accent,
  },
  repliesContainer: {
    marginTop: 8,
    paddingLeft: 20,
    borderLeftWidth: 2,
    borderLeftColor: PulseColors.dark.border,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.textSecondary,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: PulseColors.dark.textTertiary,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: PulseColors.dark.border,
    backgroundColor: PulseColors.dark.background,
    paddingBottom: Platform.OS === 'ios' ? 0 : 16,
  },
  replyingToBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 0, 87, 0.1)',
  },
  replyingToText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: PulseColors.dark.accent,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: PulseColors.dark.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
