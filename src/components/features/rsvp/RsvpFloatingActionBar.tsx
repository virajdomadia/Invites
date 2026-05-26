import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Text,
  Pressable,
  Modal,
  Icon,
  Box,
  Center,
  Spinner,
  Heading,
} from '@gluestack-ui/themed';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Check,
  X,
  HelpCircle,
  Clock,
  Ticket,
  Bell,
  BellOff,
  Edit,
} from 'lucide-react-native';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { type EventDetailsResponse } from '@/services/eventApi';
import { useAuth } from '@/core/hooks/useAuth';
import { EditActionsBar } from '@/components/features/events/EditActionsBar';
import { CircleActionButton } from '@/components/shared/CircleActionButton';
import { Button } from '@/components/ui/Button';

dayjs.extend(utc);
dayjs.extend(timezone);

interface RegistrationDateTimeApi {
  date: string;
  time?: string;
}

function parseRegistrationDateTime(
  dt: RegistrationDateTimeApi | null | undefined,
): Date | null {
  if (!dt?.date) return null;
  const time = dt.time ?? '00:00:00';
  const iso = `${dt.date}T${time}`;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

interface RsvpFloatingActionBarProps {
  onRsvp: (response: 'YES' | 'NO' | 'MAYBE') => void;
  isLoading?: boolean;
  floating?: boolean;
  eventId?: string;
  isLoggedIn?: boolean;
  rsvpStatus?: string;
  rsvpWorkflowStatus?: string;
  rsvp_type?: string;
  onGetPass?: () => void;
  passImageUrl?: string;
  rsvpOpensAt?: string | Date | null;
  rsvpClosesAt?: string | Date | null;
  eventEndTime?: Date | string | null;
  timezone?: string | null;
  rsvpResponse?: string;
  onRemindMe?: () => void | Promise<void>;
  onCancelReminder?: () => void | Promise<void>;
  hasSlots?: boolean;
  ishost?: boolean;
  eventData?: EventDetailsResponse;
  isHostPreview?: boolean;
}

type EventDetailsScreenRouteProp = RouteProp<{ EventDetails: { eventId: string } }, 'EventDetails'>;
type NavigationProp = NativeStackNavigationProp<any, 'EventDetails'>;

const REMINDER_LABELS = {
  button: 'Remind Me',
  cancel: 'Cancel Reminder',
  reRemind: 'Remind Me Again',
  status: 'Reminder Set!',
};

const isUserReminded = (rsvpResponse?: string): boolean => {
  return rsvpResponse === 'REMINDER';
};

export const RsvpFloatingActionBar: React.FC<RsvpFloatingActionBarProps> = ({
  onRsvp,
  isLoading = false,
  floating = true,
  eventId,
  isLoggedIn = false,
  rsvp_type,
  onGetPass,
  passImageUrl,
  rsvpOpensAt,
  rsvpClosesAt,
  eventEndTime,
  timezone: tzProp,
  rsvpStatus,
  rsvpWorkflowStatus,
  rsvpResponse,
  onRemindMe,
  onCancelReminder,
  hasSlots = true,
  ishost = false,
  eventData,
  isHostPreview = false,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EventDetailsScreenRouteProp>();
  const routeEventId = route.params?.eventId;
  const effectiveEventId = eventId || routeEventId;
  const { userData } = useAuth();

  const [showPassModal, setShowPassModal] = useState(false);
  const [isReminderActionLoading, setIsReminderActionLoading] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<'YES' | 'NO' | 'MAYBE' | null>(null);
  const [isRsvpOpen, setIsRsvpOpen] = useState(true);
  const [isRsvpClosed, setIsRsvpClosed] = useState(false);
  const [hasEventEnded, setHasEventEnded] = useState(false);

  const isReminderLoading = isLoading || isReminderActionLoading;

  const themeBackgroundColor = eventData?.event?.theme_instance_data?.theme_data?.colors?.rsvpBar || '#7d1b4d';
  const themeFontColor = eventData?.event?.theme_instance_data?.theme_data?.colors?.rsvpText || '#ffffff';
  const textColor = eventData?.event?.theme_instance_data?.theme_data?.colors?.text || '#000000';
  const panelColor = eventData?.event?.theme_instance_data?.theme_data?.colors?.panel || '#ffffff';

  // Check if event has ended
  useEffect(() => {
    if (!eventEndTime) {
      setHasEventEnded(false);
      return;
    }

    const checkEventEnded = () => {
      try {
        const eventEndDt = dayjs.utc(eventEndTime);
        const tz = tzProp || 'Asia/Kolkata';
        const nowDt = dayjs().tz(tz);

        setHasEventEnded(nowDt.isAfter(eventEndDt));
      } catch {
        setHasEventEnded(false);
      }
    };

    checkEventEnded();
    const interval = setInterval(checkEventEnded, 1000);
    return () => clearInterval(interval);
  }, [eventEndTime, tzProp]);

  // Check RSVP open status
  useEffect(() => {
    if (!rsvpOpensAt) {
      setIsRsvpOpen(true);
      return;
    }

    const targetDate = rsvpOpensAt instanceof Date ? rsvpOpensAt : new Date(rsvpOpensAt);
    const now = new Date();

    setIsRsvpOpen(targetDate <= now);

    const interval = setInterval(() => {
      const now = new Date();
      setIsRsvpOpen(targetDate <= now);
    }, 1000);

    return () => clearInterval(interval);
  }, [rsvpOpensAt]);

  // Check RSVP closed status
  useEffect(() => {
    if (!rsvpClosesAt) {
      setIsRsvpClosed(false);
      return;
    }

    const targetDate = rsvpClosesAt instanceof Date ? rsvpClosesAt : new Date(rsvpClosesAt);
    const now = new Date();

    setIsRsvpClosed(targetDate <= now);

    const interval = setInterval(() => {
      const now = new Date();
      setIsRsvpClosed(targetDate <= now);
    }, 1000);

    return () => clearInterval(interval);
  }, [rsvpClosesAt]);

  const normalizedRsvpStatus = rsvpStatus?.toUpperCase();
  const normalizedWorkflowStatus = rsvpWorkflowStatus?.toUpperCase();
  const isCancelled = normalizedWorkflowStatus === 'CANCELLED' || normalizedRsvpStatus === 'CANCELLED';
  const isWaitlisted = normalizedWorkflowStatus === 'WAITING' || normalizedWorkflowStatus === 'WAITLISTED';
  const selectedYesNoMaybeResponse = rsvpResponse === 'YES' || rsvpResponse === 'NO' || rsvpResponse === 'MAYBE' ? rsvpResponse : null;
  const hasRsvpForPass = (!!selectedYesNoMaybeResponse || isCancelled) && !isWaitlisted;

  const runReminderAction = async (action: () => Promise<void | undefined>) => {
    if (isReminderLoading) return;
    setIsReminderActionLoading(true);
    try {
      await action();
    } catch {
      // Error silently handled
    } finally {
      setIsReminderActionLoading(false);
    }
  };

  const handleRemindMe = async () => {
    await onRemindMe?.();
  };

  const handleCancelReminder = async () => {
    await onCancelReminder?.();
  };

  const effectiveRsvpType = rsvp_type?.toUpperCase();

  const handleRsvp = (response: 'YES' | 'NO' | 'MAYBE') => {
    if (!isLoggedIn) {
      setSelectedResponse(response);
      // Would trigger login modal here
      return;
    }
    onRsvp(response);
  };

  const handleGetPass = () => {
    if (!isLoggedIn) {
      setSelectedResponse('YES');
      // Would trigger login modal here
      return;
    }
    if (onGetPass) {
      onGetPass();
    } else if (effectiveEventId) {
      navigation.navigate('AttendingRsvp', {
        eventId: effectiveEventId,
        response: 'yes',
      });
    }
  };

  const handleEditResponse = () => {
    if (effectiveEventId) {
      navigation.navigate('AttendingRsvp', {
        eventId: effectiveEventId,
        response: selectedYesNoMaybeResponse?.toLowerCase() || 'yes',
        mode: 'edit',
      });
    }
  };

  // Loading content
  if (isLoading) {
    return (
      <Box bg={themeBackgroundColor} px="$6" py="$3" borderRadius="$md" shadowColor="$black" shadowOffset={{ width: 0, height: 4 }} shadowOpacity={0.25} shadowRadius={4} elevation={5}>
        <HStack alignItems="center" justifyContent="center" space="md">
          <Spinner size="large" color={themeFontColor} />
          <Text color={themeFontColor} fontSize="$sm" fontFamily="$lexend" fontWeight="$medium">
            Loading...
          </Text>
        </HStack>
      </Box>
    );
  }

  // Event over
  if (hasEventEnded) {
    return (
      <Box bg={themeBackgroundColor} px="$6" py="$3" borderRadius="$md" shadowColor="$black" shadowOffset={{ width: 0, height: 4 }} shadowOpacity={0.25} shadowRadius={4} elevation={5}>
        <Text fontSize="$lg" fontWeight="$600" textAlign="center" color={themeFontColor} fontFamily="$lexend">
          Event is Over
        </Text>
      </Box>
    );
  }

  // Not open yet
  if (!isRsvpOpen) {
    return (
      <Box bg={themeBackgroundColor} px="$6" py="$3" borderRadius="$md" shadowColor="$black" shadowOffset={{ width: 0, height: 4 }} shadowOpacity={0.25} shadowRadius={4} elevation={5}>
        <VStack space="md">
          <Text fontSize="$lg" fontWeight="$600" textAlign="center" color={themeFontColor} fontFamily="$lexend">
            Registrations yet to open
          </Text>
          {!isLoggedIn && (
            <Button variant="primary" size="md" onPress={() => {}}>
              Login
            </Button>
          )}
        </VStack>
      </Box>
    );
  }

  // Waitlisted
  if (isWaitlisted) {
    return (
      <Box bg={themeBackgroundColor} px="$6" py="$4" borderRadius="$md" shadowColor="$black" shadowOffset={{ width: 0, height: 4 }} shadowOpacity={0.25} shadowRadius={4} elevation={5}>
        <VStack space="md">
          <Text fontSize="$lg" fontWeight="$600" textAlign="center" color={themeFontColor} fontFamily="$lexend">
            Thank you for your registration.
          </Text>
          <Text fontSize="$sm" fontWeight="$400" textAlign="center" color={themeFontColor} opacity={0.8} fontFamily="$lexend">
            We will get in touch with you if any slots get free.
          </Text>
          <HStack
            bg="$warning100"
            borderWidth={1}
            borderColor="$warning200"
            borderRadius="$md"
            p="$3"
            alignItems="center"
            space="sm"
            justifyContent="center"
          >
            <Icon as={Clock} color="$warning700" size="md" />
            <Text fontSize="$sm" fontWeight="$600" color="$warning700">
              Waitlisted
            </Text>
          </HStack>
        </VStack>
      </Box>
    );
  }

  // Reminder flow
  if (effectiveRsvpType === 'REMINDER') {
    return (
      <Box bg={themeBackgroundColor} px="$6" py="$4" borderRadius="$md" shadowColor="$black" shadowOffset={{ width: 0, height: 4 }} shadowOpacity={0.25} shadowRadius={4} elevation={5}>
        <VStack space="md">
          <Text fontSize="$lg" fontWeight="$600" textAlign="center" color={themeFontColor} fontFamily="$lexend">
            Don&apos;t miss this event!
          </Text>
          <Text fontSize="$sm" fontWeight="$400" textAlign="center" color={themeFontColor} opacity={0.8} fontFamily="$lexend">
            Get reminded when the event is coming up
          </Text>

          {isUserReminded(rsvpResponse) && normalizedWorkflowStatus === 'CONFIRMED' ? (
            <>
              <HStack bg="$success50" borderWidth={1} borderColor="$success200" borderRadius="$md" p="$3" alignItems="center" space="sm" justifyContent="center">
                <Icon as={Bell} color="$success700" size="md" />
                <Text fontSize="$sm" fontWeight="$600" color="$success700">
                  Reminder Set!
                </Text>
              </HStack>
              <Button
                variant="secondary"
                size="md"
                onPress={async () => {
                  await runReminderAction(handleCancelReminder);
                }}
                isDisabled={isReminderLoading}
                icon={<BellOff size={18} />}
              >
                Cancel Reminder
              </Button>
            </>
          ) : rsvpResponse === 'NO' && normalizedWorkflowStatus === 'CANCELLED' ? (
            <Button
              variant="primary"
              size="md"
              onPress={async () => {
                await runReminderAction(handleRemindMe);
              }}
              isDisabled={isReminderLoading}
              icon={<Bell size={18} />}
            >
              Remind Me Again
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onPress={async () => {
                if (!isLoggedIn) {
                  return;
                }
                await runReminderAction(handleRemindMe);
              }}
              isDisabled={isReminderLoading}
              icon={<Bell size={18} />}
            >
              Remind Me
            </Button>
          )}
        </VStack>
      </Box>
    );
  }

  // Closed
  if (isRsvpClosed && !selectedYesNoMaybeResponse) {
    return (
      <Box bg={themeBackgroundColor} px="$6" py="$4" borderRadius="$md" shadowColor="$black" shadowOffset={{ width: 0, height: 4 }} shadowOpacity={0.25} shadowRadius={4} elevation={5}>
        <VStack space="md">
          <Text fontSize="$lg" fontWeight="$600" textAlign="center" color={themeFontColor} fontFamily="$lexend">
            Registrations are currently closed.
          </Text>
          <Text fontSize="$sm" fontWeight="$400" textAlign="center" color={themeFontColor} opacity={0.8} fontFamily="$lexend">
            Check back later.
          </Text>
          {!isLoggedIn && (
            <>
              <Text fontSize="$xs" textAlign="center" color={themeFontColor} opacity={0.8} fontFamily="$lexend">
                If you already have a pass, login to access it
              </Text>
              <Button variant="primary" size="md" onPress={() => {}}>
                Login
              </Button>
            </>
          )}
        </VStack>
      </Box>
    );
  }

  // No slots
  if (!hasSlots && !selectedYesNoMaybeResponse) {
    return (
      <Box bg={themeBackgroundColor} px="$6" py="$4" borderRadius="$md" shadowColor="$black" shadowOffset={{ width: 0, height: 4 }} shadowOpacity={0.25} shadowRadius={4} elevation={5}>
        <VStack space="md">
          <Text fontSize="$lg" fontWeight="$600" textAlign="center" color={themeFontColor} fontFamily="$lexend">
            All slots and the waitlist are currently filled up.
          </Text>
          <Text fontSize="$xs" textAlign="center" color={themeFontColor} opacity={0.8} fontFamily="$lexend">
            Please check back later if any are opened up through cancellations.
          </Text>
        </VStack>
      </Box>
    );
  }

  // Entry Pass flow
  if (effectiveRsvpType === 'PASS') {
    return (
      <Box bg={themeBackgroundColor} px="$6" py="$4" borderRadius="$md" shadowColor="$black" shadowOffset={{ width: 0, height: 4 }} shadowOpacity={0.25} shadowRadius={4} elevation={5}>
        <VStack space="md">
          <Text fontSize="$lg" fontWeight="$600" textAlign="center" color={themeFontColor} fontFamily="$lexend">
            Entry Pass Is Mandatory
          </Text>
          <Text fontSize="$sm" fontWeight="$400" textAlign="center" color={themeFontColor} opacity={0.8} fontFamily="$lexend">
            This is a free event, but you need a pass to participate
          </Text>

          <HStack space="md">
            {hasRsvpForPass && (
              <Pressable
                flex={1}
                borderWidth={1}
                borderColor={themeFontColor}
                bg="transparent"
                borderRadius="$md"
                px="$3"
                py="$2"
                flexDirection="row"
                alignItems="center"
                justifyContent="center"
                gap="$1"
                onPress={handleEditResponse}
              >
                <Icon as={Edit} color={themeFontColor} size="md" />
                <Text fontSize="$xs" fontWeight="$600" color={themeFontColor} fontFamily="$lexend">
                  Edit Response
                </Text>
              </Pressable>
            )}

            <Button
              variant="primary"
              size="md"
              flex={1}
              onPress={handleGetPass}
              icon={<Ticket size={18} />}
            >
              {hasRsvpForPass ? 'View My Pass' : 'Get My Pass Now'}
            </Button>
          </HStack>
        </VStack>
      </Box>
    );
  }

  // Standard RSVP
  return (
    <VStack space="md">
      <Box bg={themeBackgroundColor} px="$6" py="$4" borderRadius="$md" shadowColor="$black" shadowOffset={{ width: 0, height: 4 }} shadowOpacity={0.25} shadowRadius={4} elevation={5}>
        <VStack space="md">
          <Text fontSize="$lg" fontWeight="$600" textAlign="center" color={themeFontColor} fontFamily="$lexend">
            Hope you are joining us!
          </Text>
          <Text fontSize="$sm" fontWeight="$400" textAlign="center" color={themeFontColor} opacity={0.8} fontFamily="$lexend">
            Select an option to confirm your response
          </Text>

          {selectedYesNoMaybeResponse ? (
            <Pressable bg="$white" borderRadius="$md" px="$3" py="$3" onPress={handleEditResponse}>
              <Text fontSize="$base" fontWeight="$600" color="$gray900" textAlign="center" fontFamily="$lexend">
                {selectedYesNoMaybeResponse === 'YES'
                  ? 'Yes - I am joining'
                  : selectedYesNoMaybeResponse === 'NO'
                  ? 'No - I cannot attend'
                  : 'Maybe - Not sure yet'}
              </Text>
              <Text fontSize="$xs" fontWeight="$400" color="$gray600" textAlign="center" fontFamily="$lexend" mt="$1">
                Tap to change your response
              </Text>
            </Pressable>
          ) : (
            <HStack space="md">
              <Pressable
                flex={1}
                bg="$white"
                borderRadius="$md"
                px="$3"
                py="$2"
                flexDirection="row"
                alignItems="center"
                justifyContent="center"
                gap="$1"
                onPress={() => handleRsvp('YES')}
                disabled={isLoading}
                shadowColor="$black"
                shadowOffset={{ width: 0, height: 1 }}
                shadowOpacity={0.2}
                shadowRadius={2}
                elevation={2}
              >
                <Icon as={Check} color="$gray900" size="md" />
                <Text fontSize="$xs" fontWeight="$600" color="$gray900" fontFamily="$lexend">
                  Yes
                </Text>
              </Pressable>

              <Pressable
                flex={1}
                bg="$white"
                borderRadius="$md"
                px="$3"
                py="$2"
                flexDirection="row"
                alignItems="center"
                justifyContent="center"
                gap="$1"
                onPress={() => handleRsvp('NO')}
                disabled={isLoading}
                shadowColor="$black"
                shadowOffset={{ width: 0, height: 1 }}
                shadowOpacity={0.2}
                shadowRadius={2}
                elevation={2}
              >
                <Icon as={X} color="$gray900" size="md" />
                <Text fontSize="$xs" fontWeight="$600" color="$gray900" fontFamily="$lexend">
                  No
                </Text>
              </Pressable>

              <Pressable
                flex={1}
                bg="$white"
                borderRadius="$md"
                px="$3"
                py="$2"
                flexDirection="row"
                alignItems="center"
                justifyContent="center"
                gap="$1"
                onPress={() => handleRsvp('MAYBE')}
                disabled={isLoading}
                shadowColor="$black"
                shadowOffset={{ width: 0, height: 1 }}
                shadowOpacity={0.2}
                shadowRadius={2}
                elevation={2}
              >
                <Icon as={HelpCircle} color="$gray900" size="md" />
                <Text fontSize="$xs" fontWeight="$600" color="$gray900" fontFamily="$lexend">
                  Maybe
                </Text>
              </Pressable>
            </HStack>
          )}
        </VStack>
      </Box>

      {/* Pass Modal */}
      <Modal isOpen={showPassModal} onClose={() => setShowPassModal(false)}>
        <Center flex={1}>
          <Box bg="$white" borderRadius="$lg" p="$5" maxWidth="$80">
            <HStack justifyContent="flex-end" mb="$4">
              <Pressable onPress={() => setShowPassModal(false)}>
                <Icon as={X} size="lg" color="$gray900" />
              </Pressable>
            </HStack>
            <Heading size="lg" mb="$3">
              Your Pass
            </Heading>
            {passImageUrl && <Text fontSize="$sm">{passImageUrl}</Text>}
          </Box>
        </Center>
      </Modal>

      {/* Edit actions bar for host */}
      {ishost && (
        <EditActionsBar primaryBgColor={textColor} ishost={ishost} fontColor={textColor}>
          <HStack flex={1}>
            <CircleActionButton
              icon={<Edit size={16} color={panelColor} />}
              label="Settings"
              ariaLabel="Configure settings"
              onPress={() => {}}
              textColor={panelColor}
            />
          </HStack>
        </EditActionsBar>
      )}
    </VStack>
  );
};
