import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-native-stack-navigator/native-stack';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/core/hooks/useAuth';
import { useToast } from '@/core/hooks/useToast';
import { LoaderOverlay } from '@/components/shared/LoaderOverlay';
import { lightenColor } from '@/utils/color';
import {
  formatTimeForPreview,
  formatLocalTimeRange,
  formatDate,
  getTimezoneAbbr,
} from '@/utils/date';
import {
  fetchEventById,
  getEventLink,
  type EventDetailsResponse,
} from '@/services/eventApi';
import { getEventConfig } from '@/services/eventConfig';
import {
  getAgendaDaysForEvent,
  transformAgendaDaysForCard,
} from '@/services/agendaApi';
import { useRsvpService } from '@/services/rsvpService';

import EventHeroCard from '@/components/features/events/EventHeroCard';
import DateTimeCard from '@/components/features/events/DateTimeCard';
import LocationCard from '@/components/features/events/LocationCard';
import ExpandableZapigoBranding from '@/components/shared/ExpandableZapigoBranding';
import RsvpFloatingActionBar from '@/components/features/rsvp/RsvpFloatingActionBar';
import AgendaCard from '@/components/features/events/AgendaCard';
import type { ExtractColorsResponse } from '@/types/theme';

type EventDetailsScreenNavigationProp = NativeStackNavigationProp<any, 'EventDetails'>;
type EventDetailsScreenRouteProp = RouteProp<{ EventDetails: { eventId: string } }, 'EventDetails'>;

export default function EventDetailsScreen() {
  const navigation = useNavigation<EventDetailsScreenNavigationProp>();
  const route = useRoute<EventDetailsScreenRouteProp>();
  const { eventId } = route.params;

  const { userData } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const rsvpService = useRsvpService();

  const [eventData, setEventData] = useState<EventDetailsResponse | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [myGateLink, setMyGateLink] = useState<string | null>(null);
  const [isMyGateEnabled, setIsMyGateEnabled] = useState(false);
  const [rsvpResponse, setRsvpResponse] = useState<'YES' | 'NO' | 'MAYBE' | null>(null);
  const [guestRsvpStatus] = useState<string | null>(null);
  const [guestRsvpWorkflowStatus, setGuestRsvpWorkflowStatus] = useState<string | null>(null);
  const [isRsvpLoading, setIsRsvpLoading] = useState(false);
  const [ishost, setIshost] = useState(false);

  const { data: agendaDays = [] } = useQuery({
    queryKey: ['agendaDays', eventId],
    queryFn: async () => {
      const days = await getAgendaDaysForEvent(eventId);
      return transformAgendaDaysForCard(days);
    },
    enabled: !!eventId && !!eventData?.event?.program,
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchEventById(eventId);
        setEventData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load event';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    const fetchEventLink = async () => {
      try {
        const linkData = await getEventLink(eventId);
        setInviteLink(linkData.data?.shortUrl || null);
      } catch (err) {
        // Silently continue - invite link is optional
      }
    };

    fetchEventLink();
  }, [eventId]);

  useEffect(() => {
    const fetchEventConfigData = async () => {
      try {
        const configData = await getEventConfig(eventId);
        const passType = configData.data?.rsvp?.pass_type;
        if (passType) {
          setIsMyGateEnabled(passType.enabled ?? false);
          if (passType.link) {
            setMyGateLink(passType.link);
          }
        }
      } catch (err) {
        // Silently continue - config is optional
      }
    };

    fetchEventConfigData();
  }, [eventId]);

  const handleRsvpResponse = useCallback(
    (response: 'YES' | 'NO' | 'MAYBE') => {
      if (!eventId) return;

      if (guestRsvpStatus) {
        navigation.navigate('AttendingRsvp', {
          eventId,
          response: response.toLowerCase(),
          mode: 'edit',
        });
      } else {
        navigation.navigate('AttendingRsvp', {
          eventId,
          response: response.toLowerCase(),
        });
      }
    },
    [eventId, guestRsvpStatus, navigation]
  );

  const handleRemindMe = useCallback(async () => {
    if (!eventId || !userData?.uid) return;

    try {
      setIsRsvpLoading(true);
      const result = await rsvpService.createRsvp({
        event_id: eventId,
        user_id: userData.uid,
        rsvp_response: 'REMINDER',
        rsvp_notes: null,
      });

      if (result) {
        setRsvpResponse(null);
        setGuestRsvpWorkflowStatus('CONFIRMED');
        showSuccess('Reminder set successfully!');
      }
    } catch (err) {
      showError('Failed to set reminder');
    } finally {
      setIsRsvpLoading(false);
    }
  }, [eventId, userData?.uid, rsvpService, showSuccess, showError]);

  const handleCancelReminder = useCallback(async () => {
    if (!eventId || !userData?.uid) return;

    try {
      setIsRsvpLoading(true);
      const result = await rsvpService.createRsvp({
        event_id: eventId,
        user_id: userData.uid,
        rsvp_response: 'NO',
        rsvp_notes: null,
      });

      if (result) {
        setRsvpResponse(null);
        setGuestRsvpWorkflowStatus('CANCELLED');
        showSuccess('Reminder cancelled');
      }
    } catch (err) {
      showError('Failed to cancel reminder');
    } finally {
      setIsRsvpLoading(false);
    }
  }, [eventId, userData?.uid, rsvpService, showSuccess, showError]);

  const handleEditDateTime = () => {
    navigation.navigate('EditDateTime', { eventId });
  };

  const handleEditLocation = () => {
    navigation.navigate('EditLocation', { eventId });
  };

  if (loading) {
    return (
      <LoaderOverlay
        visible={true}
        showLogo={true}
        rotatingWords={['joyful', 'delightful', 'wonderful']}
        rotatingPrefix="Loading your"
        rotatingSuffix="event"
      />
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const colors = (eventData?.event?.theme_instance_data?.theme_data?.colors as Partial<ExtractColorsResponse>) || {};
  const PanelColor = colors?.panel?.hex || '#fff';
  const textColor = colors?.text?.hex || '#000';
  const pagebg = lightenColor(PanelColor, 80);

  return (
    <View style={[styles.container, { backgroundColor: pagebg || '#fff' }]}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Event Hero Card */}
        <View style={styles.heroContainer}>
          <EventHeroCard
            assets={eventData?.event?.theme_instance_data?.theme_data?.assets}
            title={eventData?.event?.title || ''}
            subtitle={eventData?.event?.content_block?.subtitle}
            headerText={eventData?.event?.content_block?.header_text}
            hostName={eventData?.event?.meta_data?.host_names as string | undefined}
            eventData={eventData}
            ishost={ishost}
            backgroundColor={PanelColor}
          />
        </View>

        {/* Agenda or Date/Time Card */}
        {eventData?.event?.program ? (
          <View style={styles.cardContainer}>
            <AgendaCard
              days={agendaDays}
              eventData={eventData}
              eventId={eventId}
              ishost={ishost}
            />
          </View>
        ) : (
          <View style={styles.cardContainer}>
            <DateTimeCard
              date={eventData?.event?.event_date ? formatDate(eventData.event.event_date) : ''}
              startTime={
                formatTimeForPreview(
                  eventData?.event?.start_timestamp || null,
                  eventData?.event?.timezone || 'Asia/Kolkata'
                ) || ''
              }
              endTime={
                eventData?.event?.end_timestamp &&
                eventData.event.end_timestamp !== eventData.event.start_timestamp
                  ? formatTimeForPreview(
                      eventData.event.end_timestamp,
                      eventData?.event?.timezone || 'Asia/Kolkata'
                    ) || ''
                  : ''
              }
              timezoneLabel={
                eventData?.event?.timezone ? getTimezoneAbbr(eventData.event.timezone) : ''
              }
              localTime={
                formatLocalTimeRange(
                  eventData?.event?.start_timestamp,
                  eventData?.event?.end_timestamp,
                  eventData?.event?.timezone
                ) || undefined
              }
              eventData={eventData}
              eventId={eventId}
              ishost={ishost}
              onEdit={handleEditDateTime}
              backgroundColor={PanelColor}
            />
          </View>
        )}

        {/* Location Card */}
        <View style={styles.cardContainer}>
          <LocationCard
            venueName={eventData?.event?.venue_data?.name}
            addressLine1={eventData?.event?.venue_data?.address_line1}
            addressLine2={eventData?.event?.venue_data?.address_line2}
            city={eventData?.event?.venue_data?.city}
            pincode={eventData?.event?.venue_data?.pincode}
            lat={eventData?.event?.venue_data?.lat}
            lng={eventData?.event?.venue_data?.lon}
            mapUrl={eventData?.event?.venue_data?.map_url}
            locationNotes={eventData?.event?.content_block?.location_notes}
            showGatePassLink={isMyGateEnabled}
            myGateLink={myGateLink || undefined}
            eventData={eventData}
            ishost={ishost}
            onEdit={handleEditLocation}
            backgroundColor={PanelColor}
          />
        </View>

        {/* RSVP Action Bar */}
        <View style={styles.cardContainer}>
          <RsvpFloatingActionBar
            eventId={eventId}
            onRsvp={handleRsvpResponse}
            onRemindMe={handleRemindMe}
            onCancelReminder={handleCancelReminder}
            floating={false}
            isLoggedIn={!!userData?.uid}
            isLoading={isRsvpLoading}
            rsvpResponse={rsvpResponse || undefined}
            rsvpStatus={guestRsvpStatus || undefined}
            rsvpWorkflowStatus={guestRsvpWorkflowStatus || undefined}
            eventEndTime={eventData?.event?.end_timestamp}
            timezone={eventData?.event?.timezone}
            ishost={ishost}
            isHostPreview={!ishost}
            eventData={eventData}
          />
        </View>

        {/* Zapigo Branding */}
        {!ishost && (
          <View style={styles.brandingContainer}>
            <ExpandableZapigoBranding eventData={eventData} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 50,
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  heroContainer: {
    marginBottom: 16,
  },
  cardContainer: {
    marginBottom: 16,
  },
  brandingContainer: {
    marginBottom: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#991b1b',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
