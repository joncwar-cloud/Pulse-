import { Stack } from 'expo-router';
import { Newspaper, TrendingUp, Globe, Zap, RefreshCw, Search, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PulseColors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation } from '@tanstack/react-query';
import { generateText } from '@rork-ai/toolkit-sdk';

interface NewsStory {
  id: string;
  title: string;
  summary: string;
  category: 'trending' | 'world' | 'tech' | 'entertainment';
  source: string;
  timestamp: Date;
  searchVolume: string;
}

const CATEGORIES = [
  { id: 'trending' as const, label: 'Trending', icon: TrendingUp, color: PulseColors.dark.accent },
  { id: 'world' as const, label: 'World', icon: Globe, color: PulseColors.dark.secondary },
  { id: 'tech' as const, label: 'Tech', icon: Zap, color: PulseColors.dark.warning },
  { id: 'entertainment' as const, label: 'Entertainment', icon: Newspaper, color: '#9D4EDD' },
];

const MOCK_NEWS: NewsStory[] = [
  {
    id: '1',
    title: 'AI Advances Transform Creative Industries',
    summary: 'New generative AI tools are revolutionizing how content creators work, from video editing to music production.',
    category: 'tech',
    source: 'AI Generated Summary',
    timestamp: new Date(),
    searchVolume: '2.4M searches',
  },
  {
    id: '2',
    title: 'Global Climate Summit Reaches Historic Agreement',
    summary: 'World leaders commit to ambitious carbon reduction targets as climate action takes center stage.',
    category: 'world',
    source: 'AI Generated Summary',
    timestamp: new Date(),
    searchVolume: '5.1M searches',
  },
  {
    id: '3',
    title: 'New Social Platform Features Break Records',
    summary: 'Latest social media innovations see unprecedented user engagement, reshaping digital interaction.',
    category: 'trending',
    source: 'AI Generated Summary',
    timestamp: new Date(),
    searchVolume: '8.7M searches',
  },
];

export default function PulseNewsScreen() {
  const [selectedCategory, setSelectedCategory] = useState<'trending' | 'world' | 'tech' | 'entertainment'>('trending');
  const [searchQuery, setSearchQuery] = useState('');

  const newsQuery = useQuery({
    queryKey: ['pulse-news', selectedCategory],
    queryFn: async () => {
      console.log('[PulseNews] Fetching news for category:', selectedCategory);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return MOCK_NEWS.filter(story => story.category === selectedCategory || selectedCategory === 'trending');
    },
    staleTime: 5 * 60 * 1000,
  });

  const generateNewsMutation = useMutation({
    mutationFn: async (query: string) => {
      console.log('[PulseNews] Generating news with AI for query:', query);
      
      const prompt = `Generate a brief news summary (2-3 sentences) about: "${query}". 
      Make it sound like a real news headline and summary. Keep it factual but engaging.
      Format: Just return the news summary without any prefix.`;
      
      const result = await generateText({ messages: [{ role: 'user', content: prompt }] });
      
      return {
        id: Date.now().toString(),
        title: query,
        summary: result,
        category: 'trending' as const,
        source: 'AI Generated',
        timestamp: new Date(),
        searchVolume: 'Just now',
      };
    },
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      Alert.alert('Enter Search Query', 'Please enter a topic to search for');
      return;
    }

    generateNewsMutation.mutate(searchQuery, {
      onSuccess: (newStory) => {
        console.log('[PulseNews] Generated news story:', newStory);
        Alert.alert(
          newStory.title,
          newStory.summary,
          [{ text: 'OK' }]
        );
        setSearchQuery('');
      },
      onError: (error) => {
        console.error('[PulseNews] Error generating news:', error);
        Alert.alert('Error', 'Failed to generate news. Please try again.');
      },
    });
  };

  const filteredNews = newsQuery.data || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={[PulseColors.dark.background, 'rgba(10, 10, 11, 0.95)']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.titleRow}>
            <Newspaper size={28} color={PulseColors.dark.accent} />
            <Text style={styles.title}>Pulse News</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => newsQuery.refetch()}
            disabled={newsQuery.isLoading}
          >
            <RefreshCw 
              size={22} 
              color={PulseColors.dark.text}
              style={newsQuery.isLoading ? styles.spinning : undefined}
            />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.subtitle}>
          AI-powered real-time news and trending topics
        </Text>

        <View style={styles.searchContainer}>
          <Search size={20} color={PulseColors.dark.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search or generate news..."
            placeholderTextColor={PulseColors.dark.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <X size={18} color={PulseColors.dark.textSecondary} />
            </TouchableOpacity>
          )}
          {generateNewsMutation.isPending && (
            <Text style={styles.loadingText}>Generating...</Text>
          )}
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map(({ id, label, icon: Icon, color }) => (
            <TouchableOpacity
              key={id}
              style={[
                styles.categoryChip,
                selectedCategory === id && [styles.categoryChipActive, { borderColor: color }],
              ]}
              onPress={() => setSelectedCategory(id)}
            >
              <Icon 
                size={18} 
                color={selectedCategory === id ? color : PulseColors.dark.textSecondary}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === id && [styles.categoryTextActive, { color }],
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {newsQuery.isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading news...</Text>
          </View>
        ) : (
          <>
            {filteredNews.map((story, index) => (
              <TouchableOpacity
                key={story.id}
                style={[
                  styles.newsCard,
                  index === 0 && styles.newsCardFirst,
                ]}
                onPress={() => {
                  Alert.alert(
                    story.title,
                    `${story.summary}\n\nSource: ${story.source}\nSearch Volume: ${story.searchVolume}\n\n(Full articles require backend integration)`,
                    [{ text: 'OK' }]
                  );
                }}
              >
                <LinearGradient
                  colors={index === 0 
                    ? ['rgba(255, 0, 87, 0.15)', 'rgba(255, 0, 87, 0.05)']
                    : ['transparent', 'transparent']
                  }
                  style={styles.newsCardGradient}
                >
                  <View style={styles.newsCardHeader}>
                    <View style={[styles.categoryBadge, { backgroundColor: CATEGORIES.find(c => c.id === story.category)?.color + '20' }]}>
                      <Text style={[styles.categoryBadgeText, { color: CATEGORIES.find(c => c.id === story.category)?.color }]}>
                        {CATEGORIES.find(c => c.id === story.category)?.label}
                      </Text>
                    </View>
                    <Text style={styles.searchVolume}>{story.searchVolume}</Text>
                  </View>
                  
                  <Text style={styles.newsTitle}>{story.title}</Text>
                  <Text style={styles.newsSummary} numberOfLines={3}>{story.summary}</Text>
                  
                  <View style={styles.newsFooter}>
                    <Text style={styles.newsSource}>{story.source}</Text>
                    <Text style={styles.newsTime}>
                      {story.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}

            <View style={styles.infoCard}>
              <Zap size={20} color={PulseColors.dark.warning} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>AI-Powered News</Text>
                <Text style={styles.infoText}>
                  Pulse News uses AI to gather and summarize real-time information from across the web. 
                  Search for any topic to generate custom news summaries.
                </Text>
              </View>
            </View>

            <View style={{ height: 100 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PulseColors.dark.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: PulseColors.dark.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
    marginBottom: 16,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  spinning: {
    opacity: 0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: PulseColors.dark.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: PulseColors.dark.text,
  },
  categoriesScroll: {
    gap: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: PulseColors.dark.surface,
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
  },
  categoryChipActive: {
    backgroundColor: 'rgba(255, 0, 87, 0.1)',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
  },
  categoryTextActive: {
    fontWeight: '700' as const,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
  },
  newsCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: PulseColors.dark.surface,
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
  },
  newsCardFirst: {
    borderColor: PulseColors.dark.accent,
    borderWidth: 2,
  },
  newsCardGradient: {
    padding: 20,
  },
  newsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
  },
  searchVolume: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: PulseColors.dark.accent,
  },
  newsTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: PulseColors.dark.text,
    marginBottom: 10,
    lineHeight: 26,
  },
  newsSummary: {
    fontSize: 15,
    lineHeight: 22,
    color: PulseColors.dark.textSecondary,
    marginBottom: 16,
  },
  newsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  newsSource: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: PulseColors.dark.textTertiary,
  },
  newsTime: {
    fontSize: 13,
    color: PulseColors.dark.textTertiary,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.2)',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: PulseColors.dark.warning,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: PulseColors.dark.textSecondary,
    lineHeight: 18,
  },
  clearButton: {
    padding: 4,
  },
});
