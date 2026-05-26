import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { type EventDetailsResponse } from '@/services/eventApi';
import { EditActionsBar } from '@/components/features/events/EditActionsBar';
import { CircleActionButton } from '@/components/shared/CircleActionButton';

interface DateTimeCardProps {
  date?: string;
  dateSubtext?: string;
  startTime?: string;
  endTime?: string;
  timeNotes?: string;
  timezoneLabel?: string;
  localTime?: string;
  eventId?: string;
  eventData?: EventDetailsResponse | null;
  colors?: {
    primaryPanel?: string;
    secondary?: string;
    text?: string;
  };
  delay?: number;
  ishost?: boolean;
  onEdit?: () => void;
  backgroundColor?: string;
}

type EventDetailsScreenRouteProp = RouteProp<{ EventDetails: { eventId: string } }, 'EventDetails'>;
type NavigationProp = NativeStackNavigationProp<any, 'EventDetails'>;

export const DateTimeCard: React.FC<DateTimeCardProps> = ({
  date,
  dateSubtext,
  startTime,
  endTime,
  timeNotes,
  timezoneLabel,
  localTime,
  eventId,
  eventData,
  delay = 0.3,
  ishost = false,
  onEdit,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EventDetailsScreenRouteProp>();
  const routeEventId = route.params?.eventId;
  const effectiveEventId = eventId || routeEventId;

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500, delay: delay * 1000 });
    translateY.value = withTiming(0, { duration: 500, delay: delay * 1000 });
  }, [opacity, translateY, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const primaryBgColor = eventData?.event?.theme_instance_data?.theme_data?.colors?.panel;
  const fontColor = eventData?.event?.theme_instance_data?.theme_data?.colors?.text;
  const iconColor = eventData?.event?.theme_instance_data?.theme_data?.colors?.icons;
  const subtextColor = '#535862';

  const handleEditPress = () => {
    if (onEdit) {
      onEdit();
    } else if (effectiveEventId) {
      navigation.navigate('EditDateTime', { eventId: effectiveEventId });
    }
  };

  const timeDisplay = startTime
    ? `${startTime}${endTime && startTime !== endTime ? ` - ${endTime}` : !endTime ? ' Onwards' : ''}${timezoneLabel ? ` ${timezoneLabel}` : ''}`
    : 'Time not finalized';

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: primaryBgColor },
          animatedStyle,
        ]}
      >
        {/* Date Section */}
        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="calendar-heart"
              size={24}
              color={iconColor}
            />
          </View>
          <View style={styles.contentContainer}>
            <Text
              style={[
                styles.mainText,
                { color: fontColor },
              ]}
            >
              {date || 'Date not finalized'}
            </Text>
            {dateSubtext && (
              <Text
                style={[
                  styles.subtextText,
                  { color: subtextColor },
                ]}
              >
                {dateSubtext}
              </Text>
            )}
          </View>
        </View>

        {/* Divider */}
        <View
          style={[
            styles.divider,
            { backgroundColor: fontColor, opacity: 0.05 },
          ]}
        />

        {/* Time Section */}
        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={24}
              color={iconColor}
            />
          </View>
          <View style={styles.contentContainer}>
            <Text
              style={[
                styles.mainText,
                { color: fontColor },
              ]}
            >
              {timeDisplay}
            </Text>
            {localTime && (
              <Text
                style={[
                  styles.localTimeText,
                  { color: subtextColor },
                ]}
              >
                {localTime} <Text style={{ color: '#a4a7ae' }}>(Local Time)</Text>
              </Text>
            )}
            {timeNotes && (
              <Text
                style={[
                  styles.notesText,
                  { color: subtextColor },
                ]}
              >
                {timeNotes}
              </Text>
            )}
          </View>
        </View>
      </Animated.View>

      {/* Edit Action Bar - Host Mode Only */}
      {ishost && (
        <EditActionsBar
          primaryBgColor={fontColor}
          ishost={ishost}
          fontColor={fontColor}
        >
          <View style={styles.actionButton}>
            <CircleActionButton
              icon={
                <MaterialCommunityIcons
                  name="pencil"
                  size={16}
                  color={primaryBgColor}
                />
              }
              label="Edit"
              ariaLabel="Edit Date and Time"
              onPress={handleEditPress}
              textColor={primaryBgColor}
            />
          </View>
        </EditActionsBar>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingHorizontal: 16,
  },
  iconContainer: {
    paddingTop: 2,
    justifyContent: 'flex-start',
  },
  contentContainer: {
    flex: 1,
    gap: 4,
  },
  mainText: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '600',
    fontFamily: 'Lexend',
    textAlign: 'left',
  },
  subtextText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: 'Lexend',
    textAlign: 'left',
  },
  notesText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: 'Lexend',
    textAlign: 'left',
  },
  localTimeText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: 'Lexend',
    textAlign: 'left',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  actionButton: {
    flex: 1,
  },
});
