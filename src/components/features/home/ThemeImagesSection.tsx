import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
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

const IK_BASE = 'https://ik.imagekit.io/zapigo';

const THEME_CATEGORIES = {
  party: [
    `${IK_BASE}/Themes/party2.png`,
    `${IK_BASE}/Themes/party1.png`,
    `${IK_BASE}/Themes/classic3.png`,
    `${IK_BASE}/Themes/classic1.png`,
    `${IK_BASE}/Themes/classic2.png`,
  ],
  classic: [
    `${IK_BASE}/Themes/classic4.png`,
    `${IK_BASE}/Themes/classic7.png`,
    `${IK_BASE}/Themes/classic5.png`,
    `${IK_BASE}/Themes/classic6.png`,
    `${IK_BASE}/Themes/classic8.png`,
  ],
  traditional: [
    `${IK_BASE}/Themes/traditional5.png`,
    `${IK_BASE}/Themes/traditional4.png`,
    `${IK_BASE}/Themes/traditional3.png`,
    `${IK_BASE}/Themes/traditional2.png`,
    `${IK_BASE}/Themes/traditional1.png`,
  ],
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const THEME_IMAGES = shuffleArray(Object.values(THEME_CATEGORIES).flat());

export default function ThemeImagesSection() {
  const { width } = useWindowDimensions();
  const [displayIndex, setDisplayIndex] = useState(0);

  const cardSize = Math.floor((width - 44) / 2);
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

  // Entry + float animation
  useEffect(() => {
    if (THEME_IMAGES.length > 0) {
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
  }, []);

  // Image swap every 6s
  useEffect(() => {
    swapTimer.current = setInterval(() => {
      entryScale.value = withTiming(0.85, { duration: 800 });
      entryOpacity.value = withTiming(0,   { duration: 800 });

      setTimeout(() => {
        setDisplayIndex(prev => (prev + 1) % THEME_IMAGES.length);
        entryScale.value = withTiming(1, { duration: 800 });
        entryOpacity.value = withTiming(1, { duration: 800 });
      }, 800);
    }, 6000);

    return () => {
      if (swapTimer.current) clearInterval(swapTimer.current);
    };
  }, []);

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

  const displayImageUrl = THEME_IMAGES[displayIndex];

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
      className="flex-col gap-6 items-start justify-center w-full"
      style={{ paddingHorizontal: 16, paddingVertical: 32 }}
    >
      <View
        className="flex-col gap-4 w-full"
      >
        <FloatingCard size={cardSize} />
      </View>
    </View>
  );
}