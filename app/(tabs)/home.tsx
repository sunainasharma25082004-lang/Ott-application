// app/(tabs)/home.tsx

import React, { memo, useCallback } from "react";
import { router } from "expo-router";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  ImageBackground,
  Dimensions,
  StatusBar,
  Platform,
  Pressable,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { LinearGradient } from "expo-linear-gradient";

import { BlurView } from "expo-blur";

import { Ionicons, Feather } from "@expo/vector-icons";

import { categories } from "../../src/constants/movies";
import { apiClient } from "../../src/lib/api";

const { width } = Dimensions.get("window");

const HERO =
  "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200";

type MovieItem = {
  id: string;
  title: string;
  image: string;
};

const CARD_WIDTH = width * 0.42;

const MovieCard = memo(({ item }: { item: MovieItem }) => {
  const handleOpenMovie = useCallback(() => {
    router.push({
      pathname: "/movie-details",
      params: {
        id: item.id,
        title: item.title,
        image: item.image,
      },
    });
  }, [item]);

  return (
    <Pressable
      onPress={handleOpenMovie}
      android_ripple={{ color: "rgba(255,255,255,0.15)" }}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.cardImage}
        imageStyle={styles.cardRadius}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.92)"]}
          style={styles.cardOverlay}
        />

        <View style={styles.cardTop}>
          <BlurView intensity={40} tint="dark" style={styles.ratingBox}>
            <Ionicons name="star" size={10} color="#FFD700" />

            <Text style={styles.ratingText}>4.8</Text>
          </BlurView>

          <TouchableOpacity activeOpacity={0.7} style={styles.heartBtn}>
            <Ionicons name="heart-outline" size={15} color="#fff" />
          </TouchableOpacity>
        </View>

        <View>
          <Text numberOfLines={1} style={styles.movieTitle}>
            {item.title}
          </Text>

          <Text style={styles.movieGenre}>Action • Sci-Fi</Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
});

MovieCard.displayName = "MovieCard";

export default function HomeScreen() {
  const [trendingMovies, setTrendingMovies] = React.useState<MovieItem[]>([]);
  const [moviesLoading, setMoviesLoading] = React.useState(true);

  React.useEffect(() => {
    const loadMovies = async () => {
      try {
        const res: any = await apiClient.get("/movies?limit=8");
        const mapped = (res.movies || []).map((m: any) => ({
          id: m._id || m.id,
          title: m.title,
          image: m.thumbnail || m.poster || "https://picsum.photos/400/600",
        }));
        setTrendingMovies(mapped.length ? mapped : require("../../src/constants/movies").trendingMovies);
      } catch {
        const fallback = require("../../src/constants/movies").trendingMovies;
        setTrendingMovies(fallback || []);
      } finally {
        setMoviesLoading(false);
      }
    };
    loadMovies();
  }, []);

  const renderMovieCard = useCallback(
    ({ item }: { item: MovieItem }) => <MovieCard item={item} />,
    []
  );

  const keyExtractor = useCallback((item: MovieItem) => item.id, []);

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* BACKGROUND */}
      <LinearGradient
        colors={["#020617", "#071019", "#020617"]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* SOFT GLOW */}
      <View style={styles.blueGlow} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Welcome Back</Text>

            <Text style={styles.heading}>Stream Everywhere</Text>
          </View>

          <TouchableOpacity activeOpacity={0.8}>
            <ImageBackground
              source={{
                uri: "https://i.pravatar.cc/300",
              }}
              style={styles.profile}
              imageStyle={styles.profileRadius}
            />
          </TouchableOpacity>
        </View>

        {/* SEARCH */}
        <BlurView intensity={40} tint="dark" style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#94A3B8" />

          <TextInput
            placeholder="Search movies"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />

          <Feather name="sliders" size={18} color="#fff" />
        </BlurView>

        {/* HERO */}
        <ImageBackground
          source={{ uri: HERO }}
          style={styles.hero}
          imageStyle={styles.heroRadius}
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.96)"]}
            style={styles.heroOverlay}
          />

          <View style={styles.heroTop}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />

              <Text style={styles.liveText}>NEW RELEASE</Text>
            </View>
          </View>

          <View style={styles.heroBottom}>
            <Text style={styles.heroTitle}>THE LAST WORLD</Text>

            <Text style={styles.heroDesc}>
              A cinematic journey through mystery, action and survival.
            </Text>

            <View style={styles.heroButtons}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.playBtn}
                onPress={() => router.push("/movie-details")}
              >
                <Ionicons name="play" size={18} color="#000" />

                <Text style={styles.playText}>Play Now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.plusBtn}
              >
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>

        {/* CATEGORIES */}
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.category,
                index === 0 && styles.activeCategory,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  index === 0 && styles.activeCategoryText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* TRENDING */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending</Text>

          <Text style={styles.seeAll}>See All</Text>
        </View>

        <FlatList
          horizontal
          data={trendingMovies}
          renderItem={renderMovieCard}
          keyExtractor={keyExtractor}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.moviesList}
          initialNumToRender={4}
          maxToRenderPerBatch={6}
          windowSize={5}
          removeClippedSubviews
        />

        {/* CONTINUE WATCHING */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Continue Watching</Text>

          <Text style={styles.seeAll}>See All</Text>
        </View>

        <FlatList
          horizontal
          data={trendingMovies}
          renderItem={renderMovieCard}
          keyExtractor={(item) => `${item.id}-continue`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.moviesList}
          initialNumToRender={4}
          maxToRenderPerBatch={6}
          windowSize={5}
          removeClippedSubviews
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },

  scrollContent: {
    paddingBottom: 120,
  },

  /* GLOW */

  blueGlow: {
    position: "absolute",
    top: -100,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 200,
    backgroundColor: "rgba(0,140,255,0.12)",
  },

  /* HEADER */

  header: {
    marginTop: Platform.OS === "android" ? 10 : 4,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  welcome: {
    color: "#94A3B8",
    fontSize: 13,
  },

  heading: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 5,
  },

  profile: {
    width: 50,
    height: 50,
  },

  profileRadius: {
    borderRadius: 18,
  },

  /* SEARCH */

  searchBox: {
    marginHorizontal: 20,
    marginTop: 24,
    height: 58,
    borderRadius: 18,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },

  input: {
    flex: 1,
    color: "#fff",
    marginLeft: 12,
    fontSize: 15,
  },

  /* HERO */

  hero: {
    height: 500,
    marginHorizontal: 20,
    marginTop: 26,
    overflow: "hidden",
    justifyContent: "space-between",
  },

  heroRadius: {
    borderRadius: 30,
  },

  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
  },

  heroTop: {
    padding: 22,
  },

  liveBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
    alignItems: "center",
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: "#FF3B30",
    marginRight: 8,
  },

  liveText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  heroBottom: {
    padding: 24,
  },

  heroTitle: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "900",
  },

  heroDesc: {
    color: "#CBD5E1",
    marginTop: 12,
    fontSize: 14,
    lineHeight: 24,
    width: "85%",
  },

  heroButtons: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 28,
  },

  playBtn: {
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  playText: {
    color: "#000",
    fontWeight: "800",
    marginLeft: 8,
  },

  plusBtn: {
    width: 58,
    height: 58,
    borderRadius: 18,
    marginLeft: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  /* CATEGORY */

  categoriesContainer: {
    paddingHorizontal: 20,
    paddingTop: 26,
  },

  category: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  activeCategory: {
    backgroundColor: "#FFB800",
  },

  categoryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  activeCategoryText: {
    color: "#000",
  },

  /* SECTION */

  section: {
    marginTop: 34,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
  },

  seeAll: {
    color: "#FFB800",
    fontWeight: "700",
  },

  /* MOVIES LIST */

  moviesList: {
    paddingLeft: 20,
    paddingTop: 18,
  },

  /* CARD */

  card: {
    width: CARD_WIDTH,
    marginRight: 16,
    borderRadius: 24,
    overflow: "hidden",
  },

  cardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },

  cardImage: {
    height: 240,
    padding: 14,
    justifyContent: "space-between",
  },

  cardRadius: {
    borderRadius: 24,
  },

  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  ratingBox: {
    borderRadius: 16,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
  },

  ratingText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 4,
  },

  heartBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  movieTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },

  movieGenre: {
    color: "#CBD5E1",
    fontSize: 12,
    marginTop: 4,
  },
});