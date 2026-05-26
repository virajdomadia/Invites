import React, { useCallback } from 'react';
import {
  HStack,
  VStack,
  Text,
  Pressable,
  Icon,
} from '@gluestack-ui/themed';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Share2,
  Edit2,
  Eye,
  Users,
  ShoppingBag,
} from 'lucide-react-native';
import { type EventDetailsResponse } from '@/services/eventApi';

interface BottomNavigationProps {
  activeTab: 'invite' | 'edit' | 'guests' | 'share' | 'shop';
  onTabChange: (tab: 'invite' | 'edit' | 'guests' | 'share' | 'shop') => void;
  onShopPress?: () => void;
  eventData?: EventDetailsResponse;
}

interface Tab {
  id: 'invite' | 'edit' | 'guests' | 'share' | 'shop';
  label: string;
  icon: React.ReactNode;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  onShopPress,
  eventData,
}) => {
  const insets = useSafeAreaInsets();

  const primaryBgColor = eventData?.event?.theme_instance_data?.theme_data?.colors?.panel ?? '#FFFFFF';
  const fontColor = eventData?.event?.theme_instance_data?.theme_data?.colors?.text ?? '#000000';

  const tabs: Tab[] = [
    { id: 'share', label: 'Share', icon: Share2 },
    { id: 'edit', label: 'Edit', icon: Edit2 },
    { id: 'invite', label: 'Preview', icon: Eye },
    { id: 'guests', label: 'Guests', icon: Users },
    { id: 'shop', label: 'Shop', icon: ShoppingBag },
  ];

  const handleTabPress = useCallback((tab: Tab) => {
    if (tab.id === 'shop') {
      onShopPress?.();
    } else {
      onTabChange(tab.id);
    }
  }, [onTabChange, onShopPress]);

  return (
    <HStack
      w="$full"
      justifyContent="space-around"
      alignItems="center"
      bg="$white"
      borderTopWidth={1}
      borderTopColor="$gray200"
      pt="$2"
      pb={`$${insets.bottom || 2}`}
      sx={{
        _dark: {
          bg: '$gray900',
          borderTopColor: '$gray800',
        },
      }}
    >
      {tabs.map((tab) => (
        <Pressable
          key={tab.id}
          flex={1}
          onPress={() => handleTabPress(tab)}
          sx={{
            _pressed: {
              opacity: 0.7,
            },
          }}
        >
          <VStack
            alignItems="center"
            justifyContent="center"
            py="$3"
            px="$2"
            bgColor={activeTab === tab.id ? primaryBgColor : 'transparent'}
            borderRadius="$lg"
          >
            <Icon
              as={tab.icon}
              size="md"
              color={activeTab === tab.id ? fontColor : '$gray600'}
            />
            <Text
              size="xs"
              fontWeight="$medium"
              mt="$1"
              color={activeTab === tab.id ? fontColor : '$gray600'}
            >
              {tab.label}
            </Text>
          </VStack>
        </Pressable>
      ))}
    </HStack>
  );
};
