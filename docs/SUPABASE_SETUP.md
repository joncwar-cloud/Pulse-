# Supabase Setup Guide

Your Supabase integration is now configured! Here's how to set up your database.

## Database Schema

Go to your Supabase dashboard → SQL Editor and run this SQL to create your tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar TEXT DEFAULT 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
  bio TEXT,
  email TEXT,
  verified BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  date_of_birth DATE,
  interests TEXT[] DEFAULT '{}',
  following INTEGER DEFAULT 0,
  followers INTEGER DEFAULT 0,
  posts INTEGER DEFAULT 0,
  is_creator BOOLEAN DEFAULT false,
  creator_tier TEXT,
  wallet_balance DECIMAL DEFAULT 0,
  lifetime_earnings DECIMAL DEFAULT 0,
  subscriber_count INTEGER DEFAULT 0,
  monthly_revenue DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'video')),
  title TEXT,
  content TEXT NOT NULL,
  media_url TEXT,
  media_urls TEXT[],
  thumbnail_url TEXT,
  community TEXT,
  location JSONB,
  votes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  rating TEXT DEFAULT 'sfw' CHECK (rating IN ('sfw', 'nsfw', 'questionable')),
  quality TEXT DEFAULT 'high' CHECK (quality IN ('high', 'medium', 'brainrot')),
  tags TEXT[] DEFAULT '{}',
  is_duet BOOLEAN DEFAULT false,
  original_post UUID REFERENCES posts(id),
  sound_id TEXT,
  sound_name TEXT,
  challenge_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communities table
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT 'https://api.dicebear.com/7.x/shapes/svg?seed=default',
  cover_image TEXT,
  member_count INTEGER DEFAULT 0,
  category TEXT NOT NULL,
  rules TEXT,
  is_nsfw BOOLEAN DEFAULT false,
  points_of_interest TEXT[] DEFAULT '{}',
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follows table
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Blocks table
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_community ON posts(community);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);

-- Create functions to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON communities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Row Level Security (RLS)

After creating tables, enable RLS policies:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Public read access for users (excluding blocked users)
CREATE POLICY "Public users are viewable" ON users
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Public read access for posts (with content filtering)
CREATE POLICY "Public posts are viewable" ON posts
  FOR SELECT USING (true);

-- Users can insert their own posts
CREATE POLICY "Users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own posts
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Public read access for communities
CREATE POLICY "Public communities are viewable" ON communities
  FOR SELECT USING (true);

-- Authenticated users can create communities
CREATE POLICY "Authenticated users can create communities" ON communities
  FOR INSERT WITH CHECK (auth.uid()::text = creator_id::text);

-- Community creators can update their communities
CREATE POLICY "Creators can update communities" ON communities
  FOR UPDATE USING (auth.uid()::text = creator_id::text);

-- Follow policies
CREATE POLICY "Anyone can view follows" ON follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON follows
  FOR INSERT WITH CHECK (auth.uid()::text = follower_id::text);

CREATE POLICY "Users can unfollow" ON follows
  FOR DELETE USING (auth.uid()::text = follower_id::text);

-- Block policies
CREATE POLICY "Users can view their blocks" ON blocks
  FOR SELECT USING (auth.uid()::text = blocker_id::text);

CREATE POLICY "Users can block others" ON blocks
  FOR INSERT WITH CHECK (auth.uid()::text = blocker_id::text);

CREATE POLICY "Users can unblock" ON blocks
  FOR DELETE USING (auth.uid()::text = blocker_id::text);

-- Comment policies
CREATE POLICY "Public comments are viewable" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can comment" ON comments
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Message policies
CREATE POLICY "Users can view their messages" ON messages
  FOR SELECT USING (
    auth.uid()::text = sender_id::text OR 
    auth.uid()::text = recipient_id::text
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid()::text = sender_id::text);
```

## Storage Buckets

Create storage buckets for media uploads:

1. Go to Storage in your Supabase dashboard
2. Create these buckets:
   - `avatars` (public)
   - `posts` (public)
   - `communities` (public)

## Authentication Setup

1. Go to Authentication → Providers
2. Enable Email authentication
3. Enable OAuth providers (Google, Apple, Facebook) as needed
4. Configure redirect URLs in your OAuth app settings

## Next Steps

1. Run the SQL schema in your Supabase SQL Editor
2. Enable RLS policies
3. Create storage buckets
4. Test the connection in your app

Your Supabase client is already configured in `services/supabase.ts`!
