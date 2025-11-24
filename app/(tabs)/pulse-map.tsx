import { Stack, useRouter } from 'expo-router';
import { MapPin, TrendingUp, Users, Activity, Globe } from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import { useLocationFilter } from '@/contexts/LocationFilterContext';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PulseColors } from '@/constants/colors';
import { globalLocations } from '@/mocks/locations';
import { LocationStats } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PulseMapScreen() {
  const router = useRouter();
  const { selectLocation } = useLocationFilter();
  const [selectedLocation, setSelectedLocation] = useState<LocationStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPulse, setFilterPulse] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filteredLocations = useMemo(() => {
    let filtered = globalLocations;

    if (searchQuery) {
      filtered = filtered.filter(
        (loc) =>
          loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          loc.country.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterPulse !== 'all') {
      filtered = filtered.filter((loc) => loc.pulse === filterPulse);
    }

    return filtered.sort((a, b) => b.postCount - a.postCount);
  }, [searchQuery, filterPulse]);

  const getPulseColor = (pulse: 'high' | 'medium' | 'low') => {
    switch (pulse) {
      case 'high':
        return PulseColors.dark.accent;
      case 'medium':
        return PulseColors.dark.warning;
      case 'low':
        return PulseColors.dark.secondary;
    }
  };

  const getPulseSize = (pulse: 'high' | 'medium' | 'low') => {
    switch (pulse) {
      case 'high':
        return 20;
      case 'medium':
        return 14;
      case 'low':
        return 10;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const totalPosts = useMemo(
    () => filteredLocations.reduce((sum, loc) => sum + loc.postCount, 0),
    [filteredLocations]
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={[PulseColors.dark.background, 'rgba(10, 10, 11, 0.85)']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerTitleContainer}>
            <Globe size={28} color={PulseColors.dark.accent} />
            <Text style={styles.headerTitle}>Pulse Map</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{filteredLocations.length}</Text>
              <Text style={styles.statLabel}>Locations</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatNumber(totalPosts)}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <MapPin size={18} color={PulseColors.dark.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search locations..."
            placeholderTextColor={PulseColors.dark.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
        >
          {(['all', 'high', 'medium', 'low'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                filterPulse === filter && styles.filterChipActive,
              ]}
              onPress={() => setFilterPulse(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  filterPulse === filter && styles.filterTextActive,
                ]}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)} Pulse
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mapContainer}>
          <View style={styles.worldMap}>
            <Image
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Equirectangular_projection_SW.jpg/1280px-Equirectangular_projection_SW.jpg' }}
              style={styles.mapBackground}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(10, 15, 26, 0.6)', 'rgba(10, 15, 26, 0.4)']}
              style={styles.mapOverlay}
            />
            <View style={styles.gridLines}>
              {Array.from({ length: 7 }).map((_, i) => (
                <View
                  key={`v-${i}`}
                  style={[
                    styles.gridLineVertical,
                    { left: `${(i / 6) * 100}%` },
                  ]}
                />
              ))}
              {Array.from({ length: 4 }).map((_, i) => (
                <View
                  key={`h-${i}`}
                  style={[
                    styles.gridLineHorizontal,
                    { top: `${(i / 3) * 100}%` },
                  ]}
                />
              ))}
            </View>
            {filteredLocations.map((location) => {
              const mapWidth = SCREEN_WIDTH - 40;
              const mapHeight = (mapWidth * 9) / 16;

              const normalizedLng = (location.coordinates.lng + 180) / 360;
              const latRad = (location.coordinates.lat * Math.PI) / 180;
              const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
              const normalizedLat = 0.5 - mercN / (2 * Math.PI);

              const x = normalizedLng * mapWidth;
              const y = normalizedLat * mapHeight;

              if (y < 0 || y > mapHeight) return null;

              return (
                <TouchableOpacity
                  key={`${location.countryCode}-${location.city}`}
                  style={[
                    styles.mapPin,
                    {
                      left: x - getPulseSize(location.pulse) / 2,
                      top: y - getPulseSize(location.pulse) / 2,
                    },
                  ]}
                  onPress={() => setSelectedLocation(location)}
                >
                  <View
                    style={[
                      styles.mapPinDot,
                      {
                        width: getPulseSize(location.pulse),
                        height: getPulseSize(location.pulse),
                        backgroundColor: getPulseColor(location.pulse),
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.mapPinPulse,
                      {
                        width: getPulseSize(location.pulse) * 2,
                        height: getPulseSize(location.pulse) * 2,
                        borderColor: getPulseColor(location.pulse),
                      },
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.mapLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: PulseColors.dark.accent }]} />
              <Text style={styles.legendText}>High Activity</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: PulseColors.dark.warning }]} />
              <Text style={styles.legendText}>Medium Activity</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: PulseColors.dark.secondary }]} />
              <Text style={styles.legendText}>Low Activity</Text>
            </View>
          </View>
        </View>

        {selectedLocation && (
          <View style={styles.selectedLocationCard}>
            <LinearGradient
              colors={['rgba(255, 0, 87, 0.15)', 'rgba(255, 0, 87, 0.05)']}
              style={styles.cardGradient}
            />
            <View style={styles.cardHeader}>
              <View style={styles.locationInfo}>
                <Text style={styles.locationCity}>{selectedLocation.city}</Text>
                <Text style={styles.locationCountry}>
                  {selectedLocation.country}
                </Text>
              </View>
              <View
                style={[
                  styles.pulseBadge,
                  {
                    backgroundColor: `${getPulseColor(selectedLocation.pulse)}20`,
                    borderColor: getPulseColor(selectedLocation.pulse),
                  },
                ]}
              >
                <Activity
                  size={16}
                  color={getPulseColor(selectedLocation.pulse)}
                />
                <Text
                  style={[
                    styles.pulseText,
                    { color: getPulseColor(selectedLocation.pulse) },
                  ]}
                >
                  {selectedLocation.pulse.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.cardStats}>
              <View style={styles.cardStat}>
                <TrendingUp size={18} color={PulseColors.dark.accent} />
                <Text style={styles.cardStatValue}>
                  {formatNumber(selectedLocation.postCount)}
                </Text>
                <Text style={styles.cardStatLabel}>Posts</Text>
              </View>
            </View>

            <View style={styles.trendingSection}>
              <Text style={styles.trendingTitle}>Trending</Text>
              <View style={styles.trendingTags}>
                {selectedLocation.trendingTags.map((tag) => (
                  <View key={tag} style={styles.trendingTag}>
                    <Text style={styles.trendingTagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.viewContentButton}
              onPress={() => {
                selectLocation(selectedLocation);
                router.push('/');
              }}
            >
              <LinearGradient
                colors={[PulseColors.dark.accent, PulseColors.dark.accentDark]}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  View Content from {selectedLocation.city}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.locationsList}>
          <Text style={styles.sectionTitle}>Top Locations</Text>
          {filteredLocations.map((location, index) => (
            <TouchableOpacity
              key={`${location.countryCode}-${location.city}`}
              style={styles.locationCard}
              onPress={() => setSelectedLocation(location)}
            >
              <View style={styles.locationRank}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
              </View>

              <View style={styles.locationDetails}>
                <View style={styles.locationNameRow}>
                  <Text style={styles.locationCardCity}>{location.city}</Text>
                  <View
                    style={[
                      styles.pulseDot,
                      { backgroundColor: getPulseColor(location.pulse) },
                    ]}
                  />
                </View>
                <Text style={styles.locationCardCountry}>{location.country}</Text>

                <View style={styles.locationTags}>
                  {location.trendingTags.slice(0, 2).map((tag) => (
                    <Text key={tag} style={styles.miniTag}>
                      #{tag}
                    </Text>
                  ))}
                </View>
              </View>

              <View style={styles.locationStats}>
                <Users size={16} color={PulseColors.dark.textTertiary} />
                <Text style={styles.locationPostCount}>
                  {formatNumber(location.postCount)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PulseColors.dark.background,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
  },
  headerTop: {
    marginBottom: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: PulseColors.dark.text,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: PulseColors.dark.accent,
  },
  statLabel: {
    fontSize: 12,
    color: PulseColors.dark.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: PulseColors.dark.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: PulseColors.dark.text,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: PulseColors.dark.surface,
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
  },
  filterChipActive: {
    backgroundColor: 'rgba(255, 0, 87, 0.2)',
    borderColor: PulseColors.dark.accent,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
  },
  filterTextActive: {
    color: PulseColors.dark.accentLight,
    fontWeight: '700' as const,
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    padding: 20,
    backgroundColor: PulseColors.dark.surface,
    margin: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  worldMap: {
    width: SCREEN_WIDTH - 40,
    height: ((SCREEN_WIDTH - 40) * 9) / 16,
    backgroundColor: '#0a0f1a',
    borderRadius: 12,
    position: 'relative' as const,
    overflow: 'hidden',
  },
  mapBackground: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  mapOverlay: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
  },
  gridLines: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
  },
  gridLineVertical: {
    position: 'absolute' as const,
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  gridLineHorizontal: {
    position: 'absolute' as const,
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  mapLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(15, 15, 16, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: PulseColors.dark.textSecondary,
    fontWeight: '600' as const,
  },
  mapPin: {
    position: 'absolute' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPinDot: {
    borderRadius: 999,
    zIndex: 2,
  },
  mapPinPulse: {
    position: 'absolute' as const,
    borderRadius: 999,
    borderWidth: 2,
    opacity: 0.3,
  },
  selectedLocationCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: PulseColors.dark.accent,
    overflow: 'hidden',
  },
  cardGradient: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  locationInfo: {
    flex: 1,
  },
  locationCity: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: PulseColors.dark.text,
    marginBottom: 4,
  },
  locationCountry: {
    fontSize: 16,
    color: PulseColors.dark.textSecondary,
  },
  pulseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
  },
  pulseText: {
    fontSize: 12,
    fontWeight: '800' as const,
  },
  cardStats: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  cardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardStatValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: PulseColors.dark.text,
  },
  cardStatLabel: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
  },
  trendingSection: {
    marginBottom: 16,
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: PulseColors.dark.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase' as const,
  },
  trendingTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trendingTag: {
    backgroundColor: 'rgba(255, 0, 87, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PulseColors.dark.accent,
  },
  trendingTagText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: PulseColors.dark.accentLight,
  },
  viewContentButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: PulseColors.dark.text,
  },
  locationsList: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: PulseColors.dark.text,
    marginBottom: 16,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 16,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  locationRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 0, 87, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: PulseColors.dark.accent,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: PulseColors.dark.accentLight,
  },
  locationDetails: {
    flex: 1,
  },
  locationNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  locationCardCity: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  locationCardCountry: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
    marginBottom: 6,
  },
  locationTags: {
    flexDirection: 'row',
    gap: 8,
  },
  miniTag: {
    fontSize: 12,
    color: PulseColors.dark.textTertiary,
  },
  locationStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationPostCount: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: PulseColors.dark.textSecondary,
  },
  bottomSpacer: {
    height: 40,
  },
});
