import { Comment } from '@/types';

export const mockComments: Record<string, Comment[]> = {
  '1': [
    {
      id: 'com1',
      postId: '1',
      user: {
        id: 'u3',
        username: 'meme_lord_420',
        displayName: 'Meme Lord',
        avatar: 'https://i.pravatar.cc/150?img=3',
        verified: false,
        isPremium: false,
      },
      content: 'This is absolutely mind-blowing! 🤯',
      timestamp: new Date(Date.now() - 3000000),
      likes: 234,
      replies: [],
      hasLiked: false,
    },
    {
      id: 'com2',
      postId: '1',
      user: {
        id: 'u5',
        username: 'controversial_take',
        displayName: 'Hot Takes',
        avatar: 'https://i.pravatar.cc/150?img=5',
        verified: false,
        isPremium: true,
      },
      content: 'But what about the ethical concerns? We need to talk about this.',
      timestamp: new Date(Date.now() - 2800000),
      likes: 156,
      replies: [
        {
          id: 'com2_1',
          postId: '1',
          user: {
            id: 'u1',
            username: 'techguru',
            displayName: 'Tech Guru',
            avatar: 'https://i.pravatar.cc/150?img=1',
            verified: true,
            isPremium: true,
          },
          content: 'Great point! That\'s exactly what we should be discussing.',
          timestamp: new Date(Date.now() - 2700000),
          likes: 89,
          replies: [],
          hasLiked: true,
        },
      ],
      hasLiked: false,
    },
  ],
  '2': [
    {
      id: 'com3',
      postId: '2',
      user: {
        id: 'u4',
        username: 'art_creator',
        displayName: 'Digital Artist',
        avatar: 'https://i.pravatar.cc/150?img=4',
        verified: true,
        isPremium: true,
      },
      content: 'Incredible transformation! Keep it up! 💪',
      timestamp: new Date(Date.now() - 7000000),
      likes: 567,
      replies: [],
      hasLiked: true,
    },
  ],
};
