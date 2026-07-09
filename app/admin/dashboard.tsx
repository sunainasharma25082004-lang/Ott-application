import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiClient, getAuthToken, API_BASE_URL } from '../../src/lib/api';
import { useAuth } from '../../src/context/AuthContext';
import { openVideo } from '../../src/utils/videoRouting';
import { getQualityVariants } from '../../src/utils/cloudinaryVideo';

const AVAILABLE_GENRES = ['Action', 'Drama', 'Comedy', 'Sci-Fi', 'Thriller', 'Horror', 'Romance'];

const TALENT_FILTERS = ['pending', 'approved', 'featured', 'rejected'] as const;
type TalentFilter = (typeof TALENT_FILTERS)[number];

type AdminTab = 'movies' | 'series' | 'talent' | 'users' | 'analytics';

interface Movie {
  _id: string;
  title: string;
  description?: string;
  thumbnail: string;
  poster?: string;
  genres: string[];
  rating?: number;
  releaseYear?: number;
  duration?: number;
  isDummy?: boolean;
  trailerUrl?: string;
  views?: number;
  videoUrl: string;
  isTrending?: boolean;
  isNewRelease?: boolean;
}

interface Submitter {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

interface AdminUser {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
  createdAt?: string;
}

interface Talent {
  _id: string;
  name: string;
  category: string;
  bio?: string;
  location?: string;
  auditionVideo: string;
  duration?: number;
  thumbnail?: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
  submittedBy?: Submitter | null;
  votes?: number;
  user?: Submitter;
  videoUrl?: string;
}

interface DashboardStats {
  totalUsers: number;
  totalMovies: number;
  totalSeries: number;
  recentSignups: number;
  totalWatchHistory?: number;
  talent: { pending: number; approved: number; featured: number; rejected: number; total: number };
}

// Cross-platform alert helper
const notify = (title: string, message: string) => {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
};

export default function AdminDashboard() {
  const router = useRouter();
  const { signOut, user } = useAuth();

  const [tab, setTab] = useState<AdminTab>('movies');

  // ===== Movies =====
  const [movies, setMovies] = useState<Movie[]>([]);
  const [moviesLoading, setMoviesLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<any>(null);
  const [poster, setPoster] = useState('');
  const [posterFile, setPosterFile] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<any>(null);
  const [trailerUrl, setTrailerUrl] = useState('');
  const [trailerFile, setTrailerFile] = useState<any>(null);
  const [duration, setDuration] = useState('');
  const [rating, setRating] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [language, setLanguage] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  // Top cast rows: { name, character, image }
  const [cast, setCast] = useState<{ name: string; character: string; image: string }[]>([]);
  const [castName, setCastName] = useState('');
  const [castCharacter, setCastCharacter] = useState('');
  const [castImage, setCastImage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const addCastMember = () => {
    if (!castName.trim()) { notify('Validation', 'Cast member name is required'); return; }
    setCast((prev) => [...prev, { name: castName.trim(), character: castCharacter.trim(), image: castImage.trim() }]);
    setCastName(''); setCastCharacter(''); setCastImage('');
  };

  const removeCastMember = (idx: number) => {
    setCast((prev) => prev.filter((_, i) => i !== idx));
  };
  const [uploadProgress, setUploadProgress] = useState(0);

  // ===== Series =====
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [seriesTitle, setSeriesTitle] = useState('');
  const [seriesDesc, setSeriesDesc] = useState('');
  const [seriesThumbnail, setSeriesThumbnail] = useState('');
  const [seriesGenres, setSeriesGenres] = useState<string[]>([]);
  const [seriesSubmitting, setSeriesSubmitting] = useState(false);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [epTitle, setEpTitle] = useState('');
  const [epVideoUrl, setEpVideoUrl] = useState('');
  const [epSeason, setEpSeason] = useState('1');
  const [epNumber, setEpNumber] = useState('1');
  const [epDuration, setEpDuration] = useState('');
  const [epSubmitting, setEpSubmitting] = useState(false);

  // ===== Talent =====
  const [talent, setTalent] = useState<Talent[]>([]);
  const [talentLoading, setTalentLoading] = useState(false);
  const [talentFilter, setTalentFilter] = useState<TalentFilter>('pending');
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // ===== Users =====
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [userProfiles, setUserProfiles] = useState<Record<string, any[]>>({});

  // ===== Analytics =====
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res: any = await apiClient.get('/admin/analytics');
      setAnalyticsData(res);
    } catch (e: any) {
      console.log('Failed to load analytics:', e);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const toggleMovieFeature = async (movieId: string, field: 'isTrending' | 'isNewRelease', currentValue: boolean) => {
    try {
      await apiClient.put(`/movies/${movieId}`, { [field]: !currentValue });
      setMovies((prev) =>
        prev.map((m) => (m._id === movieId ? { ...m, [field]: !currentValue } : m))
      );
      setAnalyticsData((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          topMovies: prev.topMovies?.map((m: any) =>
            m._id === movieId ? { ...m, [field]: !currentValue } : m
          ),
        };
      });
      notify('Success', 'Movie feature status updated.');
    } catch (e: any) {
      notify('Error', e?.message || 'Could not update movie status.');
    }
  };

  const toggleSeriesFeature = async (seriesId: string, field: 'isTrending' | 'isNewRelease', currentValue: boolean) => {
    try {
      await apiClient.put(`/series/${seriesId}`, { [field]: !currentValue });
      setSeriesList((prev) =>
        prev.map((s) => (s._id === seriesId ? { ...s, [field]: !currentValue } : s))
      );
      setAnalyticsData((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          topSeries: prev.topSeries?.map((s: any) =>
            s._id === seriesId ? { ...s, [field]: !currentValue } : s
          ),
        };
      });
      notify('Success', 'Series feature status updated.');
    } catch (e: any) {
      notify('Error', e?.message || 'Could not update series status.');
    }
  };

  useEffect(() => {
    if (tab === 'analytics') loadAnalytics();
  }, [tab]);

  // Role guard — redirect inside useEffect so no hooks fire during render
  useEffect(() => {
    if (Platform.OS === 'web' && user && user.role !== 'admin') {
      router.replace('/(tabs)/home');
    }
  }, [user]);

  useEffect(() => {
    apiClient
      .get('/admin/dashboard')
      .then((res: any) => res?.stats && setStats(res.stats))
      .catch(() => {});
  }, []);

  // ---------- Series ----------
  const loadSeries = useCallback(async () => {
    try {
      setSeriesLoading(true);
      const res: any = await apiClient.get('/series?limit=50');
      if (res?.series) setSeriesList(res.series);
    } catch (e: any) {
      console.log('Error loading series:', e.message);
    } finally {
      setSeriesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'series') loadSeries();
  }, [tab, loadSeries]);

  const handleCreateSeries = async () => {
    if (!seriesTitle.trim()) { notify('Validation', 'Series title is required'); return; }
    setSeriesSubmitting(true);
    try {
      await apiClient.post('/series', {
        title: seriesTitle.trim(),
        description: seriesDesc.trim(),
        thumbnail: seriesThumbnail.trim() || 'https://picsum.photos/300/450',
        genres: seriesGenres.length ? seriesGenres : ['Drama'],
        isTrending: true,
        isNewRelease: true,
      });
      notify('Success', 'Series created!');
      setSeriesTitle(''); setSeriesDesc(''); setSeriesThumbnail(''); setSeriesGenres([]);
      loadSeries();
    } catch (e: any) {
      notify('Error', e?.message || 'Could not create series');
    } finally {
      setSeriesSubmitting(false);
    }
  };

  const handleAddEpisode = async () => {
    if (!selectedSeriesId) { notify('Validation', 'Select a series first'); return; }
    if (!epTitle.trim() || !epVideoUrl.trim()) { notify('Validation', 'Episode title and video URL are required'); return; }
    setEpSubmitting(true);
    try {
      await apiClient.post('/series/episodes', {
        series: selectedSeriesId,
        title: epTitle.trim(),
        videoUrl: epVideoUrl.trim(),
        seasonNumber: parseInt(epSeason) || 1,
        episodeNumber: parseInt(epNumber) || 1,
        duration: epDuration ? parseInt(epDuration) : undefined,
      });
      notify('Success', 'Episode added!');
      setEpTitle(''); setEpVideoUrl(''); setEpDuration('');
      setEpNumber((n) => String(parseInt(n) + 1));
    } catch (e: any) {
      notify('Error', e?.message || 'Could not add episode');
    } finally {
      setEpSubmitting(false);
    }
  };

  const handleDeleteSeries = (id: string, t: string) => {
    const doDelete = async () => {
      try {
        await apiClient.delete(`/series/${id}`);
        if (selectedSeriesId === id) setSelectedSeriesId(null);
        loadSeries();
      } catch (e: any) { notify('Error', e?.message || 'Could not delete'); }
    };
    if (Platform.OS === 'web') { if (window.confirm(`Delete "${t}"?`)) doDelete(); }
    else Alert.alert('Delete Series', `Delete "${t}"?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: doDelete }]);
  };

  // ---------- Movies ----------
  const loadMovies = useCallback(async () => {
    try {
      setMoviesLoading(true);
      const res: any = await apiClient.get('/movies?limit=50');
      if (res?.movies) setMovies(res.movies);
    } catch (e: any) {
      console.log('Error loading movies:', e.message);
    } finally {
      setMoviesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const pickVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      notify('Permission Required', 'Please allow gallery access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 1,
    });
    if (!result.canceled) {
      setVideoFile(result.assets[0]);
    }
  };

  const pickTrailer = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      notify('Permission Required', 'Please allow gallery access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 1,
    });
    if (!result.canceled) {
      setTrailerFile(result.assets[0]);
    }
  };

  const pickImage = async (setter: (a: any) => void) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      notify('Permission Required', 'Please allow gallery access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (!result.canceled) {
      setter(result.assets[0]);
    }
  };

  // Append an image/video asset to FormData (web = blob, native = uri object).
  const appendFile = async (
    formData: FormData,
    field: string,
    file: any,
    fallbackName: string,
    fallbackType: string
  ) => {
    const filename = file.fileName || fallbackName;
    const mimeType = file.mimeType || fallbackType;
    if (Platform.OS === 'web') {
      const resp = await fetch(file.uri);
      const blob = await resp.blob();
      formData.append(field, blob, filename);
    } else {
      formData.append(field, { uri: file.uri, name: filename, type: mimeType } as any);
    }
  };

  const handleUploadMovie = async () => {
    if (!title.trim() || (!thumbnail.trim() && !thumbnailFile)) {
      notify('Validation Error', 'Title and a Thumbnail (image file or URL) are required');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      // Thumbnail / poster: send the file if picked, else the pasted URL.
      if (thumbnailFile) {
        await appendFile(formData, 'thumbnail', thumbnailFile, 'thumbnail.jpg', 'image/jpeg');
      } else if (thumbnail.trim()) {
        formData.append('thumbnail', thumbnail.trim());
      }
      if (posterFile) {
        await appendFile(formData, 'poster', posterFile, 'poster.jpg', 'image/jpeg');
      } else if (poster.trim()) {
        formData.append('poster', poster.trim());
      }
      if (videoUrl.trim()) {
        formData.append('videoUrl', videoUrl.trim());
      }
      if (trailerUrl.trim()) {
        formData.append('trailerUrl', trailerUrl.trim());
      }
      if (videoFile) {
        await appendFile(formData, 'video', videoFile, 'movie.mp4', 'video/mp4');
      }
      if (trailerFile) {
        await appendFile(formData, 'trailer', trailerFile, 'trailer.mp4', 'video/mp4');
      }
      formData.append('duration', String(duration ? parseInt(duration) : 120));
      formData.append('genres', JSON.stringify(selectedGenres.length ? selectedGenres : ['Action']));
      formData.append('rating', String(rating ? parseFloat(rating) : 7.5));
      formData.append('releaseYear', String(releaseYear ? parseInt(releaseYear) : new Date().getFullYear()));
      if (language.trim()) formData.append('language', language.trim());
      formData.append('cast', JSON.stringify(cast));
      formData.append('isTrending', 'true');
      formData.append('isNewRelease', 'true');
      setUploadProgress(0);
      const token = await getAuthToken();
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE_URL}/movies`);
        
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded * 100) / event.total);
            setUploadProgress(percent);
          }
        };
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            let errorMsg = 'Could not upload movie';
            try {
              const res = JSON.parse(xhr.responseText);
              errorMsg = res?.message || errorMsg;
            } catch {}
            reject(new Error(errorMsg));
          }
        };
        
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
      });
      notify('Success', 'Movie uploaded successfully!');

      setTitle('');
      setDescription('');
      setThumbnail('');
      setThumbnailFile(null);
      setPoster('');
      setPosterFile(null);
      setVideoUrl('');
      setTrailerUrl('');
      setVideoFile(null);
      setTrailerFile(null);
      setDuration('');
      setRating('');
      setReleaseYear('');
      setLanguage('');
      setSelectedGenres([]);
      setCast([]);
      setCastName(''); setCastCharacter(''); setCastImage('');

      loadMovies();
    } catch (e: any) {
      notify('Upload Failed', e?.message || 'Could not upload movie');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMovie = (id: string, movieTitle: string) => {
    const doDelete = async () => {
      try {
        await apiClient.delete(`/movies/${id}`);
        loadMovies();
      } catch (e: any) {
        notify('Error', e?.message || 'Could not delete movie');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete "${movieTitle}"?`)) doDelete();
    } else {
      Alert.alert('Confirm Delete', `Are you sure you want to delete "${movieTitle}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  // ---------- Talent ----------
  const loadTalent = useCallback(async () => {
    try {
      setTalentLoading(true);
      const endpoint =
        talentFilter === 'pending'
          ? '/admin/talent/pending'
          : `/admin/talent?status=${talentFilter}`;
      const res: any = await apiClient.get(endpoint);
      if (res?.talent) setTalent(res.talent);
    } catch (e: any) {
      console.log('Error loading talent:', e.message);
    } finally {
      setTalentLoading(false);
    }
  }, [talentFilter]);

  useEffect(() => {
    if (tab === 'talent') loadTalent();
  }, [tab, loadTalent]);

  const reviewTalent = async (id: string, status: string, adminNotes?: string) => {
    try {
      setActioningId(id);
      await apiClient.put(`/admin/talent/${id}/review`, { status, adminNotes });
      setRejectId(null);
      setRejectReason('');
      await loadTalent();
    } catch (e: any) {
      notify('Action Failed', e?.message || 'Could not update submission');
    } finally {
      setActioningId(null);
    }
  };

  const handleDeleteTalent = (id: string, name: string) => {
    const doDelete = async () => {
      try {
        setActioningId(id);
        await apiClient.delete(`/admin/talent/${id}`);
        await loadTalent();
      } catch (e: any) {
        notify('Error', e?.message || 'Could not delete submission');
      } finally {
        setActioningId(null);
      }
    };

    const message = `Permanently delete "${name}"'s submission? This cannot be undone.`;
    if (Platform.OS === 'web') {
      if (window.confirm(message)) doDelete();
    } else {
      Alert.alert('Delete Submission', message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const playVideo = (item: Talent) => {
    if (!item.auditionVideo) {
      notify('No Video', 'This submission has no video URL.');
      return;
    }
    openVideo({
      id: item._id,
      videoUrl: item.auditionVideo,
      title: item.name,
      thumbnail: item.thumbnail,
      durationSeconds: item.duration || 9999,
      contentType: 'Talent',
      subtitle: item.category,
      category: item.category,
    });
  };

  // ---------- Users ----------
  const loadUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const q = userSearch.trim() ? `?search=${encodeURIComponent(userSearch.trim())}` : '';
      const res: any = await apiClient.get(`/admin/users${q}`);
      if (res?.users) setUsers(res.users);
    } catch (e: any) {
      console.log('Error loading users:', e.message);
    } finally {
      setUsersLoading(false);
    }
  }, [userSearch]);

  useEffect(() => {
    if (tab === 'users') loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const toggleUserExpand = async (userId: string) => {
    setExpandedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) { next.delete(userId); return next; }
      next.add(userId);
      return next;
    });
    if (!userProfiles[userId]) {
      try {
        const res: any = await apiClient.get(`/admin/users/${userId}`);
        setUserProfiles((prev) => ({ ...prev, [userId]: res?.profiles || [] }));
      } catch {
        setUserProfiles((prev) => ({ ...prev, [userId]: [] }));
      }
    }
  };

  // ---------- Misc ----------
  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/admin');
    } catch (e) {
      console.log('Logout failed:', e);
    }
  };

  const formatDate = (d?: string) => {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return d;
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'approved':
        return '#00C48C';
      case 'featured':
        return '#FFB800';
      case 'rejected':
        return '#FF5A5A';
      default:
        return '#60A5FA';
    }
  };

  const TABS: { key: AdminTab; label: string; icon: any }[] = [
    { key: 'movies', label: 'Movies', icon: 'film-outline' },
    { key: 'series', label: 'Series', icon: 'tv-outline' },
    { key: 'talent', label: 'Talent', icon: 'star-outline' },
    { key: 'users', label: 'Users', icon: 'people-outline' },
    { key: 'analytics', label: 'Analytics', icon: 'bar-chart-outline' },
  ];

  // Web-only and auth guards (render-time, safe after all hooks are declared)
  if (Platform.OS !== 'web') {
    return (
      <View style={{ flex: 1, backgroundColor: '#040611', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#9CA3AF', fontSize: 16 }}>Admin panel is only available on web.</Text>
      </View>
    );
  }
  if (!user || user.role !== 'admin') return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <LinearGradient colors={['#040611', '#080E24', '#040611']} style={StyleSheet.absoluteFillObject} />

      <View style={styles.orangeGlow} />
      <View style={styles.blueGlow} />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>Manage content, submissions & users</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          

          <TouchableOpacity activeOpacity={0.8} style={styles.logoutBtn} onPress={handleLogout}>
            <Feather name="log-out" size={18} color="#FF6B6B" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TAB BAR */}
      <View style={styles.tabBar}>
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              activeOpacity={0.85}
              style={[styles.tabBtn, active && styles.tabBtnActive]}
              onPress={() => setTab(t.key)}
            >
              <Ionicons name={t.icon} size={16} color={active ? '#FFB800' : '#9CA3AF'} />
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ===================== MOVIES ===================== */}
        {tab === 'movies' && (
          <>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeader}>Upload New Movie</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Movie Title *</Text>
                <TextInput style={styles.input} placeholder="e.g. Inception" placeholderTextColor="#556" value={title} onChangeText={setTitle} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput style={[styles.input, styles.textArea]} placeholder="Short summary of the movie..." placeholderTextColor="#556" multiline numberOfLines={3} value={description} onChangeText={setDescription} />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Duration (min)</Text>
                  <TextInput
                    style={[styles.input, videoFile && styles.inputDisabled]}
                    placeholder={videoFile ? 'Auto' : '120'}
                    placeholderTextColor="#556"
                    keyboardType="numeric"
                    value={videoFile ? '' : duration}
                    onChangeText={setDuration}
                    editable={!videoFile}
                  />
                  {videoFile && <Text style={styles.autoHint}>Auto-filled from video</Text>}
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Rating (0 - 10)</Text>
                  <TextInput style={styles.input} placeholder="8.5" placeholderTextColor="#556" keyboardType="numeric" value={rating} onChangeText={setRating} />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Year</Text>
                  <TextInput style={styles.input} placeholder="2026" placeholderTextColor="#556" keyboardType="numeric" value={releaseYear} onChangeText={setReleaseYear} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Thumbnail Image (Vertical) *</Text>
                <TouchableOpacity style={styles.videoPickBtn} onPress={() => pickImage(setThumbnailFile)}>
                  <Ionicons name="image-outline" size={18} color="#60A5FA" />
                  <Text style={styles.videoPickText}>
                    {thumbnailFile ? 'Thumbnail Selected' : 'Pick Thumbnail Image'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.orText}>OR</Text>
                <TextInput style={styles.input} placeholder="https://example.com/poster.jpg" placeholderTextColor="#556" value={thumbnail} onChangeText={setThumbnail} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Poster Image (Wide Backdrop)</Text>
                <TouchableOpacity style={styles.videoPickBtn} onPress={() => pickImage(setPosterFile)}>
                  <Ionicons name="image-outline" size={18} color="#60A5FA" />
                  <Text style={styles.videoPickText}>
                    {posterFile ? 'Poster Selected' : 'Pick Poster Image'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.orText}>OR</Text>
                <TextInput style={styles.input} placeholder="https://example.com/backdrop.jpg" placeholderTextColor="#556" value={poster} onChangeText={setPoster} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Video File or Stream URL</Text>
                <TouchableOpacity style={styles.videoPickBtn} onPress={pickVideo}>
                  <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
                  <Text style={styles.videoPickText}>
                    {videoFile ? 'Video Selected' : 'Pick Video File'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.orText}>OR</Text>
                <TextInput style={styles.input} placeholder="https://example.com/movie.mp4" placeholderTextColor="#556" value={videoUrl} onChangeText={setVideoUrl} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Trailer File or URL (Optional)</Text>
                <TouchableOpacity style={styles.videoPickBtn} onPress={pickTrailer}>
                  <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
                  <Text style={styles.videoPickText}>
                    {trailerFile ? 'Trailer Selected' : 'Pick Trailer File'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.orText}>OR</Text>
                <TextInput style={styles.input} placeholder="https://example.com/trailer.mp4" placeholderTextColor="#556" value={trailerUrl} onChangeText={setTrailerUrl} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Select Movie Categories (Genres)</Text>
                <View style={styles.genreContainer}>
                  {AVAILABLE_GENRES.map((genre) => {
                    const isSelected = selectedGenres.includes(genre);
                    return (
                      <TouchableOpacity key={genre} activeOpacity={0.8} style={[styles.genreTag, isSelected && styles.genreTagActive]} onPress={() => toggleGenre(genre)}>
                        <Text style={[styles.genreText, isSelected && styles.genreTextActive]}>{genre}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Language</Text>
                <TextInput style={styles.input} placeholder="e.g. English, Hindi" placeholderTextColor="#556" value={language} onChangeText={setLanguage} />
              </View>

              {/* ── Top Cast editor ── */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Top Cast</Text>

                {cast.length > 0 && (
                  <View style={{ gap: 8, marginBottom: 10 }}>
                    {cast.map((c, idx) => (
                      <View key={idx} style={styles.castRow}>
                        <Image
                          source={{ uri: c.image || 'https://i.pravatar.cc/100?u=' + encodeURIComponent(c.name) }}
                          style={styles.castRowAvatar}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.castRowName}>{c.name}</Text>
                          {!!c.character && <Text style={styles.castRowChar}>as {c.character}</Text>}
                        </View>
                        <TouchableOpacity style={styles.deleteMovieBtn} onPress={() => removeCastMember(idx)}>
                          <Feather name="x" size={16} color="#FF5A5A" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                <TextInput style={styles.input} placeholder="Actor name (e.g. Tom Hardy)" placeholderTextColor="#556" value={castName} onChangeText={setCastName} />
                <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Character (e.g. Eames) — optional" placeholderTextColor="#556" value={castCharacter} onChangeText={setCastCharacter} />
                <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Photo URL — optional" placeholderTextColor="#556" value={castImage} onChangeText={setCastImage} />
                <TouchableOpacity style={[styles.videoPickBtn, { marginTop: 8, justifyContent: 'center' }]} onPress={addCastMember}>
                  <Ionicons name="person-add-outline" size={18} color="#60A5FA" />
                  <Text style={styles.videoPickText}>Add Cast Member</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity activeOpacity={0.88} style={styles.submitBtn} onPress={handleUploadMovie} disabled={submitting}>
                <LinearGradient colors={['#FFB800', '#FF8C00']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.submitGradient}>
                  {submitting ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <ActivityIndicator size="small" color="#111" style={{ marginRight: 8 }} />
                      <Text style={styles.submitText}>Uploading: {uploadProgress}%</Text>
                    </View>
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={20} color="#111" />
                      <Text style={styles.submitText}>Upload Movie</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeader}>Manage Uploaded Movies ({movies.length})</Text>

              {moviesLoading && movies.length === 0 ? (
                <View style={styles.listLoading}>
                  <ActivityIndicator size="large" color="#FFB800" />
                  <Text style={styles.loadingText}>Fetching movie list...</Text>
                </View>
              ) : (
                <View style={styles.moviesList}>
                  {movies.length === 0 ? (
                    <Text style={styles.emptyText}>No movies uploaded yet.</Text>
                  ) : (
                    movies.map((movie) => (
                      <View key={movie._id} style={styles.movieRow}>
                        <Image source={{ uri: movie.thumbnail || 'https://picsum.photos/150/200' }} style={styles.movieThumb} />
                        <View style={styles.movieInfo}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text numberOfLines={1} style={[styles.movieTitle, { flex: 1 }]}>{movie.title}</Text>
                            {movie.isDummy && (
                              <View style={styles.dummyBadge}>
                                <Text style={styles.dummyText}>DUMMY</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.movieGenre}>{movie.genres.join(' • ')} ({movie.releaseYear || 'N/A'}) • 👁️ {movie.views || 0} views</Text>
                          <Text style={[styles.movieGenre, { color: '#9CA3AF', fontSize: 11, marginTop: 2 }]}>
                            ⚙️ Quality: {getQualityVariants(movie.videoUrl).map(q => q.label).join(', ')}
                          </Text>
                          <View style={[styles.ratingRow, { marginTop: 4 }]}>
                            <Ionicons name="star" size={12} color="#FFD700" />
                            <Text style={styles.ratingText}>{(movie.rating || 7.5).toFixed(1)}</Text>
                          </View>
                          
                          {/* Feature status toggles */}
                          <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, alignItems: 'center' }}>
                            <TouchableOpacity 
                              activeOpacity={0.8}
                              style={[
                                styles.toggleBadge, 
                                movie.isTrending ? styles.badgeTrendingActive : styles.badgeInactive
                              ]}
                              onPress={() => toggleMovieFeature(movie._id, 'isTrending', !!movie.isTrending)}
                            >
                              <Ionicons name="flame" size={11} color={movie.isTrending ? '#FFB800' : '#6B7280'} />
                              <Text style={[styles.toggleBadgeText, movie.isTrending && { color: '#FFB800' }]}>Trending</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                              activeOpacity={0.8}
                              style={[
                                styles.toggleBadge, 
                                movie.isNewRelease ? styles.badgeNewActive : styles.badgeInactive
                              ]}
                              onPress={() => toggleMovieFeature(movie._id, 'isNewRelease', !!movie.isNewRelease)}
                            >
                              <Ionicons name="sparkles" size={11} color={movie.isNewRelease ? '#60A5FA' : '#6B7280'} />
                              <Text style={[styles.toggleBadgeText, movie.isNewRelease && { color: '#60A5FA' }]}>New Release</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                        <TouchableOpacity activeOpacity={0.8} style={styles.deleteMovieBtn} onPress={() => handleDeleteMovie(movie._id, movie.title)}>
                          <Feather name="trash-2" size={16} color="#FF5A5A" />
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>
          </>
        )}

        {/* ===================== SERIES ===================== */}
        {tab === 'series' && (
          <>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeader}>Create New Series</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Series Title *</Text>
                <TextInput style={styles.input} placeholder="e.g. Breaking Bad" placeholderTextColor="#556" value={seriesTitle} onChangeText={setSeriesTitle} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput style={[styles.input, styles.textArea]} placeholder="Short summary..." placeholderTextColor="#556" multiline numberOfLines={3} value={seriesDesc} onChangeText={setSeriesDesc} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Thumbnail URL</Text>
                <TextInput style={styles.input} placeholder="https://example.com/poster.jpg" placeholderTextColor="#556" value={seriesThumbnail} onChangeText={setSeriesThumbnail} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Genres</Text>
                <View style={styles.genreContainer}>
                  {AVAILABLE_GENRES.map((g) => {
                    const sel = seriesGenres.includes(g);
                    return (
                      <TouchableOpacity key={g} activeOpacity={0.8} style={[styles.genreTag, sel && styles.genreTagActive]}
                        onPress={() => setSeriesGenres((p) => sel ? p.filter((x) => x !== g) : [...p, g])}>
                        <Text style={[styles.genreText, sel && styles.genreTextActive]}>{g}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
              <TouchableOpacity activeOpacity={0.88} style={styles.submitBtn} onPress={handleCreateSeries} disabled={seriesSubmitting}>
                <LinearGradient colors={['#60A5FA', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.submitGradient}>
                  {seriesSubmitting ? <ActivityIndicator size="small" color="#fff" /> : (
                    <><Ionicons name="add-circle-outline" size={20} color="#fff" /><Text style={[styles.submitText, { color: '#fff' }]}>Create Series</Text></>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeader}>Add Episode to Series</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Select Series *</Text>
                {seriesLoading ? <ActivityIndicator color="#FFB800" /> : (
                  <View style={styles.genreContainer}>
                    {seriesList.map((s) => {
                      const sel = selectedSeriesId === s._id;
                      return (
                        <TouchableOpacity key={s._id} activeOpacity={0.8}
                          style={[styles.genreTag, sel && styles.genreTagActive]}
                          onPress={() => setSelectedSeriesId(s._id)}>
                          <Text style={[styles.genreText, sel && styles.genreTextActive]} numberOfLines={1}>{s.title}</Text>
                        </TouchableOpacity>
                      );
                    })}
                    {seriesList.length === 0 && <Text style={styles.emptyText}>No series yet. Create one above.</Text>}
                  </View>
                )}
              </View>
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Season #</Text>
                  <TextInput style={styles.input} placeholder="1" placeholderTextColor="#556" keyboardType="numeric" value={epSeason} onChangeText={setEpSeason} />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Episode #</Text>
                  <TextInput style={styles.input} placeholder="1" placeholderTextColor="#556" keyboardType="numeric" value={epNumber} onChangeText={setEpNumber} />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Episode Title *</Text>
                <TextInput style={styles.input} placeholder="e.g. Pilot" placeholderTextColor="#556" value={epTitle} onChangeText={setEpTitle} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Video URL *</Text>
                <TextInput style={styles.input} placeholder="https://example.com/episode.mp4" placeholderTextColor="#556" value={epVideoUrl} onChangeText={setEpVideoUrl} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Duration (min)</Text>
                <TextInput style={styles.input} placeholder="45" placeholderTextColor="#556" keyboardType="numeric" value={epDuration} onChangeText={setEpDuration} />
              </View>
              <TouchableOpacity activeOpacity={0.88} style={styles.submitBtn} onPress={handleAddEpisode} disabled={epSubmitting}>
                <LinearGradient colors={['#00C48C', '#009966']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.submitGradient}>
                  {epSubmitting ? <ActivityIndicator size="small" color="#fff" /> : (
                    <><Ionicons name="cloud-upload-outline" size={20} color="#fff" /><Text style={[styles.submitText, { color: '#fff' }]}>Add Episode</Text></>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeader}>All Series ({seriesList.length})</Text>
              {seriesLoading && seriesList.length === 0 ? (
                <View style={styles.listLoading}><ActivityIndicator size="large" color="#60A5FA" /><Text style={styles.loadingText}>Loading...</Text></View>
              ) : seriesList.length === 0 ? (
                <Text style={styles.emptyText}>No series yet.</Text>
              ) : (
                <View style={styles.moviesList}>
                  {seriesList.map((s) => (
                    <View key={s._id} style={styles.movieRow}>
                      <Image source={{ uri: s.thumbnail || 'https://picsum.photos/150/200' }} style={styles.movieThumb} />
                      <View style={styles.movieInfo}>
                        <Text numberOfLines={1} style={styles.movieTitle}>{s.title}</Text>
                        <Text style={styles.movieGenre}>{(s.genres || []).join(' • ')}</Text>
                      </View>
                      <TouchableOpacity activeOpacity={0.8} style={styles.deleteMovieBtn} onPress={() => handleDeleteSeries(s._id, s.title)}>
                        <Feather name="trash-2" size={16} color="#FF5A5A" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        {/* ===================== USERS ===================== */}
        {tab === 'users' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>Registered Users ({users.length})</Text>

            {stats && (
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{stats.totalUsers}</Text>
                  <Text style={styles.statLabel}>Users on App</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{stats.recentSignups}</Text>
                  <Text style={styles.statLabel}>New (30d)</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{stats.talent.pending}</Text>
                  <Text style={styles.statLabel}>Pending Talent</Text>
                </View>
              </View>
            )}

            <View style={[styles.inputGroup, { flexDirection: 'row', gap: 10 }]}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Search by name or email..."
                placeholderTextColor="#556"
                value={userSearch}
                onChangeText={setUserSearch}
                onSubmitEditing={loadUsers}
              />
              <TouchableOpacity style={styles.searchBtn} onPress={loadUsers}>
                <Ionicons name="search" size={18} color="#111" />
              </TouchableOpacity>
            </View>

            {usersLoading ? (
              <View style={styles.listLoading}>
                <ActivityIndicator size="large" color="#FFB800" />
                <Text style={styles.loadingText}>Loading users...</Text>
              </View>
            ) : users.length === 0 ? (
              <Text style={styles.emptyText}>No users found.</Text>
            ) : (
              <View style={{ gap: 10 }}>
                {users.map((u) => {
                  const expanded = expandedUsers.has(u._id);
                  const profiles = userProfiles[u._id];
                  return (
                    <View key={u._id} style={styles.userCard}>
                      {/* ── Main row ── */}
                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.userRow}
                        onPress={() => toggleUserExpand(u._id)}
                      >
                        <View style={styles.userAvatar}>
                          <Text style={styles.userAvatarText}>{(u.name || 'U').charAt(0).toUpperCase()}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.userName}>{u.name || 'Unnamed'}</Text>
                          <Text style={styles.userMeta}>{u.email}</Text>
                          {!!u.phone && <Text style={styles.userMeta}>📞 {u.phone}</Text>}
                          <Text style={styles.userMeta}>Joined {formatDate(u.createdAt)}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 6 }}>
                          <View style={[styles.roleBadge, u.role === 'admin' && styles.roleBadgeAdmin]}>
                            <Text style={[styles.roleBadgeText, u.role === 'admin' && { color: '#FFB800' }]}>{u.role || 'user'}</Text>
                          </View>
                          <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color="#6B7280" />
                        </View>
                      </TouchableOpacity>

                      {/* ── User ID banner (always visible) ── */}
                      <View style={styles.idBanner}>
                        <Text style={styles.idBannerLabel}>USER ID</Text>
                        <Text selectable style={styles.idBannerValue}>{u._id}</Text>
                      </View>

                      {/* ── Profiles (expanded) ── */}
                      {expanded && (
                        <View style={styles.profilesSection}>
                          <Text style={styles.profilesSectionTitle}>
                            Profiles under this account
                          </Text>
                          {profiles === undefined ? (
                            <ActivityIndicator size="small" color="#60A5FA" style={{ marginVertical: 10 }} />
                          ) : profiles.length === 0 ? (
                            <Text style={styles.emptyText}>No profiles created yet.</Text>
                          ) : (
                            profiles.map((p: any) => (
                              <View key={p._id} style={styles.profileRow}>
                                <View style={styles.profileAvatarWrap}>
                                  {p.avatar ? (
                                    <Image source={{ uri: p.avatar }} style={styles.profileAvatar} />
                                  ) : (
                                    <View style={[styles.profileAvatar, { backgroundColor: 'rgba(96,165,250,0.2)', alignItems: 'center', justifyContent: 'center' }]}>
                                      <Text style={{ color: '#60A5FA', fontWeight: '700' }}>{(p.name || 'P').charAt(0)}</Text>
                                    </View>
                                  )}
                                  {p.isKids && (
                                    <View style={styles.kidsBadge}><Text style={styles.kidsBadgeText}>KIDS</Text></View>
                                  )}
                                </View>
                                <View style={{ flex: 1 }}>
                                  <Text style={styles.profileName}>{p.name}</Text>
                                  <Text style={styles.profileId}>Profile ID: {p._id}</Text>
                                  {p.preferences?.favoriteGenres?.length > 0 && (
                                    <Text style={styles.profileMeta}>
                                      Genres: {p.preferences.favoriteGenres.join(', ')}
                                    </Text>
                                  )}
                                  {p.watchHistory?.length > 0 && (
                                    <Text style={[styles.profileMeta, { marginTop: 4, color: '#FFB800' }]}>
                                      🎥 Recent Views: {p.watchHistory.map((h: any) => h.title).join(', ')}
                                    </Text>
                                  )}
                                </View>
                              </View>
                            ))
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* ===================== ANALYTICS ===================== */}
        {tab === 'analytics' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>Reach & Engagement Analytics</Text>

            {analyticsLoading ? (
              <View style={styles.listLoading}>
                <ActivityIndicator size="large" color="#FFB800" />
                <Text style={styles.loadingText}>Fetching analytics metrics...</Text>
              </View>
            ) : !analyticsData ? (
              <Text style={styles.emptyText}>Could not load analytics. Please try again.</Text>
            ) : (
              <View style={{ gap: 20 }}>
                {/* ── Stats Summary Grid ── */}
                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{stats?.totalUsers || 0}</Text>
                    <Text style={styles.statLabel}>Registered Users</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{stats?.totalMovies || 0}</Text>
                    <Text style={styles.statLabel}>Total Movies</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{stats?.totalSeries || 0}</Text>
                    <Text style={styles.statLabel}>Total Series</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{stats?.totalWatchHistory || 0}</Text>
                    <Text style={styles.statLabel}>Total App Views</Text>
                  </View>
                </View>

                {/* ── Top 10 Most Watched Movies ── */}
                <View style={[styles.sectionCard, { backgroundColor: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 12 }]}>
                  <Text style={[styles.sectionHeader, { fontSize: 16, borderBottomWidth: 0, marginBottom: 12 }]}>
                    🔥 Top 10 Most Watched Movies
                  </Text>
                  {!analyticsData.topMovies || analyticsData.topMovies.length === 0 ? (
                    <Text style={styles.emptyText}>No views recorded yet.</Text>
                  ) : (
                    <View style={styles.moviesList}>
                      {analyticsData.topMovies.map((movie: any, idx: number) => (
                        <View key={movie._id} style={styles.movieRow}>
                          <View style={{ position: 'relative' }}>
                            <Image source={{ uri: movie.thumbnail || 'https://picsum.photos/150/200' }} style={styles.movieThumb} />
                            <View style={styles.rankBadge}>
                              <Text style={styles.rankBadgeText}>#{idx + 1}</Text>
                            </View>
                          </View>
                          <View style={styles.movieInfo}>
                            <Text numberOfLines={1} style={styles.movieTitle}>{movie.title}</Text>
                            <Text style={styles.movieGenre}>👁️ {movie.views || 0} plays</Text>
                            <Text style={[styles.movieGenre, { color: '#9CA3AF', fontSize: 11 }]}>
                              ⚙️ Quality: {getQualityVariants(movie.videoUrl).map(q => q.label).join(', ')}
                            </Text>

                            {/* Toggles */}
                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, alignItems: 'center' }}>
                              <TouchableOpacity 
                                activeOpacity={0.8}
                                style={[
                                  styles.toggleBadge, 
                                  movie.isTrending ? styles.badgeTrendingActive : styles.badgeInactive
                                ]}
                                onPress={() => toggleMovieFeature(movie._id, 'isTrending', !!movie.isTrending)}
                              >
                                <Ionicons name="flame" size={11} color={movie.isTrending ? '#FFB800' : '#6B7280'} />
                                <Text style={[styles.toggleBadgeText, movie.isTrending && { color: '#FFB800' }]}>Trending</Text>
                              </TouchableOpacity>

                              <TouchableOpacity 
                                activeOpacity={0.8}
                                style={[
                                  styles.toggleBadge, 
                                  movie.isNewRelease ? styles.badgeNewActive : styles.badgeInactive
                                ]}
                                onPress={() => toggleMovieFeature(movie._id, 'isNewRelease', !!movie.isNewRelease)}
                              >
                                <Ionicons name="sparkles" size={11} color={movie.isNewRelease ? '#60A5FA' : '#6B7280'} />
                                <Text style={[styles.toggleBadgeText, movie.isNewRelease && { color: '#60A5FA' }]}>New Release</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* ── Top 10 Most Watched Series ── */}
                <View style={[styles.sectionCard, { backgroundColor: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 12 }]}>
                  <Text style={[styles.sectionHeader, { fontSize: 16, borderBottomWidth: 0, marginBottom: 12 }]}>
                    📺 Top 10 Most Watched Series
                  </Text>
                  {!analyticsData.topSeries || analyticsData.topSeries.length === 0 ? (
                    <Text style={styles.emptyText}>No views recorded yet.</Text>
                  ) : (
                    <View style={styles.moviesList}>
                      {analyticsData.topSeries.map((series: any, idx: number) => (
                        <View key={series._id} style={styles.movieRow}>
                          <View style={{ position: 'relative' }}>
                            <Image source={{ uri: series.thumbnail || 'https://picsum.photos/150/200' }} style={styles.movieThumb} />
                            <View style={styles.rankBadge}>
                              <Text style={styles.rankBadgeText}>#{idx + 1}</Text>
                            </View>
                          </View>
                          <View style={styles.movieInfo}>
                            <Text numberOfLines={1} style={styles.movieTitle}>{series.title}</Text>
                            <Text style={styles.movieGenre}>👁️ {series.views || 0} plays</Text>

                            {/* Toggles */}
                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, alignItems: 'center' }}>
                              <TouchableOpacity 
                                activeOpacity={0.8}
                                style={[
                                  styles.toggleBadge, 
                                  series.isTrending ? styles.badgeTrendingActive : styles.badgeInactive
                                ]}
                                onPress={() => toggleSeriesFeature(series._id, 'isTrending', !!series.isTrending)}
                              >
                                <Ionicons name="flame" size={11} color={series.isTrending ? '#FFB800' : '#6B7280'} />
                                <Text style={[styles.toggleBadgeText, series.isTrending && { color: '#FFB800' }]}>Trending</Text>
                              </TouchableOpacity>

                              <TouchableOpacity 
                                activeOpacity={0.8}
                                style={[
                                  styles.toggleBadge, 
                                  series.isNewRelease ? styles.badgeNewActive : styles.badgeInactive
                                ]}
                                onPress={() => toggleSeriesFeature(series._id, 'isNewRelease', !!series.isNewRelease)}
                              >
                                <Ionicons name="sparkles" size={11} color={series.isNewRelease ? '#60A5FA' : '#6B7280'} />
                                <Text style={[styles.toggleBadgeText, series.isNewRelease && { color: '#60A5FA' }]}>New Release</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* ── Daily User Growth ── */}
                <View style={[styles.sectionCard, { backgroundColor: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 12 }]}>
                  <Text style={[styles.sectionHeader, { fontSize: 16, borderBottomWidth: 0, marginBottom: 12 }]}>
                    📈 Daily Sign-up Growth Trend (Last 30 Days)
                  </Text>
                  {!analyticsData.signupTrend || analyticsData.signupTrend.length === 0 ? (
                    <Text style={styles.emptyText}>No signups recorded in this period.</Text>
                  ) : (
                    <View style={{ gap: 6 }}>
                      {analyticsData.signupTrend.map((item: any) => (
                        <View key={item._id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' }}>
                          <Text style={{ color: '#9CA3AF', fontSize: 13 }}>📅 {item._id}</Text>
                          <Text style={{ color: '#60A5FA', fontSize: 13, fontWeight: '700' }}>+{item.count} new users</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* ── Talent Categories Distribution ── */}
                <View style={[styles.sectionCard, { backgroundColor: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 12 }]}>
                  <Text style={[styles.sectionHeader, { fontSize: 16, borderBottomWidth: 0, marginBottom: 12 }]}>
                    🎭 Registered Talent Categories
                  </Text>
                  {!analyticsData.talentByCategory || analyticsData.talentByCategory.length === 0 ? (
                    <Text style={styles.emptyText}>No talent profiles registered.</Text>
                  ) : (
                    <View style={{ gap: 6 }}>
                      {analyticsData.talentByCategory.map((item: any) => (
                        <View key={item._id || 'other'} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' }}>
                          <Text style={{ color: '#E5E7EB', fontSize: 13, fontWeight: '600' }}>⭐️ {item._id || 'Unassigned'}</Text>
                          <Text style={{ color: '#FFB800', fontSize: 13, fontWeight: '700' }}>{item.count} candidates</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#040611' },
  orangeGlow: { position: 'absolute', top: -150, right: -100, width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(245,158,11,0.08)' },
  blueGlow: { position: 'absolute', bottom: -150, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(59,130,246,0.08)' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  title: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 0.5 },
  subtitle: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,107,107,0.1)', borderWidth: 1, borderColor: 'rgba(255,107,107,0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  logoutText: { color: '#FF6B6B', fontSize: 13, fontWeight: '700', marginLeft: 6 },

  tabBar: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  tabBtnActive: { backgroundColor: 'rgba(255,184,0,0.12)', borderColor: 'rgba(255,184,0,0.35)' },
  tabText: { color: '#9CA3AF', fontSize: 13, fontWeight: '700' },
  tabTextActive: { color: '#FFB800' },

  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 20, marginBottom: 20 },
  sectionHeader: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)', paddingBottom: 8 },
  inputGroup: { marginBottom: 16 },
  label: { color: '#9CA3AF', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, color: '#fff', fontSize: 14 },
  inputDisabled: { opacity: 0.5 },
  autoHint: { color: '#00C48C', fontSize: 10, marginTop: 4, fontWeight: '600' },
  textArea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  genreContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  genreTag: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  genreTagActive: { backgroundColor: 'rgba(255,184,0,0.15)', borderColor: '#FFB800' },
  genreText: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },
  genreTextActive: { color: '#FFB800' },
  videoPickBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(37,99,235,0.15)', borderWidth: 1, borderColor: 'rgba(37,99,235,0.3)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8 },
  videoPickText: { color: '#60A5FA', fontSize: 14, fontWeight: '600' },
  orText: { textAlign: 'center', color: '#6B7280', fontSize: 12, marginVertical: 8, fontStyle: 'italic' },
  dummyBadge: { backgroundColor: 'rgba(255,90,90,0.2)', borderWidth: 1, borderColor: 'rgba(255,90,90,0.4)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  dummyText: { color: '#FF5A5A', fontSize: 11, fontWeight: '700' },
  submitBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 10 },
  submitGradient: { paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  submitText: { color: '#111', fontSize: 15, fontWeight: '800' },
  listLoading: { alignItems: 'center', paddingVertical: 30 },
  loadingText: { color: '#9CA3AF', fontSize: 13, marginTop: 10 },
  moviesList: { gap: 12 },
  emptyText: { color: '#556', textAlign: 'center', paddingVertical: 20, fontSize: 13 },
  movieRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  movieThumb: { width: 48, height: 64, borderRadius: 8, backgroundColor: '#222' },
  movieInfo: { flex: 1, marginLeft: 12 },
  movieTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  movieGenre: { color: '#6B7280', fontSize: 11, marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  ratingText: { color: '#FFD700', fontSize: 11, fontWeight: '700' },
  deleteMovieBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(255,90,90,0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,90,90,0.12)' },

  // Cast editor rows
  castRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  castRowAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#222' },
  castRowName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  castRowChar: { color: '#6B7280', fontSize: 12, marginTop: 2 },

  // Talent
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  filterChipActive: { backgroundColor: 'rgba(96,165,250,0.15)', borderColor: '#60A5FA' },
  filterChipText: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: '#60A5FA' },
  talentCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  submitterRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  submitterAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#222' },
  submitterName: { color: '#fff', fontSize: 15, fontWeight: '800' },
  submitterMeta: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  submitterId: { color: '#6B7280', fontSize: 10, marginTop: 2 },
  statusPill: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusPillText: { fontSize: 11, fontWeight: '800', textTransform: 'capitalize' },
  talentMetaBox: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 12, marginBottom: 12 },
  talentName: { color: '#fff', fontSize: 15, fontWeight: '700' },
  talentCategory: { color: '#60A5FA', fontSize: 12, marginTop: 4, fontWeight: '600' },
  talentBio: { color: '#C4CAD4', fontSize: 13, marginTop: 8, lineHeight: 19 },
  talentDate: { color: '#6B7280', fontSize: 11, marginTop: 8 },
  adminNote: { color: '#FF9E9E', fontSize: 12, marginTop: 6, fontStyle: 'italic' },
  playBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(37,99,235,0.9)', paddingVertical: 12, borderRadius: 12, marginBottom: 12 },
  playBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  rejectBox: { backgroundColor: 'rgba(255,90,90,0.06)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,90,90,0.15)' },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  actionBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  approveBtn: { backgroundColor: '#00A870' },
  featureBtn: { backgroundColor: '#FFB800' },
  rejectBtn: { backgroundColor: '#E5484D' },
  rejectConfirmBtn: { backgroundColor: '#E5484D' },
  cancelBtn: { backgroundColor: 'rgba(255,255,255,0.1)' },

  // Users
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: 'rgba(96,165,250,0.08)', borderWidth: 1, borderColor: 'rgba(96,165,250,0.2)', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 20, fontWeight: '900' },
  statLabel: { color: '#9CA3AF', fontSize: 11, marginTop: 4, fontWeight: '600' },
  searchBtn: { width: 46, height: 46, borderRadius: 14, backgroundColor: '#FFB800', justifyContent: 'center', alignItems: 'center' },

  userCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
  userRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 12 },
  userAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(96,165,250,0.2)', justifyContent: 'center', alignItems: 'center' },
  userAvatarText: { color: '#60A5FA', fontSize: 18, fontWeight: '800' },
  userName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  userMeta: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  userId: { color: '#6B7280', fontSize: 10, marginTop: 2 },

  // ID banner — prominently displayed under each user row
  idBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(96,165,250,0.06)',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 14, paddingVertical: 8,
  },
  idBannerLabel: { color: '#60A5FA', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, minWidth: 52 },
  idBannerValue: { color: '#C4CAD4', fontSize: 12, fontFamily: Platform.OS === 'web' ? 'monospace' : undefined, flex: 1 },

  // Profiles section
  profilesSection: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', padding: 14 },
  profilesSectionTitle: { color: '#9CA3AF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  profileAvatarWrap: { position: 'relative' },
  profileAvatar: { width: 40, height: 40, borderRadius: 8 },
  kidsBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: '#60A5FA', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
  kidsBadgeText: { color: '#fff', fontSize: 8, fontWeight: '800' },
  profileName: { color: '#fff', fontSize: 13, fontWeight: '700' },
  profileId: { color: '#6B7280', fontSize: 10, marginTop: 2, fontFamily: Platform.OS === 'web' ? 'monospace' : undefined },
  profileMeta: { color: '#9CA3AF', fontSize: 11, marginTop: 2 },

  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)' },
  roleBadgeAdmin: { backgroundColor: 'rgba(255,184,0,0.12)' },
  roleBadgeText: { color: '#9CA3AF', fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },

  toggleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  badgeInactive: { borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'transparent' },
  badgeTrendingActive: { borderColor: '#FFB800', backgroundColor: 'rgba(255,184,0,0.1)' },
  badgeNewActive: { borderColor: '#60A5FA', backgroundColor: 'rgba(96,165,250,0.08)' },
  toggleBadgeText: { fontSize: 10, color: '#6B7280', fontWeight: '700' },
  rankBadge: { position: 'absolute', top: -4, left: -4, backgroundColor: '#FFB800', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1, zIndex: 10 },
  rankBadgeText: { color: '#111', fontSize: 9, fontWeight: '900' },
});
