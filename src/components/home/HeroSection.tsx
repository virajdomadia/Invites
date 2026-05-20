'use client';

import ZapigoSVG from '@/components/ui/ZapigoSVG';
import { LightMode } from '@/theme';
import { Image } from 'expo-image';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const imgInvites = 'https://ik.imagekit.io/zapigo/homepage/invites.png';
const imgEvents = 'https://ik.imagekit.io/zapigo/homepage/events.png';
const imgCommunities = 'https://ik.imagekit.io/zapigo/homepage/communities.png';
const imgPartySupplies = 'https://ik.imagekit.io/zapigo/homepage/party_supplies.png';
const imgReturnGifts = 'https://ik.imagekit.io/zapigo/homepage/return_gifts.png';
const imgDelivered = 'https://ik.imagekit.io/zapigo/homepage/delivered.png';

interface HeroSectionProps {
  onInvitesPress?: () => void;
}

export default function HeroSection({ onInvitesPress }: HeroSectionProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isMobile = width < 768;

  const cardSize = isMobile ? Math.floor((width - 44) / 3) : 208;
  const logoWidth = isMobile ? 160 : 240;
  const headingSize = isMobile ? 'text-6xl' : 'text-9xl';
  const subheadingSize = isMobile ? 'text-base' : 'text-xl';
  const gapSize = isMobile ? 'gap-8' : 'gap-12';

  return (
    <View className={`flex-col ${gapSize} items-start justify-center w-full`} style={{ paddingTop: insets.top + 64 + 32, paddingHorizontal: 16, paddingBottom: 16 }}>
      {/* Logo and Text Section */}
      <View className={`flex-col ${gapSize} items-start w-full`} style={{ padding: 24, borderRadius: 16 }}>
        {/* Logo */}
        <View>
          <ZapigoSVG width={logoWidth} color="#E91E63" />
        </View>

        {/* Heading */}
        <Text className={`${headingSize} font-caveatbrush font-normal leading-snug`} style={{ color: LightMode.colorTextPrimary, fontFamily: 'CaveatBrush_400Regular', fontSize: isMobile ? 44 : 72 }}>
          Find joy together.
        </Text>

        {/* Subheading */}
        <Text className={`${subheadingSize} font-lexend font-medium leading-6`} style={{ color: LightMode.colorTextPrimary, fontFamily: 'Lexend_500Medium', marginBottom: 24 }}>
          Create invites, host events, manage communities, find party supplies, and choose return gifts - all from one place.
        </Text>
      </View>

      {/* Feature Images Section */}
      <View className={`flex-col ${isMobile ? 'gap-6' : 'gap-12'} w-full p-4`}>
        {isMobile ? (
          // Mobile: 2-column Grid Layout
          <>
            <View style={{ flexDirection: 'row', gap: 6, width: '100%', marginBottom: 12 }}>
              <TouchableOpacity
                onPress={onInvitesPress}
                className="rounded-xl overflow-hidden justify-between px-3"
                style={{ width: cardSize, height: cardSize, flex: 0 }}
              >
                <Image
                  source={{ uri: imgInvites }}
                  style={{ width: '100%', height: '100%', borderRadius: 12 }}
                  contentFit="cover"
                />
              </TouchableOpacity>

              <View className="rounded-xl overflow-hidden justify-between p-3" style={{ width: cardSize, height: cardSize, flex: 0 }}>
                <Image
                  source={{ uri: imgEvents }}
                  style={{ width: '100%', height: '100%', borderRadius: 12 }}
                  contentFit="cover"
                />
              </View>

              <View className="rounded-xl overflow-hidden justify-between p-3" style={{ width: cardSize, height: cardSize, flex: 0 }}>
                <Image
                  source={{ uri: imgCommunities }}
                  style={{ width: '100%', height: '100%', borderRadius: 12 }}
                  contentFit="cover"
                />
              </View>
            </View>

            <View className="w-full rounded-xl overflow-hidden" style={{ marginBottom: 6 }}>
              <Image
                source={{ uri: imgPartySupplies }}
                style={{ width: '100%', height: 80, borderRadius: 12 }}
                contentFit="cover"
              />
            </View>

            <View className="w-full rounded-xl overflow-hidden" style={{ marginBottom: 6 }}>
              <Image
                source={{ uri: imgReturnGifts }}
                style={{ width: '100%', height: 80, borderRadius: 12 }}
                contentFit="cover"
              />
            </View>

            <View className="w-full rounded-xl overflow-hidden">
              <Image
                source={{ uri: imgDelivered }}
                style={{ width: '100%', height: 80, borderRadius: 12 }}
                contentFit="cover"
              />
            </View>
          </>
        ) : (
          // Desktop: Horizontal Scroll
          <>
            {/* First Row - 3 Images */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ display: 'flex', flexDirection: 'row', gap: 6 }}
              scrollEnabled={true}
            >
              <TouchableOpacity
                onPress={onInvitesPress}
                className="rounded-xl overflow-hidden px-3"
                style={{ width: cardSize, height: cardSize }}
              >
                <Image
                  source={{ uri: imgInvites }}
                  style={{ width: cardSize, height: cardSize, borderRadius: 12 }}
                  contentFit="cover"
                />
              </TouchableOpacity>

              <View className="rounded-xl overflow-hidden" style={{ width: cardSize, height: cardSize, flex: 0 }}>
                <Image
                  source={{ uri: imgEvents }}
                  style={{ width: cardSize, height: cardSize }}
                  contentFit="cover"
                />
              </View>

              <View className="rounded-xl overflow-hidden" style={{ width: cardSize, height: cardSize, flex: 0 }}>
                <Image
                  source={{ uri: imgCommunities }}
                  style={{ width: cardSize, height: cardSize }}
                  contentFit="cover"
                />
              </View>
            </ScrollView>

            {/* Second Row - 3 Smaller Images */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ display: 'flex', flexDirection: 'row', gap: 12 }}
              scrollEnabled={true}
            >
              <View className="rounded-xl overflow-hidden" style={{ width: cardSize, marginBottom: 6 }}>
                <Image
                  source={{ uri: imgPartySupplies }}
                  style={{ width: cardSize, height: 80, borderRadius: 12 }}
                  contentFit="cover"
                />
              </View>

              <View className="rounded-xl overflow-hidden" style={{ width: cardSize, marginBottom: 6 }}>
                <Image
                  source={{ uri: imgReturnGifts }}
                  style={{ width: cardSize, height: 80, borderRadius: 12 }}
                  contentFit="cover"
                />
              </View>

              <View className="rounded-xl overflow-hidden" style={{ width: cardSize }}>
                <Image
                  source={{ uri: imgDelivered }}
                  style={{ width: cardSize, height: 80, borderRadius: 12 }}
                  contentFit="cover"
                />
              </View>
            </ScrollView>
          </>
        )}
      </View>
    </View>
  );
}
