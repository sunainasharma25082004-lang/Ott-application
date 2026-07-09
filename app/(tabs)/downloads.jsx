import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Platform,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useDownloads } from '../../src/context/DownloadsContext';
import { openVideo } from '../../src/utils/videoRouting';

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const DownloadCard = React.memo(({ item, onDelete, onPlay }) => {
  return (
    <Pressable
      onPress={() => onPlay(item)}
      android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <ImageBackground
        source={{ uri: item.thumbnail }}
        style={styles.image}
        imageStyle={styles.imageRadius}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.92)']}
          style={styles.imageOverlay}
        />

        <View style={styles.topRow}>
          <View style={styles.qualityTag}>
            <Text style={styles.qualityText}>{item.quality}</Text>
          </View>
          <View style={styles.downloadedBadge}>
            <Ionicons name="checkmark" size={14} color="#000" />
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.8} style={styles.playBtn} onPress={() => onPlay(item)}>
          <Ionicons name="play" size={20} color="#000" />
        </TouchableOpacity>
      </ImageBackground>

      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.title}>
          {item.title}
        </Text>
        <Text style={styles.meta}>{formatBytes(item.sizeBytes)} • Downloaded</Text>

        <View style={styles.bottomRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.deleteBtn}
            onPress={() => onDelete(item.id, item.title)}
          >
            <Feather name="trash-2" size={18} color="#FF5A5A" />
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
});

DownloadCard.displayName = 'DownloadCard';

export default function DownloadsScreen() {
  const { downloads, deleteDownload } = useDownloads();

  const totalSize = useMemo(
    () => downloads.reduce((sum, d) => sum + (d.sizeBytes || 0), 0),
    [downloads]
  );

  const onPlay = useCallback((item) => {
    const videoItem = {
      id: item.id,
      videoUrl: item.localUri,
      title: item.title,
      thumbnail: item.thumbnail,
      durationSeconds: 0,
      contentType: item.contentType || 'Movie',
    };
    openVideo(videoItem);
  }, []);

  const onDelete = useCallback(
    (id, title) => {
      const doDelete = async () => {
        try {
          await deleteDownload(id);
        } catch (e) {
          const msg = 'Could not delete download';
          if (Platform.OS === 'web') window.alert(msg);
          else Alert.alert('Error', msg);
        }
      };

      const msg = `Delete "${title}" from downloads?`;
      if (Platform.OS === 'web') {
        if (window.confirm(msg)) doDelete();
      } else {
        Alert.alert('Delete Download', msg, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: doDelete },
        ]);
      }
    },
    [deleteDownload]
  );

  const renderItem = useCallback(({ item }) => <DownloadCard item={item} onDelete={onDelete} onPlay={onPlay} />, [onDelete, onPlay]);

  const keyExtractor = useCallback((item) => item.id, []);

  const headerComponent = useMemo(
    () => (
      <>
        <View style={styles.header}>
          <View>
            <Text style={styles.smallText}>Offline Library</Text>
            <Text style={styles.heading}>Downloads</Text>
          </View>
        </View>

        <LinearGradient colors={['#FFB800', '#FF8C00']} style={styles.storageCard}>
          <View>
            <Text style={styles.storageLabel}>Storage Used</Text>
            <Text style={styles.storageValue}>{formatBytes(totalSize)}</Text>
          </View>
          <View style={styles.downloadCircle}>
            <Ionicons name="download" size={28} color="#fff" />
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Downloaded Videos ({downloads.length})</Text>
        </View>
      </>
    ),
    [totalSize, downloads.length]
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <LinearGradient
        colors={['#020617', '#07111F', '#020617']}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.blueGlow} />
      <View style={styles.orangeGlow} />

      {downloads.length === 0 ? (
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={headerComponent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="download-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No downloads yet</Text>
              <Text style={styles.emptySubtext}>Download movies and episodes to watch offline</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <FlatList
          data={downloads}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={headerComponent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          initialNumToRender={4}
          maxToRenderPerBatch={6}
          windowSize={5}
          removeClippedSubviews
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  listContent: { paddingBottom: 140 },
  blueGlow: {
    position: 'absolute',
    top: -120,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: 'rgba(0,140,255,0.12)',
  },
  orangeGlow: {
    position: 'absolute',
    bottom: 0,
    right: -100,
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: 'rgba(255,140,0,0.10)',
  },
  header: {
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'android' ? 10 : 4,
    marginBottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smallText: { color: '#94A3B8', fontSize: 13 },
  heading: { color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 4 },
  storageCard: {
    marginHorizontal: 20,
    borderRadius: 30,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 34,
  },
  storageLabel: { color: '#fff', fontSize: 14 },
  storageValue: { color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 6 },
  downloadCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  cardPressed: { transform: [{ scale: 0.98 }], opacity: 0.92 },
  image: { height: 210, justifyContent: 'space-between', padding: 16 },
  imageRadius: { borderRadius: 22 },
  imageOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: 22 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qualityTag: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  qualityText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  downloadedBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFB800',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  info: { padding: 18 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  meta: { color: '#94A3B8', fontSize: 13, marginTop: 6 },
  bottomRow: { marginTop: 18, flexDirection: 'row', alignItems: 'center' },
  deleteBtn: {
    width: 48,
    height: 48,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySubtext: { color: '#9CA3AF', fontSize: 13, marginTop: 8, textAlign: 'center' },
});
