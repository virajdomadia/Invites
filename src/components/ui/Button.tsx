import React from 'react';
import {
  Button as GluestackButton,
  ButtonText,
  ButtonIcon,
} from '@gluestack-ui/themed';
import { ViewStyle } from 'react-native';

interface CustomButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export const Button: React.FC<CustomButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isDisabled = false,
  onPress,
  children,
  icon,
  style,
  testID,
}) => {
  const variantMap = {
    primary: {
      action: 'positive' as const,
      bgColor: '$primary600',
    },
    secondary: {
      action: 'secondary' as const,
      bgColor: '$secondary600',
    },
    outline: {
      action: 'outline' as const,
      bgColor: 'transparent',
      borderWidth: 1,
      borderColor: '$primary600',
    },
    ghost: {
      action: 'secondary' as const,
      bgColor: 'transparent',
    },
  };

  const sizeMap = {
    sm: { px: '$3', py: '$2' },
    md: { px: '$4', py: '$3' },
    lg: { px: '$6', py: '$4' },
  };

  const buttonVariant = variantMap[variant];
  const buttonSize = sizeMap[size];

  return (
    <GluestackButton
      onPress={onPress}
      disabled={isDisabled}
      action={buttonVariant.action}
      size={size}
      style={style}
      testID={testID}
      {...buttonSize}
      sx={{
        _web: {
          ':focusVisible': {
            outline: '2px solid $primary600',
          },
        },
      }}
    >
      {icon && <ButtonIcon as={icon} mr="$2" />}
      <ButtonText>{children}</ButtonText>
    </GluestackButton>
  );
};
