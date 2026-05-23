import { LightMode } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Share,
  Clipboard,
} from 'react-native';
import { useAuthStore, apiClient } from '@/core';
import { useToast } from '@/core/hooks/useToast';
import { useNavigation } from '@react-navigation/native';
import { normalizeHostRole } from '@/utils/eventUtils';
import { formatEventDateTime } from '@/utils/date';

interface ActiveEventsSummary {
  total_guests: number;
  attending: number;
  not_attending: number;
  maybe: number;
  reminder: number;
  total_veg: number;
  total_veg_egg: number;
  total_non_veg: number;
  total_adults: number;
  total_children: number;
  rsvp_notes_count: number;
}

interface ActiveEvent {
  event_id: string;
  title: string;
  event_date: string | null;
  start_timestamp: string | null;
  end_timestamp: string | null;
  timezone: string | null;
  event_image_url: string | null;
  is_owner: boolean;
  is_co_host: boolean;
  host_role: string | null;
  event_config?: {
    type?: string | null;
    food_preference?: string | null;
    cutoff_age?: number | null;
    max_guests_below_cutoff?: boolean | null;
  } | null;
  summary: ActiveEventsSummary;
  public_id?: string;
}

function SummaryTile({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <View style={{
      borderRadius: 8,
      borderColor: LightMode.colorBorderSecondary,
      borderWidth: 1,
      backgroundColor: LightMode.colorBgPrimary,
      paddingHorizontal: 12,
      paddingVertical: 8,
    }}>
      <Text style={{
        fontFamily: 'Lexend',
        fontSize: 11,
        lineHeight: 16,
        color: LightMode.colorTextTertiary,
      }}>
        {label}
      </Text>
      <Text style={{
        fontFamily: 'Lexend',
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '600',
        color: LightMode.colorTextPrimary,
        marginTop: 4,
      }}>
        {String(value).padStart(2, '0')}
      </Text>
    </View>
  );
}

async function copyTextWithFallback(text: string) {
  try {
    Clipboard.setString(text);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    throw error;
  }
}

export function HostingEventListSection() {
  const { user } = useAuthStore();
  const navigation = useNavigation();
  const { showToast } = useToast();
  const [hosting, setHosting] = useState<ActiveEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get(
          `/c56/events/allActiveEventsSummary/${user.id}?limit=50&offset=0`
        );

        if (response.error) {
          console.warn(`Failed to fetch hosting events: ${response.error}. Endpoint may not be available.`);
          setHosting([]);
          return;
        }

        console.log('API Response data:', JSON.stringify(response.data, null, 2));

        // Check if response.data is directly an array or has an events property
        let events = Array.isArray(response.data) ? response.data : response.data?.events;

        if (!Array.isArray(events)) {
          console.error('Invalid hosting events response format:', typeof events, events);
          setHosting([]);
          return;
        }

        console.log('Events to validate:', events.length, 'events');

        const validatedEvents = events.filter((event: any) => {
          const isValid = event && typeof event === 'object' && 'event_id' in event && 'summary' in event;
          if (!isValid) {
            console.warn('Filtering out invalid event:', event);
          }
          return isValid;
        });

        console.log('Validated events:', validatedEvents.length);
        setHosting(validatedEvents);
      } catch (error) {
        console.error('Failed to fetch hosting events:', error);
        setHosting([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [user?.id]);

  const handleCopyInviteLink = useCallback(
    async (eventId: string, publicId?: string): Promise<boolean> => {
      try {
        if (!publicId) {
          throw new Error('Public ID not available');
        }

        const inviteLink = `https://invites.zapigo.com/${publicId}`;
        await copyTextWithFallback(inviteLink);
        showToast('Link copied to clipboard', 'success', 1500);
        return true;
      } catch (error) {
        console.error('Failed to copy invite link:', error);
        showToast('Failed to copy invite link', 'error', 1500);
        return false;
      }
    },
    [showToast]
  );

  const handleNavigateToManageEvent = useCallback(
    (eventId: string) => {
      (navigation as any).navigate('ManageEvent', { eventId });
    },
    [navigation]
  );

  // Only show if user is logged in and has hosting events
  if (!user?.id || (!isLoading && hosting.length === 0)) {
    return null;
  }

  return (
    <View style={{ width: '100%' }}>
      <View style={{ paddingHorizontal: 12, paddingBottom: 24 }}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{
            fontFamily: 'Lexend',
            fontSize: 20,
            lineHeight: 28,
            fontWeight: '600',
            color: LightMode.colorTextPrimary,
            marginBottom: 4,
          }}>
            Hosting
          </Text>
          <Text style={{
            fontFamily: 'Lexend',
            fontSize: 14,
            lineHeight: 20,
            color: LightMode.colorTextTertiary,
          }}>
            Occasions where you are a host
          </Text>
        </View>

        {/* Events List */}
        {isLoading ? (
          <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator size="large" color={LightMode.colorBrand600} />
          </View>
        ) : hosting.length > 0 ? (
          <ScrollView
            scrollEnabled={false}
            contentContainerStyle={{ gap: 12 }}
          >
            {hosting.map((event) => (
              <HostingEventCard
                key={event.event_id}
                event={event}
                onCopyInviteLink={handleCopyInviteLink}
                onNavigateToManageEvent={handleNavigateToManageEvent}
              />
            ))}
          </ScrollView>
        ) : (
          <Text style={{
            fontSize: 14,
            color: LightMode.colorTextTertiary,
            textAlign: 'center',
            paddingVertical: 20,
          }}>
            No events found
          </Text>
        )}
      </View>
    </View>
  );
}

function HostingEventCard({
  event,
  onCopyInviteLink,
  onNavigateToManageEvent,
}: {
  event: ActiveEvent;
  onCopyInviteLink: (eventId: string, publicId?: string) => Promise<boolean>;
  onNavigateToManageEvent: (eventId: string) => void;
}) {
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isCopyingLink, setIsCopyingLink] = useState(false);
  const eventRouteId = event.event_id;

  const eventSummary = event.summary;
  const isReminderEvent = event.event_config?.type === 'REMINDER';
  const isPassTypeEvent = event.event_config?.type === 'PASS';
  const showFoodPreferenceSection =
    event.event_config?.food_preference &&
    event.event_config.food_preference !== 'DON\'T_ASK';

  const RESPONSE_LABELS = {
    REMINDER: { primary: 'Get Reminders', secondary: '', tertiary: '' },
    PASS: { primary: 'Issued', secondary: 'Waitlisted', tertiary: 'Cancelled' },
    DEFAULT: { primary: 'Yes', secondary: 'Not Sure', tertiary: 'No' },
  };

  const eventType = event.event_config?.type ?? 'DEFAULT';
  const labels = RESPONSE_LABELS[eventType as keyof typeof RESPONSE_LABELS];
  const safeLabels = labels ?? RESPONSE_LABELS.DEFAULT;
  const gridLayout = isReminderEvent ? 1 : 3;

  const primaryGuestRsvpCounts = useMemo(() => {
    if (!eventSummary) {
      return { yes: 0, no: 0, maybe: 0, issued: 0, waitlisted: 0, cancelled: 0, reminder: 0 };
    }

    if (isReminderEvent) {
      return {
        yes: 0,
        no: 0,
        maybe: 0,
        issued: 0,
        waitlisted: 0,
        cancelled: 0,
        reminder: eventSummary.reminder || 0,
      };
    }

    if (isPassTypeEvent) {
      return {
        yes: 0,
        no: 0,
        maybe: 0,
        issued: eventSummary.issued || 0,
        waitlisted: eventSummary.waitlist || 0,
        cancelled: eventSummary.cancelled || 0,
        reminder: 0,
      };
    }

    return {
      yes: eventSummary.attending || 0,
      no: eventSummary.not_attending || 0,
      maybe: eventSummary.maybe || 0,
      issued: 0,
      waitlisted: 0,
      cancelled: 0,
      reminder: 0,
    };
  }, [eventSummary, isReminderEvent, isPassTypeEvent]);

  const notesCount = eventSummary?.rsvp_notes_count || 0;
  const guestSummaryCutoffAge = event.event_config?.cutoff_age ?? 13;
  const showBelowCutoffInSummary = event.event_config?.max_guests_below_cutoff ?? true;
  const hostRole = normalizeHostRole(
    event.host_role ?? undefined,
    event.is_owner,
    event.is_co_host
  );

  const formattedDate = useMemo(() => {
    return formatEventDateTime({
      event_date: event.event_date,
      start_timestamp: event.start_timestamp,
      end_timestamp: event.end_timestamp,
      timezone: event.timezone,
    });
  }, [event.event_date, event.start_timestamp, event.end_timestamp, event.timezone]);

  const handleCopyLink = async () => {
    setIsCopyingLink(true);
    setIsLinkCopied(false);
    const copied = await onCopyInviteLink(eventRouteId, event.public_id);
    setIsCopyingLink(false);
    if (copied) {
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2000);
    }
  };

  const handleShareLink = async () => {
    try {
      if (!event.public_id) {
        throw new Error('Public ID not available');
      }

      const linkToShare = `https://invites.zapigo.com/${event.public_id}`;

      await Share.share({
        message: `Check out this event: ${linkToShare}`,
        url: linkToShare,
        title: event.title,
      });
    } catch (error) {
      console.error('Failed to share link:', error);
    }
  };

  const ActionButton = ({
    label,
    icon,
    onPress,
    isLoading,
    isHighlight,
  }: {
    label: string;
    icon: string;
    onPress: () => void;
    isLoading?: boolean;
    isHighlight?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: isHighlight ? LightMode.colorBrand600 : LightMode.colorBorderSecondary,
        backgroundColor: isHighlight ? LightMode.colorBgBrandPrimary : LightMode.colorBgSecondary,
        gap: 8,
        opacity: isLoading ? 0.6 : 1,
      }}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={LightMode.colorTextPrimary} />
      ) : (
        <Ionicons
          name={icon as any}
          size={16}
          color={isHighlight ? LightMode.colorBrand600 : LightMode.colorTextPrimary}
        />
      )}
      <Text style={{
        fontFamily: 'Lexend',
        fontSize: 13,
        fontWeight: '500',
        color: isHighlight ? LightMode.colorBrand600 : LightMode.colorTextPrimary,
      }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{
      backgroundColor: LightMode.colorBgPrimary,
      borderRadius: 8,
      borderColor: LightMode.colorBorderSecondary,
      borderWidth: 1,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <View style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: LightMode.colorBorderSecondary,
        backgroundColor: LightMode.colorBgSecondary,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: 'Lexend',
              fontSize: 14,
              fontWeight: '600',
              color: LightMode.colorTextPrimary,
              flex: 1,
            }}
          >
            {event.title}
          </Text>
          <View style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
            backgroundColor: LightMode.colorBgBrandPrimary,
            marginLeft: 8,
          }}>
            <Text style={{
              fontSize: 11,
              fontWeight: '600',
              color: LightMode.colorBrand600,
            }}>
              {hostRole === 'CO-HOST' ? 'Co-Host' : 'Host'}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons
            name="calendar"
            size={14}
            color={LightMode.colorTextSecondary}
          />
          <Text style={{
            fontFamily: 'Lexend',
            fontSize: 12,
            color: LightMode.colorTextSecondary,
          }}>
            {formattedDate || 'Date TBD'}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={{ paddingHorizontal: 12, paddingVertical: 12, gap: 12 }}>
        <View>
          <Text style={{
            fontFamily: 'Lexend',
            fontSize: 12,
            fontWeight: '600',
            color: LightMode.colorTextPrimary,
            marginBottom: 8,
          }}>
            Total Responses
          </Text>
          <View style={{
            flexDirection: 'row',
            gap: 8,
            flexWrap: 'wrap',
          }}>
            <View style={{ flex: 1, minWidth: gridLayout === 1 ? '100%' : '30%' }}>
              <SummaryTile
                label={safeLabels.primary}
                value={primaryGuestRsvpCounts[
                  isReminderEvent ? 'reminder' : isPassTypeEvent ? 'issued' : 'yes'
                ]}
              />
            </View>
            {!isReminderEvent && (
              <View style={{ flex: 1, minWidth: '30%' }}>
                <SummaryTile
                  label={safeLabels.secondary}
                  value={primaryGuestRsvpCounts[isPassTypeEvent ? 'waitlisted' : 'maybe']}
                />
              </View>
            )}
            {!isReminderEvent && (
              <View style={{ flex: 1, minWidth: '30%' }}>
                <SummaryTile
                  label={safeLabels.tertiary}
                  value={primaryGuestRsvpCounts[isPassTypeEvent ? 'cancelled' : 'no']}
                />
              </View>
            )}
          </View>
        </View>

        {!isReminderEvent && (
          <View>
            <Text style={{
              fontFamily: 'Lexend',
              fontSize: 12,
              fontWeight: '600',
              color: LightMode.colorTextPrimary,
              marginBottom: 8,
            }}>
              Total Guest Counts
            </Text>
            <View style={{
              flexDirection: 'row',
              gap: 8,
              flexWrap: 'wrap',
            }}>
              <View style={{ flex: 1, minWidth: '30%' }}>
                <SummaryTile
                  label={`${guestSummaryCutoffAge} Plus`}
                  value={eventSummary?.total_adults || 0}
                />
              </View>
              {showBelowCutoffInSummary && (
                <View style={{ flex: 1, minWidth: '30%' }}>
                  <SummaryTile
                    label={`Below ${guestSummaryCutoffAge}`}
                    value={eventSummary?.total_children || 0}
                  />
                </View>
              )}
              <View style={{ flex: 1, minWidth: '30%' }}>
                <SummaryTile label="Notes" value={notesCount} />
              </View>
            </View>
          </View>
        )}

        {showFoodPreferenceSection && (
          <View>
            <Text style={{
              fontFamily: 'Lexend',
              fontSize: 12,
              fontWeight: '600',
              color: LightMode.colorTextPrimary,
              marginBottom: 8,
            }}>
              Guest Count by Food Preference
            </Text>
            <View style={{
              flexDirection: 'row',
              gap: 8,
              flexWrap: 'wrap',
            }}>
              <View style={{ flex: 1, minWidth: '30%' }}>
                <SummaryTile label="Veg Only" value={eventSummary?.total_veg || 0} />
              </View>
              <View style={{ flex: 1, minWidth: '30%' }}>
                <SummaryTile label="Veg & Eggs" value={eventSummary?.total_veg_egg || 0} />
              </View>
              <View style={{ flex: 1, minWidth: '30%' }}>
                <SummaryTile label="Non-Veg" value={eventSummary?.total_non_veg || 0} />
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={{
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: LightMode.colorBorderSecondary,
        backgroundColor: LightMode.colorBgSecondary,
        gap: 8,
      }}>
        <ActionButton
          label="View Guest List"
          icon="people"
          onPress={() => {
            (navigation as any).navigate('GuestList', { eventId: eventRouteId });
          }}
        />

        <ActionButton
          label="Add Guest Manually"
          icon="person-add"
          onPress={() => {
            (navigation as any).navigate('AddGuest', { eventId: eventRouteId });
          }}
        />

        <ActionButton
          label={isLinkCopied ? 'Link Copied' : 'Copy Invite Link'}
          icon={isLinkCopied ? 'checkmark' : 'link'}
          onPress={handleCopyLink}
          isLoading={isCopyingLink}
          isHighlight={isLinkCopied}
        />

        <ActionButton
          label="Manage Event"
          icon="arrow-forward"
          onPress={() => onNavigateToManageEvent(eventRouteId)}
        />
      </View>
    </View>
  );
}
