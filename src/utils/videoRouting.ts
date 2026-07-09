import { router } from 'expo-router';
import { Alert, Platform } from 'react-native';
import { SHORT_VIDEO_MAX_SECONDS } from '../constants/video';
import { getNetworkState } from './networkState';

export type VideoContentType = 'Movie' | 'Episode' | 'Talent';

export interface VideoItem {
  id: string;
  videoUrl: string;
  title: string;
  thumbnail?: string;
  durationSeconds: number;
  contentType: VideoContentType;
  subtitle?: string; // e.g. category / submitter name, shown in the Reels overlay
  category?: string; // Talent category, used to fetch "More Like This"
  relatedId?: string; // parent Series id, for Episode "More Like This"
}

// Keep router params (and the JSON-encoded feed) small.
const MAX_FEED_ITEMS = 25;

// Central decision point: short clips open the Reels-style swipeable feed,
// everything else opens the full Netflix/YouTube-style player.
export const openVideo = (item: VideoItem, feed?: VideoItem[]) => {
  if (!item?.videoUrl) return;

  const { isOnline } = getNetworkState();
  const isLocalFile = item.videoUrl.startsWith('file://');

  if (!isOnline && !isLocalFile) {
    const msg = 'You are offline. Play this video from your Downloads instead.';
    if (Platform.OS === 'web') window.alert(msg);
    else Alert.alert('Offline', msg);
    return;
  }

  if (item.durationSeconds > 0 && item.durationSeconds <= SHORT_VIDEO_MAX_SECONDS) {
    const list = (feed && feed.length ? feed : [item]).slice(0, MAX_FEED_ITEMS);
    const startIndex = Math.max(
      0,
      list.findIndex((i) => i.id === item.id)
    );

    router.push({
      pathname: '/player/reels',
      params: {
        items: JSON.stringify(list),
        startIndex: String(startIndex),
      },
    });
    return;
  }

  router.push({
    pathname: '/player/watch',
    params: {
      videoUrl: item.videoUrl,
      title: item.title,
      thumbnail: item.thumbnail || '',
      contentId: item.id,
      contentType: item.contentType,
      durationSeconds: String(item.durationSeconds || 0),
      category: item.category || '',
      relatedId: item.relatedId || '',
    },
  });
};
