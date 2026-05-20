'use client';

import React, { useState } from 'react';
import { View, TouchableOpacity, Text, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, interpolate, Extrapolate, SharedValue } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Palette, LightMode } from '@/theme';
import ZapigoSVG from '@/components/ui/ZapigoSVG';

interface HeaderSectionProps {
  scrollY: SharedValue<number>;
}

export default function HeaderSection({ scrollY }: HeaderSectionProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated] = useState(false);
  const isMobile = width < 768;

  const blurAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [0, 1],
      Extrapolate.CLAMP
    );
    return {
      opacity,
    };
  });

  const logoAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 50],
      [0, 1],
      Extrapolate.CLAMP
    );
    return {
      opacity,
    };
  });

  const menuAnimatedStyle = useAnimatedStyle(() => {
    const translateX = menuOpen ? 0 : -width * 0.8;
    return {
      transform: [{ translateX }],
    };
  });

  const logoWidth = isMobile ? 100 : 140;
  const headerPadding = isMobile ? 12 : 16;

  return (
    <>
      <View
        style={{
          position: 'absolute',
          top: insets.top,
          left: 0,
          right: 0,
          height: 64,
          zIndex: 50,
        }}
      >
        {/* Blur background on scroll */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 64,
            },
            blurAnimatedStyle,
          ]}
        >
          <BlurView intensity={95} style={{ flex: 1 }} />
        </Animated.View>

        {/* Header content */}
        <View style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: headerPadding,
        }}>
          {/* Left: Profile */}
          <TouchableOpacity style={{ zIndex: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{
              height: 32,
              width: 32,
              borderRadius: 16,
              backgroundColor: LightMode.colorBgTertiary,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Ionicons name="person-outline" size={16} color={LightMode.colorTextTertiary} />
            </View>
            {!isMobile && (
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: LightMode.colorTextPrimary,
              }}>
                {isAuthenticated ? 'User' : 'Login'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Center: Logo (animated) */}
          <Animated.View style={logoAnimatedStyle}>
            <ZapigoSVG width={logoWidth} height={logoWidth} />
          </Animated.View>

          {/* Right: Menu Icon */}
          <TouchableOpacity
            onPress={() => setMenuOpen(!menuOpen)}
            style={{ zIndex: 10 }}
          >
            {menuOpen ? (
              <Ionicons name="close" size={24} color="black" />
            ) : (
              <Ionicons name="menu-outline" size={24} color="black" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Overlay */}
      {menuOpen && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
          onPress={() => setMenuOpen(false)}
          activeOpacity={1}
        />
      )}

      {/* Slide-in Menu Panel */}
      {menuOpen && (
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 0,
            top: insets.top + 64,
            width: Math.min(width * 0.85, 320),
            maxWidth: 320,
            height: '100%',
            zIndex: 40,
            backgroundColor: Palette.colorWhite,
          },
          menuAnimatedStyle,
        ]}
      >
        <View style={{ flex: 1, padding: 16 }}>
          <TouchableOpacity style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: LightMode.colorBorderSecondary }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: LightMode.colorTextPrimary }}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: LightMode.colorBorderSecondary }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: LightMode.colorTextPrimary }}>Create Invite</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: LightMode.colorBorderSecondary }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: LightMode.colorTextPrimary }}>My Events</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: LightMode.colorBorderSecondary }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: LightMode.colorTextPrimary }}>Communities</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ paddingVertical: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: LightMode.colorTextPrimary }}>Settings</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      )}
    </>
  );
}
