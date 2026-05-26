import React, { useEffect } from 'react';
import { HStack } from '@gluestack-ui/themed';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { darkenColor } from '@/utils/color';

interface EditActionsBarProps {
  primaryBgColor: string;
  children: React.ReactNode;
  ishost?: boolean;
  gap?: number;
  backgroundColor?: string;
  borderColor?: string;
  fontColor?: string;
}

export const EditActionsBar: React.FC<EditActionsBarProps> = ({
  primaryBgColor,
  children,
  ishost = false,
  gap = 8,
  backgroundColor,
  borderColor,
  fontColor,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);

  useEffect(() => {
    if (ishost) {
      opacity.value = withTiming(1, { duration: 400 });
      translateY.value = withTiming(0, { duration: 400 });
    }
  }, [ishost, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!ishost) return null;

  const computedBackgroundColor =
    backgroundColor ||
    (fontColor
      ? fontColor
      : darkenColor(primaryBgColor, 60));

  const computedBorderColor =
    borderColor ||
    (fontColor ? fontColor : darkenColor(primaryBgColor, 20));

  return (
    <Animated.View
      style={[
        {
          width: '100%',
          borderTopWidth: 1,
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          marginTop: -4,
          padding: 4,
          borderTopColor: computedBorderColor,
          backgroundColor: computedBackgroundColor,
        },
        animatedStyle,
      ]}
    >
      <HStack w="$full" gap={gap}>
        {children}
      </HStack>
    </Animated.View>
  );
};
