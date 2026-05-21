import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Modal,
  useWindowDimensions,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Palette, LightMode } from '@/theme';

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
            disabled={step === 'loading'}
            style={{
              alignSelf: 'flex-end',
              marginBottom: 16,
              padding: 8,
              opacity: step === 'loading' ? 0.5 : 1,
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
            {step === 'success'
              ? 'Verified!'
              : title || (mode === 'merge' ? 'Merge Account' : 'Verify Phone Number')}
          </Text>

          {/* Subtitle */}
          <Text
            style={{
              fontSize: 14,
              color: LightMode.colorTextSecondary,
              marginBottom: 24,
            }}
          >
            {step === 'success'
              ? 'Your phone number has been verified'
              : subtitle ||
                (mode === 'merge'
                  ? 'Enter your phone number to recover your account'
                  : 'Enter your phone number to verify')}
          </Text>

          {/* Success State */}
          {step === 'success' && (
            <View style={{ alignItems: 'center', marginVertical: 16 }}>
              <Ionicons name="checkmark-circle" size={48} color="#10b981" />
            </View>
          )}

          {/* Loading State */}
          {step === 'loading' && (
            <View style={{ alignItems: 'center', paddingVertical: 24 }}>
              <ActivityIndicator size="large" color={LightMode.colorTextPrimary} />
              <Text
                style={{
                  fontSize: 14,
                  color: LightMode.colorTextSecondary,
                  marginTop: 12,
                  textAlign: 'center',
                }}
              >
                {step === 'loading' && step !== 'otp-input'
                  ? 'Sending OTP...'
                  : 'Verifying...'}
              </Text>
            </View>
          )}

          {/* Error State */}
          {(step === 'error' || (step === 'phone-input' && errorMessage)) &&
            errorMessage && (
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
                  Error
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

          {/* Phone Number Input */}
          {step === 'phone-input' && (
            <>
              <View
                style={{
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: LightMode.colorTextPrimary,
                    marginBottom: 8,
                  }}
                >
                  Phone Number
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: LightMode.colorBorderPrimary,
                    borderRadius: 12,
                    paddingHorizontal: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: LightMode.colorTextSecondary,
                      fontWeight: '600',
                    }}
                  >
                    +91
                  </Text>
                  <TextInput
                    placeholder="9876543210"
                    placeholderTextColor={LightMode.colorTextTertiary}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    editable={step === 'phone-input'}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      paddingHorizontal: 12,
                      fontSize: 16,
                      color: LightMode.colorTextPrimary,
                    }}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    color: LightMode.colorTextTertiary,
                    marginTop: 6,
                  }}
                >
                  We'll send an OTP to verify your number
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleSendOTP}
                disabled={!isPhoneValid || step === 'loading'}
                style={{
                  backgroundColor: isPhoneValid
                    ? LightMode.colorTextPrimary
                    : LightMode.colorTextTertiary,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                  opacity: !isPhoneValid ? 0.6 : 1,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: Palette.colorWhite,
                  }}
                >
                  Send OTP
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* OTP Input */}
          {step === 'otp-input' && (
            <>
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: LightMode.colorTextPrimary,
                    marginBottom: 8,
                  }}
                >
                  Enter OTP
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: LightMode.colorTextSecondary,
                    marginBottom: 12,
                  }}
                >
                  A 4-digit code was sent to +91{phoneNumber}
                </Text>
                <TextInput
                  placeholder="0000"
                  placeholderTextColor={LightMode.colorTextTertiary}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={4}
                  style={{
                    borderWidth: 1,
                    borderColor: LightMode.colorBorderPrimary,
                    borderRadius: 12,
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    fontSize: 32,
                    fontWeight: '600',
                    color: LightMode.colorTextPrimary,
                    textAlign: 'center',
                    letterSpacing: 8,
                  }}
                />
              </View>

              <TouchableOpacity
                onPress={handleVerifyOTP}
                disabled={!isOtpValid || step === 'loading'}
                style={{
                  backgroundColor: isOtpValid
                    ? LightMode.colorTextPrimary
                    : LightMode.colorTextTertiary,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                  opacity: !isOtpValid ? 0.6 : 1,
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: Palette.colorWhite,
                  }}
                >
                  Verify OTP
                </Text>
              </TouchableOpacity>

              {otpResendTimer > 0 ? (
                <Text
                  style={{
                    fontSize: 12,
                    color: LightMode.colorTextTertiary,
                    textAlign: 'center',
                  }}
                >
                  Resend OTP in {otpResendTimer}s
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResendOTP}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: LightMode.colorTextPrimary,
                      textAlign: 'center',
                      fontWeight: '600',
                    }}
                  >
                    Resend OTP
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Retry Button - Error State Only */}
          {step === 'error' && (
            <TouchableOpacity
              onPress={() => {
                setStep('phone-input');
                setErrorMessage(null);
              }}
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
