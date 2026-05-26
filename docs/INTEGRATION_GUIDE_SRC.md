# EventDetailsScreen Integration Guide

## Overview
`EventDetailsScreen` is a React Native screen that displays event details. It replaces the Next.js `NewHomePage` for native mobile applications.

## Setup Steps

### 1. Update Navigation Stack

In your main navigation file (e.g., `RootNavigator.tsx`):

```tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';

import HomeScreen from '@/screens/HomeScreen';
import EventDetailsScreen from '@/screens/EventDetailsScreen';
import AttendingRsvpScreen from '@/screens/AttendingRsvpScreen';
import EditDateTimeScreen from '@/screens/EditDateTimeScreen';
import EditLocationScreen from '@/screens/EditLocationScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen 
          name="EventDetails" 
          component={EventDetailsScreen}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen name="AttendingRsvp" component={AttendingRsvpScreen} />
        <Stack.Screen name="EditDateTime" component={EditDateTimeScreen} />
        <Stack.Screen name="EditLocation" component={EditLocationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 2. Update Home Screen CTA Buttons

In your home screen, update the event CTA button to navigate to EventDetails:

```tsx
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  };

  return (
    // Your home screen JSX
    <TouchableOpacity onPress={() => handleEventPress(event.id)}>
      <Text>View Event</Text>
    </TouchableOpacity>
  );
}
```

### 3. Component Compatibility

The EventDetailsScreen reuses your existing components:
- `EventHeroCard`
- `DateTimeCard`
- `LocationCard`
- `RsvpFloatingActionBar`
- `AgendaCard`
- `ExpandableZapigoBranding`

**Note:** These components may need to be adapted to React Native if they're currently web-only. They should:
- Use React Native components (View, Text, ScrollView, etc.)
- Use StyleSheet instead of Tailwind classes
- Use react-native-gesture-handler for interactions
- Handle platform-specific code if needed

### 4. Required Dependencies

Make sure you have these installed:
```bash
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
npm install @tanstack/react-query
```

### 5. Data Flow

```
HomeScreen (CTA Button)
    ↓ (navigation.navigate with eventId)
EventDetailsScreen
    ├── Fetches event data via fetchEventById
    ├── Loads event config and links
    ├── Displays event details with theme colors
    └── Handles RSVP and navigation to child screens
```

## Key Differences from Next.js Version

1. **Navigation**: Uses React Navigation instead of Next.js router
   - `useNavigation()` for navigation
   - `useRoute()` for accessing route params
   - Named routes instead of file-based routing

2. **Responsive Design**: Single mobile layout (no desktop view)
   - Removed `md:hidden` and `hidden md:block`
   - No `isMobile` prop usage

3. **Styling**: React Native StyleSheet
   - Replaced Tailwind classes
   - Absolute positioning for back button

4. **Tab Management**: Simplified
   - Removed tab switching logic for now
   - Can be added back if needed with bottom tab navigator

5. **Error Handling**: Simple error state with retry button

## Component Props Updates

If your child components are web-based, you'll need to adapt them:

```tsx
// Before (Web)
<DateTimeCard
  isMobile={true}
  className="mt-4"
  // ...
/>

// After (React Native)
<View style={styles.cardContainer}>
  <DateTimeCard
    // Remove isMobile prop
    // Remove className prop
    // ...
  />
</View>
```

## Navigation Routes

The EventDetailsScreen navigates to these routes (create screens for them):

- `AttendingRsvp` - RSVP response selection
- `EditDateTime` - Edit event date/time
- `EditLocation` - Edit event location
- `Market` - Marketplace (from BottomNavigation)

## Testing

```tsx
// Test navigation to EventDetails
it('should navigate to EventDetails with eventId', () => {
  const navigation = useNavigation();
  navigation.navigate('EventDetails', { eventId: 'test-123' });
  // Assert screen is rendered
});
```

## Migration Checklist

- [ ] Add RootStackParamList to your navigation types
- [ ] Create/update RootNavigator with EventDetails screen
- [ ] Update HomeScreen to navigate with `eventId`
- [ ] Adapt child components to React Native (if needed)
- [ ] Create remaining screen components (AttendingRsvp, EditDateTime, EditLocation)
- [ ] Test navigation flow from home to event details
- [ ] Test data loading and error states
- [ ] Test RSVP functionality
