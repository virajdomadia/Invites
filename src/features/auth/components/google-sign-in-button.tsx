import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useGoogleAuth } from '../services/google-auth';
import { authService } from '../services/auth-service';

interface GoogleSignInButtonProps {
  onSuccess?: (isNewUser: boolean) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export function GoogleSignInButton({
  onSuccess,
  onError,
  disabled = false,
}: GoogleSignInButtonProps) {
  const { signIn, loading, error, userInfo, idToken, isReady } = useGoogleAuth();

  const handlePress = async () => {
    if (!isReady) return;

    try {
      await signIn();

      // Wait for idToken to be set (handled by useGoogleAuth)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign-in failed';
      onError?.(errorMessage);
    }
  };

  // Handle successful Google auth
  React.useEffect(() => {
    if (idToken && userInfo) {
      (async () => {
        const result = await authService.loginWithGoogle(idToken, userInfo);
        if (result.success) {
          onSuccess?.(result.is_new_user);
        } else {
          onError?.(result.error);
        }
      })();
    }
  }, [idToken, userInfo, onSuccess, onError]);

  // Handle errors
  React.useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  return (
    <TouchableOpacity
      style={[styles.button, (disabled || loading || !isReady) && styles.disabled]}
      onPress={handlePress}
      disabled={disabled || loading || !isReady}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          <Text style={styles.icon}>🔐</Text>
          <Text style={styles.text}>Sign in with Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4285F4',
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: 50,
  },
  disabled: {
    opacity: 0.6,
  },
  icon: {
    fontSize: 20,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
