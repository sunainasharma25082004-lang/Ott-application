import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { apiClient } from '../../src/lib/api';
import { openVideo, VideoItem } from '../../src/utils/videoRouting';

interface LeaderboardItem extends VideoItem {
  votes: number;
  isFeatured: boolean;
}

export default function LeaderboardScreen() {
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/talent/leaderboard')
      .then((res: any) => {
        const mapped: LeaderboardItem[] = (res?.leaderboard || []).map((t: any) => ({
          id: t._id,
          videoUrl: t.auditionVideo,
          title: t.name,
          thumbnail: t.thumbnail || 'https://picsum.photos/200/280',
          durationSeconds: t.duration || 9999,
          contentType: 'Talent' as const,
          subtitle: t.category,
          category: t.category,
          votes: t.votes || 0,
          isFeatured: !!t.isFeatured,
        }));
        setItems(mapped);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const medalColor = (rank: number) => (rank === 0 ? '#FFD700' : rank === 1 ? '#C0C0C0' : rank === 2 ? '#CD7F32' : '#556');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#07090D" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#FFB800" />
      ) : items.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="trophy-outline" size={48} color="#334" />
          <Text style={styles.emptyText}>No ranked talent yet. Be the first to vote!</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <TouchableOpacity style={styles.row} activeOpacity={0.85} onPress={() => openVideo(item, items)}>
              <View style={styles.rankBox}>
                <Ionicons name="trophy" size={16} color={medalColor(index)} />
                <Text style={[styles.rankText, { color: medalColor(index) }]}>{index + 1}</Text>
              </View>
              <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={styles.name}>
                  {item.title}
                </Text>
                <Text style={styles.category}>{item.subtitle}</Text>
              </View>
              {item.isFeatured && (
                <View style={styles.featuredBadge}>
                  <Ionicons name="star" size={11} color="#FFB800" />
                </View>
              )}
              <View style={styles.votesBox}>
                <Ionicons name="heart" size={13} color="#FF4B6E" />
                <Text style={styles.votesText}>{item.votes}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07090D' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  list: { padding: 16, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  rankBox: { width: 32, alignItems: 'center' },
  rankText: { fontSize: 11, fontWeight: '800', marginTop: 2 },
  thumb: { width: 48, height: 64, borderRadius: 8, backgroundColor: '#1C1C1E' },
  name: { color: '#fff', fontSize: 14, fontWeight: '700' },
  category: { color: '#8B93A1', fontSize: 12, marginTop: 2 },
  featuredBadge: { marginRight: 6 },
  votesBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  votesText: { color: '#D1D5DB', fontSize: 12, fontWeight: '700' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyText: { color: '#556', fontSize: 13, marginTop: 12, textAlign: 'center' },
});
