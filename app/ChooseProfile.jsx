// ✅ FULL FIXED PREMIUM PROFILE SCREEN
// app/ChooseProfile.tsx

import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { LinearGradient } from 'expo-linear-gradient';

import {
  Ionicons,
  Feather,
} from '@expo/vector-icons';

import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const PROFILE_SIZE = width * 0.22;

const profiles = [
  {
    id: '1',
    name: 'Alex',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200',
    premium: true,
  },

  {
    id: '2',
    name: 'Sarah',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200',
  },

  {
    id: '3',
    name: 'Kids',
    image:
      'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?q=80&w=1200',
  },
];

export default function ChooseProfile() {
  const openPlatform = () => {
    router.push('/ChoosePlatform');
  };

  const renderProfile = ({ item }: any) => (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.profileCard}
      onPress={openPlatform}
    >
      <LinearGradient
        colors={[
          'rgba(255,255,255,0.08)',
          'rgba(255,255,255,0.02)',
        ]}
        style={styles.profileGradient}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: item.image,
            }}
            style={styles.profileImage}
          />

          {item.premium && (
            <View style={styles.premiumBadge}>
              <Ionicons
                name="diamond"
                size={10}
                color="#111"
              />
            </View>
          )}
        </View>

        <Text style={styles.profileName}>
          {item.name}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* BACKGROUND */}

      <LinearGradient
        colors={[
          '#040611',
          '#070B1A',
          '#040611',
        ]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* GLOW EFFECTS */}

      <View style={styles.blueGlow} />

      <View style={styles.orangeGlow} />

      {/* SCROLL */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View style={styles.container}>
          {/* HEADER */}

          <View style={styles.header}>
            <Text style={styles.title}>
              Who's Watching?
            </Text>

            <Text style={styles.subtitle}>
              Choose your profile
            </Text>
          </View>

          {/* MAIN PROFILE */}

          <TouchableOpacity
            activeOpacity={0.92}
            style={styles.mainProfileWrapper}
            onPress={openPlatform}
          >
            <LinearGradient
              colors={[
                'rgba(255,255,255,0.10)',
                'rgba(255,255,255,0.03)',
              ]}
              style={styles.mainProfileCard}
            >
              <Image
                source={{
                  uri: profiles[0].image,
                }}
                style={styles.mainProfileImage}
              />

              <Text style={styles.mainName}>
                Alex
              </Text>

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.continueBtn}
                onPress={openPlatform}
              >
                <LinearGradient
                  colors={[
                    '#F7D49B',
                    '#D9A45F',
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={
                    styles.continueGradient
                  }
                >
                  <Text
                    style={
                      styles.continueText
                    }
                  >
                    Continue
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </TouchableOpacity>

          {/* OTHER PROFILES */}

          <FlatList
            data={profiles.slice(1)}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={
              styles.profileList
            }
            columnWrapperStyle={
              styles.columnWrapper
            }
            renderItem={renderProfile}
          />

          {/* ADD PROFILE */}

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.addProfileCard}
          >
            <LinearGradient
              colors={[
                'rgba(255,255,255,0.06)',
                'rgba(255,255,255,0.02)',
              ]}
              style={styles.addGradient}
            >
              <View
                style={styles.plusCircle}
              >
                <Feather
                  name="plus"
                  size={26}
                  color="#F7D49B"
                />
              </View>

              <Text style={styles.addText}>
                Add Profile
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* MANAGE */}

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.manageBtn}
          >
            <LinearGradient
              colors={[
                'rgba(255,255,255,0.07)',
                'rgba(255,255,255,0.03)',
              ]}
              style={
                styles.manageGradient
              }
            >
              <Feather
                name="edit-2"
                size={14}
                color="#F7D49B"
              />

              <Text
                style={styles.manageText}
              >
                Manage Profiles
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#040611',
  },

  scrollView: {
    flex: 1,
    backgroundColor: '#040611',
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingTop:
      Platform.OS === 'android'
        ? 20
        : 10,
    paddingBottom: 40,
  },

  /* GLOW */

  blueGlow: {
    position: 'absolute',
    top: -120,
    left: -100,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor:
      'rgba(59,130,246,0.15)',
  },

  orangeGlow: {
    position: 'absolute',
    bottom: -120,
    right: -100,
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor:
      'rgba(245,158,11,0.12)',
  },

  /* HEADER */

  header: {
    alignItems: 'center',
    marginTop: 20,
  },

  title: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  subtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 10,
    letterSpacing: 0.4,
  },

  /* MAIN PROFILE */

  mainProfileWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 34,
  },

  mainProfileCard: {
    width: width * 0.72,
    borderRadius: 34,
    paddingVertical: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.08)',
  },

  mainProfileImage: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 3,
    borderColor: '#F7D49B',
  },

  mainName: {
    color: '#fff',
    fontSize: 23,
    fontWeight: '800',
    marginTop: 18,
  },

  continueBtn: {
    width: '82%',
    marginTop: 24,
    borderRadius: 18,
    overflow: 'hidden',
  },

  continueGradient: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  continueText: {
    color: '#111',
    fontSize: 15,
    fontWeight: '800',
  },

  /* GRID */

  profileList: {
    width: '100%',
    marginTop: 34,
  },

  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  profileCard: {
    width: '47%',
  },

  profileGradient: {
    borderRadius: 28,
    paddingVertical: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.05)',
  },

  imageContainer: {
    position: 'relative',
  },

  profileImage: {
    width: PROFILE_SIZE,
    height: PROFILE_SIZE,
    borderRadius: PROFILE_SIZE / 2,
  },

  premiumBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F7D49B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#040611',
  },

  profileName: {
    color: '#fff',
    marginTop: 14,
    fontSize: 15,
    fontWeight: '700',
  },

  /* ADD PROFILE */

  addProfileCard: {
    width: 160,
    marginTop: 10,
    borderRadius: 26,
    overflow: 'hidden',
  },

  addGradient: {
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.05)',
  },

  plusCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor:
      'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  addText: {
    color: '#fff',
    marginTop: 14,
    fontSize: 14,
    fontWeight: '700',
  },

  /* MANAGE */

  manageBtn: {
    marginTop: 24,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 30,
  },

  manageGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.06)',
  },

  manageText: {
    color: '#F7D49B',
    marginLeft: 10,
    fontWeight: '700',
    fontSize: 13,
  },
});