import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useAuth } from '../src/context/AuthContext';
import { apiClient } from '../src/lib/api';

const { width } = Dimensions.get('window');

// Inject global black background style for HTML elements on Web
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    html, body, #root {
      background-color: #050505 !important;
    }
  `;
  document.head.appendChild(style);
}

export default function Index() {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  
  // State variables for liveness checks and animation sequencing
  const [serverReady, setServerReady] = useState(false);
  const [videoFinished, setVideoFinished] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);
  const [statusText, setStatusText] = useState("Securing connection...");

  // Animation values
  const containerOpacity = useRef(new Animated.Value(1)).current;

  // 1. Server pre-heating ping loop
  useEffect(() => {
    let active = true;
    const checkServer = async () => {
      let attempts = 0;
      const maxAttempts = 8;
      
      while (attempts < maxAttempts && active) {
        try {
          // Warm up request to ensure DB + Render is alive
          const res = await apiClient.get('/ping');
          if (res && res.success) {
            if (active) {
              setServerReady(true);
            }
            return;
          }
        } catch (e) {
          attempts++;
          if (active) {
            setStatusText(`Waking up server (Attempt ${attempts}/${maxAttempts})...`);
          }
          // Wait 3 seconds before next retry
          await new Promise(r => setTimeout(r, 3000));
        }
      }
      // Fail-safe: if server still doesn't reply, let the app proceed
      if (active) {
        setServerReady(true);
      }
    };

    checkServer();
    return () => { active = false; };
  }, []);

  // 2. Play intro video using expo-video
  const player = useVideoPlayer(require('../assets/video.mp4'), (p) => {
    p.play();
    p.loop = false;
    p.muted = Platform.OS === 'web'; // Muted on Web for autoplay policy compliance, unmuted on Native
    p.volume = 1;
  });

  // Track video completion
  useEffect(() => {
    const subscription = player.addListener('playToEnd', () => {
      setVideoFinished(true);
    });
    return () => {
      subscription.remove();
    };
  }, [player]);

  // Video playback fail-safe (in case video fails to decode or play)
  useEffect(() => {
    const failSafeTimer = setTimeout(() => {
      setVideoFinished(true);
    }, 6000); // 6 seconds threshold
    return () => clearTimeout(failSafeTimer);
  }, []);

  // 3. Coordinate transitions when both server connection is verified and video has completed
  useEffect(() => {
    if (serverReady && videoFinished) {
      setStatusText("Connected");

      // Smoothly fade out the splash container
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setAnimationFinished(true);
      });
    }
  }, [serverReady, videoFinished]);

  // Keep screen active while auth checks are active, server is pre-heating, or video is playing
  if (isAuthLoading || !animationFinished) {
    return (
      <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
        {!videoFinished ? (
          <VideoView
            player={player}
            style={styles.fullScreenVideo}
            contentFit="cover"
            nativeControls={false}
          />
        ) : (
          <View style={styles.content}>
            <Animated.Image
              source={require('../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.statusText}>
              {statusText}
            </Text>
          </View>
        )}
      </Animated.View>
    );
  }

  // Once both animation and server connection states are ready, redirect
  if (isAuthenticated) {
    if (user?.role === 'admin') {
      return <Redirect href="/admin/dashboard" />;
    }
    return <Redirect href="/ChooseProfile" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    width: width * 0.45,
    height: width * 0.45,
    borderRadius: width * 0.225,
    marginBottom: 20,
  },
  statusText: {
    color: '#666666',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 25,
    letterSpacing: 0.5,
  },
});
