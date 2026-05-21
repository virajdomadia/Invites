import React, { useRef } from 'react';
import { View, ScrollView, ImageBackground } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import HeaderSection from './HeaderSection';
import HeroSection from './HeroSection';
import ThemeImagesSection from './ThemeImagesSection';
import HostPartySection from './HostPartySection';
import GatherCeremonySection from './GatherCeremonySection';
import TestimonialSection from './TestimonialSection';
import HomeFooter from './HomeFooter';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function NewHomePage() {
  const scrollY = useSharedValue(0);
  const hostPartySectionRef = useRef<View>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const handleInvitesScroll = () => {
    if (hostPartySectionRef.current && scrollViewRef.current) {
      hostPartySectionRef.current.measure((x, y, width, height, pageX, pageY) => {
        scrollViewRef.current?.scrollTo({ y: pageY - 100, animated: true });
      });
    }
  };

  return (
    <View className="flex-1 bg-white">
      <AnimatedScrollView
        ref={scrollViewRef}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Background */}
        <ImageBackground
          source={{ uri: 'https://ik.imagekit.io/zapigo/homepage/background.png' }}
          style={{ width: '100%' }}
          imageStyle={{ resizeMode: 'cover' }}
        >
          <HeroSection onInvitesPress={handleInvitesScroll} />
        </ImageBackground>

        {/* Theme Images Section */}
        <ThemeImagesSection />

        {/* Host Party Section */}
        <View ref={hostPartySectionRef} className="px-4 sm:px-6 pt-6">
          <HostPartySection />
        </View>

        {/* Gather Ceremony Section */}
        <View className="px-4 sm:px-6 pt-6">
          <GatherCeremonySection />
        </View>

        {/* Testimonial Section */}
        <TestimonialSection />

        {/* Footer */}
        <HomeFooter />
      </AnimatedScrollView>

      {/* Fixed Header */}
      <HeaderSection scrollY={scrollY} />
    </View>
  );
}
