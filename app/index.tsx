import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { apiClient } from '../src/lib/api';

const { width } = Dimensions.get('window');

export default function Index() {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  
  // State variables for liveness checks and animation sequencing
  const [serverReady, setServerReady] = useState(false);
  const [entryDone, setEntryDone] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);
  const [statusText, setStatusText] = useState("Securing connection...");

  // Animation values
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const sloganOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  
  // Pulse loop references for the wait states
  const pulseValue = useRef(new Animated.Value(1)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

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
      // so it shows the friendly Network Error screen instead of getting stuck forever
      if (active) {
        setServerReady(true);
      }
    };

    checkServer();
    return () => { active = false; };
  }, []);

  // 2. Play the entry animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1.0,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start(() => {
      setEntryDone(true);
    });
  }, []);

  // Pulsing animation loops (helper functions)
  const startPulsing = () => {
    pulseValue.setValue(1);
    pulseLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1.0,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    );
    pulseLoopRef.current.start();
  };

  const stopPulsing = () => {
    if (pulseLoopRef.current) {
      pulseLoopRef.current.stop();
      pulseValue.setValue(1);
    }
  };

  // 3. Coordinate outro based on server status + entry status
  useEffect(() => {
    if (serverReady && entryDone) {
      stopPulsing();
      setStatusText("Connected");

      // Fade in premium taglines
      Animated.timing(sloganOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Hold on completed state, then zoom out
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(logoScale, {
              toValue: 3.5,
              duration: 700,
              useNativeDriver: true,
            }),
            Animated.timing(containerOpacity, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            })
          ]).start(() => {
            setAnimationFinished(true);
          });
        }, 650);
      });
    } else if (entryDone && !serverReady) {
      // If intro finished but server is still booting up, start the pulsing wait loop
      startPulsing();
    }
  }, [serverReady, entryDone]);

  // Interpolations
  const spin = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '0deg']
  });

  // Combine scaling factor from spring animation and pulsing wait loop
  const combinedScale = Animated.multiply(logoScale, pulseValue);

  // Keep screen active while auth checks are active, server is pre-heating, or animation is running
  if (isAuthLoading || !animationFinished) {
    return (
      <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
        <View style={styles.content}>
          <Animated.Image
            source={require('../assets/icon.png')}
            style={[
              styles.logo,
              {
                opacity: logoOpacity,
                transform: [{ scale: combinedScale }, { rotate: spin }],
              },
            ]}
            resizeMode="contain"
          />
          
          {/* Tagline is shown only when server responds (pre-heating complete) */}
          <Animated.Text style={[styles.slogan, { opacity: sloganOpacity }]}>
            VIZ TV
          </Animated.Text>
          <Animated.Text style={[styles.subSlogan, { opacity: sloganOpacity }]}>
            Premium Discovery & Streaming
          </Animated.Text>

          {/* Connection status/warm-up checks displayed at the bottom */}
          {!serverReady && (
            <Text style={styles.statusText}>
              {statusText}
            </Text>
          )}
        </View>
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
  slogan: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 10,
    textShadowColor: 'rgba(255, 255, 255, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subSlogan: {
    color: '#FFB800',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 3,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  statusText: {
    color: '#666666',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 35,
    letterSpacing: 0.5,
  },
});
