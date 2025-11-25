import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'https://fmuypfddssxkbdwjdvdc.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtdXlwZmRkc3N4a2Jkd2pkdmRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5Mjg5NzIsImV4cCI6MjA3OTUwNDk3Mn0.HUSNa8KQO8DrFUFvYspV_lqZdOYsilcd_ZYegi7KMuU';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing configuration');
  throw new Error('Supabase URL and Anon Key are required. Please check your app.json configuration.');
}

console.log('[Supabase] Initializing client with URL:', supabaseUrl);
console.log('[Supabase] Platform:', Platform.OS);

const customStorageAdapter = {
  getItem: async (key: string) => {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('[Supabase Storage] Error getting item:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('[Supabase Storage] Error setting item:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error('[Supabase Storage] Error removing item:', error);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorageAdapter,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
  global: {
    headers: {
      'X-Client-Info': `pulse-app-${Platform.OS}`,
    },
  },
});

console.log('[Supabase] Client initialized successfully');
