
// ✅ OPTIMIZED + CLICKABLE + SAFE AREA + CROSS PLATFORM
// app/(tabs)/wishlist.tsx

import React, {
  memo,
  useCallback,
  useMemo,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  Dimensions,
  Pressable,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  router,
} from 'expo-router';

const { width } =
  Dimensions.get('window');

const CARD_WIDTH =
  (width - 42) / 2;

// ================= DATA =================

const wishlistMovies = [
  {
    id: '1',
    title: 'Neon Protocol',
    genre: 'Sci-Fi',
    year: '2024',
    image:
      'https://images.unsplash.com/photo-1519608487953-e999c86e7455',
  },

  {
    id: '2',
    title: 'Beyond the Void',
    genre: 'Drama',
    year: '2023',
    image:
      'https://images.unsplash.com/photo-1502134249126-9f3755a50d78',
  },

  {
    id: '3',
    title: 'City of Shadows',
    genre: 'Thriller',
    year: '2024',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156',
  },

  {
    id: '4',
    title: 'Elden Realms',
    genre: 'Fantasy',
    year: '2023',
    image:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  },
];

const recommended = [
  {
    id: '1',
    title: 'The Courier',
    image:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
  },

  {
    id: '2',
    title: 'Whisper',
    image:
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c',
  },

  {
    id: '3',
    title: "The Crown's Fall",
    image:
      'https://images.unsplash.com/photo-1440404653325-ab127d49abc1',
  },
];

// ================= MOVIE CARD =================

const WishlistCard = memo(
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
            genre:
              item.genre,
            year: item.year,
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
        <Image
          source={{
            uri: item.image,
          }}
          style={styles.cardImage}
          resizeMode="cover"
        />

        {/* OVERLAY */}

        <View
          style={styles.overlay}
        />

        {/* HEART */}

        <TouchableOpacity
          activeOpacity={0.8}
          style={
            styles.heartButton
          }
        >
          <Ionicons
            name="heart"
            size={15}
            color="#FF4D6D"
          />
        </TouchableOpacity>

        {/* INFO */}

        <View
          style={styles.cardInfo}
        >
          <Text
            numberOfLines={1}
            style={
              styles.movieTitle
            }
          >
            {item.title}
          </Text>

          <Text
            style={
              styles.movieMeta
            }
          >
            {item.genre} •{' '}
            {item.year}
          </Text>
        </View>
      </Pressable>
    );
  }
);

WishlistCard.displayName =
  'WishlistCard';

// ================= RECOMMENDED CARD =================

const RecommendedCard = memo(
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
          styles.recommendCard,
          pressed && {
            opacity: 0.9,
            transform: [
              {
                scale: 0.97,
              },
            ],
          },
        ]}
      >
        <Image
          source={{
            uri: item.image,
          }}
          style={
            styles.recommendImage
          }
        />

        <Text
          numberOfLines={1}
          style={
            styles.recommendTitle
          }
        >
          {item.title}
        </Text>
      </Pressable>
    );
  }
);

RecommendedCard.displayName =
  'RecommendedCard';

// ================= SCREEN =================

export default function WishlistScreen() {
  const wishlistData =
    useMemo(
      () => wishlistMovies,
      []
    );

  const recommendedData =
    useMemo(
      () => recommended,
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

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <Text
              style={
                styles.heading
              }
            >
              My Wishlist
            </Text>

            <Text
              style={
                styles.subText
              }
            >
              12 Items
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={
              styles.menuButton
            }
          >
            <Ionicons
              name="options-outline"
              size={22}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* FILTER */}

        <View
          style={styles.filterRow}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            style={
              styles.sortButton
            }
          >
            <Text
              style={
                styles.sortLabel
              }
            >
              Sort by:
            </Text>

            <Text
              style={
                styles.sortValue
              }
            >
              Recently Added
            </Text>

            <Ionicons
              name="chevron-down"
              size={16}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={
              styles.gridButton
            }
          >
            <Ionicons
              name="grid-outline"
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* GRID */}

        <View style={styles.grid}>
          {wishlistData.map(
            (item) => (
              <WishlistCard
                key={item.id}
                item={item}
              />
            )
          )}
        </View>

        {/* RECOMMENDED */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Based on your Wishlist
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.recommendList
          }
        >
          {recommendedData.map(
            (item) => (
              <RecommendedCard
                key={item.id}
                item={item}
              />
            )
          )}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

// ================= STYLES =================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B14',
  },

  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 120,
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    marginTop:
      Platform.OS ===
      'android'
        ? 10
        : 4,
    marginBottom: 20,
  },

  heading: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },

  subText: {
    color: '#8D96A8',
    fontSize: 13,
    marginTop: 4,
  },

  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor:
      'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent:
      'center',
  },

  /* FILTER */

  filterRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      'rgba(255,255,255,0.05)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  sortLabel: {
    color: '#8D96A8',
    fontSize: 12,
    marginRight: 5,
  },

  sortValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },

  gridButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor:
      'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent:
      'center',
  },

  /* GRID */

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent:
      'space-between',
  },

  card: {
    width: CARD_WIDTH,
    height: 260,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 18,
    backgroundColor:
      '#121826',
  },

  cardPressed: {
    opacity: 0.92,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  cardImage: {
    width: '100%',
    height: '100%',
  },

  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 95,
    backgroundColor:
      'rgba(0,0,0,0.72)',
  },

  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor:
      'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent:
      'center',
  },

  cardInfo: {
    position: 'absolute',
    bottom: 14,
    left: 12,
    right: 12,
  },

  movieTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  movieMeta: {
    color: '#C5C8D0',
    fontSize: 12,
    marginTop: 4,
  },

  /* RECOMMENDED */

  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 16,
  },

  recommendList: {
    paddingRight: 10,
  },

  recommendCard: {
    width: 95,
    marginRight: 14,
  },

  recommendImage: {
    width: 95,
    height: 135,
    borderRadius: 18,
    backgroundColor:
      '#121826',
  },

  recommendTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
});

