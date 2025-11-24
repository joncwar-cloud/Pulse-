import { Story } from '@/types';

const TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24;

export const mockStories: Story[] = [
  {
    id: 'story_1',
    user: {
      id: 'user_4',
      username: 'dance_queen',
      displayName: 'Dance Queen',
      avatar: 'https://i.pravatar.cc/150?img=5',
      verified: true,
      isPremium: true,
    },
    mediaUrl: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=400',
    type: 'image',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    expiresAt: new Date(Date.now() + TWENTY_FOUR_HOURS - 1000 * 60 * 30),
    views: 1234,
    hasViewed: false,
  },
  {
    id: 'story_2',
    user: {
      id: 'user_7',
      username: 'tech_guru',
      displayName: 'Tech Guru',
      avatar: 'https://i.pravatar.cc/150?img=8',
      verified: true,
      isPremium: false,
    },
    mediaUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
    type: 'image',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    expiresAt: new Date(Date.now() + TWENTY_FOUR_HOURS - 1000 * 60 * 60),
    views: 856,
    hasViewed: false,
  },
  {
    id: 'story_3',
    user: {
      id: 'user_3',
      username: 'music_master',
      displayName: 'Music Master',
      avatar: 'https://i.pravatar.cc/150?img=14',
      verified: true,
      isPremium: true,
    },
    mediaUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
    type: 'image',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    expiresAt: new Date(Date.now() + TWENTY_FOUR_HOURS - 1000 * 60 * 120),
    views: 2341,
    hasViewed: true,
  },
  {
    id: 'story_4',
    user: {
      id: 'user_5',
      username: 'crypto_whale',
      displayName: 'Crypto Whale',
      avatar: 'https://i.pravatar.cc/150?img=11',
      verified: true,
      isPremium: true,
    },
    mediaUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
    type: 'image',
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
    expiresAt: new Date(Date.now() + TWENTY_FOUR_HOURS - 1000 * 60 * 180),
    views: 567,
    hasViewed: true,
  },
];
