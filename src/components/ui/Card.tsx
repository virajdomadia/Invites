import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text as GluestackText,
} from '@gluestack-ui/themed';
import { ViewStyle } from 'react-native';

interface CustomCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: string;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const Card: React.FC<CustomCardProps> = ({
  title,
  subtitle,
  children,
  variant = 'elevated',
  padding = '$4',
  onPress,
  style,
  testID,
}) => {
  const variantStyles = {
    elevated: {
      bg: '$white',
      borderRadius: '$lg',
      shadowColor: '$black',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    outlined: {
      bg: '$white',
      borderRadius: '$lg',
      borderWidth: 1,
      borderColor: '$gray200',
    },
    filled: {
      bg: '$gray50',
      borderRadius: '$lg',
    },
  };

  return (
    <Box
      {...variantStyles[variant]}
      p={padding}
      onPress={onPress}
      style={style}
      testID={testID}
    >
      {title && (
        <VStack mb="$3">
          <Heading size="md" mb="$1">
            {title}
          </Heading>
          {subtitle && (
            <GluestackText size="sm" color="$gray600">
              {subtitle}
            </GluestackText>
          )}
        </VStack>
      )}
      {children}
    </Box>
  );
};
