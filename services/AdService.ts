import { Ad, AdType } from '@/types';

export class AdService {
  private static mockAds: Ad[] = [
    {
      id: 'ad_1',
      type: 'banner',
      title: 'Level Up Your Game',
      description: 'Download the hottest mobile game of 2025',
      imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=100&fit=crop',
      ctaText: 'Play Now',
      targetUrl: 'https://example.com',
      impressions: 0,
      clicks: 0,
    },
    {
      id: 'ad_2',
      type: 'native',
      title: 'Premium Audio Experience',
      description: 'Get 50% off wireless earbuds. Limited time offer!',
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop',
      ctaText: 'Shop Now',
      targetUrl: 'https://example.com',
      impressions: 0,
      clicks: 0,
    },
    {
      id: 'ad_3',
      type: 'native',
      title: 'Master New Skills',
      description: 'Learn from the best with online courses. Start free trial today.',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=400&fit=crop',
      ctaText: 'Learn More',
      targetUrl: 'https://example.com',
      impressions: 0,
      clicks: 0,
    },
    {
      id: 'ad_4',
      type: 'interstitial',
      title: 'Exclusive Fashion Deals',
      description: 'Up to 70% off on trending fashion. Shop the latest styles.',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=600&fit=crop',
      ctaText: 'Shop Sale',
      targetUrl: 'https://example.com',
      impressions: 0,
      clicks: 0,
    },
    {
      id: 'ad_5',
      type: 'rewarded',
      title: 'Watch & Earn',
      description: 'Watch this video and earn 10 free coins!',
      imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop',
      ctaText: 'Watch Video',
      targetUrl: 'https://example.com',
      impressions: 0,
      clicks: 0,
    },
  ];

  private static adFrequency = {
    banner: 0,
    native: 5,
    interstitial: 0,
    rewarded: 0,
  };

  private static sessionImpressions = {
    banner: 0,
    native: 0,
    interstitial: 0,
    rewarded: 0,
  };

  static getAd(type: AdType): Ad | null {
    const availableAds = this.mockAds.filter((ad) => ad.type === type);
    if (availableAds.length === 0) return null;

    const ad = availableAds[Math.floor(Math.random() * availableAds.length)];
    this.trackImpression(ad.id, type);
    return ad;
  }

  static getNativeAdForFeed(postIndex: number, isPremium: boolean): Ad | null {
    if (isPremium) return null;

    const frequency = this.adFrequency.native;
    if (frequency === 0) return null;

    if ((postIndex + 1) % frequency === 0) {
      return this.getAd('native');
    }

    return null;
  }

  static shouldShowInterstitial(actionsCount: number, isPremium: boolean): boolean {
    if (isPremium) return false;
    
    const threshold = 15;
    return actionsCount % threshold === 0 && actionsCount > 0;
  }

  static shouldShowBanner(isPremium: boolean): boolean {
    if (isPremium) return false;
    return this.adFrequency.banner > 0;
  }

  static trackImpression(adId: string, type: AdType) {
    console.log('[AdService] Ad impression:', adId, type);
    this.sessionImpressions[type]++;
    
    const ad = this.mockAds.find((a) => a.id === adId);
    if (ad) {
      ad.impressions++;
    }
  }

  static trackClick(adId: string) {
    console.log('[AdService] Ad clicked:', adId);
    const ad = this.mockAds.find((a) => a.id === adId);
    if (ad) {
      ad.clicks++;
    }
  }

  static calculateCreatorRevenue(impressions: number, clicks: number): number {
    const cpm = 2.5;
    const cpc = 0.25;
    
    const impressionRevenue = (impressions / 1000) * cpm;
    const clickRevenue = clicks * cpc;
    
    return impressionRevenue + clickRevenue;
  }

  static getRevenueShare(userTier: 'free' | 'basic' | 'premium' | 'vip'): number {
    switch (userTier) {
      case 'vip':
        return 0.5;
      case 'premium':
        return 0;
      case 'basic':
        return 0;
      case 'free':
        return 0;
      default:
        return 0;
    }
  }

  static getSessionStats() {
    return {
      impressions: this.sessionImpressions,
      totalImpressions: Object.values(this.sessionImpressions).reduce((a, b) => a + b, 0),
    };
  }
}
