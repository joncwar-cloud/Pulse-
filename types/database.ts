export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          display_name: string
          avatar: string
          bio: string | null
          email: string | null
          verified: boolean
          is_premium: boolean
          date_of_birth: string | null
          interests: string[]
          following: number
          followers: number
          posts: number
          is_creator: boolean
          creator_tier: 'basic' | 'pro' | 'elite' | null
          wallet_balance: number
          lifetime_earnings: number
          subscriber_count: number
          monthly_revenue: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          display_name: string
          avatar?: string
          bio?: string | null
          email?: string | null
          verified?: boolean
          is_premium?: boolean
          date_of_birth?: string | null
          interests?: string[]
          following?: number
          followers?: number
          posts?: number
          is_creator?: boolean
          creator_tier?: 'basic' | 'pro' | 'elite' | null
          wallet_balance?: number
          lifetime_earnings?: number
          subscriber_count?: number
          monthly_revenue?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string
          avatar?: string
          bio?: string | null
          email?: string | null
          verified?: boolean
          is_premium?: boolean
          date_of_birth?: string | null
          interests?: string[]
          following?: number
          followers?: number
          posts?: number
          is_creator?: boolean
          creator_tier?: 'basic' | 'pro' | 'elite' | null
          wallet_balance?: number
          lifetime_earnings?: number
          subscriber_count?: number
          monthly_revenue?: number
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          type: 'text' | 'image' | 'video'
          title: string | null
          content: string
          media_url: string | null
          media_urls: string[] | null
          thumbnail_url: string | null
          community: string | null
          location: Json | null
          votes: number
          comments: number
          shares: number
          rating: 'sfw' | 'nsfw' | 'questionable'
          quality: 'high' | 'medium' | 'brainrot'
          tags: string[]
          is_duet: boolean
          original_post: string | null
          sound_id: string | null
          sound_name: string | null
          challenge_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'text' | 'image' | 'video'
          title?: string | null
          content: string
          media_url?: string | null
          media_urls?: string[] | null
          thumbnail_url?: string | null
          community?: string | null
          location?: Json | null
          votes?: number
          comments?: number
          shares?: number
          rating?: 'sfw' | 'nsfw' | 'questionable'
          quality?: 'high' | 'medium' | 'brainrot'
          tags?: string[]
          is_duet?: boolean
          original_post?: string | null
          sound_id?: string | null
          sound_name?: string | null
          challenge_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'text' | 'image' | 'video'
          title?: string | null
          content?: string
          media_url?: string | null
          media_urls?: string[] | null
          thumbnail_url?: string | null
          community?: string | null
          location?: Json | null
          votes?: number
          comments?: number
          shares?: number
          rating?: 'sfw' | 'nsfw' | 'questionable'
          quality?: 'high' | 'medium' | 'brainrot'
          tags?: string[]
          is_duet?: boolean
          original_post?: string | null
          sound_id?: string | null
          sound_name?: string | null
          challenge_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      communities: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          cover_image: string | null
          member_count: number
          category: string
          rules: string | null
          is_nsfw: boolean
          points_of_interest: string[]
          creator_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon?: string
          cover_image?: string | null
          member_count?: number
          category: string
          rules?: string | null
          is_nsfw?: boolean
          points_of_interest?: string[]
          creator_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          cover_image?: string | null
          member_count?: number
          category?: string
          rules?: string | null
          is_nsfw?: boolean
          points_of_interest?: string[]
          creator_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      blocks: {
        Row: {
          id: string
          blocker_id: string
          blocked_id: string
          created_at: string
        }
        Insert: {
          id?: string
          blocker_id: string
          blocked_id: string
          created_at?: string
        }
        Update: {
          id?: string
          blocker_id?: string
          blocked_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          likes: number
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          likes?: number
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          likes?: number
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          content?: string
          read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
