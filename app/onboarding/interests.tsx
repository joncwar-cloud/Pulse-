import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PulseColors } from '@/constants/colors';

const INTERESTS = [
  'Technology', 'Gaming', 'Art', 'Music', 'Fitness', 'Food',
  'Travel', 'Fashion', 'Sports', 'Photography', 'Comedy', 'Education',
  'Science', 'Politics', 'Business', 'Health', 'Beauty', 'DIY',
  'Pets', 'Cars', 'Books', 'Movies', 'Dance', 'Nature',
];

export default function InterestsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleContinue = () => {
    console.log('[Interests] Continue button pressed');
    console.log('[Interests] Selected interests:', selectedInterests);
    console.log('[Interests] Selected count:', selectedInterests.length);
    
    if (selectedInterests.length < 3) {
      console.log('[Interests] Not enough interests selected');
      return;
    }
    
    try {
      console.log('[Interests] Navigating to age verification');
      console.log('[Interests] Current params:', params);
      
      router.push({
        pathname: '/onboarding/age-verification',
        params: { 
          ...params,
          interests: JSON.stringify(selectedInterests) 
        },
      });
      
      console.log('[Interests] Navigation initiated successfully');
    } catch (error) {
      console.error('[Interests] Navigation error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>What are you into?</Text>
        <Text style={styles.subtitle}>
          {selectedInterests.length < 3
            ? `Pick ${3 - selectedInterests.length} more interest${3 - selectedInterests.length === 1 ? '' : 's'} to continue`
            : `${selectedInterests.length} interests selected ✓`}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.interestsGrid}>
          {INTERESTS.map((interest) => {
            const isSelected = selectedInterests.includes(interest);
            return (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.interestChip,
                  isSelected && styles.interestChipSelected,
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text
                  style={[
                    styles.interestText,
                    isSelected && styles.interestTextSelected,
                  ]}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.progressText}>Step 2 of 3</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedInterests.length < 3 && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={selectedInterests.length < 3}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <ChevronRight size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PulseColors.dark.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '900' as const,
    color: PulseColors.dark.text,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: PulseColors.dark.textSecondary,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  interestChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: PulseColors.dark.surface,
    borderWidth: 2,
    borderColor: PulseColors.dark.border,
  },
  interestChipSelected: {
    backgroundColor: 'rgba(255, 0, 87, 0.2)',
    borderColor: PulseColors.dark.accent,
  },
  interestText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
  },
  interestTextSelected: {
    color: PulseColors.dark.accentLight,
    fontWeight: '700' as const,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: PulseColors.dark.border,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    width: '50%',
    height: '100%',
    backgroundColor: PulseColors.dark.accent,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
    minWidth: 80,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: PulseColors.dark.accent,
    gap: 8,
  },
  continueButtonDisabled: {
    backgroundColor: PulseColors.dark.surface,
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
