import React from 'react';
import {
  Toast as GluestackToast,
  VStack,
  HStack,
  ToastTitle,
  ToastDescription,
  Pressable,
  Icon,
  CloseIcon,
} from '@gluestack-ui/themed';
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react-native';
import { Toast as ToastType } from '@/core/hooks/useToast';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

const actionMap = {
  success: 'positive' as const,
  error: 'error' as const,
  info: 'info' as const,
  warning: 'warning' as const,
};

const iconMap = {
  success: CheckCircle,
  error: AlertTriangle,
  info: Info,
  warning: AlertCircle,
};

export function Toast({ toast, onDismiss }: ToastProps) {
  const action = actionMap[toast.type];
  const IconComponent = iconMap[toast.type];

  return (
    <GluestackToast action={action} variant="accent" mx="$2" mb="$2">
      <HStack space="md" alignItems="center">
        <Icon as={IconComponent} size="md" />
        <VStack space="xs" flex={1}>
          <ToastTitle fontWeight="$bold">{toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}</ToastTitle>
          <ToastDescription>{toast.message}</ToastDescription>
        </VStack>
        <Pressable onPress={() => onDismiss(toast.id)}>
          <Icon as={CloseIcon} size="md" />
        </Pressable>
      </HStack>
    </GluestackToast>
  );
}

interface ToastContainerProps {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <VStack position="absolute" top={50} left={0} right={0} zIndex={9999} pointerEvents="none" space="sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </VStack>
  );
}
