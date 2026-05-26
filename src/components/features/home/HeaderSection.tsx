import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, Text, useWindowDimensions, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, interpolate, Extrapolate, SharedValue } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Palette, LightMode } from '@/theme';
import { Avatar } from '@/components/ui/Avatar';
import ZapigoSVG from '@/components/ui/ZapigoSVG';
import SignInModal from '@/components/features/auth/SignInModal';
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

  const handleGoogleSignInSuccess = useCallback(
    async (tokens: { idToken: string; email: string; name: string; photoUrl?: string }) => {
      try {
        console.log('[HeaderSection] Signing in with Google tokens...');
        await signInWithGoogle(tokens.idToken, tokens.email, tokens.name, tokens.photoUrl);
        console.log('[HeaderSection] Sign-in successful');
        setSignInModalVisible(false);
      } catch (error) {
        console.error('[HeaderSection] Sign-in failed:', error);
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
      // Silently continue - user will retry if needed
    }
  }, [signOut]);


  const menuAnimatedStyle = useAnimatedStyle(() => {
    const translateX = menuOpen ? 0 : -width * 0.8;
    return {
      transform: [{ translateX }],
    };
  });

  const shadowAnimatedStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(
      scrollY.value,
      [0, 50],
      [0, 1],
      Extrapolate.CLAMP
    );
    return {
      opacity: shadowOpacity,
    };
  });

  const logoWidth = 100;
  const headerPadding = 12;

  return (
    <>
      <ImageBackground
        source={{ uri: 'https://ik.imagekit.io/zapigo/homepage/background.png' }}
        style={{
          position: 'absolute',
          top: insets.top,
          left: 0,
          right: 0,
          height: 64,
          zIndex: 50,
        }}
      >
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
            onPress={() => !isAuthenticated && setSignInModalVisible(true)}
            style={{ zIndex: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}
          >
            <Avatar
              isAuthenticated={isAuthenticated}
              displayName={user?.name}
              photoUrl={user?.photo_url}
              size="md"
            />
          </TouchableOpacity>

          {/* Center: Logo */}
          <View>
            <ZapigoSVG width={logoWidth} height={logoWidth} />
          </View>

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
      </ImageBackground>

      {/* Bottom shadow on scroll */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: insets.top + 64,
            left: 0,
            right: 0,
            height: 3,
            zIndex: 49,
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 5,
          },
          shadowAnimatedStyle,
        ]}
      />

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
