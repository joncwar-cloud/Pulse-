import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { PulseColors } from '@/constants/colors';
import { useUser } from '@/contexts/UserContext';
import { useContentFilters } from '@/contexts/ContentFilterContext';

export default function AgeVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ interests: string; username?: string; displayName?: string; avatar?: string }>();
  const { completeOnboarding, updateProfile } = useUser();
  const { updateFilters } = useContentFilters();

  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date(2000, 0, 1));
  const [showPicker, setShowPicker] = useState(false);

  const handleContinue = () => {
    const parsedInterests = params.interests ? JSON.parse(params.interests) : [];
    const shouldActivateChildMode = completeOnboarding(parsedInterests, dateOfBirth);

    if (params.username && params.displayName && params.avatar) {
      updateProfile({
        username: params.username,
        displayName: params.displayName,
        avatar: params.avatar,
      });
    }

    if (shouldActivateChildMode) {
      updateFilters({
        childrenMode: true,
        showNSFW: false,
        blockBrainrot: true,
      });
    }

    router.replace('/(tabs)');
  };

  const age = new Date().getFullYear() - dateOfBirth.getFullYear();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>When&apos;s your birthday?</Text>
          <Text style={styles.subtitle}>
            We need to verify your age for content filtering.{age < 18 ? '\nChild safety mode will be automatically enabled for users under 18.' : ''}
          </Text>
        </View>

        <View style={styles.dateSection}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.dateText}>
              {dateOfBirth.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={dateOfBirth}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_event: any, selectedDate?: Date) => {
                if (Platform.OS === 'android') {
                  setShowPicker(false);
                }
                if (selectedDate) {
                  setDateOfBirth(selectedDate);
                }
              }}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
            />
          )}

          {age < 13 && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                You must be at least 13 years old to use Pulse
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.progressText}>Almost done!</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            age < 13 && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={age < 13}
        >
          <Text style={styles.continueButtonText}>Get Started</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    marginBottom: 48,
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
  dateSection: {
    gap: 20,
  },
  dateButton: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: PulseColors.dark.surface,
    borderWidth: 2,
    borderColor: PulseColors.dark.accent,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  warningBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    borderWidth: 1,
    borderColor: PulseColors.dark.error,
  },
  warningText: {
    fontSize: 15,
    color: PulseColors.dark.error,
    textAlign: 'center',
    fontWeight: '600' as const,
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
    width: '100%',
    height: '100%',
    backgroundColor: PulseColors.dark.accent,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.textSecondary,
    minWidth: 100,
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
