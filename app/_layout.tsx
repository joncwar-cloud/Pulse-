import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ContentFilterProvider } from '@/contexts/ContentFilterContext';
import { UserProvider } from '@/contexts/UserContext';
import { LocationFilterProvider } from '@/contexts/LocationFilterContext';
import { MonetizationProvider } from '@/contexts/MonetizationContext';
import { CommunityProvider } from '@/contexts/CommunityContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PulseColors } from '@/constants/colors';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 60000,
      gcTime: 300000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: 'Back' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="auth" 
        options={{ 
          headerShown: false, 
          presentation: 'modal',
          animation: 'slide_from_bottom',
          gestureEnabled: false,
        }} 
      />
      <Stack.Screen 
        name="onboarding" 
        options={{ 
          headerShown: false, 
          presentation: 'fullScreenModal',
          animation: 'fade',
          gestureEnabled: false,
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
