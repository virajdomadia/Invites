import { LightMode, Palette } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ImageBackground, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/core/store/authStore';
import { createEventWithCTA, getEventCreationLogs } from '@/services/nativeEventCreation';
import { useToast } from '@/core/hooks/useToast';
import { logger } from '@/utils/logger';

const imgContent = 'https://ik.imagekit.io/zapigo/homepage/host_a_party.png';

export default function HostPartySection() {
  const [partyName, setPartyName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const { error: showError, success: showSuccess } = useToast();
  const router = useRouter();

  const handleCreateInvite = async () => {
    if (!user?.id) {
      showError('Please log in to create an event');
      logger.warn('HostPartySection', 'Create invite attempted without user', {
        component: 'HostPartySection',
      });
      return;
    }

    if (!partyName.trim()) {
      showError('Please enter a party name');
      logger.warn('HostPartySection', 'Create invite attempted with empty party name', {
        component: 'HostPartySection',
      });
      return;
    }

    setLoading(true);
    logger.info('HostPartySection', 'Starting party creation', {
      component: 'HostPartySection',
      partyNameLength: partyName.length,
      userId: user.id ? 'present' : 'missing',
    });

    const result = await createEventWithCTA({
      title: partyName,
      eventType: 'BIRTHDAY',
      userId: user.id,
      displayName: user.name,
      onProgress: (status) => {
        logger.debug('HostPartySection', `Progress: ${status}`, {
          component: 'HostPartySection',
        });
      },
      onError: (error) => {
        logger.error('HostPartySection', 'Event creation error callback triggered', error, {
          component: 'HostPartySection',
          errorMessage: error.message,
        });
        showError(error.message);

        const logs = getEventCreationLogs();
        if (logs) {
          logger.debug('HostPartySection', 'Full error logs available', {
            component: 'HostPartySection',
            logsPreview: logs.split('\n').slice(-3).join(' | '),
          });
        }
      },
    });
    setLoading(false);

    if (result.success && result.eventId) {
      logger.info('HostPartySection', 'Party created successfully', {
        component: 'HostPartySection',
        eventId: result.eventId,
      });
      showSuccess('Party created successfully! 🎉');
      setPartyName('');
      router.push(`/event/${result.eventId}`);
    } else {
      logger.error('HostPartySection', 'Party creation returned failure status', result.error, {
        component: 'HostPartySection',
        errorMessage: result.error?.message,
      });
    }
  };

  return (
    <View className="relative w-full rounded-2xl overflow-hidden shadow-lg mb-6" style={{ padding: 16, backgroundColor: 'transparent' }}>
      <ImageBackground
        source={{ uri: imgContent }}
        style={{
          backgroundColor: 'transparent',
          padding: 16,
        }}
        imageStyle={{ resizeMode: 'cover', borderRadius: 16 }}
      >
        <View style={{
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          gap: 24,
          paddingHorizontal: 12,
          paddingVertical: 32,
          position: 'relative',
          zIndex: 10,
        }}>
          {/* Left Content */}
          <View style={{ width: '100%', gap: 32 }}>
            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 24, fontFamily: 'Literata_500Medium', fontWeight: '500', lineHeight: 28, color: Palette.colorGray900 }}>
                Host a Party in 30 Seconds
              </Text>
              <View style={{ gap: 12 }}>
                <Text style={{ fontSize: 14, color: Palette.colorGray900, fontFamily: 'Lexend_500Medium', fontWeight: '500', lineHeight: 20 }}>
                  Add a date. A location. Share the invite link. Done.
                </Text>

                <View style={{ gap: 8, marginLeft: 8 }}>
                  <Text style={{ fontSize: 16, color: Palette.colorGray900, fontFamily: 'Lexend_500Medium', fontWeight: '500' }}>
                    Birthdays · Anniversaries · Dinners · More
                  </Text>
                  <View style={{ gap: 4, marginLeft: 8 }}>
                    <Text style={{ fontSize: 16, color: Palette.colorGray900, fontFamily: 'Lexend_400Regular' }}>
                      • Two-click confirmations
                    </Text>
                    <Text style={{ fontSize: 16, color: Palette.colorGray900, fontFamily: 'Lexend_400Regular' }}>
                      • Food preferences
                    </Text>
                    <Text style={{ fontSize: 16, color: Palette.colorGray900, fontFamily: 'Lexend_400Regular' }}>
                      • MyGate passes
                    </Text>
                    <Text style={{ fontSize: 16, color: Palette.colorGray900, fontFamily: 'Lexend_400Regular' }}>
                      • Auto-reminders
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Right CTA Box */}
          <View style={{
            width: '100%',
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
              disabled={loading}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: loading ? Palette.colorGray400 : Palette.colorBrand600,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 8,
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Palette.colorWhite} />
              ) : (
                <>
                  <Text style={{ color: Palette.colorWhite, fontWeight: '600', fontSize: 14 }}>Create Invite</Text>
                  <Ionicons name="arrow-forward" size={20} color={Palette.colorWhite} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}
