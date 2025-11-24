import { Stack } from 'expo-router';
import { Bell, Heart, UserPlus, MessageCircle, Coins, Star, Radio, Settings } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PulseColors } from '@/constants/colors';
import { mockNotifications } from '@/mocks/notifications';
import { Notification, NotificationType } from '@/types';

const NOTIFICATION_ICONS: Record<NotificationType, React.ReactNode> = {
  like: <Heart size={20} color={PulseColors.dark.accent} fill={PulseColors.dark.accent} />,
  comment: <MessageCircle size={20} color="#00BFFF" />,
  follow: <UserPlus size={20} color="#00FF87" />,
  mention: <MessageCircle size={20} color="#FFB800" />,
  tip: <Coins size={20} color="#FFD700" />,
  subscription: <Star size={20} color="#FF00FF" />,
  live: <Radio size={20} color={PulseColors.dark.accent} />,
  system: <Bell size={20} color={PulseColors.dark.textSecondary} />,
};

export default function NotificationsScreen() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const filteredNotifications = notifications.filter(n => 
    activeFilter === 'all' || !n.read
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.read && styles.notificationCardUnread]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={[styles.iconContainer, !item.read && styles.iconContainerUnread]}>
        {NOTIFICATION_ICONS[item.type]}
      </View>

      <View style={styles.notificationContent}>
        {item.fromUser && (
          <View style={styles.userRow}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {item.fromUser.displayName.charAt(0)}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName}>{item.fromUser.displayName}</Text>
                {item.fromUser.verified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedIcon}>✓</Text>
                  </View>
                )}
              </View>
              <Text style={styles.userUsername}>@{item.fromUser.username}</Text>
            </View>
          </View>
        )}
        
        <Text style={[styles.notificationText, !item.fromUser && styles.notificationTextSystem]}>
          {item.message}
        </Text>
        
        <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
      </View>

      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Bell size={28} color={PulseColors.dark.accent} />
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={20} color={PulseColors.dark.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterButton, activeFilter === 'all' && styles.filterButtonActive]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, activeFilter === 'unread' && styles.filterButtonActive]}
          onPress={() => setActiveFilter('unread')}
        >
          <Text style={[styles.filterText, activeFilter === 'unread' && styles.filterTextActive]}>
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {filteredNotifications.length > 0 ? (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyState}>
          <Bell size={64} color={PulseColors.dark.border} />
          <Text style={styles.emptyStateTitle}>No notifications</Text>
          <Text style={styles.emptyStateText}>
            {activeFilter === 'unread' 
              ? "You're all caught up!"
              : "We'll notify you when something happens"}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PulseColors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: PulseColors.dark.surface,
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: PulseColors.dark.text,
  },
  badge: {
    backgroundColor: PulseColors.dark.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: PulseColors.dark.surface,
    borderBottomWidth: 1,
    borderBottomColor: PulseColors.dark.border,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: PulseColors.dark.background,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
  },
  filterButtonActive: {
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
  markAllButton: {
    marginLeft: 'auto',
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: PulseColors.dark.accent,
  },
  list: {
    padding: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: PulseColors.dark.surface,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: PulseColors.dark.border,
    position: 'relative' as const,
  },
  notificationCardUnread: {
    backgroundColor: 'rgba(255, 0, 87, 0.05)',
    borderColor: 'rgba(255, 0, 87, 0.3)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerUnread: {
    backgroundColor: 'rgba(255, 0, 87, 0.15)',
  },
  notificationContent: {
    flex: 1,
    gap: 6,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 0, 87, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: PulseColors.dark.accent,
  },
  userAvatarText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: PulseColors.dark.accentLight,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  userUsername: {
    fontSize: 12,
    color: PulseColors.dark.textTertiary,
  },
  verifiedBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: PulseColors.dark.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedIcon: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
  },
  notificationText: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
    lineHeight: 20,
  },
  notificationTextSystem: {
    color: PulseColors.dark.text,
    fontWeight: '600' as const,
  },
  timestamp: {
    fontSize: 12,
    color: PulseColors.dark.textTertiary,
  },
  unreadDot: {
    position: 'absolute' as const,
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PulseColors.dark.accent,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: PulseColors.dark.text,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: PulseColors.dark.textSecondary,
    marginTop: 8,
    textAlign: 'center' as const,
  },
});
