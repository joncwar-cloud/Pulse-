import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { PulseColors } from '@/constants/colors';
import { AlertCircle, RefreshCw } from 'lucide-react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
    console.error('[ErrorBoundary] Component stack:', errorInfo?.componentStack);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const isNetworkError = this.state.error?.message?.includes('fetch') || 
                            this.state.error?.message?.includes('Network') ||
                            this.state.error?.message?.includes('network') ||
                            this.state.error?.name === 'TypeError';

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <AlertCircle size={64} color={PulseColors.dark.error} />
            
            <Text style={styles.title}>
              {isNetworkError ? 'Network Error' : 'Something went wrong'}
            </Text>
            
            <Text style={styles.message}>
              {isNetworkError 
                ? 'Unable to connect to the server. Please check your internet connection and try again.'
                : 'An unexpected error occurred. Please try again.'}
            </Text>

            {this.state.error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>Error Details:</Text>
                <ScrollView style={styles.errorScroll}>
                  <Text style={styles.errorText}>
                    {this.state.error.toString()}
                  </Text>
                  {this.state.error.message && (
                    <Text style={styles.errorText}>
                      Message: {this.state.error.message}
                    </Text>
                  )}
                  {this.state.error.stack && (
                    <Text style={styles.errorStack}>
                      {this.state.error.stack}
                    </Text>
                  )}
                </ScrollView>
              </View>
            )}

            {isNetworkError && (
              <View style={styles.troubleshootBox}>
                <Text style={styles.troubleshootTitle}>Troubleshooting:</Text>
                <Text style={styles.troubleshootText}>• Check your internet connection</Text>
                <Text style={styles.troubleshootText}>• Try switching between WiFi and mobile data</Text>
                <Text style={styles.troubleshootText}>• Check if the server is accessible</Text>
                <Text style={styles.troubleshootText}>• Try again in a few moments</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={this.handleReload}
            >
              <RefreshCw size={20} color={PulseColors.dark.text} />
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PulseColors.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 500,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: PulseColors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  errorBox: {
    width: '100%',
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
    maxHeight: 200,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.error,
    marginBottom: 8,
  },
  errorScroll: {
    maxHeight: 150,
  },
  errorText: {
    fontSize: 12,
    color: PulseColors.dark.textTertiary,
    fontFamily: 'monospace' as const,
    marginBottom: 4,
  },
  errorStack: {
    fontSize: 10,
    color: PulseColors.dark.textTertiary,
    fontFamily: 'monospace' as const,
    marginTop: 8,
  },
  troubleshootBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 0, 87, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: PulseColors.dark.accent,
  },
  troubleshootTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.accentLight,
    marginBottom: 8,
  },
  troubleshootText: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: PulseColors.dark.accent,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
});
