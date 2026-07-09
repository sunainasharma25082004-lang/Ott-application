import React, { useMemo, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Dimensions, TouchableOpacity, ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import ReelsPlayerItem from '../../src/components/video/ReelsPlayerItem';
import type { VideoItem } from '../../src/utils/videoRouting';

const { height } = Dimensions.get('window');

export default function ReelsScreen() {
  const { items, startIndex } = useLocalSearchParams<{ items?: string; startIndex?: string }>();

  const feed: VideoItem[] = useMemo(() => {
    try {
      const parsed = items ? JSON.parse(items) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [items]);

  const initialIndex = Math.min(Math.max(parseInt(startIndex || '0', 10) || 0, 0), Math.max(feed.length - 1, 0));
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 }).current;

  const renderItem = useCallback(
    ({ item, index }: { item: VideoItem; index: number }) => (
      <ReelsPlayerItem item={item} isActive={index === activeIndex} />
    ),
    [activeIndex]
  );

  if (feed.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <TouchableOpacity style={styles.closeBtnEmpty} onPress={() => router.back()}>
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={feed}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        decelerationRate="fast"
        initialScrollIndex={initialIndex}
        getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      <SafeAreaView style={styles.closeSafeArea} pointerEvents="box-none">
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  emptyContainer: { flex: 1, backgroundColor: '#000' },
  closeSafeArea: { position: 'absolute', top: 0, left: 0, right: 0 },
  closeBtn: {
    marginTop: 6,
    marginLeft: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnEmpty: {
    marginTop: 60,
    marginLeft: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
