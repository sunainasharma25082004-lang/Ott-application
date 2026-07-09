// app/(tabs)/search.tsx
import React, {
  memo,
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
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
  ActivityIndicator,
  Animated,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { apiClient } from '../../src/lib/api';
import { openVideo, VideoItem } from '../../src/utils/videoRouting';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.44;

const CATEGORIES = ['All', 'Movies', 'Series', 'Talents'];

const TRENDING_TAGS = [
  'Neon Protocol',
  'Beyond the Void',
  'Talent Showcase',
  'Sci-Fi',
  'Thriller',
];

// ================= RESULTS MOVIE CARD =================
const MovieCard = memo(({ item, talentFeed }: { item: any; talentFeed: VideoItem[] }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const openItem = useCallback(() => {
    if (item.type === 'Talent') {
      const id = item.id || item._id;
      const talentItem: VideoItem = {
        id,
        videoUrl: item.auditionVideo,
        title: item.title || item.name,
        thumbnail: item.image || item.thumbnail,
        durationSeconds: item.duration || 9999,
        contentType: 'Talent',
        subtitle: item.category,
        category: item.category,
      };
      openVideo(talentItem, talentFeed);
    } else if (item.type === 'Series') {
      router.push({
        pathname: '/series/[id]',
        params: {
          id: item.id || item._id,
          title: item.title || item.name,
          image: item.image || item.thumbnail || 'https://i.pravatar.cc/300',
        },
      });
    } else {
      router.push({
        pathname: '/movie-details',
        params: {
          id: item.id || item._id,
          title: item.title || item.name,
          image: item.image || item.thumbnail || item.avatar || 'https://i.pravatar.cc/300',
        },
      });
    }
  }, [item, talentFeed]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], width: '47%', marginBottom: 16 }}>
      <Pressable
        onPress={openItem}
        android_ripple={{ color: 'rgba(255,255,255,0.1)' }}
        style={styles.card}
      >
        <Image
          source={{ uri: item.image || item.thumbnail || item.avatar || 'https://i.pravatar.cc/300' }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        
        {/* RATING */}
        {(item.rating || item.views !== undefined) && (
          <View style={styles.ratingContainer}>
            <Ionicons name={item.rating ? "star" : "eye"} size={10} color="#FFD166" />
            <Text style={styles.rating}>
              {item.rating ? item.rating : item.views}
            </Text>
          </View>
        )}

        {/* CONTENT */}
        <View style={styles.cardContent}>
          <Text numberOfLines={1} style={styles.movieTitle}>
            {item.title || item.name}
          </Text>
          <Text style={styles.movieInfo}>
            {item.type || 'Media'} {item.releaseYear ? `• ${item.releaseYear}` : ''}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
});

MovieCard.displayName = 'MovieCard';

// ================= MAIN SEARCH SCREEN =================
export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Neon Protocol',
    'Beyond the Void',
    'Sci-Fi',
  ]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceText, setVoiceText] = useState('Listening...');
  const voicePulse = useRef(new Animated.Value(1)).current;

  // Voice Pulse Animation
  useEffect(() => {
    let animation: Animated.CompositeAnimation;
    if (isVoiceActive) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(voicePulse, {
            toValue: 1.4,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(voicePulse, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      voicePulse.setValue(1);
    }
    return () => animation?.stop();
  }, [isVoiceActive]);

  // Debounced search logic
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      performSearch(query);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const res: any = await apiClient.get(`/search?q=${encodeURIComponent(searchTerm)}`);
      if (res?.results) {
        setResults(res.results);
      }
    } catch (e) {
      console.log('Search API failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = () => {
    if (query.trim() && !recentSearches.includes(query.trim())) {
      setRecentSearches(prev => [query.trim(), ...prev.slice(0, 4)]);
    }
    performSearch(query);
  };

  const selectRecentSearch = (term: string) => {
    setQuery(term);
    performSearch(term);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const removeRecentSearchItem = (index: number) => {
    setRecentSearches(prev => prev.filter((_, i) => i !== index));
  };

  // Start voice search simulation
  const startVoiceSearch = () => {
    setIsVoiceActive(true);
    setVoiceText('Listening...');
    
    // Simulate hearing voice input after 2 seconds
    setTimeout(() => {
      setVoiceText('Thinking...');
      setTimeout(() => {
        const randomTrending = TRENDING_TAGS[Math.floor(Math.random() * TRENDING_TAGS.length)];
        setVoiceText(`"${randomTrending}"`);
        setTimeout(() => {
          setIsVoiceActive(false);
          setQuery(randomTrending);
          performSearch(randomTrending);
        }, 800);
      }, 1000);
    }, 1800);
  };

  // Filter based on category tabs
  const filteredResults = useMemo(() => {
    if (selectedCategory === 'All') return results;
    if (selectedCategory === 'Movies') return results.filter(r => r.type === 'Movie');
    if (selectedCategory === 'Series') return results.filter(r => r.type === 'Series');
    if (selectedCategory === 'Talents') return results.filter(r => r.type === 'Talent');
    return results;
  }, [results, selectedCategory]);

  // Short talent clips from the current filtered results become the Reels swipe feed
  // when the user taps one — "see all the video only like this" from search.
  const talentFeed = useMemo<VideoItem[]>(
    () =>
      filteredResults
        .filter((r: any) => r.type === 'Talent')
        .map((r: any) => ({
          id: r.id || r._id,
          videoUrl: r.auditionVideo,
          title: r.title || r.name,
          thumbnail: r.image || r.thumbnail,
          durationSeconds: r.duration || 9999,
          contentType: 'Talent' as const,
          subtitle: r.category,
          category: r.category,
        })),
    [filteredResults]
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View style={styles.container}>
        {/* HEADER & SEARCH BAR */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#8B8B8B" />
            <TextInput
              placeholder="Search movies, series, stars..."
              placeholderTextColor="#777"
              style={styles.input}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearchSubmit}
              cursorColor="#FFD166"
              returnKeyType="search"
            />
            {query.length > 0 ? (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={18} color="#8B8B8B" style={{ marginRight: 8 }} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={startVoiceSearch}>
              <MaterialIcons name="keyboard-voice" size={20} color="#FFD166" />
            </TouchableOpacity>
          </View>
        </View>

        {/* CATEGORY TABS */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          >
            {CATEGORIES.map(item => {
              const isActive = selectedCategory === item;
              return (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.8}
                  onPress={() => setSelectedCategory(item)}
                  style={[styles.categoryButton, isActive && styles.activeCategory]}
                >
                  <Text style={[styles.categoryText, isActive && styles.activeCategoryText]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* MAIN BODY AREA */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#FFD166" />
            <Text style={styles.loadingText}>Searching the catalog...</Text>
          </View>
        ) : query.trim().length >= 2 ? (
          /* SEARCH RESULTS GRID */
          filteredResults.length > 0 ? (
            <FlatList
              data={filteredResults}
              renderItem={({ item }) => <MovieCard item={item} talentFeed={talentFeed} />}
              keyExtractor={item => String(item.id || item._id)}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
              contentContainerStyle={styles.gridContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            /* NO RESULTS STATE */
            <View style={styles.centerContainer}>
              <Ionicons name="search-outline" size={64} color="#333" />
              <Text style={styles.emptyTitle}>No Results Found</Text>
              <Text style={styles.emptySubtitle}>Try searching for something else or check spelling</Text>
            </View>
          )
        ) : (
          /* SEARCH SUGGESTIONS & RECENT SEARCHES */
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsContent}
          >
            {/* RECENT SEARCHES */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <TouchableOpacity onPress={clearRecentSearches}>
                    <Text style={styles.clearText}>Clear All</Text>
                  </TouchableOpacity>
                </View>

                {recentSearches.map((item, index) => (
                  <View key={index} style={styles.recentItem}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => selectRecentSearch(item)}
                      style={styles.recentLeft}
                    >
                      <Ionicons name="time-outline" size={18} color="#7A7A7A" />
                      <Text style={styles.recentText}>{item}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeRecentSearchItem(index)}>
                      <Ionicons name="close" size={18} color="#666" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* TRENDING SEARCHES */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔥 Trending Searches</Text>
              <View style={styles.tagsWrapper}>
                {TRENDING_TAGS.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.8}
                    onPress={() => selectRecentSearch(item)}
                    style={styles.tag}
                  >
                    <Text style={styles.tagText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      {/* VOICE SEARCH MODAL */}
      <Modal visible={isVoiceActive} transparent animationType="fade">
        <View style={styles.voiceOverlay}>
          <View style={styles.voiceCard}>
            <Text style={styles.voiceTitle}>Voice Search</Text>
            <Text style={styles.voiceSub}>{voiceText}</Text>
            
            {/* Animated Mic Ring */}
            <View style={styles.micCircleContainer}>
              <Animated.View
                style={[
                  styles.pulseRing,
                  {
                    transform: [{ scale: voicePulse }],
                    opacity: voicePulse.interpolate({
                      inputRange: [1, 1.4],
                      outputRange: [0.6, 0],
                    }),
                  },
                ]}
              />
              <View style={styles.micCircle}>
                <Ionicons name="mic" size={32} color="#111" />
              </View>
            </View>

            <TouchableOpacity
              style={styles.voiceCancel}
              onPress={() => setIsVoiceActive(false)}
            >
              <Text style={styles.voiceCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: Platform.OS === 'android' ? 10 : 4,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#111',
    justifyContent: 'center',
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
  categoryContainer: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 10,
    gap: 8,
  },
  categoryButton: {
    backgroundColor: '#111',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F1F1F',
    marginRight: 8,
  },
  activeCategory: {
    backgroundColor: '#FFD166',
    borderColor: '#FFD166',
  },
  categoryText: {
    color: '#AAA',
    fontSize: 13,
    fontWeight: '600',
  },
  activeCategoryText: {
    color: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    color: '#666',
    marginTop: 12,
    fontSize: 14,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtitle: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  suggestionsContent: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  clearText: {
    color: '#FFB84D',
    fontWeight: '600',
    fontSize: 13,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#141414',
  },
  recentLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentText: {
    color: '#DDD',
    fontSize: 14,
    marginLeft: 10,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
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
  gridContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 80,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  card: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  cardImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#1C1C1E',
  },
  ratingContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  cardContent: {
    padding: 12,
  },
  movieTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  movieInfo: {
    color: '#888',
    fontSize: 11,
    marginTop: 4,
  },
  /* VOICE MODAL */
  voiceOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceCard: {
    width: width * 0.8,
    backgroundColor: '#111',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  voiceTitle: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  voiceSub: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'center',
  },
  micCircleContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
  },
  micCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFD166',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  pulseRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFD166',
    zIndex: 1,
  },
  voiceCancel: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#222',
  },
  voiceCancelText: {
    color: '#AAA',
    fontSize: 14,
    fontWeight: '600',
  },
});
