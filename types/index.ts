export type ContentType = 'text' | 'image' | 'video';
export type ContentRating = 'sfw' | 'nsfw' | 'questionable';
export type ContentQuality = 'high' | 'medium' | 'brainrot';

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  verified: boolean;
  isPremium: boolean;
}

export interface Post {
  id: string;
  user: User;
  type: ContentType;
  title?: string;
  content: string;
  mediaUrl?: string;
  mediaUrls?: string[];
  thumbnailUrl?: string;
  community?: string;
  location?: Location;
  timestamp: Date;
  votes: number;
  comments: number;
  shares: number;
  rating: ContentRating;
  quality: ContentQuality;
  tags: string[];
  hasVoted?: 'up' | 'down' | null;
  isDuet?: boolean;
  originalPost?: string;
  soundId?: string;
  soundName?: string;
  challengeId?: string;
}

export interface ContentFilters {
  showNSFW: boolean;
  blockBrainrot: boolean;
  childrenMode: boolean;
  contentTypes: ContentType[];
}

export interface Community {
  id: string;
  name: string;
  description: string;
  icon: string;
  memberCount: number;
  category: string;
  rules?: string;
  isNSFW: boolean;
  pointsOfInterest: string[];
  creatorId: string;
  createdAt: Date;
  coverImage?: string;
  isJoined?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

export interface MarketplaceItem {
  id: string;
  seller: User;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  location: string;
  timestamp: Date;
  views: number;
  saved: boolean;
}

export type AuthProvider = 'apple' | 'google' | 'facebook';

export interface Location {
  country: string;
  city: string;
  countryCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface LocationStats {
  country: string;
  countryCode: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  postCount: number;
  trendingTags: string[];
  pulse: 'high' | 'medium' | 'low';
}

export interface UserProfile extends User {
  email?: string;
  bio?: string;
  dateOfBirth?: Date;
  interests: string[];
  authProvider?: AuthProvider;
  following: number;
  followers: number;
  posts: number;
  isCreator?: boolean;
  creatorTier?: 'basic' | 'pro' | 'elite';
  walletBalance?: number;
  lifetimeEarnings?: number;
  subscriberCount?: number;
  monthlyRevenue?: number;
  followingUsers?: string[];
  blockedUsers?: string[];
}

export interface VirtualCurrency {
  coins: number;
  gems: number;
}

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'vip';

export interface Subscription {
  tier: SubscriptionTier;
  price: number;
  features: string[];
  expiresAt?: Date;
}

export interface CreatorSubscription {
  id: string;
  creatorId: string;
  subscriberId: string;
  tier: 'bronze' | 'silver' | 'gold';
  price: number;
  startDate: Date;
  expiresAt: Date;
  autoRenew: boolean;
}

export interface Tip {
  id: string;
  fromUserId: string;
  toUserId: string;
  postId?: string;
  amount: number;
  message?: string;
  timestamp: Date;
}

export type AdType = 'banner' | 'interstitial' | 'native' | 'rewarded';

export interface Ad {
  id: string;
  type: AdType;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  targetUrl: string;
  impressions: number;
  clicks: number;
}

export interface CreatorEarnings {
  userId: string;
  tips: number;
  subscriptions: number;
  adRevenue: number;
  marketplace: number;
  total: number;
  lastUpdated: Date;
}

export type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'tip' | 'subscription' | 'live' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  fromUser?: User;
  post?: Post;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export interface Story {
  id: string;
  user: User;
  mediaUrl: string;
  type: 'image' | 'video';
  timestamp: Date;
  expiresAt: Date;
  views: number;
  hasViewed?: boolean;
}

export interface LiveStream {
  id: string;
  creator: User;
  title: string;
  thumbnailUrl?: string;
  viewerCount: number;
  startedAt: Date;
  isLive: boolean;
  category: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  reward?: {
    coins?: number;
    gems?: number;
  };
}

export interface UserStats {
  streak: number;
  totalPosts: number;
  totalLikes: number;
  totalViews: number;
  level: number;
  xp: number;
  achievements: Achievement[];
}

export interface Analytics {
  period: 'day' | 'week' | 'month' | 'year';
  views: number;
  likes: number;
  comments: number;
  shares: number;
  followers: number;
  revenue: number;
  engagement: number;
  topPost?: Post;
  demographics: {
    age: Record<string, number>;
    gender: Record<string, number>;
    location: Record<string, number>;
  };
}

export interface Comment {
  id: string;
  postId: string;
  user: User;
  content: string;
  timestamp: Date;
  likes: number;
  replies: Comment[];
  hasLiked?: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  hashtag: string;
  creator: User;
  thumbnailUrl: string;
  participantCount: number;
  viewCount: number;
  startDate: Date;
  endDate?: Date;
  prize?: string;
  isActive: boolean;
}

export interface Sound {
  id: string;
  name: string;
  artist?: string;
  duration: number;
  audioUrl: string;
  thumbnailUrl?: string;
  useCount: number;
  category: 'original' | 'music' | 'sound_effect';
  isOriginal?: boolean;
  originalCreator?: User;
}

export interface CollaborativePost {
  id: string;
  postId: string;
  collaborators: User[];
  inviteStatus: Record<string, 'pending' | 'accepted' | 'declined'>;
  createdAt: Date;
}
