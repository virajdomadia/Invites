import React, { useState, useEffect } from 'react';
import { VStack, HStack, Text, Center, Box, Spinner } from '@gluestack-ui/themed';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

interface LoaderOverlayProps {
  showLogo?: boolean;
  loaderText?: string;
  rotatingWords?: string[];
  rotatingPrefix?: string;
  rotatingSuffix?: string;
  visible?: boolean;
}

const RotateWords: React.FC<{
  words: string[];
  prefix: string;
  suffix: string;
}> = ({ words, prefix, suffix }) => {
  const [index, setIndex] = useState(0);
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-100);

  useEffect(() => {
    if (!words || words.length === 0) return;

    const interval = setInterval(() => {
      setIndex(prevIndex => (prevIndex + 1) % words.length);
    }, 500);

    return () => clearInterval(interval);
  }, [words]);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 250 });
    translateX.value = withTiming(0, { duration: 250 });
  }, [index, opacity, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <VStack alignItems="center" mt="$6">
      <Text fontSize="$lg" color="$gray900" fontFamily="$literata" fontWeight="$normal" mb="$1">
        {prefix}
      </Text>
      <HStack alignItems="center" gap="$1.5" mt="$1">
        <Animated.Text style={[{ fontSize: 18, fontWeight: '600', color: '#CC056B', fontFamily: 'Literata' }, animatedStyle]}>
          {words[index]}
        </Animated.Text>
        <Text fontSize="$lg" color="$gray900" fontFamily="$literata" fontWeight="$normal">
          {suffix}
        </Text>
      </HStack>
    </VStack>
  );
};

export const LoaderOverlay: React.FC<LoaderOverlayProps> = ({
  showLogo = false,
  loaderText = '',
  rotatingWords,
  rotatingPrefix = 'Celebrations are the',
  rotatingSuffix = 'of India',
  visible = true,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <Center
      position="absolute"
      top="$0"
      left="$0"
      right="$0"
      bottom="$0"
      zIndex={100}
      bg="$white"
      minHeight="$full"
    >
      <VStack alignItems="center" space="lg">
        {showLogo && (
          <Box
            w="$44"
            h="$44"
            borderRadius="$full"
            bg="$rose600"
            justifyContent="center"
            alignItems="center"
            mb="$-8"
          >
            <Text
              fontSize="$9xl"
              fontWeight="$bold"
              color="$white"
              fontFamily="$lexend"
            >
              Z
            </Text>
          </Box>
        )}

        {Array.isArray(rotatingWords) && rotatingWords.length > 0 ? (
          <RotateWords
            words={rotatingWords}
            prefix={rotatingPrefix}
            suffix={rotatingSuffix}
          />
        ) : (
          loaderText && (
            <Text
              fontSize="$lg"
              color="$gray900"
              fontFamily="$literata"
              textAlign="center"
              mt="$8"
            >
              {loaderText}
            </Text>
          )
        )}

        <Center w="$56" h="$56" mt="$8">
          <Spinner size="large" color="$rose600" />
        </Center>
      </VStack>
    </Center>
  );
};

export default LoaderOverlay;
