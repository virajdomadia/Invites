import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, Text, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, interpolate, Extrapolate, SharedValue } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Palette, LightMode } from '@/theme';
import ZapigoSVG from '@/components/ui/ZapigoSVG';
import SignInModal from '@/components/modals/SignInModal';
import { useGoogleSignIn } from '@/core/hooks/useGoogleSignIn';
import { useAuthStore } from '@/core/store/authStore';

interface HeaderSectionProps {
  scrollY: SharedValue<number>;
}

export default function HeaderSection({ scrollY }: HeaderSectionProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signInModalVisible, setSignInModalVisible] = useState(false);
  const { signIn } = useGoogleSignIn();
  const { signInWithGoogle, user, signOut } = useAuthStore();
  const isAuthenticated = !!user;
  const isMobile = width < 768;

  const handleGoogleSignInSuccess = useCallback(
    async (tokens: { idToken: string; email: string; name: string }) => {
      try {
        await signInWithGoogle(tokens.idToken, tokens.email, tokens.name);
        setSignInModalVisible(false);
      } catch (error) {
        console.error('Failed to exchange token:', error);
        throw error;
      }
    },
    [signInWithGoogle]
  );

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      setMenuOpen(false);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  }, [signOut]);

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

  const darkOverlayAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [100, 300],
      [0, 0.8],
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

        {/* Dark overlay on scroll */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 64,
              backgroundColor: '#fff',
            },
            darkOverlayAnimatedStyle,
          ]}
        />

        {/* Header content */}
        <View style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: headerPadding,
        }}>
          {/* Left: Profile */}
          <TouchableOpacity
            onPress={isAuthenticated ? handleLogout : () => setSignInModalVisible(true)}
            style={{ zIndex: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}
          >
            <View style={{
              height: 32,
              width: 32,
              borderRadius: 16,
              backgroundColor: LightMode.colorBgTertiary,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Ionicons
                name={isAuthenticated ? "log-out-outline" : "person-outline"}
                size={16}
                color={LightMode.colorTextTertiary}
              />
            </View>
            {!isMobile && (
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: LightMode.colorTextPrimary,
              }}>
                {isAuthenticated ? user.name : 'Login'}
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
          {isAuthenticated && (
            <TouchableOpacity
              onPress={handleLogout}
              style={{ paddingVertical: 12, borderTopWidth: 1, borderTopColor: LightMode.colorBorderSecondary, marginTop: 8 }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#EF4444' }}>Logout</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
      )}

      {/* Sign In Modal */}
      <SignInModal
        visible={signInModalVisible}
        onClose={() => setSignInModalVisible(false)}
        onGoogleSignInStart={signIn}
        onGoogleSignInSuccess={handleGoogleSignInSuccess}
      />
    </>
  );
}
