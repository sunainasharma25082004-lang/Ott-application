// ✅ OPTIMIZED + CLICKABLE + SAFE AREA + CROSS PLATFORM
// app/(tabs)/downloads.tsx

import React, {
  memo,
  useCallback,
  useMemo,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  StatusBar,
  Platform,
  FlatList,
  Pressable,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  LinearGradient,
} from 'expo-linear-gradient';

import { BlurView } from 'expo-blur';

import {
  Ionicons,
  Feather,
} from '@expo/vector-icons';

import {
  router,
} from 'expo-router';

const { width } =
  Dimensions.get('window');

// ================= DATA =================

const DOWNLOADS = [
  {
    id: '1',
    title: 'Money Heist',
    image:
      'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?q=80&w=1200',
    size: '1.2 GB',
    quality: 'HD',
    progress: '100%',
  },

  {
    id: '2',
    title: 'Stranger Things',
    image:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200',
    size: '850 MB',
    quality: 'Full HD',
    progress: '78%',
  },

  {
    id: '3',
    title: 'Avatar 2',
    image:
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200',
    size: '2.1 GB',
    quality: '4K',
    progress: '100%',
  },

  {
    id: '4',
    title: 'Dark',
    image:
      'https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?q=80&w=1200',
    size: '980 MB',
    quality: 'HD',
    progress: '65%',
  },
];

// ================= DOWNLOAD CARD =================

const DownloadCard = memo(
  ({ item }: any) => {
    const openMovie =
      useCallback(() => {
        router.push({
          pathname:
            '/movie-details',
          params: {
            id: item.id,
            title: item.title,
            image: item.image,
            quality:
              item.quality,
          },
        });
      }, [item]);

    return (
      <Pressable
        onPress={openMovie}
        android_ripple={{
          color:
            'rgba(255,255,255,0.08)',
        }}
        style={({ pressed }) => [
          styles.card,
          pressed &&
            styles.cardPressed,
        ]}
      >
        <ImageBackground
          source={{
            uri: item.image,
          }}
          style={styles.image}
          imageStyle={
            styles.imageRadius
          }
        >
          {/* OVERLAY */}

          <LinearGradient
            colors={[
              'transparent',
              'rgba(0,0,0,0.92)',
            ]}
            style={
              styles.imageOverlay
            }
          />

          {/* TOP */}

          <View style={styles.topRow}>
            <View
              style={
                styles.qualityTag
              }
            >
              <Text
                style={
                  styles.qualityText
                }
              >
                {item.quality}
              </Text>
            </View>

            <View
              style={
                styles.downloadedBadge
              }
            >
              <Ionicons
                name="checkmark"
                size={14}
                color="#000"
              />
            </View>
          </View>

          {/* PLAY */}

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.playBtn}
            onPress={openMovie}
          >
            <Ionicons
              name="play"
              size={20}
              color="#000"
            />
          </TouchableOpacity>
        </ImageBackground>

        {/* INFO */}

        <View style={styles.info}>
          <Text
            numberOfLines={1}
            style={styles.title}
          >
            {item.title}
          </Text>

          <Text style={styles.meta}>
            {item.size} •
            Downloaded
          </Text>

          <View
            style={
              styles.bottomRow
            }
          >
            {/* PROGRESS */}

            <View
              style={
                styles.progressBox
              }
            >
              <View
                style={
                  styles.progressBar
                }
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width:
                        item.progress,
                    },
                  ]}
                />
              </View>

              <Text
                style={
                  styles.progressText
                }
              >
                {item.progress}
              </Text>
            </View>

            {/* DELETE */}

            <TouchableOpacity
              activeOpacity={0.8}
              style={
                styles.deleteBtn
              }
            >
              <Feather
                name="trash-2"
                size={18}
                color="#FF5A5A"
              />
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    );
  }
);

DownloadCard.displayName =
  'DownloadCard';

// ================= MAIN SCREEN =================

export default function DownloadsScreen() {
  const renderItem =
    useCallback(
      ({ item }: any) => (
        <DownloadCard
          item={item}
        />
      ),
      []
    );

  const keyExtractor =
    useCallback(
      (item: any) => item.id,
      []
    );

  const headerComponent =
    useMemo(
      () => (
        <>
          {/* HEADER */}

          <View
            style={styles.header}
          >
            <View>
              <Text
                style={
                  styles.smallText
                }
              >
                Offline Library
              </Text>

              <Text
                style={
                  styles.heading
                }
              >
                Downloads
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={
                styles.headerBtn
              }
            >
              <Ionicons
                name="options-outline"
                size={22}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          {/* STORAGE */}

          <LinearGradient
            colors={[
              '#FFB800',
              '#FF8C00',
            ]}
            style={
              styles.storageCard
            }
          >
            <View>
              <Text
                style={
                  styles.storageLabel
                }
              >
                Storage Used
              </Text>

              <Text
                style={
                  styles.storageValue
                }
              >
                4.3 GB / 64 GB
              </Text>

              <View
                style={
                  styles.storageBar
                }
              >
                <View
                  style={
                    styles.storageFill
                  }
                />
              </View>
            </View>

            <BlurView
              intensity={40}
              tint="light"
              style={
                styles.downloadCircle
              }
            >
              <Ionicons
                name="download"
                size={28}
                color="#fff"
              />
            </BlurView>
          </LinearGradient>

          {/* SECTION */}

          <View
            style={styles.section}
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Downloaded Movies
            </Text>

            <Text
              style={
                styles.sectionMore
              }
            >
              {
                DOWNLOADS.length
              }{' '}
              Files
            </Text>
          </View>
        </>
      ),
      []
    );

  return (
    <SafeAreaView
      edges={['top']}
      style={styles.container}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* BACKGROUND */}

      <LinearGradient
        colors={[
          '#020617',
          '#07111F',
          '#020617',
        ]}
        style={
          StyleSheet.absoluteFillObject
        }
      />

      {/* GLOW EFFECT */}

      <View
        style={styles.blueGlow}
      />

      <View
        style={styles.orangeGlow}
      />

      {/* LIST */}

      <FlatList
        data={DOWNLOADS}
        renderItem={renderItem}
        keyExtractor={
          keyExtractor
        }
        ListHeaderComponent={
          headerComponent
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.listContent
        }
        initialNumToRender={4}
        maxToRenderPerBatch={
          6
        }
        windowSize={5}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
}

// ================= STYLES =================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },

  listContent: {
    paddingBottom: 140,
  },

  /* GLOW */

  blueGlow: {
    position: 'absolute',
    top: -120,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor:
      'rgba(0,140,255,0.12)',
  },

  orangeGlow: {
    position: 'absolute',
    bottom: 0,
    right: -100,
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor:
      'rgba(255,140,0,0.10)',
  },

  /* HEADER */

  header: {
    paddingHorizontal: 20,
    marginTop:
      Platform.OS ===
      'android'
        ? 10
        : 4,
    marginBottom: 28,
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  smallText: {
    color: '#94A3B8',
    fontSize: 13,
  },

  heading: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
  },

  headerBtn: {
    width: 48,
    height: 48,
    borderRadius: 18,
    justifyContent:
      'center',
    alignItems: 'center',
    backgroundColor:
      'rgba(255,255,255,0.05)',
  },

  /* STORAGE */

  storageCard: {
    marginHorizontal: 20,
    borderRadius: 30,
    padding: 24,
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    marginBottom: 34,
  },

  storageLabel: {
    color: '#fff',
    fontSize: 14,
  },

  storageValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 6,
  },

  storageBar: {
    width: width * 0.45,
    height: 8,
    borderRadius: 10,
    backgroundColor:
      'rgba(255,255,255,0.25)',
    marginTop: 16,
    overflow: 'hidden',
  },

  storageFill: {
    width: '40%',
    height: '100%',
    backgroundColor: '#fff',
  },

  downloadCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    justifyContent:
      'center',
    alignItems: 'center',
    backgroundColor:
      'rgba(255,255,255,0.18)',
  },

  /* SECTION */

  section: {
    paddingHorizontal: 20,
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },

  sectionMore: {
    color: '#FFB800',
    fontWeight: '700',
  },

  /* CARD */

  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor:
      'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.04)',
  },

  cardPressed: {
    transform: [
      {
        scale: 0.98,
      },
    ],
    opacity: 0.92,
  },

  image: {
    height: 210,
    justifyContent:
      'space-between',
    padding: 16,
  },

  imageRadius: {
    borderRadius: 22,
  },

  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  qualityTag: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor:
      'rgba(0,0,0,0.45)',
  },

  qualityText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },

  downloadedBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor:
      '#FFB800',
    justifyContent:
      'center',
    alignItems: 'center',
  },

  playBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
    justifyContent:
      'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },

  /* INFO */

  info: {
    padding: 18,
  },

  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },

  meta: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 6,
  },

  bottomRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  progressBox: {
    flex: 1,
    marginRight: 14,
  },

  progressBar: {
    height: 8,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor:
      'rgba(255,255,255,0.08)',
  },

  progressFill: {
    height: '100%',
    borderRadius: 10,
    backgroundColor:
      '#FFB800',
  },

  progressText: {
    color: '#94A3B8',
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },

  deleteBtn: {
    width: 48,
    height: 48,
    borderRadius: 18,
    justifyContent:
      'center',
    alignItems: 'center',
    backgroundColor:
      'rgba(255,255,255,0.05)',
  },
});