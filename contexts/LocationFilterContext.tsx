import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { LocationStats } from '@/types';

const STORAGE_KEY_LOCATION = 'selected_location';

export const [LocationFilterProvider, useLocationFilter] = createContextHook(() => {
  const [selectedLocation, setSelectedLocation] = useState<LocationStats | null>(null);

  useEffect(() => {
    const loadSelectedLocation = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_LOCATION);
        if (stored) {
          try {
            setSelectedLocation(JSON.parse(stored));
          } catch (parseError) {
            console.error('[LocationFilterContext] Error parsing location:', parseError);
            await AsyncStorage.removeItem(STORAGE_KEY_LOCATION);
          }
        }
      } catch (error) {
        console.error('[LocationFilterContext] Failed to load selected location:', error);
      }
    };
    loadSelectedLocation();
  }, []);

  const selectLocation = async (location: LocationStats | null) => {
    setSelectedLocation(location);
    try {
      if (location) {
        await AsyncStorage.setItem(STORAGE_KEY_LOCATION, JSON.stringify(location));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY_LOCATION);
      }
    } catch (error) {
      console.error('Failed to save selected location:', error);
    }
  };

  const clearLocation = () => {
    selectLocation(null);
  };

  return {
    selectedLocation,
    selectLocation,
    clearLocation,
  };
});
