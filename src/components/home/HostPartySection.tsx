import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette, LightMode } from '@/theme';

const imgContent = 'https://ik.imagekit.io/zapigo/homepage/host_a_party.png';

export default function HostPartySection() {
  const [partyName, setPartyName] = useState('');
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const handleCreateInvite = () => {
    if (partyName.trim()) {
      console.log('Creating invite for:', partyName);
    }
  };

  const headingSize = isMobile ? 'text-2xl' : 'text-4xl';
  const featureTextSize = isMobile ? 'text-sm' : 'text-lg';
  const featureLabelSize = isMobile ? 'text-base' : 'text-lg';

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
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: isMobile ? 'flex-start' : 'space-between',
          gap: isMobile ? 24 : 48,
          paddingHorizontal: 12,
          paddingVertical: isMobile ? 32 : 80,
          position: 'relative',
          zIndex: 10,
        }}>
          {/* Left Content */}
          <View style={{ width: isMobile ? '100%' : 'auto', flex: isMobile ? undefined : 1, gap: 32 }}>
            <View style={{ gap: 16 }}>
              <Text style={{ fontSize: isMobile ? 24 : 36, fontFamily: 'Literata_500Medium', fontWeight: '500', lineHeight: isMobile ? 28 : 40, color: Palette.colorGray900 }}>
                Host a Party in 30 Seconds
              </Text>
              <View style={{ gap: 24 }}>
                <Text style={{ fontSize: isMobile ? 14 : 18, color: Palette.colorGray900, fontFamily: 'Lexend_500Medium', fontWeight: '500', lineHeight: 20 }}>
                  Add a date. A location. Share the invite link. Done.
                </Text>

                <View style={{ gap: 8, marginLeft: 8 }}>
                  <Text style={{ fontSize: isMobile ? 16 : 18, color: Palette.colorGray900, fontFamily: 'Lexend_500Medium', fontWeight: '500' }}>
                    Birthdays · Anniversaries · Dinners · More
                  </Text>
                  <View style={{ gap: 4, marginLeft: 8 }}>
                    <Text style={{ fontSize: isMobile ? 12 : 14, color: Palette.colorGray900, fontFamily: 'Lexend_400Regular' }}>
                      • Two-click confirmations
                    </Text>
                    <Text style={{ fontSize: isMobile ? 12 : 14, color: Palette.colorGray900, fontFamily: 'Lexend_400Regular' }}>
                      • Food preferences
                    </Text>
                    <Text style={{ fontSize: isMobile ? 12 : 14, color: Palette.colorGray900, fontFamily: 'Lexend_400Regular' }}>
                      • MyGate passes
                    </Text>
                    <Text style={{ fontSize: isMobile ? 12 : 14, color: Palette.colorGray900, fontFamily: 'Lexend_400Regular' }}>
                      • Auto-reminders
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

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
                What is your party for? (e.g. Rahul&apos;s Birthday)
              </Text>
              <TextInput
                value={partyName}
                onChangeText={setPartyName}
                onSubmitEditing={handleCreateInvite}
                placeholder="e.g. Rahul&apos;s Birthday"
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
                backgroundColor: Palette.colorBrand600,
                paddingHorizontal: 16,
                paddingVertical: isMobile ? 12 : 8,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: Palette.colorWhite, fontWeight: '600', fontSize: 14 }}>Create Invite</Text>
              <Ionicons name="arrow-forward" size={20} color={Palette.colorWhite} />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}
