import React from 'react';
import {
  Avatar as GluestackAvatar,
  AvatarFallbackText,
  AvatarImage,
} from '@gluestack-ui/themed';

interface AvatarProps {
  isAuthenticated: boolean;
  displayName?: string | null;
  photoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({
  isAuthenticated,
  displayName,
  photoUrl,
  size = 'md',
}: AvatarProps) {
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const sizeMap = {
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'lg' as const,
  };

  const initials = getInitials(displayName);

  return (
    <GluestackAvatar size={sizeMap[size]} borderRadius="$full">
      {isAuthenticated && photoUrl && <AvatarImage source={{ uri: photoUrl }} alt={displayName || 'User'} />}
      <AvatarFallbackText>{initials}</AvatarFallbackText>
    </GluestackAvatar>
  );
}
