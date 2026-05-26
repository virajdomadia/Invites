import React from 'react';
import { Center, Spinner } from '@gluestack-ui/themed';
import { useAuthStore } from '@/core/store/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({
  children,
  fallback,
  requireAuth = true,
}: AuthGuardProps) {
  const { user, isLoading } = useAuthStore();
  const isAuthenticated = !!user;

  if (isLoading) {
    return (
      <Center flex={1} bg="$white">
        <Spinner size="large" color="$gray900" />
      </Center>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <Center flex={1} bg="$white" />
    );
  }

  return <>{children}</>;
}

export function useAuthGuard(requireAuth = true) {
  const { user, isLoading } = useAuthStore();
  const isAuthenticated = !!user;

  return {
    isAuthenticated,
    isLoading,
    shouldShowContent: !isLoading && (!requireAuth || isAuthenticated),
  };
}
