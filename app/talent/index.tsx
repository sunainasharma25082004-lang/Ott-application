import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { apiClient } from '../../src/lib/api';
import { openVideo, VideoItem } from '../../src/utils/videoRouting';

const { width } = Dimensions.get('window');
const TILE_SIZE = (width - 16 * 2 - 8 * 2) / 3;

const CATEGORY_FILTERS = ['All', 'Actor', 'Actress', 'Singer', 'Dancer', 'Musician', 'Comedian', 'Model', 'Other'];

export default function TalentExploreScreen() {
  const [talent, setTalent] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    setLoading(true);
    const q = category === 'All' ? '' : `?category=${encodeURIComponent(category)}`;
    apiClient
      .get(`/talent${q}`)
      .then((res: any) => {
        const mapped: VideoItem[] = (res?.talent || []).map((t: any) => ({
          id: t._id,
          videoUrl: t.auditionVideo,
          title: t.name,
          thumbnail: t.thumbnail || 'https://picsum.photos/300/400',
          durationSeconds: t.duration || 9999,
          contentType: 'Talent' as const,
          subtitle: t.category,
          category: t.category,
        }));
        setTalent(mapped);
      })
      .catch(() => setTalent([]))
      .finally(() => setLoading(false));
  }, [category]);

  const shortsFeed = useMemo(() => talent.filter((t) => t.durationSeconds <= 30), [talent]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#07090D" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Explore Talent</Text>
        <TouchableOpacity onPress={() => router.push('/talent/leaderboard')}>
          <Ionicons name="trophy-outline" size={22} color="#FFB800" />
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORY_FILTERS}
        keyExtractor={(c) => c}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => {
          const active = category === item;
          return (
            <TouchableOpacity
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setCategory(item)}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{item}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#FF4B2B" />
      ) : talent.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="videocam-off-outline" size={48} color="#334" />
          <Text style={styles.emptyText}>No talent videos in this category yet.</Text>
        </View>
      ) : (
        <FlatList
          data={talent}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.tile}
              activeOpacity={0.85}
              onPress={() => openVideo(item, item.durationSeconds <= 30 ? shortsFeed : talent)}
            >
              <Image source={{ uri: item.thumbnail }} style={styles.tileImage} />
              {item.durationSeconds <= 30 && (
                <View style={styles.shortBadge}>
                  <Ionicons name="film-outline" size={10} color="#fff" />
                </View>
              )}
              <Text numberOfLines={1} style={styles.tileTitle}>
                {item.title}
              </Text>
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
  filterRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#111827',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  filterChipActive: { backgroundColor: 'rgba(255,75,43,0.15)', borderColor: '#FF4B2B' },
  filterChipText: { color: '#8B93A1', fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: '#FF4B2B' },
  grid: { paddingHorizontal: 16, paddingBottom: 40 },
  tile: { width: TILE_SIZE, marginRight: 8, marginBottom: 14 },
  tileImage: { width: TILE_SIZE, height: TILE_SIZE * 1.3, borderRadius: 10, backgroundColor: '#1C1C1E' },
  shortBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    padding: 4,
  },
  tileTitle: { color: '#D1D5DB', fontSize: 11, marginTop: 4 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyText: { color: '#556', fontSize: 13, marginTop: 12, textAlign: 'center' },
});
