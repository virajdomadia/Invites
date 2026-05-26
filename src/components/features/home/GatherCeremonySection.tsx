import { LightMode, Palette } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ImageBackground, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { useAuthStore } from '@/core/store/authStore';
import { createEventWithCTA, getEventCreationLogs } from '@/services/nativeEventCreation';
import { useToast } from '@/core/hooks/useToast';
import { logger } from '@/utils/logger';

const imgContent = 'https://ik.imagekit.io/zapigo/homepage/gather_a_ceremony.png';

export default function GatherCeremonySection() {
  const [ceremonyType, setCeremonyType] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const { error: showError, success: showSuccess } = useToast();

  const handleCreateInvite = async () => {
    if (!user?.id) {
      showError('Please log in to create an event');
      logger.warn('GatherCeremonySection', 'Create invite attempted without user', {
        component: 'GatherCeremonySection',
      });
      return;
    }

    if (!ceremonyType.trim()) {
      showError('Please enter a ceremony type');
      logger.warn('GatherCeremonySection', 'Create invite attempted with empty ceremony type', {
        component: 'GatherCeremonySection',
      });
      return;
    }

    setLoading(true);
    logger.info('GatherCeremonySection', 'Starting ceremony creation', {
      component: 'GatherCeremonySection',
      ceremonyTypeLength: ceremonyType.length,
      userId: user.id ? 'present' : 'missing',
    });

    const result = await createEventWithCTA({
      title: ceremonyType,
      eventType: 'CEREMONY',
      userId: user.id,
      displayName: user.name,
      onProgress: (status) => {
        logger.debug('GatherCeremonySection', `Progress: ${status}`, {
          component: 'GatherCeremonySection',
        });
      },
      onError: (error) => {
        logger.error('GatherCeremonySection', 'Event creation error callback triggered', error, {
          component: 'GatherCeremonySection',
          errorMessage: error.message,
        });
        showError(error.message);

        const logs = getEventCreationLogs();
        if (logs) {
          logger.debug('GatherCeremonySection', 'Full error logs available', {
            component: 'GatherCeremonySection',
            logsPreview: logs.split('\n').slice(-3).join(' | '),
          });
        }
      },
    });
    setLoading(false);

    if (result.success && result.eventId) {
      logger.info('GatherCeremonySection', 'Ceremony created successfully', {
        component: 'GatherCeremonySection',
        eventId: result.eventId,
      });
      showSuccess('Ceremony created successfully! 🎉');
      setCeremonyType('');
      // TODO: Navigate to event details page
    } else {
      logger.error('GatherCeremonySection', 'Ceremony creation returned failure status', result.error, {
        component: 'GatherCeremonySection',
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
          flexDirection: 'column-reverse',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          gap: 24,
          paddingHorizontal: 12,
          paddingVertical: 32,
          position: 'relative',
          zIndex: 10,
        }}>
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
              disabled={loading}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: loading ? Palette.colorGray400 : '#7C1D1D',
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

          {/* Left Content */}
          <View style={{ width: '100%', gap: 32 }}>
            <View style={{ gap: 16 }}>
              <Text style={{ fontSize: 24, fontFamily: 'Literata_500Medium', fontWeight: '500', lineHeight: 28, color: Palette.colorWhite }}>
                Gather for a Ceremony
              </Text>
              <View style={{ gap: 24 }}>
                <Text style={{ fontSize: 14, color: Palette.colorWhite, fontFamily: 'Lexend_500Medium', fontWeight: '500', lineHeight: 20 }}>
                  Add a program. A location. Share the invite link. Done.
                </Text>

                <View style={{ gap: 8 }}>
                  <Text style={{ fontSize: 16, color: Palette.colorWhite, fontFamily: 'Lexend_500Medium', fontWeight: '500' }}>
                    Pujas · Grihapravesh · Naming Ceremonies · More
                  </Text>
                  <View style={{ gap: 4, marginLeft: 8 }}>
                    <Text style={{ fontSize: 12, color: Palette.colorWhite, fontFamily: 'Lexend_400Regular' }}>
                      • Upload your own image
                    </Text>
                    <Text style={{ fontSize: 12, color: Palette.colorWhite, fontFamily: 'Lexend_400Regular' }}>
                      • Save-the-date reminders
                    </Text>
                    <Text style={{ fontSize: 12, color: Palette.colorWhite, fontFamily: 'Lexend_400Regular' }}>
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
