# Backend Integration Guide for Pulse Social App

## Overview

This document outlines the backend integration structure for the Pulse social media application. Currently, the app works with local state and mock data. To scale to TikTok-level capabilities, you'll need to integrate a backend.

## Current State (No Backend)

The app currently uses:
- **AsyncStorage** for local persistence (user profiles, preferences, onboarding status)
- **React Query** for state management and caching
- **Context API** (@nkzw/create-context-hook) for global state
- **Mock data** for posts, users, and content

### Limitations Without Backend:
- No real-time data synchronization
- No multi-device support
- No server-side content moderation
- No scalable analytics
- Limited monetization capabilities
- No user authentication across devices
- Storage limited to device capacity

## How to Enable Backend

1. **Click the Integrations button** in the top right corner of Rork
2. **Select "Backend"** from the integrations panel
3. Backend will be automatically configured with the project

## Recommended Backend Structure

### Backend Technology Stack

**Option 1: Supabase (Recommended for MVP)**
- PostgreSQL database
- Real-time subscriptions
- Built-in authentication
- Row Level Security (RLS)
- Storage for media files
- Edge Functions for serverless logic
- Cost: Free tier available, scales well

**Option 2: Firebase**
- Firestore for real-time data
- Firebase Auth
- Cloud Storage
- Cloud Functions
- Push notifications
- Cost: Pay-as-you-go

**Option 3: Custom Backend (For Scale)**
- Node.js/Express or Golang
- PostgreSQL/MongoDB
- Redis for caching
- S3 for media storage
- Message queue (RabbitMQ/Kafka)
- Microservices architecture
- CDN for content delivery

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  date_of_birth DATE,
  auth_provider VARCHAR(20),
  verified BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  is_creator BOOLEAN DEFAULT false,
  creator_tier VARCHAR(20),
  following_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  subscriber_count INTEGER DEFAULT 0,
  wallet_balance INTEGER DEFAULT 0,
  lifetime_earnings DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

### Posts Table
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- text, image, video
  title TEXT,
  content TEXT NOT NULL,
  media_url TEXT,
  thumbnail_url TEXT,
  community_id UUID REFERENCES communities(id),
  location_id UUID REFERENCES locations(id),
  rating VARCHAR(20) DEFAULT 'sfw', -- sfw, nsfw, questionable
  quality VARCHAR(20) DEFAULT 'medium', -- high, medium, brainrot
  votes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_community_id ON posts(community_id);
CREATE INDEX idx_posts_rating ON posts(rating);
```

### Communities Table
```sql
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  category VARCHAR(50),
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_sender_recipient ON messages(sender_id, recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

### Marketplace Items Table
```sql
CREATE TABLE marketplace_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(50),
  condition VARCHAR(20),
  location VARCHAR(100),
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Creator Earnings Table
```sql
CREATE TABLE creator_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tips DECIMAL(10,2) DEFAULT 0,
  subscriptions DECIMAL(10,2) DEFAULT 0,
  ad_revenue DECIMAL(10,2) DEFAULT 0,
  marketplace_revenue DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints Structure

### Authentication
- `POST /auth/signup` - Create new account
- `POST /auth/login` - Sign in
- `POST /auth/logout` - Sign out
- `POST /auth/refresh` - Refresh access token
- `POST /auth/oauth/google` - Google OAuth
- `POST /auth/oauth/apple` - Apple OAuth
- `POST /auth/oauth/facebook` - Facebook OAuth

### Users
- `GET /users/:id` - Get user profile
- `PATCH /users/:id` - Update profile
- `GET /users/:id/posts` - Get user posts
- `POST /users/:id/follow` - Follow user
- `DELETE /users/:id/follow` - Unfollow user
- `GET /users/:id/followers` - Get followers
- `GET /users/:id/following` - Get following

### Posts
- `GET /posts` - Get feed (with pagination, filters)
- `GET /posts/:id` - Get single post
- `POST /posts` - Create post
- `PATCH /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post
- `POST /posts/:id/vote` - Vote on post
- `POST /posts/:id/comment` - Comment on post
- `GET /posts/:id/comments` - Get comments

### Communities
- `GET /communities` - List communities
- `GET /communities/:id` - Get community
- `POST /communities/:id/join` - Join community
- `DELETE /communities/:id/join` - Leave community
- `GET /communities/:id/posts` - Get community posts

### Messages
- `GET /messages/conversations` - Get all conversations
- `GET /messages/:userId` - Get messages with user
- `POST /messages` - Send message
- `PATCH /messages/:id/read` - Mark as read

### Marketplace
- `GET /marketplace` - List items
- `GET /marketplace/:id` - Get item
- `POST /marketplace` - Create listing
- `PATCH /marketplace/:id` - Update listing
- `DELETE /marketplace/:id` - Delete listing

### Creator
- `GET /creator/earnings` - Get earnings
- `GET /creator/analytics` - Get analytics
- `GET /creator/subscribers` - Get subscribers
- `POST /creator/payout` - Request payout

### Monetization
- `POST /payments/coins` - Purchase coins
- `POST /payments/subscription` - Subscribe
- `POST /payments/tip` - Send tip

## Real-time Features

Use WebSockets or Server-Sent Events for:
- Live message updates
- New post notifications
- Vote/like updates
- Comment threads
- Live location-based activity (Pulse Map)

## Content Delivery

### Media Storage
1. **Images**: Upload to S3/CloudFlare R2
2. **Videos**: Use transcoding service (AWS MediaConvert, Mux)
3. **CDN**: CloudFlare, AWS CloudFront for fast delivery
4. **Thumbnails**: Auto-generate on upload

### Video Streaming
- Use HLS/DASH for adaptive streaming
- Multiple quality levels (480p, 720p, 1080p)
- Compression and optimization

## Moderation & Safety

### Content Moderation
1. **AI Moderation**: Use AWS Rekognition or Sightengine
2. **User Reports**: Flag system
3. **Manual Review**: Dashboard for moderators
4. **Children's Mode**: Strict filtering

### Safety Features
- Rate limiting
- Spam detection
- Block/report users
- Content warnings
- NSFW detection

## Analytics

### Track Events
- Post views, likes, shares
- User engagement metrics
- Creator earnings breakdown
- Location-based trends
- Peak activity times

### Analytics Tools
- Mixpanel or Amplitude for user analytics
- Custom dashboard for creators
- Export reports (CSV, PDF)

## Scaling Considerations

### For TikTok-Level Scale:
1. **Database**: Sharding by user_id or geo-location
2. **Caching**: Redis for hot data
3. **Load Balancing**: Multiple app servers
4. **CDN**: Global content delivery
5. **Search**: Elasticsearch for content search
6. **Recommendations**: ML-based content feed
7. **Queue**: Message queue for async tasks
8. **Monitoring**: DataDog, New Relic, Sentry

## Migration Path

### Phase 1: Enable Backend
1. Set up Supabase/Firebase project
2. Create database schema
3. Implement authentication

### Phase 2: Replace Local State
1. Migrate AsyncStorage data to backend
2. Replace mock data with API calls
3. Update contexts to use API

### Phase 3: Real-time Features
1. Add WebSocket connections
2. Implement live notifications
3. Real-time messaging

### Phase 4: Advanced Features
1. Content recommendation engine
2. Advanced analytics
3. Payment processing
4. Creator payouts

### Phase 5: Scale
1. Performance optimization
2. CDN integration
3. Load testing
4. Monitoring and alerts

## Integration Code Examples

### Replace AsyncStorage with API

**Before (Local Storage):**
```typescript
const userQuery = useQuery({
  queryKey: ['userProfile'],
  queryFn: async () => {
    const stored = await AsyncStorage.getItem('user_profile');
    return stored ? JSON.parse(stored) : null;
  },
});
```

**After (API):**
```typescript
const userQuery = useQuery({
  queryKey: ['userProfile'],
  queryFn: async () => {
    const response = await fetch(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.json();
  },
});
```

### Replace Mock Posts with API

**Before:**
```typescript
const feedItems = useMemo(() => {
  let posts = mockPosts;
  // filters...
  return posts;
}, [filters]);
```

**After:**
```typescript
const { data: posts } = useQuery({
  queryKey: ['posts', filters],
  queryFn: async () => {
    const params = new URLSearchParams({
      contentTypes: filters.contentTypes.join(','),
      showNSFW: filters.showNSFW.toString(),
      // ... other filters
    });
    const response = await fetch(`${API_URL}/posts?${params}`);
    return response.json();
  },
});
```

## Cost Estimates

### Monthly Costs (Estimated)

**10K Users:**
- Supabase: $25/month
- Media Storage: $50/month
- CDN: $30/month
- Total: ~$100/month

**100K Users:**
- Database: $200/month
- Media Storage: $500/month
- CDN: $300/month
- Server: $200/month
- Total: ~$1,200/month

**1M Users:**
- Database (scaled): $2,000/month
- Media Storage: $5,000/month
- CDN: $3,000/month
- Servers: $2,000/month
- Monitoring: $500/month
- Total: ~$12,500/month

## Next Steps

1. **Enable backend integration** through Rork's integrations panel
2. **Review this documentation** with your backend team
3. **Create database schema** in your chosen backend
4. **Implement authentication** first
5. **Migrate features incrementally** (don't do everything at once)
6. **Test thoroughly** before removing local state
7. **Monitor performance** and scale as needed

## Support Resources

- Supabase Docs: https://supabase.com/docs
- Firebase Docs: https://firebase.google.com/docs
- React Query: https://tanstack.com/query/latest
- Expo Backend: https://docs.expo.dev/guides/using-custom-backends/

---

**Note**: This is a living document. Update it as your backend architecture evolves.
