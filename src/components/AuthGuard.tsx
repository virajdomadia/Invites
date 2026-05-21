import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/core/store/authStore';
import { Palette } from '@/theme';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean; // If true, only show children if authenticated
}

/**
 * Component to guard content based on auth state
 * Usage: Wrap screens that require authentication
 */
export function AuthGuard({
  children,
  fallback,
  requireAuth = true,
}: AuthGuardProps) {
  const { user, isLoading } = useAuthStore();
  const isAuthenticated = !!user;

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Palette.colorWhite,
        }}
      >
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Palette.colorWhite,
        }}
      />
    );
  }

  return <>{children}</>;
}

/**
 * Hook version for more control
 */
export function useAuthGuard(requireAuth = true) {
  const { user, isLoading } = useAuthStore();
  const isAuthenticated = !!user;

  return {
    isAuthenticated,
    isLoading,
    shouldShowContent: !isLoading && (!requireAuth || isAuthenticated),
  };
}
