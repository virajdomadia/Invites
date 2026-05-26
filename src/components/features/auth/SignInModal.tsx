import React, { useState, useCallback } from 'react';
import {
  Modal,
  VStack,
  HStack,
  ScrollView,
  Button,
  ButtonText,
  Text,
  Icon,
  Pressable,
  Center,
  Box,
  Heading,
} from '@gluestack-ui/themed';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  CheckCircle,
  LogIn,
  AlertCircle,
  Loader,
} from 'lucide-react-native';

type OAuthFlowState = 'initial' | 'loading' | 'success' | 'error';

interface SignInModalProps {
  visible: boolean;
  onClose: () => void;
  onGoogleSignInStart?: () => Promise<{ idToken: string; email: string; name: string; photoUrl?: string }>;
  onGoogleSignInSuccess?: (tokens: { idToken: string; email: string; name: string; photoUrl?: string }) => void;
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
  const [flowState, setFlowState] = useState<OAuthFlowState>('initial');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      setFlowState('loading');
      setErrorMessage(null);

      if (!onGoogleSignInStart) {
        throw new Error('Google Sign-In handler not configured');
      }

      console.log('[SignIn] Starting Google Sign-In...');
      const tokens = await onGoogleSignInStart();
      console.log('[SignIn] Got tokens:', { idToken: !!tokens.idToken, email: tokens.email });

      setFlowState('success');
      console.log('[SignIn] Calling onGoogleSignInSuccess...');
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
    <Modal isOpen={visible} onClose={handleCloseModal} size="full">
      <ScrollView
        w="$full"
        h="$full"
        bg="$white"
        px="$5"
        pt="$6"
        pb={`$${insets.bottom + 5}`}
      >
        <VStack space="md" pb="$8">
          {/* Close Button */}
          <HStack justifyContent="flex-end" mb="$4">
            <Pressable
              onPress={handleCloseModal}
              disabled={flowState === 'loading'}
              sx={{
                _pressed: {
                  opacity: 0.7,
                },
              }}
            >
              <Icon as={X} size="xl" color="$gray900" />
            </Pressable>
          </HStack>

          {/* Title */}
          <Heading size="2xl" mb="$2">
            {flowState === 'success' ? 'Welcome!' : 'Sign In'}
          </Heading>

          {/* Subtitle */}
          <Text size="md" color="$gray600" mb="$6">
            {flowState === 'success'
              ? 'You are successfully signed in'
              : 'Create or log into your account to save your events'}
          </Text>

          {/* Success State */}
          {flowState === 'success' && (
            <Center my="$4">
              <Icon as={CheckCircle} size="2xl" color="$success600" />
            </Center>
          )}

          {/* Loading State */}
          {flowState === 'loading' && (
            <Center py="$6">
              <VStack alignItems="center" space="md">
                <Icon as={Loader} size="2xl" color="$primary600" />
                <Text size="md" color="$gray600" textAlign="center">
                  Completing sign-in...
                </Text>
              </VStack>
            </Center>
          )}

          {/* Error State */}
          {flowState === 'error' && errorMessage && (
            <Box
              bg="$error100"
              borderLeftWidth={4}
              borderLeftColor="$error600"
              p="$3"
              mb="$4"
              borderRadius="$md"
            >
              <HStack space="sm" alignItems="flex-start">
                <Icon as={AlertCircle} color="$error600" size="md" mt="$1" />
                <VStack flex={1}>
                  <Text fontWeight="$bold" color="$error900" size="sm">
                    Sign-in Error
                  </Text>
                  <Text color="$error800" size="xs" mt="$1">
                    {errorMessage}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          )}

          {/* Google Sign-In Button */}
          {flowState !== 'success' && (
            <VStack space="sm">
              <Button
                size="lg"
                variant={flowState === 'loading' ? 'outline' : 'outline'}
                action="secondary"
                onPress={handleGoogleSignIn}
                disabled={flowState === 'loading'}
                mb="$3"
              >
                {flowState === 'loading' ? (
                  <>
                    <Icon as={Loader} mr="$2" />
                    <ButtonText>Signing in...</ButtonText>
                  </>
                ) : (
                  <>
                    <Icon as={LogIn} mr="$2" />
                    <ButtonText>Continue with Google</ButtonText>
                  </>
                )}
              </Button>

              {/* Continue as Guest */}
              <Button
                size="lg"
                variant="ghost"
                onPress={handleGuestContinue}
                disabled={flowState === 'loading'}
              >
                <ButtonText>Continue as Guest</ButtonText>
              </Button>
            </VStack>
          )}

          {/* Terms */}
          <Text
            size="xs"
            color="$gray600"
            mt="$4"
            textAlign="center"
          >
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>

          {/* Retry Button - Error State Only */}
          {flowState === 'error' && (
            <Button
              size="lg"
              mt="$4"
              onPress={() => setFlowState('initial')}
              action="secondary"
            >
              <ButtonText>Try Again</ButtonText>
            </Button>
          )}
        </VStack>
      </ScrollView>
    </Modal>
  );
}
