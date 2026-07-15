import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { getNetworkState } from '../utils/networkState';
import { QualityVariant } from '../utils/cloudinaryVideo';
import { VideoItem } from '../utils/videoRouting';

export interface Download {
  id: string;
  title: string;
  thumbnail: string;
  contentType: 'Movie' | 'Episode' | 'Talent';
  quality: string;
  localUri: string;
  sizeBytes: number;
  downloadedAt: number;
}

interface DownloadsContextType {
  downloads: Download[];
  activeDownloads: Record<string, number>;
  startDownload: (item: VideoItem, quality: QualityVariant) => Promise<void>;
  deleteDownload: (id: string) => Promise<void>;
}

const DownloadsContext = createContext<DownloadsContextType | undefined>(undefined);

const MANIFEST_FILE = FileSystem.documentDirectory ? FileSystem.documentDirectory + 'downloads.json' : '';
const DOWNLOADS_DIR = FileSystem.documentDirectory ? FileSystem.documentDirectory + 'downloads/' : '';

export const DownloadsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [activeDownloads, setActiveDownloads] = useState<Record<string, number>>({});

  useEffect(() => {
    loadManifest();
  }, []);

  const loadManifest = async () => {
    if (Platform.OS === 'web') return;
    try {
      const info = await FileSystem.getInfoAsync(MANIFEST_FILE);
      if (info.exists) {
        const content = await FileSystem.readAsStringAsync(MANIFEST_FILE);
        setDownloads(JSON.parse(content));
      }
    } catch (e) {
      console.log('Failed to load downloads manifest:', e);
    }
  };

  const saveManifest = async (data: Download[]) => {
    if (Platform.OS === 'web') {
      setDownloads(data);
      return;
    }
    try {
      const dirInfo = await FileSystem.getInfoAsync(DOWNLOADS_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(DOWNLOADS_DIR, { intermediates: true });
      }
      await FileSystem.writeAsStringAsync(MANIFEST_FILE, JSON.stringify(data, null, 2));
      setDownloads(data);
    } catch (e) {
      console.log('Failed to save downloads manifest:', e);
    }
  };

  const startDownload = useCallback(async (item: VideoItem, quality: QualityVariant) => {
    if (Platform.OS === 'web') {
      throw new Error('Downloads are not supported on web browsers');
    }

    const { isOnline } = getNetworkState();
    if (!isOnline) {
      throw new Error('You must be online to download videos');
    }

    const downloadId = item.id;
    const localPath = DOWNLOADS_DIR + downloadId + '.mp4';

    try {
      setActiveDownloads(prev => ({ ...prev, [downloadId]: 0 }));

      const downloadResumable = FileSystem.createDownloadResumable(
        quality.url,
        localPath,
        {},
        ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
          const progress = totalBytesWritten / totalBytesExpectedToWrite;
          setActiveDownloads(prev => ({ ...prev, [downloadId]: progress }));
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (!result || !result.uri) throw new Error('Download failed');

      const fileInfo = await FileSystem.getInfoAsync(result.uri);
      const sizeBytes = fileInfo.exists ? fileInfo.size : 0;

      const newDownload: Download = {
        id: downloadId,
        title: item.title,
        thumbnail: item.thumbnail || '',
        contentType: item.contentType,
        quality: quality.label,
        localUri: result.uri,
        sizeBytes,
        downloadedAt: Date.now(),
      };

      const updated = [...downloads, newDownload];
      await saveManifest(updated);

      setActiveDownloads(prev => {
        const copy = { ...prev };
        delete copy[downloadId];
        return copy;
      });
    } catch (e) {
      setActiveDownloads(prev => {
        const copy = { ...prev };
        delete copy[downloadId];
        return copy;
      });
      throw e;
    }
  }, [downloads]);

  const deleteDownload = useCallback(async (id: string) => {
    if (Platform.OS === 'web') return;
    try {
      const download = downloads.find(d => d.id === id);
      if (download) {
        await FileSystem.deleteAsync(download.localUri, { idempotent: true });
      }
      const updated = downloads.filter(d => d.id !== id);
      await saveManifest(updated);
    } catch (e) {
      console.log('Failed to delete download:', e);
      throw e;
    }
  }, [downloads]);

  return (
    <DownloadsContext.Provider value={{ downloads, activeDownloads, startDownload, deleteDownload }}>
      {children}
    </DownloadsContext.Provider>
  );
};

export const useDownloads = (): DownloadsContextType => {
  const context = useContext(DownloadsContext);
  if (!context) {
    throw new Error('useDownloads must be used within DownloadsProvider');
  }
  return context;
};
