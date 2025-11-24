import { Image } from 'expo-image';
import { ExternalLink } from 'lucide-react-native';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ad } from '@/types';
import { PulseColors } from '@/constants/colors';
import { AdService } from '@/services/AdService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface NativeAdCardProps {
  ad: Ad;
}

export default function NativeAdCard({ ad }: NativeAdCardProps) {
  const handleAdClick = () => {
    console.log('[NativeAdCard] Ad clicked:', ad.id);
    AdService.trackClick(ad.id);
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: ad.imageUrl }}
        style={styles.backgroundMedia}
        contentFit="cover"
        placeholder={undefined}
      />
      
      <LinearGradient
        colors={['rgba(10, 10, 11, 0)', 'rgba(10, 10, 11, 0.7)', 'rgba(10, 10, 11, 0.95)']}
        style={styles.gradient}
      />

      <View style={styles.sponsoredBadge}>
        <Text style={styles.sponsoredText}>SPONSORED</Text>
      </View>

      <View style={styles.bottomContent}>
        <Text style={styles.title}>{ad.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {ad.description}
        </Text>

        <TouchableOpacity style={styles.ctaButton} onPress={handleAdClick}>
          <Text style={styles.ctaText}>{ad.ctaText}</Text>
          <ExternalLink size={20} color={PulseColors.dark.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: PulseColors.dark.background,
    position: 'relative' as const,
  },
  backgroundMedia: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  gradient: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  sponsoredBadge: {
    position: 'absolute' as const,
    top: 100,
    left: 20,
    backgroundColor: 'rgba(255, 193, 7, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: PulseColors.dark.warning,
  },
  sponsoredText: {
    fontSize: 11,
    fontWeight: '900' as const,
    color: PulseColors.dark.warning,
    letterSpacing: 1,
  },
  bottomContent: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: PulseColors.dark.text,
    marginBottom: 8,
    lineHeight: 30,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: PulseColors.dark.text,
    marginBottom: 20,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: PulseColors.dark.accent,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    alignSelf: 'flex-start' as const,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '900' as const,
    color: PulseColors.dark.text,
  },
});
