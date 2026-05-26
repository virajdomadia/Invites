import { useToast } from '@/core/hooks/useToast';
import { useAuthStore } from '@/core/store/authStore';
import React, { useRef } from 'react';
import { ImageBackground, ScrollView, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ToastContainer } from '@/components/ui/Toast';
import GatherCeremonySection from './GatherCeremonySection';
import HeaderSection from './HeaderSection';
import HeroSection from './HeroSection';
import HomeFooter from './HomeFooter';
import { HostingEventListSection } from './HostingEventListSection';
import HostPartySection from './HostPartySection';
import TestimonialSection from './TestimonialSection';
import ThemeImagesSection from './ThemeImagesSection';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function NewHomePage() {
  const scrollY = useSharedValue(0);
  const hostPartySectionRef = useRef<View>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const { toasts, removeToast } = useToast();
  const { user } = useAuthStore();

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const handleInvitesScroll = () => {
    if (hostPartySectionRef.current && scrollViewRef.current) {
      hostPartySectionRef.current.measure((x, y, width, height, pageX, pageY) => {
        scrollViewRef.current?.scrollTo({ y: y - 100, animated: true });
      });
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <AnimatedScrollView
        ref={scrollViewRef}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        showsVerticalScrollIndicator={false}
      >
        {/* Hosting Events Section - Only show when logged in */}
        

        {/* Hero Section with Background */}
        <ImageBackground
          source={{ uri: 'https://ik.imagekit.io/zapigo/homepage/background.png' }}
          style={{ width: '100%' }}
          imageStyle={{ resizeMode: 'cover' }}
        >
          {user?.id && (
          <View className="px-4 sm:px-6 pt-6">
            <HostingEventListSection />
          </View>
        )}
          <HeroSection onInvitesPress={handleInvitesScroll} />

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
        </ImageBackground>

        {/* Footer */}
        <HomeFooter />
      </AnimatedScrollView>

      {/* Fixed Header */}
      <HeaderSection scrollY={scrollY} />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </SafeAreaView>
  );
}
