import { Theme, themeLibraryService } from '@/core/api/themeLibraryService';
import { useAuthStore } from '@/core/store/authStore';
import { LightMode } from '@/theme';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export default function ThemeImagesSection() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const isSignedIn = useAuthStore((state) => !!state.accessToken && !!state.user);

  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayIndex, setDisplayIndex] = useState(0);

  const cardSize = isMobile ? Math.floor((width - 44) / 2) : 240;
  const shadowWidth = cardSize + 20;

  // Entry animation
  const entryScale = useSharedValue(0.88);
  const entryOpacity = useSharedValue(0);
  const entryTranslateY = useSharedValue(20);

  // Float animation
  const floatY = useSharedValue(0);
  const floatRotateZ = useSharedValue(0);

  // Shadow animation
  const shadowScaleX = useSharedValue(1);
  const shadowOpacity = useSharedValue(1);

  const swapTimer = useRef<NodeJS.Timeout | null>(null);

  // Fetch themes
  useEffect(() => {
    if (!isAuthReady || !isSignedIn) return;

    const fetchThemes = async () => {
      try {
        setLoading(true);
        console.log('[ThemeImagesSection] Fetching system tags...');
        const tagsResponse = await themeLibraryService.getSystemTags();
        console.log('[ThemeImagesSection] Tags response:', tagsResponse);

        if (tagsResponse.error || tagsResponse.data.length === 0) {
          console.error('[ThemeImagesSection] Error or empty tags:', tagsResponse.error);
          setError('Failed to load themes');
          setLoading(false);
          return;
        }

        const allThemes: Theme[] = [];
        for (const tag of tagsResponse.data) {
          const themesResponse = await themeLibraryService.getThemesByTag(tag.id);
          if (themesResponse.data) {
            allThemes.push(...themesResponse.data);
          }
        }

        const imageUrls = allThemes
          .map(theme => theme.main_banner_url?.[0])
          .filter(Boolean) as string[];

        if (imageUrls.length === 0) {
          setError('No theme images available');
          setLoading(false);
          return;
        }

        const shuffled = [...new Set(imageUrls)]
          .sort(() => Math.random() - 0.5)
          .slice(0, 50);

        setThemes(
          shuffled.map((url, index) => ({
            id: `theme-${index}`,
            name: `Theme ${index + 1}`,
            main_banner_url: [url],
          }))
        );
        setError(null);
      } catch (err) {
        console.error('Error fetching themes:', err);
        setError('Failed to load themes');
      } finally {
        setLoading(false);
      }
    };

    fetchThemes();
  }, [isAuthReady]);

  // Entry + float animation
  useEffect(() => {
    if (themes.length > 0 && !loading) {
      // Entry
      entryScale.value = withTiming(1, { duration: 800 });
      entryOpacity.value = withTiming(1, { duration: 800 });
      entryTranslateY.value = withTiming(0, { duration: 800 });

      // Float starts after entry
      setTimeout(() => {
        floatY.value = withRepeat(
          withSequence(
            withTiming(-20, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            withTiming(0,   { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          ),
          -1,
          false
        );

        floatRotateZ.value = withRepeat(
          withSequence(
            withTiming(-1.5, { duration: 750,  easing: Easing.inOut(Easing.ease) }),
            withTiming(1.5,  { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            withTiming(-1.5, { duration: 750,  easing: Easing.inOut(Easing.ease) }),
          ),
          -1,
          false
        );

        shadowScaleX.value = withRepeat(
          withSequence(
            withTiming(0.55, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            withTiming(1,    { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          ),
          -1,
          false
        );

        shadowOpacity.value = withRepeat(
          withSequence(
            withTiming(0.5, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            withTiming(1,   { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          ),
          -1,
          false
        );
      }, 800);
    }
  }, [themes.length, loading]);

  // Image swap every 6s
  useEffect(() => {
    if (themes.length === 0) return;

    swapTimer.current = setInterval(() => {
      entryScale.value = withTiming(0.85, { duration: 800 });
      entryOpacity.value = withTiming(0,   { duration: 800 });

      setTimeout(() => {
        setDisplayIndex(prev => (prev + 1) % themes.length);
        entryScale.value = withTiming(1, { duration: 800 });
        entryOpacity.value = withTiming(1, { duration: 800 });
      }, 800);
    }, 6000);

    return () => {
      if (swapTimer.current) clearInterval(swapTimer.current);
    };
  }, [themes.length]);

  // Card animated style
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: entryScale.value },
      { translateY: entryTranslateY.value + floatY.value },
      { rotateZ: `${floatRotateZ.value}deg` },
    ],
    opacity: entryOpacity.value,
  }));

  // Shadow animated style — tied to entryOpacity so it hides during swap
  const shadowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: shadowScaleX.value }],
    opacity: shadowOpacity.value * entryOpacity.value,
  }));

  const displayTheme = themes[displayIndex];
  const displayImageUrl = displayTheme?.main_banner_url?.[0];

  // Soft blurred shadow using stacked LinearGradients
  // Replicates CSS: filter: blur(9px) + rgba(0,0,0,0.4) + border-radius: 50%
  const SoftShadow = ({ w }: { w: number }) => (
    <Animated.View
      style={[
        { width: w, height: 30, alignItems: 'center', justifyContent: 'center' },
        shadowAnimatedStyle,
      ]}
    >
      {/* outermost — widest, most transparent horizontal fade */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.06)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          position: 'absolute',
          width: w,
          height: 30,
          borderRadius: 100,
        }}
      />

      {/* mid horizontal layer */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.13)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          position: 'absolute',
          width: w * 0.82,
          height: 22,
          borderRadius: 100,
        }}
      />

      {/* core horizontal — darkest */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.38)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          position: 'absolute',
          width: w * 0.60,
          height: 14,
          borderRadius: 100,
        }}
      />

      {/* vertical softness — top/bottom fade */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.18)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: 'absolute',
          width: w * 0.70,
          height: 20,
          borderRadius: 100,
        }}
      />
    </Animated.View>
  );

  // Floating card + grounded shadow
  const FloatingCard = ({ size }: { size: number }) => (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        height: size + 80,
      }}
    >
      {/* Only render when image is available */}
      {displayImageUrl && (
        <>
          {/* Floating card */}
          <Animated.View style={[{ position: 'absolute' }, cardAnimatedStyle]}>
            <Image
              source={{ uri: displayImageUrl }}
              style={{ width: size, height: size, borderRadius: 12 }}
              contentFit="cover"
            />
          </Animated.View>

          {/* Ground shadow — sibling, stays at bottom always */}
          <View style={{ position: 'absolute', bottom: 8 }}>
            <SoftShadow w={shadowWidth} />
          </View>
        </>
      )}
    </View>
  );

  return (
    <View
      className={`flex-col ${isMobile ? 'gap-6' : 'gap-8'} items-start justify-center w-full`}
      style={{ paddingHorizontal: 16, paddingVertical: 32 }}
    >
      <View
        className={`flex-col ${isMobile ? 'gap-4' : 'gap-6'} w-full p-4`}
      >
        {loading && (
          <View style={{ alignItems: 'center', justifyContent: 'center', height: 250 }}>
            <ActivityIndicator size="large" color={LightMode.colorPrimary} />
          </View>
        )}

        {error && (
          <View style={{ alignItems: 'center', justifyContent: 'center', height: 250 }}>
            <Text style={{ color: LightMode.colorTextSecondary }}>{error}</Text>
          </View>
        )}

        {/* Mobile */}
        {!loading && !error && themes.length > 0 && isMobile && (
          <FloatingCard size={cardSize} />
        )}

        {/* Desktop */}
        {!loading && !error && themes.length > 0 && !isMobile && (
          <>
            <FloatingCard size={cardSize} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexDirection: 'row', gap: 12 }}
            >
              {themes.slice(1).map(theme => (
                <View
                  key={theme.id}
                  style={{
                    width: cardSize,
                    height: cardSize,
                    borderRadius: 8,
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  <Image
                    source={{ uri: theme.main_banner_url?.[0] }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </View>
    </View>
  );
}