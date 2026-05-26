import React from 'react';
import {
  Modal as GluestackModal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Heading,
  Icon,
  CloseIcon,
  VStack,
  HStack,
} from '@gluestack-ui/themed';

interface CustomModalProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  testID?: string;
}

export const Modal: React.FC<CustomModalProps> = ({
  isVisible,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  testID,
}) => {
  return (
    <GluestackModal isOpen={isVisible} onClose={onClose} size={size} testID={testID}>
      <ModalBackdrop />
      <ModalContent>
        {title && (
          <ModalHeader borderBottomWidth={1} borderColor="$gray200">
            <VStack flex={1} mr="$12">
              <Heading size="lg">{title}</Heading>
            </VStack>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
        )}
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </GluestackModal>
  );
};
