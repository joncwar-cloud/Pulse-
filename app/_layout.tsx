import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ContentFilterProvider } from '@/contexts/ContentFilterContext';
import { UserProvider, useUser } from '@/contexts/UserContext';
import { LocationFilterProvider } from '@/contexts/LocationFilterContext';
import { MonetizationProvider } from '@/contexts/MonetizationContext';
import { CommunityProvider } from '@/contexts/CommunityContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NetworkStatusIndicator } from '@/components/NetworkStatusIndicator';
import { PulseColors } from '@/constants/colors';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.message?.includes('fetch') || error?.message?.includes('Network')) {
          return failureCount < 3;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 60000,
      gcTime: 300000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error: any) => {
        if (error?.message?.includes('fetch') || error?.message?.includes('Network')) {
          return failureCount < 2;
        }
        return failureCount < 1;
      },
    },
  },
});

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const { user, supabaseUser, isLoading, hasOnboarded } = useUser();

  useEffect(() => {
    if (isLoading) {
      console.log('[RootLayoutNav] Still loading auth state');
      return;
    }

    const inAuthGroup = segments[0] === 'auth';
    const inOnboardingGroup = segments[0] === 'onboarding';
    const inTabsGroup = segments[0] === '(tabs)';
    const inContentRoute = ['community', 'post', 'user', 'edit-profile', 'create-community', 'search'].includes(segments[0]);

    console.log('[RootLayoutNav] Current segment:', segments[0]);
    console.log('[RootLayoutNav] Has supabase user:', !!supabaseUser);
    console.log('[RootLayoutNav] Has profile:', !!user);
    console.log('[RootLayoutNav] Has onboarded:', hasOnboarded);

    if (!supabaseUser) {
      console.log('[RootLayoutNav] No supabase user, redirecting to auth');
      if (!inAuthGroup) {
        router.replace('/auth');
      }
    } else if (!user) {
      console.log('[RootLayoutNav] Supabase user exists but no profile yet');
      console.log('[RootLayoutNav] Supabase user ID:', supabaseUser.id);
      console.log('[RootLayoutNav] Redirecting to profile setup');
      if (!inOnboardingGroup || segments[1] !== 'profile-setup') {
        router.replace('/onboarding/profile-setup');
      }
    } else if (!hasOnboarded) {
      console.log('[RootLayoutNav] User has profile but not onboarded');
      if (!inOnboardingGroup) {
        console.log('[RootLayoutNav] Not in onboarding group, redirecting to interests');
        router.replace('/onboarding/interests');
      }
    } else {
      console.log('[RootLayoutNav] User is authenticated and onboarded');
      if (!inTabsGroup && !inContentRoute) {
        console.log('[RootLayoutNav] Not in tabs or content route, redirecting to tabs');
        router.replace('/(tabs)');
      }
    }
  }, [supabaseUser, user, hasOnboarded, isLoading, segments, router]);

  return (
    <Stack screenOptions={{ headerBackTitle: 'Back' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="auth" 
        options={{ 
          headerShown: false, 
          presentation: 'card',
          animation: 'fade',
          gestureEnabled: false,
        }} 
      />
      <Stack.Screen 
        name="onboarding" 
        options={{ 
          headerShown: false, 
          presentation: 'card',
          animation: 'fade',
          gestureEnabled: false,
        }} 
      />
      <Stack.Screen 
        name="community/[id]" 
        options={{ 
          headerShown: false,
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="post/[id]" 
        options={{ 
          headerShown: false,
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="user/[username]" 
        options={{ 
          headerShown: false,
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="edit-profile" 
        options={{ 
          headerShown: false,
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="create-community" 
        options={{ 
          headerShown: false,
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="search" 
        options={{ 
          headerShown: false,
          presentation: 'card',
        }} 
      />
      <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        console.log('[RootLayout] Initializing app...');
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('[RootLayout] Error during initialization:', error);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
        console.log('[RootLayout] App ready');
      }
    };

    prepare();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: PulseColors.dark.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={PulseColors.dark.accent} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NetworkStatusIndicator />
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>
            <UserProvider>
              <MonetizationProvider>
                <ContentFilterProvider>
                  <LocationFilterProvider>
                    <CommunityProvider>
                      <RootLayoutNav />
                    </CommunityProvider>
                  </LocationFilterProvider>
                </ContentFilterProvider>
              </MonetizationProvider>
            </UserProvider>
          </NotificationProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
