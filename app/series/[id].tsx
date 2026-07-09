import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { apiClient } from '../../src/lib/api';
import { openVideo, VideoItem } from '../../src/utils/videoRouting';

export default function SeriesDetails() {
  const { id, title, image } = useLocalSearchParams<{ id?: string; title?: string; image?: string }>();

  const [series, setSeries] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    apiClient
      .get(`/series/${id}`)
      .then((res: any) => {
        if (cancelled) return;
        setSeries(res?.series || null);
        setEpisodes(res?.episodes || []);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [id]);

  const openEpisode = (ep: any) => {
    const item: VideoItem = {
      id: ep._id,
      videoUrl: ep.videoUrl,
      title: ep.title,
      thumbnail: ep.thumbnail,
      durationSeconds: (ep.duration || 0) * 60,
      contentType: 'Episode',
      relatedId: String(id),
      subtitle: `S${ep.seasonNumber} • E${ep.episodeNumber}`,
    };
    if (!ep.videoUrl) return;
    openVideo(item);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#FFB800" />
      </SafeAreaView>
    );
  }

  const heroImage = series?.poster || series?.thumbnail || image || 'https://picsum.photos/800/450';
  const displayTitle = series?.title || title || 'Series';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground source={{ uri: heroImage }} style={styles.hero} resizeMode="cover">
          <LinearGradient colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.6)', '#040611']} locations={[0, 0.5, 1]} style={styles.heroOverlay} />

          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.heroContent}>
            <Text style={styles.title}>{displayTitle}</Text>
            {!!series?.genres?.length && <Text style={styles.genres}>{series.genres.join(' • ')}</Text>}
            {!!series?.description && (
              <Text numberOfLines={3} style={styles.description}>
                {series.description}
              </Text>
            )}
          </View>
        </ImageBackground>

        <View style={styles.episodesSection}>
          <Text style={styles.sectionTitle}>Episodes ({episodes.length})</Text>

          {episodes.length === 0 ? (
            <Text style={styles.emptyText}>No episodes available yet.</Text>
          ) : (
            episodes.map((ep) => (
              <TouchableOpacity key={ep._id} style={styles.episodeRow} activeOpacity={0.85} onPress={() => openEpisode(ep)}>
                <Image source={{ uri: ep.thumbnail || heroImage }} style={styles.episodeThumb} />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={styles.episodeTitle}>
                    S{ep.seasonNumber} E{ep.episodeNumber} • {ep.title}
                  </Text>
                  <Text style={styles.episodeMeta}>{ep.duration || 45} min</Text>
                </View>
                <Ionicons name="play-circle" size={28} color="#FFB800" />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#040611' },
  center: { flex: 1, backgroundColor: '#040611', justifyContent: 'center', alignItems: 'center' },
  hero: { width: '100%', height: 280, justifyContent: 'flex-end' },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: { padding: 20 },
  title: { color: '#fff', fontSize: 26, fontWeight: '900' },
  genres: { color: '#9CA3AF', fontSize: 13, marginTop: 6 },
  description: { color: '#D1D5DB', fontSize: 13, marginTop: 10, lineHeight: 19 },
  episodesSection: { padding: 20 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 14 },
  emptyText: { color: '#556', fontSize: 13, textAlign: 'center', paddingVertical: 20 },
  episodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  episodeThumb: { width: 90, height: 56, borderRadius: 8, backgroundColor: '#1C1C1E' },
  episodeTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  episodeMeta: { color: '#8B93A1', fontSize: 11, marginTop: 4 },
});
