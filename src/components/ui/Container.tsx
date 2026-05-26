import React from 'react';
import { VStack, VStackProps } from '@gluestack-ui/themed';

interface ContainerProps extends VStackProps {
  children: React.ReactNode;
  maxWidth?: string;
  centerContent?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = '$full',
  centerContent = false,
  ...props
}) => {
  return (
    <VStack
      flex={1}
      maxWidth={maxWidth}
      width="$full"
      {...(centerContent && {
        alignItems: 'center',
        justifyContent: 'center',
      })}
      {...props}
    >
      {children}
    </VStack>
  );
};
