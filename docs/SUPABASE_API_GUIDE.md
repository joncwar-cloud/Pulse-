# Supabase API Integration Guide

All Supabase API features are now integrated and ready to use! This guide shows you how to use them in your app.

## 🎯 Available Services

### 1. Authentication (`authService`)

```typescript
import { authService } from '@/services/api';

// Sign up new user
const { user, profile } = await authService.signUp(
  'email@example.com',
  'password123',
  {
    username: 'johndoe',
    display_name: 'John Doe',
    interests: ['tech', 'gaming'],
  }
);

// Sign in
const data = await authService.signIn('email@example.com', 'password123');

// Sign out
await authService.signOut();

// Get current session
const session = await authService.getSession();

// Get current user
const user = await authService.getCurrentUser();

// Reset password
await authService.resetPassword('email@example.com');
```

### 2. Users (`usersService`)

```typescript
import { usersService } from '@/services/api';

// Get user by ID
const user = await usersService.getUser(userId);

// Get user by username
const user = await usersService.getUserByUsername('johndoe');

// Update user profile
const updated = await usersService.updateUser(userId, {
  display_name: 'New Name',
  bio: 'Updated bio',
  interests: ['art', 'music'],
});

// Search users
const users = await usersService.searchUsers('john', 20);
```

### 3. Posts (`postsService`)

```typescript
import { postsService } from '@/services/api';

// Create a post
const post = await postsService.createPost({
  user_id: userId,
  type: 'image',
  content: 'Check out this photo!',
  media_url: 'https://...',
  tags: ['photography', 'nature'],
  community: 'photography',
});

// Get feed
const posts = await postsService.getFeed(20, 0);

// Get user's posts
const userPosts = await postsService.getUserPosts(userId, 20, 0);

// Get community posts
const communityPosts = await postsService.getCommunityPosts('gaming', 20, 0);

// Vote on post
await postsService.votePost(postId, 1); // +1 or -1

// Update post
await postsService.updatePost(postId, { content: 'Updated content' });

// Delete post
await postsService.deletePost(postId);

// Search posts
const results = await postsService.searchPosts('nature', 20);

// Get posts by tag
const taggedPosts = await postsService.getPostsByTag('gaming', 20, 0);
```

### 4. Comments (`commentsService`)

```typescript
import { commentsService } from '@/services/api';

// Create comment
const comment = await commentsService.createComment({
  post_id: postId,
  user_id: userId,
  content: 'Great post!',
});

// Create reply
const reply = await commentsService.createComment({
  post_id: postId,
  user_id: userId,
  content: 'Thanks!',
  parent_id: commentId,
});

// Get post comments
const comments = await commentsService.getPostComments(postId);

// Get comment replies
const replies = await commentsService.getCommentReplies(commentId);

// Like comment
await commentsService.likeComment(commentId, 1); // +1 or -1

// Delete comment
await commentsService.deleteComment(commentId, postId);
```

### 5. Follows (`followsService`)

```typescript
import { followsService } from '@/services/api';

// Follow user
await followsService.followUser(myUserId, otherUserId);

// Unfollow user
await followsService.unfollowUser(myUserId, otherUserId);

// Check if following
const isFollowing = await followsService.isFollowing(myUserId, otherUserId);

// Get followers
const followers = await followsService.getFollowers(userId, 50, 0);

// Get following
const following = await followsService.getFollowing(userId, 50, 0);

// Get mutual follows
const mutuals = await followsService.getMutualFollows(userId1, userId2);
```

### 6. Blocks (`blocksService`)

```typescript
import { blocksService } from '@/services/api';

// Block user
await blocksService.blockUser(myUserId, otherUserId);

// Unblock user
await blocksService.unblockUser(myUserId, otherUserId);

// Check if blocked
const isBlocked = await blocksService.isBlocked(myUserId, otherUserId);

// Get blocked users
const blocked = await blocksService.getBlockedUsers(myUserId);
```

### 7. Communities (`communitiesService`)

```typescript
import { communitiesService } from '@/services/api';

// Create community
const community = await communitiesService.createCommunity({
  name: 'gaming',
  description: 'Gaming community',
  category: 'entertainment',
  creator_id: userId,
  icon: 'https://...',
});

// Get community
const community = await communitiesService.getCommunity(communityId);
const community = await communitiesService.getCommunityByName('gaming');

// Get all communities
const communities = await communitiesService.getAllCommunities(50, 0);

// Search communities
const results = await communitiesService.searchCommunities('gam', 20);

// Update community
await communitiesService.updateCommunity(communityId, {
  description: 'Updated description',
});

// Get communities by category
const categoryComms = await communitiesService.getCommunitiesByCategory('entertainment');
```

### 8. Messages (`messagesService`)

```typescript
import { messagesService } from '@/services/api';

// Send message
const message = await messagesService.sendMessage({
  sender_id: myUserId,
  recipient_id: otherUserId,
  content: 'Hello!',
});

// Get conversation
const messages = await messagesService.getConversation(myUserId, otherUserId, 50, 0);

// Get all conversations
const conversations = await messagesService.getConversations(myUserId);

// Mark as read
await messagesService.markAsRead(messageId);
await messagesService.markConversationAsRead(myUserId, otherUserId);

// Get unread count
const unreadCount = await messagesService.getUnreadCount(myUserId);

// Subscribe to real-time messages
const subscription = messagesService.subscribeToMessages(
  myUserId,
  (message) => {
    console.log('New message:', message);
  }
);
```

### 9. Storage (`storageService`)

```typescript
import { storageService } from '@/services/api';

// Upload avatar
const avatarUrl = await storageService.uploadAvatar(
  userId,
  fileUri,
  'image/jpeg'
);

// Upload post media
const mediaUrl = await storageService.uploadPostMedia(
  userId,
  fileUri,
  'image/jpeg'
);

// Upload multiple media
const mediaUrls = await storageService.uploadMultipleMedia(userId, [
  { uri: fileUri1, mimeType: 'image/jpeg' },
  { uri: fileUri2, mimeType: 'video/mp4' },
]);

// Upload community icon
const iconUrl = await storageService.uploadCommunityIcon(
  communityId,
  fileUri,
  'image/png'
);

// Delete file
await storageService.deleteFile('posts', filePath);

// Get public URL
const url = storageService.getPublicUrl('posts', filePath);
```

### 10. Real-time (`realtimeService`)

```typescript
import { realtimeService } from '@/services/api';

// Subscribe to user updates
const channel = realtimeService.subscribeToUserUpdates(userId, (user) => {
  console.log('User updated:', user);
});

// Subscribe to post updates
const postChannel = realtimeService.subscribeToPostUpdates(postId, (post) => {
  console.log('Post updated:', post);
});

// Subscribe to new posts
const newPostsChannel = realtimeService.subscribeToNewPosts((post) => {
  console.log('New post:', post);
});

// Subscribe to comments
const commentsChannel = realtimeService.subscribeToComments(postId, (comment) => {
  console.log('New comment:', comment);
});

// Subscribe to messages
const messagesChannel = realtimeService.subscribeToMessages(userId, (message) => {
  console.log('New message:', message);
});

// Unsubscribe
realtimeService.unsubscribe(channel);

// Unsubscribe from all
realtimeService.unsubscribeAll();
```

## 🎨 React Query Integration Example

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsService } from '@/services/api';

// Fetch posts
const { data: posts, isLoading } = useQuery({
  queryKey: ['posts', 'feed'],
  queryFn: () => postsService.getFeed(20, 0),
});

// Create post mutation
const queryClient = useQueryClient();
const createPost = useMutation({
  mutationFn: postsService.createPost,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  },
});

// Use mutation
createPost.mutate({
  user_id: userId,
  type: 'text',
  content: 'Hello world!',
});
```

## 🔐 Authentication Hook

```typescript
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

function MyComponent() {
  const { user, loading, signIn, signOut } = useSupabaseAuth();

  if (loading) return <Text>Loading...</Text>;
  if (!user) return <LoginScreen />;

  return <MainApp user={user} onSignOut={signOut} />;
}
```

## 📦 Required Dependencies

Already installed:
- `@supabase/supabase-js`
- `expo-file-system`
- `base64-arraybuffer`

## 🚀 Next Steps

1. **Run the SQL schema** from `docs/SUPABASE_SETUP.md` in your Supabase dashboard
2. **Create storage buckets**: avatars, posts, communities (all public)
3. **Enable authentication** providers in Supabase dashboard
4. **Start using the APIs** in your components!

## 💡 Tips

- All services handle errors by throwing them - wrap calls in try/catch
- Use React Query for caching and optimistic updates
- Real-time subscriptions automatically reconnect on disconnect
- Storage URLs are public - anyone can access them with the URL
- RLS policies ensure users can only modify their own data

## 🆓 Free Tier Limits

- **Database**: 500 MB
- **Storage**: 1 GB
- **Bandwidth**: 5 GB
- **Real-time**: Unlimited connections
- **Auth**: Unlimited users
- **API Requests**: Unlimited

These limits are generous for most apps getting started!
