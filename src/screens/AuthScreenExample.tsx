/**
 * Complete Example: Google OAuth + Phone Verification Flow
 *
 * This screen demonstrates the full authentication flow:
 * 1. User signs in with Google
 * 2. If new user, offer account merge option
 * 3. If hosting event, collect phone number
 * 4. Verify phone with OTP
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SignInModal from '@/components/modals/SignInModal';
import PhoneVerificationModal from '@/components/modals/PhoneVerificationModal';
import { useAuthStore, useGoogleSignIn } from '@/core';
import { Palette, LightMode } from '@/theme';

type AuthStep = 'sign-in' | 'merge-prompt' | 'phone-verification' | 'signed-in';

export default function AuthScreenExample() {
  const [authStep, setAuthStep] = useState<AuthStep>('sign-in');
  const [signInModalVisible, setSignInModalVisible] = useState(false);
  const [phoneVerificationVisible, setPhoneVerificationVisible] = useState(false);
  const [phoneVerificationMode, setPhoneVerificationMode] = useState<'verify' | 'merge'>('verify');

  // Auth state management
  const { signIn: googleSignIn } = useGoogleSignIn();
  const {
    user,
    isNewUser,
    isLoading,
    signInWithGoogle,
    verifyPhoneNumber,
    mergePhoneAccount,
    signOut,
  } = useAuthStore();

  // ============================================================================
  // Google Sign-In Handler
  // ============================================================================

  const handleGoogleSignInStart = useCallback(async () => {
    const tokens = await googleSignIn();
    return tokens;
  }, [googleSignIn]);

  const handleGoogleSignInSuccess = useCallback(
    async (tokens: { idToken: string; email: string; name: string }) => {
      try {
        await signInWithGoogle(tokens.idToken, tokens.email, tokens.name);

        // Check if this is a new user
        const store = useAuthStore.getState();
        if (store.isNewUser) {
          // Prompt merge option
          setAuthStep('merge-prompt');
        } else {
          // Existing user, signed in successfully
          setAuthStep('signed-in');
          setSignInModalVisible(false);
        }
      } catch (error) {
        console.error('Sign-in failed:', error);
      }
    },
    [signInWithGoogle]
  );

  const handleGuestContinue = useCallback(() => {
    // Implement guest flow if needed
    console.log('Guest continue');
    setSignInModalVisible(false);
  }, []);

  // ============================================================================
  // Phone Verification Handlers
  // ============================================================================

  const handleSendPhoneOTP = useCallback(async (phoneNumber: string) => {
    // OTP will be sent by backend
    console.log('Sending OTP to:', phoneNumber);
    // Backend handles this via POST /c56/auth/send-phone-otp
  }, []);

  const handleVerifyPhoneOTP = useCallback(
    async (phoneNumber: string, otp: string) => {
      try {
        await verifyPhoneNumber(phoneNumber, otp);
        setPhoneVerificationVisible(false);
      } catch (error) {
        console.error('Phone verification failed:', error);
        throw error;
      }
    },
    [verifyPhoneNumber]
  );

  const handleMergePhoneOTP = useCallback(
    async (phoneNumber: string, otp: string) => {
      try {
        await mergePhoneAccount(phoneNumber, otp);
        setPhoneVerificationVisible(false);
        setAuthStep('signed-in');
      } catch (error) {
        console.error('Account merge failed:', error);
        throw error;
      }
    },
    [mergePhoneAccount]
  );

  // ============================================================================
  // UI Handlers
  // ============================================================================

  const handleStartPhoneVerification = useCallback(() => {
    setPhoneVerificationMode('verify');
    setPhoneVerificationVisible(true);
  }, []);

  const handleStartAccountMerge = useCallback(() => {
    setPhoneVerificationMode('merge');
    setPhoneVerificationVisible(true);
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      setAuthStep('sign-in');
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  }, [signOut]);

  // ============================================================================
  // Render: Sign-In Step
  // ============================================================================

  if (authStep === 'sign-in') {
    return (
      <View style={{ flex: 1, backgroundColor: Palette.colorWhite }}>
        <SignInModal
          visible={signInModalVisible}
          onClose={() => setSignInModalVisible(false)}
          onGoogleSignInStart={handleGoogleSignInStart}
          onGoogleSignInSuccess={handleGoogleSignInSuccess}
          onGuestContinue={handleGuestContinue}
        />

        <ScrollView
          contentContainerStyle={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight: '700',
              color: LightMode.colorTextPrimary,
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            Welcome to Invites
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: LightMode.colorTextSecondary,
              marginBottom: 32,
              textAlign: 'center',
            }}
          >
            Sign in to manage your events
          </Text>

          <TouchableOpacity
            onPress={() => setSignInModalVisible(true)}
            style={{
              backgroundColor: LightMode.colorTextPrimary,
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 12,
              marginBottom: 16,
              width: '100%',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: Palette.colorWhite,
              }}
            >
              Sign In
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ============================================================================
  // Render: Merge Prompt (for new users)
  // ============================================================================

  if (authStep === 'merge-prompt') {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Palette.colorWhite,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}
      >
        <PhoneVerificationModal
          visible={phoneVerificationVisible}
          onClose={() => setPhoneVerificationVisible(false)}
          onMergeAccount={handleMergePhoneOTP}
          mode="merge"
          title="Have an Existing Account?"
          subtitle="Enter your phone number to recover your account with your events"
        />

        <Ionicons
          name="help-circle"
          size={64}
          color={LightMode.colorTextSecondary}
          style={{ marginBottom: 24 }}
        />

        <Text
          style={{
            fontSize: 24,
            fontWeight: '700',
            color: LightMode.colorTextPrimary,
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          New or Returning?
        </Text>

        <Text
          style={{
            fontSize: 16,
            color: LightMode.colorTextSecondary,
            marginBottom: 32,
            textAlign: 'center',
          }}
        >
          Do you have an existing account we can merge with your Google login?
        </Text>

        <TouchableOpacity
          onPress={handleStartAccountMerge}
          style={{
            backgroundColor: LightMode.colorTextPrimary,
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 12,
            marginBottom: 12,
            width: '100%',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: Palette.colorWhite,
            }}
          >
            Yes, Merge My Account
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setAuthStep('signed-in')}
          style={{
            backgroundColor: LightMode.colorBorderPrimary,
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 12,
            width: '100%',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: LightMode.colorTextPrimary,
            }}
          >
            No, Continue as New User
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ============================================================================
  // Render: Signed-In State
  // ============================================================================

  if (authStep === 'signed-in') {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Palette.colorWhite,
          paddingHorizontal: 20,
          paddingVertical: 32,
        }}
      >
        <PhoneVerificationModal
          visible={phoneVerificationVisible}
          onClose={() => setPhoneVerificationVisible(false)}
          onSendOTP={handleSendPhoneOTP}
          onVerifyOTP={handleVerifyPhoneOTP}
          onMergeAccount={handleMergePhoneOTP}
          mode={phoneVerificationMode}
          title={
            phoneVerificationMode === 'merge'
              ? 'Merge Account'
              : 'Verify Phone Number'
          }
          subtitle={
            phoneVerificationMode === 'merge'
              ? 'Enter your phone number to recover your account'
              : 'Enter your phone number to start hosting events'
          }
        />

        <Text
          style={{
            fontSize: 32,
            fontWeight: '700',
            color: LightMode.colorTextPrimary,
            marginBottom: 8,
          }}
        >
          Welcome!
        </Text>

        <Text
          style={{
            fontSize: 16,
            color: LightMode.colorTextSecondary,
            marginBottom: 32,
          }}
        >
          You're signed in
        </Text>

        {/* User Info */}
        <View
          style={{
            backgroundColor: '#f5f5f5',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: LightMode.colorTextTertiary,
              marginBottom: 4,
            }}
          >
            Name
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: LightMode.colorTextPrimary,
              marginBottom: 16,
            }}
          >
            {user?.name}
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: LightMode.colorTextTertiary,
              marginBottom: 4,
            }}
          >
            Email
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: LightMode.colorTextPrimary,
              marginBottom: 16,
            }}
          >
            {user?.email}
          </Text>

          {user?.phone_number ? (
            <>
              <Text
                style={{
                  fontSize: 14,
                  color: LightMode.colorTextTertiary,
                  marginBottom: 4,
                }}
              >
                Phone
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: LightMode.colorTextPrimary,
                }}
              >
                {user.phone_number}
              </Text>
            </>
          ) : (
            <TouchableOpacity onPress={handleStartPhoneVerification}>
              <Text
                style={{
                  fontSize: 14,
                  color: LightMode.colorTextPrimary,
                  fontWeight: '600',
                }}
              >
                + Add Phone Number
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Actions */}
        <TouchableOpacity
          onPress={() => console.log('Go to events')}
          style={{
            backgroundColor: LightMode.colorTextPrimary,
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 12,
            marginBottom: 12,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: Palette.colorWhite,
            }}
          >
            Create Event
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSignOut}
          style={{
            backgroundColor: '#fee2e2',
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 12,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#991b1b',
            }}
          >
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}
