import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PUSH_TOKEN_KEY = 'pushToken';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type NotificationContextType = {
  pushToken: string | null;
  notificationPermission: Notifications.NotificationPermissionsStatus | null;
  requestPermission: () => Promise<boolean>;
  sendLocalNotification: (title: string, body: string, data?: any) => Promise<void>;
  schedulePushNotification: (title: string, body: string, seconds: number, data?: any) => Promise<string>;
  cancelNotification: (notificationId: string) => Promise<void>;
  badgeCount: number;
  setBadgeCount: (count: number) => Promise<void>;
  clearBadgeCount: () => Promise<void>;
};

export const [NotificationProvider, useNotifications] = createContextHook(() => {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<Notifications.NotificationPermissionsStatus | null>(null);
  const [badgeCount, setBadgeCountState] = useState<number>(0);

  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    checkPermission();
    loadPushToken();
    loadBadgeCount();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('[Notification] Received:', notification);
      incrementBadgeCount();
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('[Notification] Response:', response);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkPermission = async () => {
    try {
      const permissionStatus = await Notifications.getPermissionsAsync();
      setNotificationPermission(permissionStatus);
      console.log('[Notification] Permission status:', permissionStatus.status);
    } catch (error) {
      console.error('[Notification] Error checking permission:', error);
    }
  };

  const loadPushToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      if (storedToken) {
        setPushToken(storedToken);
        console.log('[Notification] Loaded push token:', storedToken);
      }
    } catch (error) {
      console.error('[Notification] Error loading push token:', error);
    }
  };

  const loadBadgeCount = async () => {
    try {
      if (Platform.OS === 'web') return;
      const count = await Notifications.getBadgeCountAsync();
      setBadgeCountState(count);
    } catch (error) {
      console.error('[Notification] Error loading badge count:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        console.log('[Notification] Web platform - using limited notification support');
        
        if ('Notification' in window) {
          const permission = await window.Notification.requestPermission();
          const granted = permission === 'granted';
          
          const mockPermission: Notifications.NotificationPermissionsStatus = {
            status: granted ? Notifications.PermissionStatus.GRANTED : Notifications.PermissionStatus.DENIED,
            granted,
            canAskAgain: false,
            expires: 'never' as Notifications.PermissionExpiration,
            ios: {} as any,
            android: {} as any,
          };
          
          setNotificationPermission(mockPermission);
          console.log('[Notification] Web notification permission:', permission);
          return granted;
        }
        
        return false;
      }

      if (!Device.isDevice) {
        console.log('[Notification] Must use physical device for push notifications');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      const permissionStatus = await Notifications.getPermissionsAsync();
      setNotificationPermission(permissionStatus);

      if (finalStatus !== 'granted') {
        console.log('[Notification] Permission not granted');
        return false;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: '59v78v46b1qcoi7myjqpr',
      });

      console.log('[Notification] Push token:', token.data);
      setPushToken(token.data);
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token.data);

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF0057',
        });
      }

      return true;
    } catch (error) {
      console.error('[Notification] Error requesting permission:', error);
      return false;
    }
  };

  const sendLocalNotification = async (title: string, body: string, data?: any) => {
    try {
      if (Platform.OS === 'web') {
        if ('Notification' in window && window.Notification.permission === 'granted') {
          new window.Notification(title, { body });
        }
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
        },
        trigger: null,
      });
      console.log('[Notification] Local notification sent');
    } catch (error) {
      console.error('[Notification] Error sending local notification:', error);
    }
  };

  const schedulePushNotification = async (
    title: string,
    body: string,
    seconds: number,
    data?: any
  ): Promise<string> => {
    try {
      if (Platform.OS === 'web') {
        console.log('[Notification] Scheduled notifications not fully supported on web');
        return '';
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds },
      });
      console.log('[Notification] Scheduled notification:', id);
      return id;
    } catch (error) {
      console.error('[Notification] Error scheduling notification:', error);
      return '';
    }
  };

  const cancelNotification = async (notificationId: string) => {
    try {
      if (Platform.OS === 'web') return;
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('[Notification] Cancelled notification:', notificationId);
    } catch (error) {
      console.error('[Notification] Error cancelling notification:', error);
    }
  };

  const setBadgeCount = async (count: number) => {
    try {
      if (Platform.OS === 'web') return;
      await Notifications.setBadgeCountAsync(count);
      setBadgeCountState(count);
      console.log('[Notification] Badge count set to:', count);
    } catch (error) {
      console.error('[Notification] Error setting badge count:', error);
    }
  };

  const clearBadgeCount = async () => {
    await setBadgeCount(0);
  };

  const incrementBadgeCount = useCallback(async () => {
    const newCount = badgeCount + 1;
    await setBadgeCount(newCount);
  }, [badgeCount]);

  return {
    pushToken,
    notificationPermission,
    requestPermission,
    sendLocalNotification,
    schedulePushNotification,
    cancelNotification,
    badgeCount,
    setBadgeCount,
    clearBadgeCount,
  };
});
