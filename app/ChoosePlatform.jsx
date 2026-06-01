// app/index.tsx OR app/HomeScreen.tsx

import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  StatusBar,
  Platform,
  Dimensions,
  Image,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

const CARD_HEIGHT = 190;
const CARD_RADIUS = 26;

const DATA = [
  {
    id: "1",
    title: "Movies & Series",
    subtitle: "Premium cinematic experiences",
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
    route: "/(tabs)/home",
  },
  {
    id: "2",
    title: "Real Talent Hunt",
    subtitle: "Vertical short-form performances",
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop",

    // 👇 YE CHANGE KIYA HAI
    route: "/upload-talent",
  },
];

const Card = memo(({ item }: any) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.cardContainer}
      onPress={() => router.push(item.route)}
    >
      <ImageBackground
        source={{ uri: item.image }}
        resizeMode="cover"
        imageStyle={styles.cardImage}
        style={styles.card}
      >
        {/* DARK OVERLAY */}
        <View style={styles.overlay} />

        {/* CONTENT */}
        <View style={styles.cardContent}>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={styles.cardTitle}>
              {item.title}
            </Text>

            <Text numberOfLines={1} style={styles.cardSubtitle}>
              {item.subtitle}
            </Text>
          </View>

          <View style={styles.arrowButton}>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
});

export default function ChoosePlatform() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* GRID BACKGROUND */}
      <View pointerEvents="none" style={styles.gridContainer}>
        {Array.from({ length: 220 }).map((_, index) => (
          <View key={index} style={styles.gridItem} />
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.profileRow}>
            <Image
              source={{
                uri: "https://randomuser.me/api/portraits/men/32.jpg",
              }}
              style={styles.avatar}
            />

            <View style={styles.userInfo}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.username}>Alex</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons
              name="notifications-outline"
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* TITLE */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            What are you in the{"\n"}mood for?
          </Text>

          <Text style={styles.description}>
            Choose your entertainment universe.
          </Text>
        </View>

        {/* CARDS */}
        <View style={styles.cardsWrapper}>
          {DATA.map((item) => (
            <Card key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#07090D",
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  /* GRID */

  gridContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    opacity: 0.12,
  },

  gridItem: {
    width: 22,
    height: 22,
    borderWidth: 0.3,
    borderColor: "#8A8A8A",
  },

  /* HEADER */

  header: {
    marginTop: Platform.OS === "android" ? 10 : 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },

  userInfo: {
    marginLeft: 10,
  },

  welcomeText: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "500",
  },

  username: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },

  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  /* TITLE */

  titleContainer: {
    marginTop: 26,
  },

  title: {
    color: "#fff",
    fontSize: 36,
    lineHeight: 42,
    fontWeight: "800",
    letterSpacing: -1,
  },

  description: {
    marginTop: 10,
    color: "#8B93A1",
    fontSize: 15,
    lineHeight: 22,
  },

  /* CARDS */

  cardsWrapper: {
    marginTop: 26,
  },

  cardContainer: {
    marginBottom: 18,
  },

  card: {
    width: width - 32,
    height: CARD_HEIGHT,
    justifyContent: "flex-end",
    overflow: "hidden",
    borderRadius: CARD_RADIUS,
    backgroundColor: "#111",
  },

  cardImage: {
    borderRadius: CARD_RADIUS,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  cardContent: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 18,
  },

  cardTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
  },

  cardSubtitle: {
    marginTop: 4,
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    fontWeight: "500",
  },

  arrowButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
});