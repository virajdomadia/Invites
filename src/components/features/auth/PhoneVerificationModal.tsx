import React, { useState, useCallback, useEffect } from 'react';
import {
  Modal,
  VStack,
  HStack,
  Text,
  Pressable,
  ScrollView,
  Icon,
  Box,
  Heading,
  Center,
  Spinner,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from '@gluestack-ui/themed';
import { useWindowDimensions, TextInput as RNTextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, CheckCircle, AlertCircle } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';

type PhoneVerificationStep = 'phone-input' | 'otp-input' | 'loading' | 'success' | 'error';

interface PhoneVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSendOTP?: (phoneNumber: string) => Promise<void>;
  onVerifyOTP?: (phoneNumber: string, otp: string) => Promise<void>;
  onMergeAccount?: (phoneNumber: string, otp: string) => Promise<void>;
  mode?: 'verify' | 'merge'; // 'verify' for adding phone, 'merge' for account merge
  title?: string;
  subtitle?: string;
}

export default function PhoneVerificationModal({
  visible,
  onClose,
  onSendOTP,
  onVerifyOTP,
  onMergeAccount,
  mode = 'verify',
  title,
  subtitle,
}: PhoneVerificationModalProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [step, setStep] = useState<PhoneVerificationStep>('phone-input');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [otpResendTimer, setOtpResendTimer] = useState(0);

  useEffect(() => {
    if (otpResendTimer > 0) {
      const timer = setTimeout(() => setOtpResendTimer(otpResendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpResendTimer]);

  const handleSendOTP = useCallback(async () => {
    if (!phoneNumber.trim()) {
      setErrorMessage('Please enter a phone number');
      return;
    }

    try {
      setStep('loading');
      setErrorMessage(null);

      if (!onSendOTP) {
        throw new Error('OTP sender not configured');
      }

      await onSendOTP(phoneNumber);
      setStep('otp-input');
      setOtpResendTimer(60);
      setErrorMessage(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send OTP';
      setErrorMessage(message);
      setStep('phone-input');
    }
  }, [phoneNumber, onSendOTP]);

  const handleVerifyOTP = useCallback(async () => {
    if (!otp.trim() || otp.length < 4) {
      setErrorMessage('Please enter a valid OTP');
      return;
    }

    try {
      setStep('loading');
      setErrorMessage(null);

      if (mode === 'merge' && onMergeAccount) {
        await onMergeAccount(phoneNumber, otp);
      } else if (onVerifyOTP) {
        await onVerifyOTP(phoneNumber, otp);
      } else {
        throw new Error('Verification handler not configured');
      }

      setStep('success');
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed';
      setErrorMessage(message);
      setStep('error');
    }
  }, [otp, phoneNumber, mode, onVerifyOTP, onMergeAccount, onClose]);

  const handleResendOTP = useCallback(async () => {
    await handleSendOTP();
  }, [handleSendOTP]);

  const resetForm = useCallback(() => {
    setStep('phone-input');
    setPhoneNumber('');
    setOtp('');
    setErrorMessage(null);
    setOtpResendTimer(0);
  }, []);

  const handleCloseModal = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const isPhoneValid = phoneNumber.trim().length >= 10;
  const isOtpValid = otp.trim().length >= 4;

  return (
    <Modal isOpen={visible} onClose={handleCloseModal}>
      <VStack
        flex={1}
        bg="$white"
        borderTopLeftRadius="$3xl"
        borderTopRightRadius="$3xl"
        px="$5"
        pt="$6"
        pb={`$${insets.bottom + 5}`}
        justifyContent="flex-start"
      >
        {/* Close Button */}
        <HStack justifyContent="flex-end" mb="$4">
          <Pressable onPress={handleCloseModal} disabled={step === 'loading'} opacity={step === 'loading' ? 0.5 : 1}>
            <Icon as={X} size="lg" color="$gray900" />
          </Pressable>
        </HStack>

        <ScrollView showsVerticalScrollIndicator={true}>
          {/* Title */}
          <Heading size="2xl" mb="$2">
            {step === 'success' ? 'Verified!' : title || (mode === 'merge' ? 'Merge Account' : 'Verify Phone Number')}
          </Heading>

          {/* Subtitle */}
          <Text size="md" color="$gray600" mb="$6">
            {step === 'success'
              ? 'Your phone number has been verified'
              : subtitle || (mode === 'merge' ? 'Enter your phone number to recover your account' : 'Enter your phone number to verify')}
          </Text>

          {/* Success State */}
          {step === 'success' && (
            <Center my="$4">
              <Icon as={CheckCircle} size="4xl" color="$success600" />
            </Center>
          )}

          {/* Loading State */}
          {step === 'loading' && (
            <Center py="$6">
              <VStack alignItems="center" space="md">
                <Spinner size="large" color="$gray900" />
                <Text size="md" color="$gray600" textAlign="center">
                  {step === 'loading' && step !== 'otp-input' ? 'Sending OTP...' : 'Verifying...'}
                </Text>
              </VStack>
            </Center>
          )}

          {/* Error State */}
          {(step === 'error' || (step === 'phone-input' && errorMessage)) && errorMessage && (
            <Box bg="$error100" borderLeftWidth={4} borderLeftColor="$error600" p="$3" mb="$4" borderRadius="$md">
              <HStack space="sm" alignItems="flex-start">
                <Icon as={AlertCircle} color="$error600" size="md" mt="$1" />
                <VStack flex={1}>
                  <Text fontWeight="$bold" color="$error900" size="sm">
                    Error
                  </Text>
                  <Text color="$error800" size="xs" mt="$1">
                    {errorMessage}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          )}

          {/* Phone Number Input */}
          {step === 'phone-input' && (
            <VStack space="md" mb="$4">
              <FormControl>
                <FormControlLabel mb="$2">
                  <FormControlLabelText>Phone Number</FormControlLabelText>
                </FormControlLabel>
                <HStack
                  borderWidth={1}
                  borderColor="$gray300"
                  borderRadius="$lg"
                  alignItems="center"
                  px="$3"
                >
                  <Text fontSize="$lg" fontWeight="$600" color="$gray600">
                    +91
                  </Text>
                  <RNTextInput
                    placeholder="9876543210"
                    placeholderTextColor="$gray500"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    editable={step === 'phone-input'}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      paddingHorizontal: 12,
                      fontSize: 16,
                      color: '#1f2937',
                    }}
                  />
                </HStack>
              </FormControl>
              <Text size="xs" color="$gray600">
                We&apos;ll send an OTP to verify your number
              </Text>

              <Button
                variant="primary"
                size="lg"
                onPress={handleSendOTP}
                isDisabled={!isPhoneValid || step === 'loading'}
              >
                Send OTP
              </Button>
            </VStack>
          )}

          {/* OTP Input */}
          {step === 'otp-input' && (
            <VStack space="md" mb="$4">
              <FormControl>
                <FormControlLabel mb="$2">
                  <FormControlLabelText>Enter OTP</FormControlLabelText>
                </FormControlLabel>
                <Text size="sm" color="$gray600" mb="$2">
                  A 4-digit code was sent to +91{phoneNumber}
                </Text>
                <Box borderWidth={1} borderColor="$gray300" borderRadius="$lg" px="$3" py="$3">
                  <RNTextInput
                    placeholder="0000"
                    placeholderTextColor="$gray500"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={4}
                    style={{
                      fontSize: 32,
                      fontWeight: '600',
                      color: '#1f2937',
                      textAlign: 'center',
                      letterSpacing: 8,
                    }}
                  />
                </Box>
              </FormControl>

              <Button
                variant="primary"
                size="lg"
                onPress={handleVerifyOTP}
                isDisabled={!isOtpValid || step === 'loading'}
              >
                Verify OTP
              </Button>

              {otpResendTimer > 0 ? (
                <Text size="xs" color="$gray600" textAlign="center">
                  Resend OTP in {otpResendTimer}s
                </Text>
              ) : (
                <Pressable onPress={handleResendOTP}>
                  <Text size="xs" color="$gray900" textAlign="center" fontWeight="$600">
                    Resend OTP
                  </Text>
                </Pressable>
              )}
            </VStack>
          )}

          {/* Retry Button - Error State Only */}
          {step === 'error' && (
            <Button
              variant="secondary"
              size="lg"
              mt="$4"
              onPress={() => {
                setStep('phone-input');
                setErrorMessage(null);
              }}
            >
              Try Again
            </Button>
          )}
        </ScrollView>
      </VStack>
    </Modal>
  );
}
