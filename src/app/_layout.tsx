import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  CaveatBrush_400Regular,
} from '@expo-google-fonts/caveat-brush';
import {
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
} from '@expo-google-fonts/lexend';
import {
  Literata_400Regular,
  Literata_500Medium,
  Literata_600SemiBold,
} from '@expo-google-fonts/literata';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    CaveatBrush_400Regular,
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Literata_400Regular,
    Literata_500Medium,
    Literata_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </SafeAreaProvider>
  );
}
