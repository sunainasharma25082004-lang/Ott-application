import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { apiClient } from '../src/lib/api';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const ICON_BY_TYPE: Record<string, { icon: any; color: string }> = {
  talent_submitted: { icon: 'cloud-upload-outline', color: '#60A5FA' },
  talent_approved: { icon: 'checkmark-circle-outline', color: '#00C48C' },
  talent_featured: { icon: 'star-outline', color: '#FFB800' },
  talent_rejected: { icon: 'close-circle-outline', color: '#FF5A5A' },
  general: { icon: 'notifications-outline', color: '#9CA3AF' },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    try {
      const res: any = await apiClient.get('/notifications?limit=50');
      if (res?.notifications) setItems(res.notifications);
      if (typeof res?.unreadCount === 'number') setUnread(res.unreadCount);
    } catch (e: any) {
      console.log('Error loading notifications:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const markRead = async (id: string, alreadyRead: boolean) => {
    if (alreadyRead) return;
    setItems((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
    try {
      await apiClient.put(`/notifications/${id}/read`);
    } catch {
      // best effort; revert not critical
    }
  };

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
    try {
      await apiClient.put('/notifications/read-all');
    } catch {
      /* best effort */
    }
  };

  const timeAgo = (d: string) => {
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar translucent={false} backgroundColor="#090D16" barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unread > 0 && <Text style={styles.headerSub}>{unread} unread</Text>}
        </View>
        {items.length > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FFB800" />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="notifications-off-outline" size={48} color="#334" />
          <Text style={styles.emptyText}>No notifications yet</Text>
          <Text style={styles.emptySub}>You'll be notified when your videos are reviewed.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFB800" />}
        >
          {items.map((n) => {
            const meta = ICON_BY_TYPE[n.type] || ICON_BY_TYPE.general;
            return (
              <TouchableOpacity
                key={n._id}
                activeOpacity={0.85}
                style={[styles.card, !n.isRead && styles.cardUnread]}
                onPress={() => markRead(n._id, n.isRead)}
              >
                <View style={[styles.iconWrap, { backgroundColor: meta.color + '22' }]}>
                  <Ionicons name={meta.icon} size={20} color={meta.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{n.title}</Text>
                  <Text style={styles.cardMessage}>{n.message}</Text>
                  <Text style={styles.cardTime}>{timeAgo(n.createdAt)}</Text>
                </View>
                {!n.isRead && <View style={styles.dot} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090D16' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  headerSub: { color: '#FFB800', fontSize: 12, marginTop: 2 },
  markAll: { color: '#60A5FA', fontSize: 13, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyText: { color: '#8B93A1', fontSize: 16, fontWeight: '700', marginTop: 14 },
  emptySub: { color: '#556', fontSize: 13, marginTop: 6, textAlign: 'center' },
  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardUnread: { backgroundColor: 'rgba(96,165,250,0.06)', borderColor: 'rgba(96,165,250,0.2)' },
  iconWrap: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  cardMessage: { color: '#C4CAD4', fontSize: 13, marginTop: 4, lineHeight: 19 },
  cardTime: { color: '#6B7280', fontSize: 11, marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#60A5FA', marginTop: 6 },
});
