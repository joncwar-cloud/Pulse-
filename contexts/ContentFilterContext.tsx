import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { generateObject } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';
import { ContentFilters, Post, ContentType } from '@/types';

const STORAGE_KEY = 'content_filters';

const defaultFilters: ContentFilters = {
  showNSFW: false,
  blockBrainrot: false,
  childrenMode: false,
  contentTypes: ['text', 'image', 'video'],
};

export const [ContentFilterProvider, useContentFilters] = createContextHook(() => {
  const [filters, setFilters] = useState<ContentFilters>(defaultFilters);

  const filtersQuery = useQuery({
    queryKey: ['contentFilters'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!stored) return defaultFilters;
        return JSON.parse(stored);
      } catch (error) {
        console.error('[ContentFilterContext] Error loading filters:', error);
        await AsyncStorage.removeItem(STORAGE_KEY);
        return defaultFilters;
      }
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (newFilters: ContentFilters) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newFilters));
      return newFilters;
    },
  });

  useEffect(() => {
    if (filtersQuery.data) {
      console.log('[ContentFilterContext] Filters loaded:', filtersQuery.data);
      setFilters(filtersQuery.data);
    }
  }, [filtersQuery.data]);

  const updateFilters = (newFilters: Partial<ContentFilters>) => {
    console.log('[ContentFilterContext] Updating filters:', newFilters);
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    saveMutation.mutate(updated);
  };

  const toggleNSFW = () => {
    if (filters.childrenMode) return;
    updateFilters({ showNSFW: !filters.showNSFW });
  };

  const toggleBrainrot = () => {
    updateFilters({ blockBrainrot: !filters.blockBrainrot });
  };

  const toggleChildrenMode = () => {
    const newChildrenMode = !filters.childrenMode;
    updateFilters({
      childrenMode: newChildrenMode,
      showNSFW: false,
      blockBrainrot: newChildrenMode,
    });
  };

  const setContentTypes = (types: ContentType[]) => {
    if (types.length === 0) return;
    updateFilters({ contentTypes: types });
  };

  const toggleContentType = (type: ContentType) => {
    const currentTypes = filters.contentTypes;
    if (currentTypes.includes(type)) {
      if (currentTypes.length === 1) return;
      setContentTypes(currentTypes.filter(t => t !== type));
    } else {
      setContentTypes([...currentTypes, type]);
    }
  };

  const detectBrainrot = useCallback(async (post: Post) => {
    if (!filters.blockBrainrot || post.quality === 'high') {
      return false;
    }

    const cachedKey = `brainrot_${post.id}`;
    const cached = await AsyncStorage.getItem(cachedKey);
    if (cached) {
      return cached === 'true';
    }

    try {
      const schema = z.object({
        isBrainrot: z.boolean().describe('Is this content brainrot?'),
        reason: z.string().describe('Brief explanation'),
      });

      const result = await generateObject({
        messages: [
          {
            role: 'user',
            content: `Analyze if this content is brainrot (low-quality, mindless, overly repetitive, or designed purely for engagement without value):\n\nTitle: ${post.title || 'N/A'}\nContent: ${post.content}\nTags: ${post.tags.join(', ')}`,
          },
        ],
        schema,
      });

      await AsyncStorage.setItem(cachedKey, result.isBrainrot.toString());
      return result.isBrainrot;
    } catch (error) {
      console.error('Error detecting brainrot:', error);
      return false;
    }
  }, [filters.blockBrainrot]);

  return {
    filters,
    updateFilters,
    toggleNSFW,
    toggleBrainrot,
    toggleChildrenMode,
    setContentTypes,
    toggleContentType,
    detectBrainrot,
    isLoading: filtersQuery.isLoading,
  };
});
