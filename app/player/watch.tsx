import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'react-native';
import { useWindowDimensions } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { apiClient } from '../../src/lib/api';
import { useAuth } from '../../src/context/AuthContext';
import { getQualityVariants, QualityVariant } from '../../src/utils/cloudinaryVideo';
import { openVideo, VideoItem, VideoContentType } from '../../src/utils/videoRouting';
import { pickInitialQuality } from '../../src/utils/networkQuality';

// ─── Types ───────────────────────────────────────────────────────────────────

interface WatchParams {
  videoUrl?: string;
  title?: string;
  thumbnail?: string;
  contentId?: string;
  contentType?: string;
  durationSeconds?: string;
  category?: string;
  relatedId?: string;
}

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const SKIP_INTRO_MAX_SECONDS = 300; // show skip-intro button for first 5 min
const SAVE_INTERVAL_MS = 10_000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function WatchScreen() {
  const params = useLocalSearchParams() as any as WatchParams;
  const { selectedProfile } = useAuth();
  const { width: winWidth, height: winHeight } = useWindowDimensions();

  const originalUrl = params.videoUrl || '';
  const contentType = (params.contentType as VideoContentType) || 'Movie';
  const paramDuration = parseInt(params.durationSeconds || '0', 10);

  // ── Quality ──────────────────────────────────────────────────────────────

  const qualityVariants = useMemo(() => getQualityVariants(originalUrl), [originalUrl]);
  const [sourceUrl, setSourceUrl] = useState(originalUrl);
  const [qualityLabel, setQualityLabel] = useState('Auto');
  const [pickingQuality, setPickingQuality] = useState(qualityVariants.length > 1);
  const pendingSeekRef = useRef<number | null>(null);

  useEffect(() => {
    if (qualityVariants.length <= 1 || !pickingQuality) return;
    let cancelled = false;
    pickInitialQuality(qualityVariants).then((v) => {
      if (!cancelled) {
        setSourceUrl(v.url);
        setQualityLabel(v.label);
        setPickingQuality(false);
      }
    });
    return () => { cancelled = true; };
  }, [qualityVariants, pickingQuality]);

  // ── Player ───────────────────────────────────────────────────────────────

  const player = useVideoPlayer(sourceUrl, (p) => {
    p.play();
    p.muted = false;
  });

  // Seamless quality switch
  useEffect(() => {
    const sub = player.addListener('statusChange', (payload: { status: string }) => {
      if (payload.status === 'readyToPlay' && pendingSeekRef.current != null) {
        player.currentTime = pendingSeekRef.current;
        pendingSeekRef.current = null;
        player.play();
      }
    });
    return () => sub.remove();
  }, [player]);

  const switchQuality = (variant: QualityVariant) => {
    if (variant.url === sourceUrl) { setQualityModal(false); return; }
    pendingSeekRef.current = player.currentTime || 0;
    setSourceUrl(variant.url);
    setQualityLabel(variant.label);
    player.replace(variant.url);
    setQualityModal(false);
  };

  // ── Playback state ───────────────────────────────────────────────────────

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(paramDuration > 0 ? paramDuration : 0);
  const [isBuffering, setIsBuffering] = useState(false);

  // Poll time every 500ms
  useEffect(() => {
    const id = setInterval(() => {
      if (!isSeeking.current) {
        const t = player.currentTime ?? 0;
        const d = player.duration ?? 0;
        setCurrentTime(isFinite(t) ? t : 0);
        if (d > 0) setDuration(d);
      }
    }, 500);
    return () => clearInterval(id);
  }, [player]);

  // Sync isPlaying + buffering from player events
  useEffect(() => {
    const playSub = player.addListener('playingChange', (e: { isPlaying: boolean }) => {
      setIsPlaying(e.isPlaying);
    });
    const statusSub = player.addListener('statusChange', (e: { status: string }) => {
      setIsBuffering(e.status === 'loading');
    });
    return () => { playSub.remove(); statusSub.remove(); };
  }, [player]);

  const togglePlay = useCallback(() => {
    if (isPlaying) player.pause();
    else player.play();
  }, [isPlaying, player]);

  // ── Orientation ───────────────────────────────────────────────────────────

  const [isLandscape, setIsLandscape] = useState(false);

  const toggleOrientation = useCallback(async () => {
    try {
      if (isLandscape) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        setIsLandscape(false);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        setIsLandscape(true);
      }
    } catch { /* web / unsupported */ }
  }, [isLandscape]);

  useEffect(() => {
    return () => { ScreenOrientation.unlockAsync().catch(() => {}); };
  }, []);

  const videoHeight = isLandscape ? winHeight : Math.round(winWidth * 9 / 16);

  const lastTapRef = useRef(0);
  const [seekFeedback, setSeekFeedback] = useState<'fwd' | 'back' | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSeekFeedback = (dir: 'fwd' | 'back') => {
    setSeekFeedback(dir);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setSeekFeedback(null), 700);
  };

  const handleTapSide = (side: 'left' | 'right') => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      lastTapRef.current = 0;
      const cur = player.currentTime || 0;
      if (side === 'right') { player.currentTime = Math.min(cur + 10, duration || cur + 10); showSeekFeedback('fwd'); }
      else { player.currentTime = Math.max(0, cur - 10); showSeekFeedback('back'); }
    } else {
      lastTapRef.current = now;
      resetHideTimer();
    }
  };

  useEffect(() => { return () => { if (feedbackTimer.current) clearTimeout(feedbackTimer.current); }; }, []);

  const [showControls, setShowControls] = useState(true);
  const controlsAnim = useRef(new Animated.Value(1)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setControlsVisible = useCallback((v: boolean) => {
    setShowControls(v);
    Animated.timing(controlsAnim, {
      toValue: v ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [controlsAnim]);

  const resetHideTimer = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setControlsVisible(true);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 3500);
  }, [setControlsVisible]);

  useEffect(() => {
    resetHideTimer();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, []);

  const handleVideoTap = () => {
    if (showControls) {
      setControlsVisible(false);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    } else {
      resetHideTimer();
    }
  };

  // ── Seek bar ─────────────────────────────────────────────────────────────

  const [seekBarWidth, setSeekBarWidth] = useState(1);
  const isSeeking = useRef(false);
  const [seekRatio, setSeekRatio] = useState(0);

  // Keep seekRatio in sync when not seeking
  useEffect(() => {
    if (!isSeeking.current && duration > 0) {
      setSeekRatio(currentTime / duration);
    }
  }, [currentTime, duration]);

  const seekPan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          isSeeking.current = true;
          resetHideTimer();
          const ratio = Math.max(0, Math.min(1, e.nativeEvent.locationX / seekBarWidth));
          setSeekRatio(ratio);
        },
        onPanResponderMove: (e) => {
          const ratio = Math.max(0, Math.min(1, e.nativeEvent.locationX / seekBarWidth));
          setSeekRatio(ratio);
        },
        onPanResponderRelease: (e) => {
          const ratio = Math.max(0, Math.min(1, e.nativeEvent.locationX / seekBarWidth));
          if (duration > 0) player.currentTime = ratio * duration;
          isSeeking.current = false;
          setSeekRatio(ratio);
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seekBarWidth, duration]
  );

  // ── Volume / Brightness gestures ─────────────────────────────────────────

  const [volume, setVolume] = useState(1);
  const [brightness, setBrightness] = useState(1); // local visual only
  const [showVolIndicator, setShowVolIndicator] = useState(false);
  const [showBrightIndicator, setShowBrightIndicator] = useState(false);
  const volTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const brightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gestureStartY = useRef(0);
  const gestureStartVal = useRef(0);
  const gestureSide = useRef<'vol' | 'bright' | null>(null);

  const gesturePan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 8 && Math.abs(gs.dy) > Math.abs(gs.dx),
        onPanResponderGrant: (e, _gs) => {
          gestureStartY.current = e.nativeEvent.pageY;
          const isRight = e.nativeEvent.pageX > winWidth / 2;
          gestureSide.current = isRight ? 'vol' : 'bright';
          gestureStartVal.current = isRight ? volume : brightness;
        },
        onPanResponderMove: (_, gs) => {
          const delta = -(gs.dy / (videoHeight * 0.6));
          const newVal = Math.max(0, Math.min(1, gestureStartVal.current + delta));
          if (gestureSide.current === 'vol') {
            setVolume(newVal);
            player.volume = newVal;
            setShowVolIndicator(true);
            if (volTimer.current) clearTimeout(volTimer.current);
            volTimer.current = setTimeout(() => setShowVolIndicator(false), 1200);
          } else {
            setBrightness(newVal);
            setShowBrightIndicator(true);
            if (brightTimer.current) clearTimeout(brightTimer.current);
            brightTimer.current = setTimeout(() => setShowBrightIndicator(false), 1200);
          }
        },
        onPanResponderRelease: () => { gestureSide.current = null; },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [volume, brightness, videoHeight, winWidth]
  );

  // ── Speed ─────────────────────────────────────────────────────────────────

  const [speed, setSpeed] = useState(1);

  const changeSpeed = (s: number) => {
    setSpeed(s);
    player.playbackRate = s;
    setSpeedModal(false);
    resetHideTimer();
  };

  // ── Lock ──────────────────────────────────────────────────────────────────

  const [isLocked, setIsLocked] = useState(false);

  // ── Modals ────────────────────────────────────────────────────────────────

  const [qualityModal, setQualityModal] = useState(false);
  const [speedModal, setSpeedModal] = useState(false);
  const [episodeModal, setEpisodeModal] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);

  // ── Related / episodes ────────────────────────────────────────────────────

  const [related, setRelated] = useState<VideoItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        if (contentType === 'Movie') {
          const res: any = await apiClient.get('/movies?limit=12');
          const items: VideoItem[] = (res?.movies || [])
            .filter((m: any) => m._id !== params.contentId)
            .map((m: any) => ({
              id: m._id, videoUrl: m.videoUrl, title: m.title,
              thumbnail: m.thumbnail || m.poster, durationSeconds: (m.duration || 0) * 60,
              contentType: 'Movie' as VideoContentType,
            }));
          if (!cancelled) setRelated(items);
        } else if (contentType === 'Episode' && params.relatedId) {
          const res: any = await apiClient.get(`/series/${params.relatedId}`);
          const items: VideoItem[] = (res?.episodes || []).map((e: any) => ({
            id: e._id, videoUrl: e.videoUrl, title: e.title,
            thumbnail: e.thumbnail, durationSeconds: (e.duration || 0) * 60,
            contentType: 'Episode' as VideoContentType, relatedId: params.relatedId,
          }));
          if (!cancelled) setRelated(items);
        } else if (contentType === 'Talent') {
          const qs = params.category ? `?category=${encodeURIComponent(params.category)}&limit=12` : '?limit=12';
          const res: any = await apiClient.get(`/talent${qs}`);
          const items: VideoItem[] = (res?.talent || [])
            .filter((t: any) => t._id !== params.contentId)
            .map((t: any) => ({
              id: t._id, videoUrl: t.auditionVideo, title: t.name,
              thumbnail: t.thumbnail, durationSeconds: t.duration || 9999,
              contentType: 'Talent' as VideoContentType, category: t.category,
            }));
          if (!cancelled) setRelated(items);
        }
      } catch { /* best effort */ }
    };
    load();
    return () => { cancelled = true; };
  }, [contentType, params.contentId, params.relatedId, params.category]);

  // ── Watch history + continue watching ────────────────────────────────────

  useEffect(() => {
    if (!params.contentId) return;
    if (contentType !== 'Movie' && contentType !== 'Episode') return;
    apiClient.post('/watch-history', {
      contentId: params.contentId, contentType,
      profileId: selectedProfile?.id, progress: 0,
    }).catch(() => {});
  }, [params.contentId, contentType]);

  // Save position periodically
  useEffect(() => {
    if (!params.contentId) return;
    if (contentType !== 'Movie' && contentType !== 'Episode') return;
    const id = setInterval(() => {
      const t = player.currentTime;
      if (t > 5) {
        apiClient.post('/watch-history', {
          contentId: params.contentId, contentType,
          profileId: selectedProfile?.id, progress: Math.round(t),
        }).catch(() => {});
      }
    }, SAVE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [params.contentId, contentType, player]);

  // ── Loading state ─────────────────────────────────────────────────────────

  if (pickingQuality) {
    return (
      <View style={s.fullBlack}>
        <Text style={s.detectText}>Detecting best quality…</Text>
      </View>
    );
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const showSkipIntro = currentTime < SKIP_INTRO_MAX_SECONDS && currentTime > 5;
  const isEpisode = contentType === 'Episode';
  const episodes = isEpisode ? related : [];
  const currentEpIdx = episodes.findIndex((e) => e.id === params.contentId);
  const nextEpisode = episodes[currentEpIdx + 1] ?? null;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <View style={s.root}>
      <StatusBar hidden={isLandscape} translucent backgroundColor="transparent" barStyle="light-content" />

      {/* ── Video + gesture/tap layer ───────────────────────────────────── */}
      <View style={[s.videoBox, { height: videoHeight }]}>
        <VideoView
          player={player}
          style={s.video}
          contentFit="contain"
          nativeControls={false}
          allowsFullscreen={false}
          allowsPictureInPicture
        />

        {/* Gesture layer (volume/brightness) – always active */}
        {!isLocked && (
          <View style={StyleSheet.absoluteFillObject} {...gesturePan.panHandlers} pointerEvents="box-none" />
        )}

        {/* Tap zones (double-tap seek + single-tap toggle controls) */}
        {!isLocked && (
          <View style={s.tapZones} pointerEvents="box-none">
            <Pressable style={s.tapSide} onPress={() => handleTapSide('left')} />
            <Pressable style={s.tapCenter} onPress={handleVideoTap} />
            <Pressable style={s.tapSide} onPress={() => handleTapSide('right')} />
          </View>
        )}

        {/* Locked tap area (just unlock button visible) */}
        {isLocked && (
          <Pressable style={StyleSheet.absoluteFillObject} onPress={resetHideTimer} />
        )}

        {/* Seek feedback badges */}
        {seekFeedback === 'back' && (
          <View style={[s.seekBadge, s.seekLeft]} pointerEvents="none">
            <Ionicons name="play-back" size={28} color="#fff" />
            <Text style={s.seekBadgeText}>-10s</Text>
          </View>
        )}
        {seekFeedback === 'fwd' && (
          <View style={[s.seekBadge, s.seekRight]} pointerEvents="none">
            <Ionicons name="play-forward" size={28} color="#fff" />
            <Text style={s.seekBadgeText}>+10s</Text>
          </View>
        )}

        {/* Volume indicator */}
        {showVolIndicator && (
          <View style={[s.gestureBadge, s.gestureRight]} pointerEvents="none">
            <Ionicons name={volume > 0 ? 'volume-high' : 'volume-mute'} size={20} color="#fff" />
            <View style={s.gestureBg}>
              <View style={[s.gestureFill, { height: `${Math.round(volume * 100)}%` as any }]} />
            </View>
            <Text style={s.gesturePct}>{Math.round(volume * 100)}%</Text>
          </View>
        )}

        {/* Brightness indicator */}
        {showBrightIndicator && (
          <View style={[s.gestureBadge, s.gestureLeft]} pointerEvents="none">
            <Ionicons name="sunny" size={20} color="#fff" />
            <View style={s.gestureBg}>
              <View style={[s.gestureFill, { height: `${Math.round(brightness * 100)}%` as any }]} />
            </View>
            <Text style={s.gesturePct}>{Math.round(brightness * 100)}%</Text>
          </View>
        )}

        {/* Brightness dim overlay */}
        {brightness < 0.95 && (
          <View
            style={[StyleSheet.absoluteFillObject, { backgroundColor: `rgba(0,0,0,${(1 - brightness) * 0.8})` }]}
            pointerEvents="none"
          />
        )}

        {/* Buffering spinner */}
        {isBuffering && (
          <View style={s.bufferOverlay} pointerEvents="none">
            <View style={s.bufferSpinner}>
              <Ionicons name="sync" size={32} color="#FFB800" />
            </View>
          </View>
        )}

        {/* ── LOCKED UI ─────────────────────────────────────────────────── */}
        {isLocked && (
          <Animated.View style={[s.lockedBar, { opacity: controlsAnim }]}>
            <TouchableOpacity style={s.unlockBtn} onPress={() => { setIsLocked(false); resetHideTimer(); }}>
              <Ionicons name="lock-closed" size={18} color="#FFB800" />
              <Text style={s.unlockText}>Unlock</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ── CUSTOM CONTROLS ───────────────────────────────────────────── */}
        {!isLocked && (
          <Animated.View style={[s.controls, { opacity: controlsAnim }]} pointerEvents={showControls ? 'box-none' : 'none'}>

            {/* Top bar */}
            <View style={s.topBar}>
              <TouchableOpacity onPress={() => router.back()} style={s.iconBtn}>
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text numberOfLines={1} style={s.ctrlTitle}>{params.title}</Text>
              <View style={s.topRight}>
                {isEpisode && episodes.length > 0 && (
                  <TouchableOpacity style={s.iconBtn} onPress={() => { setEpisodeModal(true); resetHideTimer(); }}>
                    <Ionicons name="list" size={22} color="#fff" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={s.iconBtn} onPress={() => { setSettingsModal(true); resetHideTimer(); }}>
                  <Ionicons name="settings-outline" size={22} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={s.iconBtn} onPress={toggleOrientation}>
                  <Ionicons name={isLandscape ? 'phone-portrait-outline' : 'phone-landscape-outline'} size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Center buttons */}
            <View style={s.centerRow}>
              <TouchableOpacity style={s.seekBtn} onPress={() => { player.currentTime = Math.max(0, (player.currentTime || 0) - 10); showSeekFeedback('back'); }}>
                <Ionicons name="play-back" size={28} color="#fff" />
                <Text style={s.seekBtnLabel}>10</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.playBtn} onPress={togglePlay}>
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={38} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity style={s.seekBtn} onPress={() => { player.currentTime = Math.min((player.currentTime || 0) + 10, duration || 9999); showSeekFeedback('fwd'); }}>
                <Ionicons name="play-forward" size={28} color="#fff" />
                <Text style={s.seekBtnLabel}>10</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom bar */}
            <View style={s.bottomBar}>
              {/* Progress row */}
              <View style={s.progressRow}>
                <Text style={s.timeText}>{fmt(currentTime)}</Text>
                <View
                  style={s.seekBarTrack}
                  onLayout={(e) => setSeekBarWidth(e.nativeEvent.layout.width)}
                  {...seekPan.panHandlers}
                >
                  <View style={[s.seekBarFill, { width: `${Math.round(seekRatio * 100)}%` }]} />
                  <View style={[s.seekThumb, { left: `${Math.round(seekRatio * 100)}%` as any }]} />
                </View>
                <Text style={s.timeText}>{fmt(duration)}</Text>
              </View>

              {/* Bottom action row */}
              <View style={s.bottomActions}>
                <TouchableOpacity style={s.speedChip} onPress={() => { setSpeedModal(true); resetHideTimer(); }}>
                  <Ionicons name="speedometer-outline" size={14} color="#fff" />
                  <Text style={s.speedChipText}>{speed}x</Text>
                </TouchableOpacity>

                {qualityVariants.length > 1 && (
                  <TouchableOpacity style={s.speedChip} onPress={() => { setQualityModal(true); resetHideTimer(); }}>
                    <Ionicons name="layers-outline" size={14} color="#fff" />
                    <Text style={s.speedChipText}>{qualityLabel}</Text>
                  </TouchableOpacity>
                )}

                <View style={{ flex: 1 }} />

                <TouchableOpacity style={s.iconBtn} onPress={() => setIsLocked(true)}>
                  <Ionicons name="lock-open-outline" size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={s.iconBtn} onPress={toggleOrientation}>
                  <Ionicons name={isLandscape ? 'contract-outline' : 'expand-outline'} size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Skip Intro button */}
        {showSkipIntro && !isLocked && (
          <TouchableOpacity
            style={s.skipIntroBtn}
            onPress={() => { player.currentTime = SKIP_INTRO_MAX_SECONDS; resetHideTimer(); }}
          >
            <Ionicons name="play-skip-forward" size={14} color="#fff" />
            <Text style={s.skipIntroText}>Skip Intro</Text>
          </TouchableOpacity>
        )}

        {/* Next Episode button */}
        {nextEpisode && (currentTime / duration) > 0.9 && !isLocked && (
          <TouchableOpacity
            style={s.nextEpBtn}
            onPress={() => openVideo(nextEpisode, related)}
          >
            <Ionicons name="play-circle" size={16} color="#111" />
            <Text style={s.nextEpText}>Next Episode</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Below-video detail area (portrait only) ─────────────────────── */}
      {!isLandscape && (
        <ScrollView style={s.details} showsVerticalScrollIndicator={false}>
          <Text style={s.title}>{params.title}</Text>
          {duration > 0 && (
            <Text style={s.meta}>
              {contentType} • {fmt(duration)} {speed !== 1 ? ` • ${speed}x` : ''}
            </Text>
          )}

          {/* Continue-watching progress bar */}
          {duration > 0 && currentTime > 5 && (
            <View style={s.cwBarTrack}>
              <View style={[s.cwBarFill, { width: `${Math.round((currentTime / duration) * 100)}%` as any }]} />
            </View>
          )}

          {/* "More Like This" / Episodes */}
          {related.length > 0 && (
            <View style={s.relSection}>
              <Text style={s.relHeader}>{isEpisode ? 'Episodes' : 'More Like This'}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {related.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={s.relCard}
                    onPress={() => openVideo(item, related)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: item.thumbnail || 'https://picsum.photos/200/280' }}
                      style={[s.relThumb, item.id === params.contentId && s.relThumbActive]}
                    />
                    <Text numberOfLines={1} style={s.relTitle}>{item.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>
      )}

      {/* ── Quality modal ────────────────────────────────────────────────── */}
      <Modal visible={qualityModal} transparent animationType="fade" statusBarTranslucent>
        <Pressable style={s.modalOverlay} onPress={() => setQualityModal(false)}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>Video Quality</Text>
            {qualityVariants.map((v) => (
              <TouchableOpacity key={v.label} style={s.sheetRow} onPress={() => switchQuality(v)}>
                <Text style={[s.sheetRowText, v.label === qualityLabel && s.sheetRowActive]}>{v.label}</Text>
                {v.label === qualityLabel && <Ionicons name="checkmark" size={18} color="#FFB800" />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* ── Speed modal ──────────────────────────────────────────────────── */}
      <Modal visible={speedModal} transparent animationType="fade" statusBarTranslucent>
        <Pressable style={s.modalOverlay} onPress={() => setSpeedModal(false)}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>Playback Speed</Text>
            {SPEEDS.map((sp) => (
              <TouchableOpacity key={sp} style={s.sheetRow} onPress={() => changeSpeed(sp)}>
                <Text style={[s.sheetRowText, sp === speed && s.sheetRowActive]}>{sp === 1 ? 'Normal' : `${sp}x`}</Text>
                {sp === speed && <Ionicons name="checkmark" size={18} color="#FFB800" />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* ── Settings modal ───────────────────────────────────────────────── */}
      <Modal visible={settingsModal} transparent animationType="fade" statusBarTranslucent>
        <Pressable style={s.modalOverlay} onPress={() => setSettingsModal(false)}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>Player Settings</Text>
            <TouchableOpacity style={s.sheetRow} onPress={() => { setSettingsModal(false); setSpeedModal(true); }}>
              <Ionicons name="speedometer-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
              <Text style={s.sheetRowText}>Playback Speed</Text>
              <Text style={s.sheetRowHint}>{speed}x</Text>
            </TouchableOpacity>
            {qualityVariants.length > 1 && (
              <TouchableOpacity style={s.sheetRow} onPress={() => { setSettingsModal(false); setQualityModal(true); }}>
                <Ionicons name="layers-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
                <Text style={s.sheetRowText}>Video Quality</Text>
                <Text style={s.sheetRowHint}>{qualityLabel}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={s.sheetRow} onPress={() => { setSettingsModal(false); setIsLocked(true); }}>
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
              <Text style={s.sheetRowText}>Lock Controls</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.sheetRow} onPress={() => { setSettingsModal(false); toggleOrientation(); }}>
              <Ionicons name="phone-landscape-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
              <Text style={s.sheetRowText}>Rotate Screen</Text>
              <Text style={s.sheetRowHint}>{isLandscape ? 'Portrait' : 'Landscape'}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* ── Episode list modal ───────────────────────────────────────────── */}
      <Modal visible={episodeModal} transparent animationType="slide" statusBarTranslucent>
        <Pressable style={s.modalOverlay} onPress={() => setEpisodeModal(false)}>
          <View style={[s.sheet, s.episodeSheet]}>
            <Text style={s.sheetTitle}>Episodes</Text>
            <ScrollView>
              {episodes.map((ep, i) => (
                <TouchableOpacity
                  key={ep.id}
                  style={[s.epRow, ep.id === params.contentId && s.epRowActive]}
                  onPress={() => { setEpisodeModal(false); openVideo(ep, related); }}
                >
                  {ep.thumbnail ? (
                    <Image source={{ uri: ep.thumbnail }} style={s.epThumb} />
                  ) : (
                    <View style={[s.epThumb, s.epThumbPlaceholder]}>
                      <Text style={s.epNum}>{i + 1}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={[s.epTitle, ep.id === params.contentId && { color: '#FFB800' }]}>
                      {i + 1}. {ep.title}
                    </Text>
                    {ep.durationSeconds > 0 && (
                      <Text style={s.epDur}>{fmt(ep.durationSeconds)}</Text>
                    )}
                  </View>
                  {ep.id === params.contentId && <Ionicons name="play-circle" size={22} color="#FFB800" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  fullBlack: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  detectText: { color: '#fff', fontSize: 15, marginTop: 12 },

  videoBox: { width: '100%', backgroundColor: '#000', overflow: 'hidden', position: 'relative' },
  video: { width: '100%', height: '100%' },

  // Tap zones
  tapZones: { ...StyleSheet.absoluteFillObject, flexDirection: 'row' },
  tapSide: { flex: 3 },
  tapCenter: { flex: 4 },

  // Seek feedback
  seekBadge: {
    position: 'absolute', top: '35%', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 50,
  },
  seekLeft: { left: '8%' },
  seekRight: { right: '8%' },
  seekBadgeText: { color: '#fff', fontSize: 13, fontWeight: '700', marginTop: 4 },

  // Volume / Brightness indicator
  gestureBadge: {
    position: 'absolute', top: '20%', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14,
  },
  gestureLeft: { left: 16 },
  gestureRight: { right: 16 },
  gestureBg: { width: 6, height: 60, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden', justifyContent: 'flex-end' },
  gestureFill: { width: '100%', backgroundColor: '#FFB800', borderRadius: 3 },
  gesturePct: { color: '#fff', fontSize: 11, fontWeight: '700' },

  // Buffering
  bufferOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  bufferSpinner: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },

  // Locked bar
  lockedBar: { position: 'absolute', bottom: 20, left: 0, right: 0, alignItems: 'center' },
  unlockBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,184,0,0.15)', borderWidth: 1, borderColor: '#FFB800',
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30,
  },
  unlockText: { color: '#FFB800', fontWeight: '700', fontSize: 14 },

  // Controls overlay
  controls: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 14, paddingBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  ctrlTitle: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '700', marginHorizontal: 8 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19 },

  // Center
  centerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32 },
  seekBtn: { alignItems: 'center', justifyContent: 'center', width: 56, height: 56 },
  seekBtnLabel: { color: '#fff', fontSize: 10, fontWeight: '700', marginTop: -2 },
  playBtn: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },

  // Bottom bar
  bottomBar: { paddingHorizontal: 12, paddingBottom: 16, backgroundColor: 'rgba(0,0,0,0.5)' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  timeText: { color: '#fff', fontSize: 11, fontWeight: '600', minWidth: 42, textAlign: 'center' },

  // Seek bar
  seekBarTrack: {
    flex: 1, height: 20, justifyContent: 'center', position: 'relative',
  },
  seekBarFill: { height: 4, backgroundColor: '#FFB800', borderRadius: 2 },
  seekThumb: {
    position: 'absolute', width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#FFB800', top: 3, marginLeft: -7,
    shadowColor: '#FFB800', shadowRadius: 4, shadowOpacity: 0.8, elevation: 4,
  },

  // Bottom actions
  bottomActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  speedChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12,
  },
  speedChipText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Skip intro
  skipIntroBtn: {
    position: 'absolute', bottom: 70, right: 14,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: '#fff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  skipIntroText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Next episode
  nextEpBtn: {
    position: 'absolute', bottom: 70, right: 14,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFB800', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8,
  },
  nextEpText: { color: '#111', fontSize: 13, fontWeight: '800' },

  // Below-video details
  details: { flex: 1, backgroundColor: '#0B0D14', paddingHorizontal: 18, paddingTop: 14 },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  meta: { color: '#9CA3AF', fontSize: 13, marginTop: 4 },

  // Continue-watching bar
  cwBarTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 2, marginTop: 10, marginBottom: 4 },
  cwBarFill: { height: '100%', backgroundColor: '#FFB800', borderRadius: 2 },

  // Related row
  relSection: { marginTop: 22 },
  relHeader: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 12 },
  relCard: { width: 110, marginRight: 12 },
  relThumb: { width: 110, height: 150, borderRadius: 12, backgroundColor: '#1C1C1E' },
  relThumbActive: { borderWidth: 2, borderColor: '#FFB800' },
  relTitle: { color: '#D1D5DB', fontSize: 12, marginTop: 6 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#161A24', borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32,
  },
  episodeSheet: { maxHeight: '70%' },
  sheetTitle: { color: '#9CA3AF', fontSize: 13, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  sheetRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  sheetRowText: { flex: 1, color: '#D1D5DB', fontSize: 15, fontWeight: '600' },
  sheetRowActive: { color: '#FFB800' },
  sheetRowHint: { color: '#6B7280', fontSize: 13, fontWeight: '600', marginRight: 8 },

  // Episode list
  epRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  epRowActive: { backgroundColor: 'rgba(255,184,0,0.06)', borderRadius: 10, paddingHorizontal: 8 },
  epThumb: { width: 80, height: 50, borderRadius: 8, backgroundColor: '#1C1C1E' },
  epThumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  epNum: { color: '#6B7280', fontSize: 18, fontWeight: '700' },
  epTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  epDur: { color: '#6B7280', fontSize: 11, marginTop: 3 },
});
