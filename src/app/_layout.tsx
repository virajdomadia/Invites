import '../global.css';
import { Stack } from 'expo-router';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useEffect, useRef } from 'react';
import { router } from 'expo-router';

export default function RootLayout() {
  const auth = useAuth();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;

      if (!auth.isAuthenticated) {
        router.replace('/login');
      } else {
        router.replace('/');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
      <Stack.Screen name="(home)" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
