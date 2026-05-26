import React from 'react';
import {
  Input as GluestackInput,
  InputField,
  InputIcon,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlHelper,
  FormControlHelperText,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from '@gluestack-ui/themed';
import { AlertCircle } from 'lucide-react-native';

interface CustomInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  type?: 'text' | 'password' | 'email' | 'number';
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  isDisabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  testID?: string;
}

export const Input: React.FC<CustomInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  type = 'text',
  error,
  helperText,
  icon,
  isDisabled = false,
  size = 'md',
  testID,
}) => {
  return (
    <FormControl isInvalid={!!error} isDisabled={isDisabled}>
      {label && (
        <FormControlLabel mb="$2">
          <FormControlLabelText>{label}</FormControlLabelText>
        </FormControlLabel>
      )}
      <GluestackInput
        size={size}
        sx={{
          _focus: {
            borderColor: '$primary600',
          },
        }}
      >
        {icon && <InputIcon as={icon} ml="$3" />}
        <InputField
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          type={type}
          editable={!isDisabled}
          testID={testID}
        />
      </GluestackInput>
      {helperText && !error && (
        <FormControlHelper mt="$1">
          <FormControlHelperText>{helperText}</FormControlHelperText>
        </FormControlHelper>
      )}
      {error && (
        <FormControlError mt="$1">
          <FormControlErrorIcon as={AlertCircle} />
          <FormControlErrorText>{error}</FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
};
