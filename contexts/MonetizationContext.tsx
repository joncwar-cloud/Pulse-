import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  VirtualCurrency,
  Subscription,
  SubscriptionTier,
  CreatorSubscription,
  Tip,
  CreatorEarnings,
} from '@/types';

const STORAGE_KEY_WALLET = 'wallet_balance';
const STORAGE_KEY_SUBSCRIPTION = 'user_subscription';
const STORAGE_KEY_EARNINGS = 'creator_earnings';

export const [MonetizationProvider, useMonetization] = createContextHook(() => {
  const [wallet, setWallet] = useState<VirtualCurrency>({ coins: 0, gems: 0 });
  const [subscription, setSubscription] = useState<Subscription>({
    tier: 'free',
    price: 0,
    features: ['Basic features', 'See ads'],
  });
  const [earnings, setEarnings] = useState<CreatorEarnings>({
    userId: '',
    tips: 0,
    subscriptions: 0,
    adRevenue: 0,
    marketplace: 0,
    total: 0,
    lastUpdated: new Date(),
  });
  const [creatorSubscriptions, setCreatorSubscriptions] = useState<CreatorSubscription[]>([]);

  const walletQuery = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_WALLET);
        if (!stored) return { coins: 100, gems: 10 };
        return JSON.parse(stored);
      } catch (error) {
        console.error('[MonetizationContext] Error loading wallet:', error);
        await AsyncStorage.removeItem(STORAGE_KEY_WALLET);
        return { coins: 100, gems: 10 };
      }
    },
  });

  const subscriptionQuery = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_SUBSCRIPTION);
        if (!stored) {
          return {
            tier: 'free' as SubscriptionTier,
            price: 0,
            features: ['Basic features', 'See ads'],
          };
        }
        return JSON.parse(stored);
      } catch (error) {
        console.error('[MonetizationContext] Error loading subscription:', error);
        await AsyncStorage.removeItem(STORAGE_KEY_SUBSCRIPTION);
        return {
          tier: 'free' as SubscriptionTier,
          price: 0,
          features: ['Basic features', 'See ads'],
        };
      }
    },
  });

  const earningsQuery = useQuery({
    queryKey: ['earnings'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_EARNINGS);
        if (!stored) {
          return {
            userId: '',
            tips: 0,
            subscriptions: 0,
            adRevenue: 0,
            marketplace: 0,
            total: 0,
            lastUpdated: new Date(),
          };
        }
        return JSON.parse(stored);
      } catch (error) {
        console.error('[MonetizationContext] Error loading earnings:', error);
        await AsyncStorage.removeItem(STORAGE_KEY_EARNINGS);
        return {
          userId: '',
          tips: 0,
          subscriptions: 0,
          adRevenue: 0,
          marketplace: 0,
          total: 0,
          lastUpdated: new Date(),
        };
      }
    },
  });

  const saveWalletMutation = useMutation({
    mutationFn: async (newWallet: VirtualCurrency) => {
      await AsyncStorage.setItem(STORAGE_KEY_WALLET, JSON.stringify(newWallet));
      return newWallet;
    },
  });

  const saveSubscriptionMutation = useMutation({
    mutationFn: async (newSub: Subscription) => {
      await AsyncStorage.setItem(STORAGE_KEY_SUBSCRIPTION, JSON.stringify(newSub));
      return newSub;
    },
  });

  const saveEarningsMutation = useMutation({
    mutationFn: async (newEarnings: CreatorEarnings) => {
      await AsyncStorage.setItem(STORAGE_KEY_EARNINGS, JSON.stringify(newEarnings));
      return newEarnings;
    },
  });

  useEffect(() => {
    if (walletQuery.data) {
      setWallet(walletQuery.data);
    }
  }, [walletQuery.data]);

  useEffect(() => {
    if (subscriptionQuery.data) {
      setSubscription(subscriptionQuery.data);
    }
  }, [subscriptionQuery.data]);

  useEffect(() => {
    if (earningsQuery.data) {
      setEarnings(earningsQuery.data);
    }
  }, [earningsQuery.data]);

  const purchaseCoins = (amount: number, cost: number) => {
    console.log('[Monetization] Purchasing coins:', amount, 'for $', cost);
    const newWallet = { ...wallet, coins: wallet.coins + amount };
    setWallet(newWallet);
    saveWalletMutation.mutate(newWallet);
  };

  const spendCoins = (amount: number): boolean => {
    if (wallet.coins < amount) {
      console.log('[Monetization] Insufficient coins');
      return false;
    }
    console.log('[Monetization] Spending coins:', amount);
    const newWallet = { ...wallet, coins: wallet.coins - amount };
    setWallet(newWallet);
    saveWalletMutation.mutate(newWallet);
    return true;
  };

  const sendTip = (tip: Omit<Tip, 'id' | 'timestamp'>): boolean => {
    console.log('[Monetization] Sending tip:', tip.amount, 'coins to', tip.toUserId);
    if (!spendCoins(tip.amount)) {
      return false;
    }
    return true;
  };

  const receiveTip = (amount: number) => {
    console.log('[Monetization] Receiving tip:', amount, 'coins');
    const newEarnings = {
      ...earnings,
      tips: earnings.tips + amount,
      total: earnings.total + amount,
      lastUpdated: new Date(),
    };
    setEarnings(newEarnings);
    saveEarningsMutation.mutate(newEarnings);
  };

  const upgradeSubscription = (tier: SubscriptionTier) => {
    console.log('[Monetization] Upgrading subscription to:', tier);
    let price = 0;
    let features: string[] = [];

    switch (tier) {
      case 'basic':
        price = 4.99;
        features = ['Ad-free browsing', 'Basic analytics', 'Priority support'];
        break;
      case 'premium':
        price = 9.99;
        features = [
          'All Basic features',
          'Ad-free everywhere',
          'Advanced analytics',
          'Custom profile badge',
          'Early access to features',
          'Download content',
        ];
        break;
      case 'vip':
        price = 19.99;
        features = [
          'All Premium features',
          'VIP badge',
          'Exclusive content',
          'Direct creator messaging',
          'Monthly coin bonus',
          'Revenue sharing on ads',
        ];
        break;
      default:
        price = 0;
        features = ['Basic features', 'See ads'];
    }

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const newSub: Subscription = { tier, price, features, expiresAt };
    setSubscription(newSub);
    saveSubscriptionMutation.mutate(newSub);
  };

  const subscribeToCreator = (
    creatorId: string,
    tier: 'bronze' | 'silver' | 'gold'
  ): boolean => {
    console.log('[Monetization] Subscribing to creator:', creatorId, 'tier:', tier);
    
    let price = 0;
    switch (tier) {
      case 'bronze':
        price = 50;
        break;
      case 'silver':
        price = 100;
        break;
      case 'gold':
        price = 200;
        break;
    }

    if (!spendCoins(price)) {
      return false;
    }

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const newSub: CreatorSubscription = {
      id: `sub_${Date.now()}`,
      creatorId,
      subscriberId: 'current_user',
      tier,
      price,
      startDate: new Date(),
      expiresAt,
      autoRenew: true,
    };

    setCreatorSubscriptions([...creatorSubscriptions, newSub]);
    return true;
  };

  const addAdRevenue = (amount: number) => {
    console.log('[Monetization] Adding ad revenue:', amount);
    const newEarnings = {
      ...earnings,
      adRevenue: earnings.adRevenue + amount,
      total: earnings.total + amount,
      lastUpdated: new Date(),
    };
    setEarnings(newEarnings);
    saveEarningsMutation.mutate(newEarnings);
  };

  const addSubscriptionRevenue = (amount: number) => {
    console.log('[Monetization] Adding subscription revenue:', amount);
    const revenueShare = amount * 0.7;
    const newEarnings = {
      ...earnings,
      subscriptions: earnings.subscriptions + revenueShare,
      total: earnings.total + revenueShare,
      lastUpdated: new Date(),
    };
    setEarnings(newEarnings);
    saveEarningsMutation.mutate(newEarnings);
  };

  const addMarketplaceRevenue = (amount: number) => {
    console.log('[Monetization] Adding marketplace revenue:', amount);
    const revenueShare = amount * 0.9;
    const newEarnings = {
      ...earnings,
      marketplace: earnings.marketplace + revenueShare,
      total: earnings.total + revenueShare,
      lastUpdated: new Date(),
    };
    setEarnings(newEarnings);
    saveEarningsMutation.mutate(newEarnings);
  };

  const watchRewardedAd = (): Promise<number> => {
    return new Promise((resolve) => {
      console.log('[Monetization] Watching rewarded ad');
      setTimeout(() => {
        const reward = 10;
        const newWallet = { ...wallet, coins: wallet.coins + reward };
        setWallet(newWallet);
        saveWalletMutation.mutate(newWallet);
        resolve(reward);
      }, 2000);
    });
  };

  const isPremium = subscription.tier !== 'free';
  const hasAdFree = ['basic', 'premium', 'vip'].includes(subscription.tier);

  return {
    wallet,
    subscription,
    earnings,
    creatorSubscriptions,
    isPremium,
    hasAdFree,
    purchaseCoins,
    spendCoins,
    sendTip,
    receiveTip,
    upgradeSubscription,
    subscribeToCreator,
    addAdRevenue,
    addSubscriptionRevenue,
    addMarketplaceRevenue,
    watchRewardedAd,
    isLoading: walletQuery.isLoading || subscriptionQuery.isLoading || earningsQuery.isLoading,
  };
});
