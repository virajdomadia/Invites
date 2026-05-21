import React, { useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Modal,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Palette, LightMode } from '@/theme';

type OAuthFlowState = 'initial' | 'loading' | 'success' | 'error';

interface SignInModalProps {
  visible: boolean;
  onClose: () => void;
  onGoogleSignInStart?: () => Promise<{ idToken: string; email: string; name: string }>;
  onGoogleSignInSuccess?: (tokens: { idToken: string; email: string; name: string }) => void;
  onGuestContinue?: () => void;
}

export default function SignInModal({
  visible,
  onClose,
  onGoogleSignInStart,
  onGoogleSignInSuccess,
  onGuestContinue,
}: SignInModalProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [flowState, setFlowState] = useState<OAuthFlowState>('initial');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      setFlowState('loading');
      setErrorMessage(null);

      if (!onGoogleSignInStart) {
        throw new Error('Google Sign-In handler not configured');
      }

      const tokens = await onGoogleSignInStart();
      setFlowState('success');
      onGoogleSignInSuccess?.(tokens);

      // Close modal after short delay to show success state
      setTimeout(() => {
        onClose();
        setFlowState('initial');
      }, 1000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign-in failed';
      setErrorMessage(message);
      setFlowState('error');
    }
  }, [onGoogleSignInStart, onGoogleSignInSuccess, onClose]);

  const handleGuestContinue = useCallback(() => {
    try {
      onGuestContinue?.();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to continue';
      setErrorMessage(message);
      setFlowState('error');
    }
  }, [onGuestContinue, onClose]);

  const resetState = useCallback(() => {
    setFlowState('initial');
    setErrorMessage(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCloseModal}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <ScrollView
          scrollEnabled={false}
          style={{
            backgroundColor: Palette.colorWhite,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: insets.bottom + 20,
            maxHeight: height * 0.8,
          }}
        >
          {/* Close Button */}
          <TouchableOpacity
            onPress={handleCloseModal}
            disabled={flowState === 'loading'}
            style={{
              alignSelf: 'flex-end',
              marginBottom: 16,
              padding: 8,
              opacity: flowState === 'loading' ? 0.5 : 1,
            }}
          >
            <Ionicons name="close" size={24} color={LightMode.colorTextPrimary} />
          </TouchableOpacity>

          {/* Title */}
          <Text
            style={{
              fontSize: 24,
              fontWeight: '700',
              color: LightMode.colorTextPrimary,
              marginBottom: 8,
            }}
          >
            {flowState === 'success' ? 'Welcome!' : 'Sign In'}
          </Text>

          {/* Subtitle */}
          <Text
            style={{
              fontSize: 14,
              color: LightMode.colorTextSecondary,
              marginBottom: 24,
            }}
          >
            {flowState === 'success'
              ? 'You are successfully signed in'
              : 'Create or log into your account to save your events'}
          </Text>

          {/* Success State */}
          {flowState === 'success' && (
            <View style={{ alignItems: 'center', marginVertical: 16 }}>
              <Ionicons name="checkmark-circle" size={48} color="#10b981" />
            </View>
          )}

          {/* Loading State */}
          {flowState === 'loading' && (
            <View
              style={{
                alignItems: 'center',
                paddingVertical: 24,
              }}
            >
              <ActivityIndicator
                size="large"
                color={LightMode.colorTextPrimary}
              />
              <Text
                style={{
                  fontSize: 14,
                  color: LightMode.colorTextSecondary,
                  marginTop: 12,
                  textAlign: 'center',
                }}
              >
                Completing sign-in...
              </Text>
            </View>
          )}

          {/* Error State */}
          {flowState === 'error' && errorMessage && (
            <View
              style={{
                backgroundColor: '#fee2e2',
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: '#dc2626',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: '#991b1b',
                  fontWeight: '600',
                }}
              >
                Sign-in Error
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: '#7f1d1d',
                  marginTop: 4,
                }}
              >
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Google Sign-In Button */}
          {flowState !== 'success' && (
            <>
              <TouchableOpacity
                onPress={handleGoogleSignIn}
                disabled={flowState === 'loading'}
                style={{
                  borderWidth: 1,
                  borderColor: LightMode.colorBorderPrimary,
                  borderRadius: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  marginBottom: 12,
                  opacity: flowState === 'loading' ? 0.6 : 1,
                }}
              >
                {flowState === 'loading' ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color={LightMode.colorTextPrimary}
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: LightMode.colorTextPrimary,
                      }}
                    >
                      Signing in...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons
                      name="logo-google"
                      size={20}
                      color={LightMode.colorTextPrimary}
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: LightMode.colorTextPrimary,
                      }}
                    >
                      Continue with Google
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Continue as Guest */}
              <TouchableOpacity
                onPress={handleGuestContinue}
                disabled={flowState === 'loading'}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: flowState === 'loading' ? 0.6 : 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: LightMode.colorTextSecondary,
                  }}
                >
                  Continue as Guest
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Terms */}
          <Text
            style={{
              fontSize: 12,
              color: LightMode.colorTextTertiary,
              marginTop: 16,
              textAlign: 'center',
            }}
          >
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>

          {/* Retry Button - Error State Only */}
          {flowState === 'error' && (
            <TouchableOpacity
              onPress={() => setFlowState('initial')}
              style={{
                marginTop: 16,
                paddingVertical: 12,
                paddingHorizontal: 16,
                backgroundColor: LightMode.colorTextSecondary,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: Palette.colorWhite,
                }}
              >
                Try Again
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
