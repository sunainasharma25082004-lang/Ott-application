
// app/movie-details.jsx

import React, { memo, useCallback, useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Image,
  Share,
  Alert,
  Platform,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { LinearGradient } from 'expo-linear-gradient';

import {
  Ionicons,
  Feather,
} from '@expo/vector-icons';

import {
  useLocalSearchParams,
  router,
} from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { apiClient } from '../src/lib/api';
import { openVideo } from '../src/utils/videoRouting';
import { useDownloads } from '../src/context/DownloadsContext';
import { getQualityVariants } from '../src/utils/cloudinaryVideo';

const { width, height } = Dimensions.get('window');

const CastCard = memo(({ item }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.castCard}
      onPress={() =>
        Alert.alert(item.name)
      }
    >
      <Image
        source={{
          uri: item.image,
        }}
        style={styles.castImage}
      />

      <Text style={styles.castName} numberOfLines={1}>
        {item.name}
      </Text>
      {!!item.character && (
        <Text style={styles.castCharacter} numberOfLines={1}>
          {item.character}
        </Text>
      )}
    </TouchableOpacity>
  );
});

const MoreMovieCard = memo(
  ({ item }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.movieCard}
        onPress={() =>
          router.push({
            pathname:
              '/movie-details',
            params: {
              id: item.id,
              title: item.title,
              image: item.image,
            },
          })
        }
      >
        <ImageBackground
          source={{
            uri: item.image,
          }}
          style={styles.moreCard}
          imageStyle={
            styles.moreCardRadius
          }
        >
          <LinearGradient
            colors={[
              'transparent',
              'rgba(0,0,0,0.95)',
            ]}
            style={
              styles.movieOverlay
            }
          />

          <View
            style={styles.movieInfo}
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
                styles.movieGenre
              }
            >
              {item.genre}
            </Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  }
);

export default function MovieDetails() {
  const { id, title, image } =
    useLocalSearchParams();
  const { isAuthenticated } = useAuth();

  // Full movie doc (videoUrl/duration) is not passed via nav params — fetch it by id.
  const [movie, setMovie] = useState(null);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    console.log('[MovieDetails] Fetching details for ID:', id);
    apiClient
      .get(`/movies/${id}`)
      .then((res) => {
        console.log('[MovieDetails] Fetch result:', res);
        if (!cancelled && res?.movie) setMovie(res.movie);
      })
      .catch((err) => {
        console.error('[MovieDetails] Fetch error:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // "More Like This" — real movies from the same primary genre (fallback: latest).
  useEffect(() => {
    if (!movie) return;
    let cancelled = false;
    const primaryGenre = movie.genres?.[0];
    const endpoint = primaryGenre
      ? `/movies?genre=${encodeURIComponent(primaryGenre)}&limit=10`
      : '/movies?limit=10';
    apiClient
      .get(endpoint)
      .then((res) => {
        if (cancelled) return;
        const items = (res?.movies || []).filter((m) => m._id !== movie._id).slice(0, 8);
        setRelated(items);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [movie]);

  // ── Display values derived from the real movie (fall back to nav params) ──
  const displayTitle = movie?.title || title || 'Untitled';
  const displayGenres = movie?.genres?.length ? movie.genres.join(' • ') : '—';
  const displayRating = typeof movie?.rating === 'number' ? movie.rating.toFixed(1) : null;
  const displayYear = movie?.releaseYear || null;
  const displayLanguage = movie?.language || null;
  const displayDuration = (() => {
    const mins = movie?.duration;
    if (!mins) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  })();
  const displayCast = movie?.cast?.length ? movie.cast : null;
  const heroImage = movie?.poster || movie?.thumbnail || image;

  const checkAuth = useCallback((actionDesc, successCallback) => {
    if (!isAuthenticated) {
      Alert.alert(
        'Authentication Required',
        `You need to register or login first to ${actionDesc}.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Login / Register',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    } else {
      successCallback();
    }
  }, [isAuthenticated]);

  const handleLike =
    useCallback(() => {
      checkAuth('add this movie to favorites', () => {
        Alert.alert(
          '❤️ Added to Favorites',
          `${title} saved successfully!`
        );
      });
    }, [title, checkAuth]);

  const handleShare =
    useCallback(async () => {
      try {
        await Share.share({
          message: `🎬 Check out ${title} — an amazing movie!`,
        });
      } catch (error) {
        console.log(error);
      }
    }, [title]);

  const handleWatch =
    useCallback(() => {
      checkAuth('watch premium movies', () => {
        if (!movie?.videoUrl) {
          Alert.alert('Video Unavailable', 'This movie has no playable video yet.');
          return;
        }
        openVideo({
          id: movie._id,
          videoUrl: movie.videoUrl,
          title: movie.title || title,
          thumbnail: movie.thumbnail || movie.poster || image,
          durationSeconds: (movie.duration || 0) * 60,
          contentType: 'Movie',
        });
      });
    }, [movie, title, image, checkAuth]);

  const { startDownload, activeDownloads } = useDownloads();

  const handleDownload =
    useCallback(() => {
      checkAuth('download movies', () => {
        if (!movie?.videoUrl || movie.isDummy) {
          Alert.alert('Cannot Download', 'This movie has no playable video.');
          return;
        }

        if (Platform.OS === 'web') {
          try {
            const link = document.createElement('a');
            link.href = movie.videoUrl;
            link.setAttribute('download', `${movie.title || 'movie'}.mp4`);
            link.setAttribute('target', '_blank');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (e) {
            window.open(movie.videoUrl, '_blank');
          }
          return;
        }

        const variants = getQualityVariants(movie.videoUrl);
        const bestQuality = variants[0] || { label: 'Auto', url: movie.videoUrl };
        startDownload(
          {
            id: movie._id,
            videoUrl: movie.videoUrl,
            title: movie.title || title,
            thumbnail: movie.thumbnail || movie.poster || image,
            durationSeconds: (movie.duration || 0) * 60,
            contentType: 'Movie',
          },
          bestQuality
        ).then(() => {
          Alert.alert('✓ Download Complete', `${title} saved to Downloads`);
        }).catch((e) => {
          Alert.alert('Download Failed', e?.message || 'Could not download video');
        });
      });
    }, [movie, title, image, checkAuth, startDownload]);

  const handleAdd =
    useCallback(() => {
      checkAuth('add movies to your watchlist', () => {
        Alert.alert(
          '➕ Added',
          `${title} added to your watchlist!`
        );
      });
    }, [title, checkAuth]);

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top']}
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
        {/* HERO */}

        <ImageBackground
          source={{
            uri:
              heroImage ||
              'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1400',
          }}
          style={styles.hero}
          resizeMode="cover"
        >
          <LinearGradient
            colors={[
              'rgba(0,0,0,0.15)',
              'rgba(0,0,0,0.55)',
              '#020617',
            ]}
            locations={[
              0,
              0.45,
              1,
            ]}
            style={styles.overlay}
          />

          {/* TOP BAR */}

          <View style={styles.topBar}>
            {/* BACK */}

            <TouchableOpacity
              style={styles.glassBtn}
              activeOpacity={0.8}
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/(tabs)/home');
                }
              }}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color="#fff"
              />
            </TouchableOpacity>

            <View
              style={
                styles.topActions
              }
            >
              {/* LIKE */}

              <TouchableOpacity
                style={
                  styles.glassBtn
                }
                activeOpacity={0.8}
                onPress={
                  handleLike
                }
              >
                <Feather
                  name="heart"
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>

              {/* SHARE */}

              <TouchableOpacity
                style={
                  styles.glassBtn
                }
                activeOpacity={0.8}
                onPress={
                  handleShare
                }
              >
                <Ionicons
                  name="share-social-outline"
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* CONTENT */}

          <View
            style={styles.content}
          >
            {(movie?.isTrending || movie?.isNewRelease) && (
              <View
                style={styles.badge}
              >
                <View
                  style={
                    styles.liveDot
                  }
                />

                <Text
                  style={
                    styles.badgeText
                  }
                >
                  {movie?.isTrending ? 'TRENDING NOW' : 'NEW RELEASE'}
                </Text>
              </View>
            )}

            {/* DYNAMIC TITLE */}

            <Text
              style={styles.title}
            >
              {displayTitle}
            </Text>

            <Text
              style={styles.genre}
            >
              {displayGenres}
            </Text>

            {/* STATS */}

            <View
              style={
                styles.statsRow
              }
            >
              {displayRating && (
                <View style={styles.statCard}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.statText}>{displayRating}</Text>
                </View>
              )}

              {displayDuration && (
                <View style={styles.statCard}>
                  <Ionicons name="time-outline" size={16} color="#60A5FA" />
                  <Text style={styles.statText}>{displayDuration}</Text>
                </View>
              )}

              {displayYear && (
                <View style={styles.statCard}>
                  <Ionicons name="calendar-outline" size={16} color="#34D399" />
                  <Text style={styles.statText}>{displayYear}</Text>
                </View>
              )}

              {displayLanguage && (
                <View style={styles.statCard}>
                  <Ionicons name="language-outline" size={16} color="#F472B6" />
                  <Text style={styles.statText}>{displayLanguage}</Text>
                </View>
              )}
            </View>

            {/* DESCRIPTION */}

            <Text
              style={
                styles.description
              }
            >
              {movie?.description || 'No description available for this title yet.'}
            </Text>

            {/* BUTTONS */}

            <View
              style={
                styles.buttons
              }
            >
              {/* WATCH */}

              <TouchableOpacity
                style={
                  styles.playBtn
                }
                activeOpacity={0.9}
                onPress={
                  handleWatch
                }
              >
                <LinearGradient
                  colors={[
                    '#ffffff',
                    '#dbeafe',
                  ]}
                  start={{
                    x: 0,
                    y: 0,
                  }}
                  end={{
                    x: 1,
                    y: 1,
                  }}
                  style={
                    styles.playGradient
                  }
                >
                  <Ionicons
                    name="play"
                    size={18}
                    color="#000"
                  />

                  <Text
                    style={
                      styles.playText
                    }
                  >
                    Watch Now
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* DOWNLOAD */}

              <TouchableOpacity
                style={
                  styles.secondaryBtn
                }
                activeOpacity={0.8}
                onPress={
                  handleDownload
                }
              >
                <Ionicons
                  name="download-outline"
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>

              {/* ADD */}

              <TouchableOpacity
                style={
                  styles.secondaryBtn
                }
                activeOpacity={0.8}
                onPress={
                  handleAdd
                }
              >
                <Ionicons
                  name="add"
                  size={22}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>

        {/* CAST — real data from the movie */}

        {displayCast && (
          <View style={styles.section}>
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
                Top Cast
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
            >
              {displayCast.map((item, idx) => (
                <CastCard
                  key={idx}
                  item={{
                    id: idx,
                    name: item.character ? `${item.name}` : item.name,
                    character: item.character,
                    image: item.image || 'https://i.pravatar.cc/150?u=' + encodeURIComponent(item.name),
                  }}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* TRAILER */}

        {movie?.trailerUrl && (
          <View style={styles.section}>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Trailer Preview
            </Text>

            <ImageBackground
              source={{
                uri: movie.thumbnail || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200',
              }}
              style={styles.trailer}
              imageStyle={
                styles.trailerRadius
              }
            >
              <LinearGradient
                colors={[
                  'transparent',
                  'rgba(0,0,0,0.95)',
                ]}
                style={
                  styles.trailerOverlay
                }
              />

              <TouchableOpacity
                style={
                  styles.playCircle
                }
                activeOpacity={0.8}
                onPress={() => openVideo({
                  id: movie._id,
                  videoUrl: movie.trailerUrl,
                  title: `${movie.title} - Trailer`,
                  thumbnail: movie.thumbnail,
                  durationSeconds: 180,
                  contentType: 'Movie',
                })}
              >
              <LinearGradient
                colors={[
                  '#fff',
                  '#dbeafe',
                ]}
                style={
                  styles.circleGradient
                }
              >
                <Ionicons
                  name="play"
                  size={30}
                  color="#000"
                />
              </LinearGradient>
            </TouchableOpacity>

            <View
              style={
                styles.trailerBottom
              }
            >
              <Text
                style={
                  styles.trailerTitle
                }
              >
                Official Trailer
              </Text>

              <Text
                style={
                  styles.trailerSub
                }
              >
                2m 14s • 4K Ultra HD
              </Text>
            </View>
          </ImageBackground>
        </View>
        )}

        {/* MORE MOVIES — real related content */}

        {related.length > 0 && (
          <View style={styles.section}>
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
                More Like This
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
            >
              {related.map(
                (item) => (
                  <MoreMovieCard
                    key={item._id}
                    item={{
                      id: item._id,
                      title: item.title,
                      genre: (item.genres || [])[0] || 'Movie',
                      image: item.thumbnail || item.poster || 'https://picsum.photos/400/600',
                    }}
                  />
                )
              )}
            </ScrollView>
          </View>
        )}

        <View
          style={{ height: 40 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },

  scrollContent: {
    paddingBottom: 20,
  },

  hero: {
    width: '100%',
    height:
      Platform.OS === 'ios'
        ? height * 0.82
        : height * 0.88,
    justifyContent:
      'space-between',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  topBar: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop:
      Platform.OS === 'android'
        ? 16
        : 8,
  },

  topActions: {
    flexDirection: 'row',
  },

  glassBtn: {
    width: 48,
    height: 48,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.15)',
    marginLeft: 10,
  },

  content: {
    paddingHorizontal: 24,
    paddingBottom: 34,
  },

  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    marginBottom: 18,
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.12)',
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    marginRight: 8,
  },

  badgeText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1,
  },

  title: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  genre: {
    color: '#CBD5E1',
    fontSize: 16,
    marginTop: 10,
    letterSpacing: 1,
  },

  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 24,
  },

  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    marginRight: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.08)',
  },

  statText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '700',
    fontSize: 13,
  },

  description: {
    color: '#CBD5E1',
    lineHeight: 30,
    marginTop: 24,
    fontSize: 15,
  },

  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 34,
  },

  playBtn: {
    flex: 1,
  },

  playGradient: {
    flexDirection: 'row',
    justifyContent:
      'center',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 22,
  },

  playText: {
    color: '#000',
    fontWeight: '900',
    marginLeft: 10,
    fontSize: 15,
  },

  secondaryBtn: {
    width: 62,
    height: 62,
    borderRadius: 22,
    justifyContent:
      'center',
    alignItems: 'center',
    backgroundColor:
      'rgba(255,255,255,0.08)',
    marginLeft: 14,
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.08)',
  },

  section: {
    marginTop: 30,
    paddingHorizontal: 20,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  sectionTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
  },

  seeAll: {
    color: '#60A5FA',
    fontWeight: '700',
  },

  castCard: {
    alignItems: 'center',
    marginRight: 18,
  },

  castImage: {
    width: 74,
    height: 74,
    borderRadius: 37,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#1E293B',
  },

  castName: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 84,
    textAlign: 'center',
  },

  castCharacter: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
    maxWidth: 84,
    textAlign: 'center',
  },

  trailer: {
    height: 240,
    justifyContent:
      'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 16,
  },

  trailerRadius: {
    borderRadius: 30,
  },

  trailerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  playCircle: {
    justifyContent:
      'center',
    alignItems: 'center',
  },

  circleGradient: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent:
      'center',
    alignItems: 'center',
  },

  trailerBottom: {
    position: 'absolute',
    left: 24,
    bottom: 22,
  },

  trailerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },

  trailerSub: {
    color: '#CBD5E1',
    marginTop: 6,
  },

  movieCard: {
    marginRight: 18,
  },

  moreCard: {
    width: width * 0.42,
    height: 260,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },

  moreCardRadius: {
    borderRadius: 26,
  },

  movieOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  movieInfo: {
    padding: 16,
  },

  movieTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },

  movieGenre: {
    color: '#CBD5E1',
    marginTop: 4,
  },
});

