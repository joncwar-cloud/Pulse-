import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, Animated, Platform } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { PulseColors } from '@/constants/colors';

export function NetworkStatusIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const slideAnim = useState(new Animated.Value(-100))[0];

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleOnline = () => {
        console.log('[NetworkStatus] Back online');
        setIsOffline(false);
      };

      const handleOffline = () => {
        console.log('[NetworkStatus] Connection lost');
        setIsOffline(true);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      setIsOffline(!navigator.onLine);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  useEffect(() => {
    if (isOffline) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline, slideAnim]);

  if (!isOffline) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <WifiOff size={16} color={PulseColors.dark.text} />
      <Text style={styles.text}>No internet connection</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: PulseColors.dark.error,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 9999,
  },
  text: {
    color: PulseColors.dark.text,
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
