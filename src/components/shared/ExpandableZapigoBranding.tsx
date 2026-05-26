import React, { useState } from 'react';
import {
  VStack,
  HStack,
  Text,
  Pressable,
  Divider,
  Icon,
  Box,
} from '@gluestack-ui/themed';
import { Linking } from 'react-native';
import { ChevronUp, ChevronDown, Star } from 'lucide-react-native';
import { type EventDetailsResponse } from '@/services/eventApi';
import { Button } from '@/components/ui/Button';

interface ExpandableZapigoBrandingProps {
  eventData?: EventDetailsResponse | null;
  colors?: {
    primary?: string;
    secondary_bg_color?: string;
    secondary_font_color?: string;
    primary_bg_color?: string;
    background?: {
      main?: string;
      primary?: string;
      secondary?: string;
    };
    font?: {
      primary?: string;
      secondary?: string;
    };
  };
}

const ExpandableZapigoBranding: React.FC<ExpandableZapigoBrandingProps> = ({
  eventData,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const primaryBgColor = eventData?.event?.theme_instance_data?.theme_data?.colors?.panel;
  const fontColor = eventData?.event?.theme_instance_data?.theme_data?.colors?.text;

  const handleHostEvent = async () => {
    try {
      await Linking.openURL('/invites');
    } catch {
      // Silently fail - link may not be available
    }
  };

  return (
    <Box
      bg={primaryBgColor || '$white'}
      borderRadius="$lg"
      shadowColor="$black"
      shadowOffset={{ width: 0, height: 4 }}
      shadowOpacity={0.25}
      shadowRadius={4}
      elevation={5}
      overflow="hidden"
    >
      <Pressable
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        px="$4"
        py="$4"
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <HStack alignItems="center" gap="$1">
          <Text fontSize="$sm" fontWeight="$600" color={fontColor || '$gray900'}>
            Hosted on
          </Text>
          <Text fontSize="$sm" fontWeight="$bold" color={fontColor || '$gray900'} ml="$1">
            Zapigo
          </Text>
        </HStack>
        <Icon as={isExpanded ? ChevronUp : ChevronDown} size="lg" color={fontColor || '$gray900'} />
      </Pressable>

      {isExpanded && (
        <>
          <Divider />
          <VStack px="$4" py="$4" space="md">
            <VStack space="md">
              <Text fontSize="$sm" color={fontColor || '$gray900'} lineHeight="$md">
                This event is hosted on Zapigo, a joyful way to bring people together for birthdays, gatherings, ceremonies, and community events.
              </Text>
              <Text fontSize="$sm" color={fontColor || '$gray900'} lineHeight="$md">
                Free to use, always.
              </Text>
              <Text fontSize="$sm" color={fontColor || '$gray900'} lineHeight="$md">
                From guest replies and reminders to MyGate passes and updates, everything stays in one place - so you don&apos;t have to chase the details.
              </Text>
              <Text fontSize="$sm" fontWeight="$600" color={fontColor || '$gray900'} lineHeight="$md">
                Host your own event in seconds.
              </Text>
            </VStack>

            <Button
              variant="primary"
              size="md"
              onPress={handleHostEvent}
              icon={<Star size={20} />}
            >
              Host Your Event Now
            </Button>
          </VStack>
        </>
      )}
    </Box>
  );
};

export default ExpandableZapigoBranding;
