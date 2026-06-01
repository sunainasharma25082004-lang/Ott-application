
// app/(tabs)/search.tsx

import React, {
  memo,
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  Platform,
  StatusBar,
  Dimensions,
  Pressable,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  Ionicons,
  MaterialIcons,
} from '@expo/vector-icons';

import {
  router,
} from 'expo-router';

const { width } =
  Dimensions.get('window');

// ================= CONSTANTS =================

const CARD_WIDTH =
  width * 0.42;

const CATEGORIES = [
  'All',
  'Movies',
  'People',
  'Genres',
];

const RECENT_SEARCHES = [
  'Stellar Drift',
  'Sci-Fi Thrillers 2024',
  'James Miller Movies',
];

const TRENDING = [
  'Neon Protocol',
  'Cyberpunk 2077',
  'Space Opera',
  'Elena Rivera',
];

const MOVIES = [
  {
    id: '1',
    title: 'Neon Protocol',
    year: '2023',
    genre: 'Sci-Fi',
    rating: '4.8',
    image:
      'https://images.unsplash.com/photo-1519608487953-e999c86e7455?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'Beyond the Void',
    year: '2022',
    genre: 'Thriller',
    rating: '4.9',
    image:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
  },
];

// ================= MOVIE CARD =================

const MovieCard = memo(
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
            'rgba(255,255,255,0.12)',
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

        {/* RATING */}

        <View
          style={
            styles.ratingContainer
          }
        >
          <Ionicons
            name="star"
            size={10}
            color="#FFD700"
          />

          <Text style={styles.rating}>
            {item.rating}
          </Text>
        </View>

        {/* CONTENT */}

        <View
          style={styles.cardContent}
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
            style={styles.movieInfo}
          >
            {item.year} •{' '}
            {item.genre}
          </Text>
        </View>
      </Pressable>
    );
  }
);

MovieCard.displayName =
  'MovieCard';

// ================= MAIN SCREEN =================

export default function SearchScreen() {
  const [selectedCategory,
    setSelectedCategory] =
    useState('All');

  // OPTIMIZED RENDER

  const renderMovie =
    useCallback(
      ({ item }: any) => (
        <MovieCard item={item} />
      ),
      []
    );

  const keyExtractor =
    useCallback(
      (item: any) => item.id,
      []
    );

  // MEMOIZED DATA

  const filteredMovies =
    useMemo(() => {
      return MOVIES;
    }, [selectedCategory]);

  return (
    <SafeAreaView
      edges={['top']}
      style={styles.safeArea}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <View style={styles.container}>
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
            {/* BACK */}

            <TouchableOpacity
              activeOpacity={0.8}
              style={
                styles.backButton
              }
              onPress={() =>
                router.back()
              }
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color="#fff"
              />
            </TouchableOpacity>

            {/* SEARCH */}

            <View
              style={
                styles.searchContainer
              }
            >
              <Ionicons
                name="search"
                size={18}
                color="#8B8B8B"
              />

              <TextInput
                placeholder="Search movies, actors..."
                placeholderTextColor="#777"
                style={styles.input}
                cursorColor="#FFD166"
              />

              <MaterialIcons
                name="keyboard-voice"
                size={20}
                color="#8B8B8B"
              />
            </View>
          </View>

          {/* CATEGORIES */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.categoryContainer
            }
          >
            {CATEGORIES.map(
              (item) => {
                const isActive =
                  selectedCategory ===
                  item;

                return (
                  <TouchableOpacity
                    key={item}
                    activeOpacity={
                      0.8
                    }
                    onPress={() =>
                      setSelectedCategory(
                        item
                      )
                    }
                    style={[
                      styles.categoryButton,
                      isActive &&
                        styles.activeCategory,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        isActive &&
                          styles.activeCategoryText,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }
            )}
          </ScrollView>

          {/* RECENT SEARCHES */}

          <View
            style={
              styles.sectionHeader
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Recent Searches
            </Text>

            <TouchableOpacity>
              <Text
                style={
                  styles.clearText
                }
              >
                Clear All
              </Text>
            </TouchableOpacity>
          </View>

          {RECENT_SEARCHES.map(
            (item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                style={
                  styles.recentItem
                }
              >
                <View
                  style={
                    styles.recentLeft
                  }
                >
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color="#7A7A7A"
                  />

                  <Text
                    style={
                      styles.recentText
                    }
                  >
                    {item}
                  </Text>
                </View>

                <Ionicons
                  name="close"
                  size={18}
                  color="#666"
                />
              </TouchableOpacity>
            )
          )}

          {/* TRENDING */}

          <Text
            style={
              styles.sectionTitle
            }
          >
            🔥 Trending Now
          </Text>

          <View
            style={
              styles.tagsWrapper
            }
          >
            {TRENDING.map(
              (item, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  style={styles.tag}
                >
                  <Text
                    style={
                      styles.tagText
                    }
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>

          {/* MOVIES */}

          <Text
            style={
              styles.sectionTitle
            }
          >
            Top Results
          </Text>

          <FlatList
            horizontal
            data={filteredMovies}
            renderItem={
              renderMovie
            }
            keyExtractor={
              keyExtractor
            }
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.movieList
            }
            initialNumToRender={
              4
            }
            maxToRenderPerBatch={
              6
            }
            windowSize={5}
            removeClippedSubviews
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ================= STYLES =================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050505',
  },

  container: {
    flex: 1,
    backgroundColor: '#050505',
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 120,
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop:
      Platform.OS ===
      'android'
        ? 10
        : 4,
  },

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#111',
    justifyContent:
      'center',
    alignItems: 'center',
    marginRight: 12,
  },

  searchContainer: {
    flex: 1,
    height: 54,
    backgroundColor: '#111',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F1F1F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  input: {
    flex: 1,
    color: '#fff',
    marginHorizontal: 10,
    fontSize: 14,
  },

  /* CATEGORY */

  categoryContainer: {
    paddingTop: 24,
    paddingBottom: 10,
  },

  categoryButton: {
    backgroundColor: '#111',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },

  activeCategory: {
    backgroundColor:
      '#FFD166',
    borderColor:
      '#FFD166',
  },

  categoryText: {
    color: '#AAA',
    fontSize: 13,
    fontWeight: '600',
  },

  activeCategoryText: {
    color: '#000',
  },

  /* SECTION */

  sectionHeader: {
    marginTop: 20,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 16,
  },

  clearText: {
    color: '#FFB84D',
    fontWeight: '600',
    fontSize: 13,
  },

  /* RECENT */

  recentItem: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor:
      '#141414',
  },

  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  recentText: {
    color: '#DDD',
    fontSize: 14,
    marginLeft: 10,
  },

  /* TAGS */

  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  tag: {
    backgroundColor: '#111',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },

  tagText: {
    color: '#DDD',
    fontSize: 13,
  },

  /* MOVIES */

  movieList: {
    paddingBottom: 20,
  },

  card: {
    width: CARD_WIDTH,
    marginRight: 16,
  },

  cardPressed: {
    transform: [
      {
        scale: 0.97,
      },
    ],
    opacity: 0.92,
  },

  cardImage: {
    width: '100%',
    height: 240,
    borderRadius: 24,
    backgroundColor: '#111',
  },

  ratingContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor:
      'rgba(0,0,0,0.75)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },

  rating: {
    color: '#FFF',
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '600',
  },

  cardContent: {
    marginTop: 12,
  },

  movieTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },

  movieInfo: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
});

