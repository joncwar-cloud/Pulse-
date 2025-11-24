import { supabase } from '../supabase';
import { MarketplaceItem } from '@/types';

export const marketplaceService = {
  async createListing(listing: {
    seller_id: string;
    title: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    condition: 'new' | 'like-new' | 'good' | 'fair';
    location: string;
    shipping_available: boolean;
    shipping_price?: number;
    local_pickup: boolean;
  }) {
    console.log('[MarketplaceService] Creating listing:', listing.title);
    console.log('[MarketplaceService] Listing data:', JSON.stringify(listing, null, 2));
    
    const { data, error } = await supabase
      .from('marketplace_listings')
      .insert([listing])
      .select()
      .single();

    if (error) {
      console.error('[MarketplaceService] Error creating listing:', error);
      console.error('[MarketplaceService] Error details:', JSON.stringify(error, null, 2));
      
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        throw new Error('The marketplace_listings table needs to be created in Supabase. Please check your database setup.');
      }
      
      if (error.message?.includes('permission') || error.message?.includes('RLS')) {
        throw new Error('Permission denied. Please check your Row Level Security policies in Supabase.');
      }
      
      throw new Error(error.message || 'Failed to create listing');
    }
    
    console.log('[MarketplaceService] Listing created successfully:', data.id);
    return data;
  },

  async getListing(listingId: string) {
    console.log('[MarketplaceService] Fetching listing:', listingId);
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select(`
        *,
        seller:users!marketplace_listings_seller_id_fkey(*)
      `)
      .eq('id', listingId)
      .single();

    if (error) {
      console.error('[MarketplaceService] Error fetching listing:', error);
      throw error;
    }
    return data;
  },

  async getListings(limit = 20, offset = 0): Promise<MarketplaceItem[]> {
    console.log('[MarketplaceService] Fetching listings');
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select(`
        *,
        seller:users!marketplace_listings_seller_id_fkey(*)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[MarketplaceService] Error fetching listings:', error);
      throw error;
    }
    
    return (data || []).map((listing): MarketplaceItem => ({
      id: listing.id,
      seller: {
        id: listing.seller.id,
        username: listing.seller.username,
        displayName: listing.seller.display_name,
        avatar: listing.seller.avatar,
        verified: listing.seller.verified || false,
        isPremium: listing.seller.is_premium || false,
      },
      title: listing.title,
      description: listing.description,
      price: listing.price,
      images: listing.images || [],
      category: listing.category,
      condition: listing.condition,
      location: listing.location,
      timestamp: new Date(listing.created_at),
      views: listing.views || 0,
      saved: false,
    }));
  },

  async getUserListings(userId: string, limit = 20, offset = 0) {
    console.log('[MarketplaceService] Fetching user listings:', userId);
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select(`
        *,
        seller:users!marketplace_listings_seller_id_fkey(*)
      `)
      .eq('seller_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[MarketplaceService] Error fetching user listings:', error);
      throw error;
    }
    return data;
  },

  async searchListings(query: string, category?: string, limit = 20) {
    console.log('[MarketplaceService] Searching listings:', query, category);
    let queryBuilder = supabase
      .from('marketplace_listings')
      .select(`
        *,
        seller:users!marketplace_listings_seller_id_fkey(*)
      `)
      .eq('status', 'active')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }

    const { data, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[MarketplaceService] Error searching listings:', error);
      throw error;
    }
    
    return (data || []).map((listing): MarketplaceItem => ({
      id: listing.id,
      seller: {
        id: listing.seller.id,
        username: listing.seller.username,
        displayName: listing.seller.display_name,
        avatar: listing.seller.avatar,
        verified: listing.seller.verified || false,
        isPremium: listing.seller.is_premium || false,
      },
      title: listing.title,
      description: listing.description,
      price: listing.price,
      images: listing.images || [],
      category: listing.category,
      condition: listing.condition,
      location: listing.location,
      timestamp: new Date(listing.created_at),
      views: listing.views || 0,
      saved: false,
    }));
  },

  async updateListing(listingId: string, updates: Record<string, any>) {
    console.log('[MarketplaceService] Updating listing:', listingId);
    const { data, error } = await supabase
      .from('marketplace_listings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', listingId)
      .select()
      .single();

    if (error) {
      console.error('[MarketplaceService] Error updating listing:', error);
      throw error;
    }
    return data;
  },

  async deleteListing(listingId: string) {
    console.log('[MarketplaceService] Deleting listing:', listingId);
    const { error } = await supabase
      .from('marketplace_listings')
      .delete()
      .eq('id', listingId);

    if (error) {
      console.error('[MarketplaceService] Error deleting listing:', error);
      throw error;
    }
  },

  async incrementViews(listingId: string) {
    console.log('[MarketplaceService] Incrementing views for listing:', listingId);
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select('views')
      .eq('id', listingId)
      .single();

    if (error) {
      console.error('[MarketplaceService] Error fetching views:', error);
      throw error;
    }

    const newViews = (data.views || 0) + 1;
    const { error: updateError } = await supabase
      .from('marketplace_listings')
      .update({ views: newViews })
      .eq('id', listingId);

    if (updateError) {
      console.error('[MarketplaceService] Error updating views:', updateError);
      throw updateError;
    }
    return newViews;
  },
};
