import React, { useState, useCallback } from 'react';
import SignInModal from '@/components/modals/SignInModal';
import { useGoogleSignIn } from '@/core/hooks/useGoogleSignIn';
import { googleOAuthService } from './google-oauth-service';

interface OAuthIntegrationExampleProps {
  onSignInSuccess?: (user: { id: string; email: string; name: string }) => void;
  onGuestContinue?: () => void;
}

export function OAuthIntegrationExample({
  onSignInSuccess,
  onGuestContinue,
}: OAuthIntegrationExampleProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const { signIn: googleSignIn } = useGoogleSignIn();

  const handleGoogleSignInStart = useCallback(async () => {
    const tokens = await googleSignIn();

    const authResponse = await googleOAuthService.exchangeTokenForSession(
      tokens.idToken
    );

    return {
      idToken: tokens.idToken,
      email: authResponse.user.email,
      name: authResponse.user.name,
    };
  }, [googleSignIn]);

  const handleGoogleSignInSuccess = useCallback(
    (tokens: { idToken: string; email: string; name: string }) => {
      onSignInSuccess?.({
        id: tokens.email,
        email: tokens.email,
        name: tokens.name,
      });
    },
    [onSignInSuccess]
  );

  const handleGuestContinue = useCallback(() => {
    onGuestContinue?.();
  }, [onGuestContinue]);

  return (
    <>
      <SignInModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onGoogleSignInStart={handleGoogleSignInStart}
        onGoogleSignInSuccess={handleGoogleSignInSuccess}
        onGuestContinue={handleGuestContinue}
      />
    </>
  );
}

export default OAuthIntegrationExample;
