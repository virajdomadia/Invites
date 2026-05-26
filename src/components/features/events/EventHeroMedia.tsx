import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';

interface ThemeAssets {
  main_asset_video?: {
    playbackId: string;
    [key: string]: unknown;
  };
  main_asset?: {
    uploadedAssetUrl: string;
    alt_text?: string;
    [key: string]: unknown;
  };
  main_asset_mobile?: {
    uploadedAssetUrl: string;
    alt_text?: string;
    [key: string]: unknown;
  };
  main_asset_desktop?: {
    uploadedAssetUrl: string;
    alt_text?: string;
    [key: string]: unknown;
  };
}

interface EventHeroMediaProps {
  assets: ThemeAssets | undefined;
  previewImage?: string | null;
  eventImageUrl?: string | null;
  aspectRatio?: string;
  testId?: string;
  ishost?: boolean;
  onEdit?: () => void;
  eventId?: string;
  backgroundColor?: string;
}

const formatImageUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  return `https://${url}`;
};

const getThemeAssetUrl = (
  assets: ThemeAssets | undefined
): { url: string; alt: string } | null => {
  if (!assets) return null;

  // Priority: mobile > main > desktop (since we're always mobile in native)
  const candidateUrl =
    assets.main_asset_mobile?.uploadedAssetUrl ||
    assets.main_asset?.uploadedAssetUrl ||
    assets.main_asset_desktop?.uploadedAssetUrl;

  if (!candidateUrl) return null;

  const altText =
    assets.main_asset_mobile?.alt_text ||
    assets.main_asset?.alt_text ||
    assets.main_asset_desktop?.alt_text ||
    'Event Theme';

  return {
    url: formatImageUrl(candidateUrl),
    alt: altText,
  };
};

export const EventHeroMedia: React.FC<EventHeroMediaProps> = ({
  assets,
  previewImage,
  eventImageUrl,
  aspectRatio = '16:9',
  testId,
  ishost = false,
  backgroundColor = '#000000',
}) => {
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageLoad = (event: any) => {
    const { width, height } = event.nativeEvent.source;
    if (width && height) {
      setImageAspectRatio(width / height);
    }
    setImageLoading(false);
  };

  // Get image URL
  const themeImageData = getThemeAssetUrl(assets);
  const finalImageUrl = previewImage || themeImageData?.url || eventImageUrl;
  const altText = themeImageData?.alt || 'Event Theme';

  // Show video if available and no preview override
  if (assets?.main_asset_video?.playbackId && !previewImage) {
    const playbackId = assets.main_asset_video.playbackId;
    const videoUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;

    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Image
          source={{ uri: videoUrl }}
          style={styles.image}
          resizeMode="cover"
          testID={testId}
        />
      </View>
    );
  }

  if (!finalImageUrl) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const calculatedAspectRatio = imageAspectRatio
    ? imageAspectRatio
    : aspectRatio === '16:9'
    ? 16 / 9
    : aspectRatio === '1:1'
    ? 1
    : 4 / 3;

  return (
    <View
      style={[
        styles.container,
        {
          aspectRatio: calculatedAspectRatio,
        },
      ]}
    >
      <Image
        source={{ uri: formatImageUrl(finalImageUrl) }}
        style={styles.image}
        resizeMode="cover"
        onLoad={handleImageLoad}
        testID={testId}
      />
      {imageLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});
