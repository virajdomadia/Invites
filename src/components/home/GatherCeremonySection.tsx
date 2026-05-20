'use client';

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette, LightMode } from '@/theme';

const imgContent = 'https://ik.imagekit.io/zapigo/homepage/gather_a_ceremony.png';

export default function GatherCeremonySection() {
  const [ceremonyType, setCeremonyType] = useState('');
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const handleCreateInvite = () => {
    if (ceremonyType.trim()) {
      console.log('Creating invite for:', ceremonyType);
    }
  };

  return (
    <View className="relative w-full rounded-2xl overflow-hidden shadow-lg mb-6" style={{ padding: 16, backgroundColor: 'transparent' }}>
      <ImageBackground
        source={{ uri: imgContent }}
        style={{
          backgroundColor: 'transparent',
          padding: isMobile ? 16 : 20,
        }}
        imageStyle={{ resizeMode: 'cover', borderRadius: 16 }}
      >
        <View style={{
          flexDirection: isMobile ? 'column-reverse' : 'row-reverse',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: isMobile ? 'flex-start' : 'space-between',
          gap: isMobile ? 24 : 48,
          paddingHorizontal: 12,
          paddingVertical: isMobile ? 32 : 80,
          position: 'relative',
          zIndex: 10,
        }}>
          {/* Right CTA Box */}
          <View style={{
            width: isMobile ? '100%' : 384,
            backgroundColor: Palette.colorWhite,
            borderRadius: 16,
            padding: 24,
            gap: 24,
          }}>
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: LightMode.colorTextTertiary }}>
                Create an Invite Now
              </Text>
              <Text style={{ fontSize: 12, color: LightMode.colorTextPlaceholder }}>
                What is the ceremony you are gathering for?
              </Text>
              <TextInput
                value={ceremonyType}
                onChangeText={setCeremonyType}
                onSubmitEditing={handleCreateInvite}
                placeholder="e.g. Puja"
                placeholderTextColor={LightMode.colorTextPlaceholder}
                style={{
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: LightMode.colorBorderPrimary,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  fontSize: 14,
                  color: LightMode.colorTextPrimary,
                  width: '100%',
                }}
              />
            </View>

            {/* Create Button */}
            <TouchableOpacity
              onPress={handleCreateInvite}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: '#7C1D1D',
                paddingHorizontal: 16,
                paddingVertical: isMobile ? 12 : 8,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: Palette.colorWhite, fontWeight: '600', fontSize: 14 }}>Create Invite</Text>
              <Ionicons name="arrow-forward" size={20} color={Palette.colorWhite} />
            </TouchableOpacity>
          </View>

          {/* Left Content */}
          <View style={{ width: isMobile ? '100%' : 'auto', flex: isMobile ? undefined : 1, gap: 32 }}>
            <View style={{ gap: 16 }}>
              <Text style={{ fontSize: isMobile ? 24 : 36, fontFamily: 'Literata_500Medium', fontWeight: '500', lineHeight: isMobile ? 28 : 40, color: Palette.colorWhite }}>
                Gather for a Ceremony
              </Text>
              <View style={{ gap: 24 }}>
                <Text style={{ fontSize: isMobile ? 14 : 18, color: Palette.colorWhite, fontFamily: 'Lexend_500Medium', fontWeight: '500', lineHeight: 20 }}>
                  Add a program. A location. Share the invite link. Done.
                </Text>

                <View style={{ gap: 8 }}>
                  <Text style={{ fontSize: isMobile ? 16 : 18, color: Palette.colorWhite, fontFamily: 'Lexend_500Medium', fontWeight: '500' }}>
                    Pujas · Grihapravesh · Naming Ceremonies · More
                  </Text>
                  <View style={{ gap: 4, marginLeft: 8 }}>
                    <Text style={{ fontSize: isMobile ? 12 : 14, color: Palette.colorWhite, fontFamily: 'Lexend_400Regular' }}>
                      • Upload your own image
                    </Text>
                    <Text style={{ fontSize: isMobile ? 12 : 14, color: Palette.colorWhite, fontFamily: 'Lexend_400Regular' }}>
                      • Save-the-date reminders
                    </Text>
                    <Text style={{ fontSize: isMobile ? 12 : 14, color: Palette.colorWhite, fontFamily: 'Lexend_400Regular' }}>
                      • Program items with timings
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}
