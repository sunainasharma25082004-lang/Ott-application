import React, { useCallback, useEffect, useState } from 'react';
import { router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  ImageBackground,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { useAuth } from '../src/context/AuthContext';
import { UPLOAD_GUIDELINES } from '../src/constants/uploadGuidelines';
import { apiClient } from '../src/lib/api';
import { openVideo, VideoItem } from '../src/utils/videoRouting';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Ionicons,
  MaterialIcons,
} from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Candidate extends VideoItem {
  votes: number;
}

export default function UploadTalentScreen() {
  const { isAuthenticated } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/talent?limit=10')
      .then((res: any) => {
        const mapped: Candidate[] = (res?.talent || []).map((t: any) => ({
          id: t._id,
          videoUrl: t.auditionVideo,
          title: t.name,
          thumbnail: t.thumbnail || 'https://picsum.photos/400/600',
          durationSeconds: t.duration || 9999,
          contentType: 'Talent' as const,
          subtitle: t.category,
          category: t.category,
          votes: t.votes || 0,
        }));
        setCandidates(mapped);
      })
      .catch(() => {})
      .finally(() => setCandidatesLoading(false));
  }, []);

  const handleUploadPress = useCallback(() => {
    if (!isAuthenticated) {
      Alert.alert(
        'Authentication Required',
        'You need to register or login first to upload your acting reels.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Login / Register',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    } else {
      router.push("/talentform");
    }
  }, [isAuthenticated]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0B0B0F"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Text style={styles.smallTitle}>
            TALENT DISCOVERY
          </Text>

          <Text style={styles.mainTitle}>
            Upload Your{'\n'}Acting Reels
          </Text>

          <Text style={styles.description}>
            Upload your reels, short videos, acting clips,
            or drama performances and get a chance to be
            featured in movies, web series, and premium
            entertainment projects.
          </Text>
        </View>

        {/* UPLOAD CARD */}

        <LinearGradient
          colors={['#1E1E28', '#101014']}
          style={styles.uploadCard}
        >
          <View style={styles.iconCircle}>
            <Ionicons
              name="cloud-upload-outline"
              size={34}
              color="#fff"
            />
          </View>

          <Text style={styles.uploadTitle}>
            Upload Your Reel
          </Text>

          <Text style={styles.uploadSubtitle}>
            MP4 • MOV • Reels • Acting Clips
          </Text>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleUploadPress}
          >
            <LinearGradient
              colors={['#FF416C', '#FF4B2B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.uploadButton}
            >
              <MaterialIcons
                name="video-library"
                size={22}
                color="#fff"
              />

              <Text style={styles.uploadButtonText}>
                Upload Video
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        {/* UPLOAD GUIDELINES */}

        <View style={styles.guidelinesCard}>
          <View style={styles.guidelinesHeaderRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#FFB800" />
            <Text style={styles.guidelinesTitle}>Video Upload Guidelines</Text>
          </View>

          {UPLOAD_GUIDELINES.map((rule, i) => (
            <View key={i} style={styles.ruleRow}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color="#00FFB2"
                style={{ marginTop: 2 }}
              />
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </View>

        {/* INFO SECTION */}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Get Discovered
          </Text>

          <Text style={styles.infoText}>
            Thousands of talented creators are joining
            our platform to showcase their acting,
            performance, drama, and cinematic skills.
            Selected candidates may get opportunities
            in web series, movies, OTT projects, and
            entertainment productions.
          </Text>
        </View>

        {/* TOP CANDIDATES */}

        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={styles.sectionTitle}>
                Top Candidates
              </Text>

              <Text style={styles.sectionSub}>
                Trending performers on our platform
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 14 }}>
              <TouchableOpacity onPress={() => router.push('/talent')}>
                <Ionicons name="grid-outline" size={22} color="#8B93A1" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/talent/leaderboard')}>
                <Ionicons name="trophy-outline" size={22} color="#FFB800" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {candidatesLoading ? (
          <ActivityIndicator style={{ marginTop: 20 }} color="#FF4B2B" />
        ) : candidates.length === 0 ? (
          <Text style={styles.emptyText}>No approved submissions yet — be the first!</Text>
        ) : (
          candidates.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              onPress={() => openVideo(item, candidates)}
            >
              <ImageBackground
                source={{ uri: item.thumbnail }}
                imageStyle={styles.candidateImage}
                style={styles.candidateCard}
              >
                <LinearGradient
                  colors={[
                    'transparent',
                    'rgba(0,0,0,0.85)',
                  ]}
                  style={styles.overlay}
                >
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      TOP TALENT
                    </Text>
                  </View>

                  <Text style={styles.candidateName}>
                    {item.title}
                  </Text>

                  <Text style={styles.candidateRole}>
                    {item.subtitle}
                  </Text>

                  <View style={styles.earnRow}>
                    <Ionicons
                      name="heart"
                      size={16}
                      color="#00FFB2"
                    />

                    <Text style={styles.earnText}>
                      {item.votes} votes
                    </Text>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },

  scrollContainer: {
    paddingBottom: 120,
  },

  header: {
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
    marginTop: 12,
  },

  smallTitle: {
    color: '#FF4B2B',
    fontSize: 13,
    letterSpacing: 1.8,
    fontWeight: '700',
    marginBottom: 10,
  },

  mainTitle: {
    color: '#fff',
    fontSize: 38,
    fontWeight: '800',
    lineHeight: 46,
  },

  description: {
    color: '#9B9BA5',
    fontSize: 15,
    lineHeight: 24,
    marginTop: 16,
  },

  uploadCard: {
    marginTop: 28,
    marginHorizontal: 20,
    borderRadius: 28,
    paddingVertical: 34,
    paddingHorizontal: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  iconCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  uploadTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },

  uploadSubtitle: {
    color: '#8E8E98',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 24,
  },

  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 18,
    gap: 10,
  },

  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  guidelinesCard: {
    marginHorizontal: 20,
    marginTop: 28,
    backgroundColor: 'rgba(255,184,0,0.06)',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.2)',
  },

  guidelinesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },

  guidelinesTitle: {
    color: '#FFB800',
    fontSize: 17,
    fontWeight: '800',
  },

  ruleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },

  ruleText: {
    color: '#C4CAD4',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },

  infoCard: {
    marginHorizontal: 20,
    marginTop: 28,
    backgroundColor: '#141419',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },

  infoTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 14,
  },

  infoText: {
    color: '#A8A8B3',
    fontSize: 15,
    lineHeight: 24,
  },

  sectionHeader: {
    marginTop: 34,
    paddingHorizontal: 20,
    marginBottom: 18,
  },

  sectionTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },

  sectionSub: {
    color: '#8F8F98',
    fontSize: 14,
    marginTop: 6,
  },

  candidateCard: {
    width: width - 40,
    height: 240,
    alignSelf: 'center',
    marginBottom: 20,
    justifyContent: 'flex-end',
  },

  candidateImage: {
    borderRadius: 26,
  },

  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    borderRadius: 26,
  },

  badge: {
    position: 'absolute',
    top: 18,
    left: 18,
    backgroundColor: '#FF4B2B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
  },

  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },

  candidateName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },

  candidateRole: {
    color: '#D3D3DA',
    fontSize: 14,
    marginTop: 6,
  },

  earnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  earnText: {
    color: '#00FFB2',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '700',
  },

  emptyText: {
    color: '#556',
    textAlign: 'center',
    fontSize: 13,
    marginTop: 10,
    marginHorizontal: 20,
  },
});