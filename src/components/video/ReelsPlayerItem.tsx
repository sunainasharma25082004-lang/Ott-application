import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Pressable } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../lib/api';
import type { VideoItem } from '../../utils/videoRouting';

const { height } = Dimensions.get('window');

interface Props {
  item: VideoItem;
  isActive: boolean;
}

export default function ReelsPlayerItem({ item, isActive }: Props) {
  const player = useVideoPlayer(item.videoUrl, (p) => {
    p.loop = true;
    p.muted = true;
  });

  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    if (isActive && !paused) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, paused, player]);

  const togglePause = () => setPaused((p) => !p);

  const toggleMute = () => {
    setMuted((m) => {
      player.muted = !m;
      return !m;
    });
  };

  const handleVote = async () => {
    if (item.contentType !== 'Talent' || liked || voting) return;
    setVoting(true);
    setLiked(true);
    try {
      await apiClient.post(`/talent/${item.id}/vote`);
    } catch {
      setLiked(false);
    } finally {
      setVoting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={StyleSheet.absoluteFillObject} onPress={togglePause}>
        <VideoView
          player={player}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          nativeControls={false}
        />
      </Pressable>

      {paused && (
        <View pointerEvents="none" style={styles.pauseOverlay}>
          <Ionicons name="play" size={56} color="rgba(255,255,255,0.85)" />
        </View>
      )}

      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.bottomGradient}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        {!!item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>}
      </LinearGradient>

      <TouchableOpacity style={styles.muteBtn} activeOpacity={0.8} onPress={toggleMute}>
        <Ionicons name={muted ? 'volume-mute' : 'volume-high'} size={20} color="#fff" />
      </TouchableOpacity>

      {item.contentType === 'Talent' && (
        <TouchableOpacity style={styles.likeBtn} activeOpacity={0.8} onPress={handleVote}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={30} color={liked ? '#FF4B6E' : '#fff'} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', height, backgroundColor: '#000' },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: { color: '#fff', fontSize: 16, fontWeight: '800' },
  subtitle: { color: '#D1D5DB', fontSize: 13, marginTop: 4 },
  muteBtn: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeBtn: {
    position: 'absolute',
    right: 16,
    bottom: 110,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
