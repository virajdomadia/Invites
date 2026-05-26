import React from 'react';
import { HStack, Pressable, Text } from '@gluestack-ui/themed';

interface CircleActionButtonProps {
  icon: React.ReactNode;
  label?: string;
  ariaLabel: string;
  onPress: () => void;
  textColor?: string;
}

export const CircleActionButton: React.FC<CircleActionButtonProps> = ({
  icon,
  label,
  ariaLabel,
  onPress,
  textColor = '$white',
}) => {
  return (
    <Pressable
      px="$4"
      py="$2"
      borderRadius="$lg"
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      gap="$2"
      onPress={onPress}
      accessibilityLabel={ariaLabel}
      sx={{
        _pressed: {
          opacity: 0.7,
        },
      }}
    >
      {icon}
      {label && (
        <Text fontSize="$xs" fontWeight="$medium" color={textColor}>
          {label}
        </Text>
      )}
    </Pressable>
  );
};
