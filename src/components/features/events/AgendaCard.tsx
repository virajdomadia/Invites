import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Animated as RNAnimated,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import MarkdownDisplay from 'react-native-markdown-display';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { type EventDetailsResponse } from '@/services/eventApi';
import { CircleActionButton } from '@/components/shared/CircleActionButton';
import { EditActionsBar } from '@/components/features/events/EditActionsBar';

dayjs.extend(utc);
dayjs.extend(timezone);

interface AgendaItem {
  id: string;
  title: string;
  short_description?: string;
  imageUrl?: string;
  start_timestamp?: string;
  timezone?: string;
  day_date?: string;
}

interface AgendaDay {
  date?: string;
  items?: AgendaItem[];
}

interface AgendaCardProps {
  days?: AgendaDay[];
  eventId?: string;
  eventData?: EventDetailsResponse | null;
  ishost?: boolean;
  delay?: number;
}

type EventDetailsScreenRouteProp = RouteProp<{ EventDetails: { eventId: string } }, 'EventDetails'>;
type NavigationProp = NativeStackNavigationProp<any, 'EventDetails'>;

const toTitleCase = (text: string): string => {
  return text.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const formatTimeFromTimestamp = (timestamp: string | null, tz: string | null): string => {
  if (!timestamp) return '';
  try {
    return dayjs.utc(timestamp).tz(tz ?? 'Asia/Kolkata').format('h:mm A');
  } catch {
    return '';
  }
};

export const AgendaCard: React.FC<AgendaCardProps> = ({
  days = [],
  eventId,
  eventData,
  ishost = false,
  delay = 0.3,
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

  const panelBgColor = eventData?.event?.theme_instance_data?.theme_data?.colors?.panel;
  const fontColor = eventData?.event?.theme_instance_data?.theme_data?.colors?.text;
  const iconColor = eventData?.event?.theme_instance_data?.theme_data?.colors?.icons;

  const selectedDay = days[0];
  const allItems = days.length > 0
    ? days.flatMap(day => (day.items || []).map(item => ({
        ...item,
        time: formatTimeFromTimestamp((item as any).start_timestamp || '', (item as any).timezone),
      })))
    : [];

  const firstItemWithDate = allItems.find((item: any) => (item as any).day_date) as any;
  const formattedItemDate = firstItemWithDate?.day_date
    ? new Date(firstItemWithDate.day_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  const displayDate = formattedItemDate || selectedDay?.date || 'Date not finalized';

  const primaryColor = panelBgColor;
  const textColor = fontColor;
  const useIconColor = iconColor;

  const markdownStyles = {
    text: {
      color: textColor,
      fontSize: 14,
      lineHeight: 20,
    },
    paragraph: {
      color: textColor,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 4,
    },
  };

  const handleEditPress = () => {
    if (effectiveEventId) {
      navigation.navigate('EditDateTime', { eventId: effectiveEventId });
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: primaryColor },
          animatedStyle,
        ]}
      >
        {/* Header with Icon and Title */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="calendar"
              size={24}
              color={useIconColor}
            />
          </View>
          <View style={styles.headerContent}>
            <Text
              style={[
                styles.dateText,
                { color: textColor },
              ]}
            >
              {displayDate}
            </Text>
          </View>
        </View>

        {/* Timeline Items */}
        {allItems.length > 0 && (
          <View style={styles.timelineContainer}>
            {allItems.map((item, index) => {
              const isLastItem = index === allItems.length - 1;
              return (
                <View key={item.id} style={styles.timelineItem}>
                  {/* Timeline Left Column - Icon and Connector */}
                  <View style={styles.timelineIconColumn}>
                    {/* Icon Circle */}
                    <View
                      style={[
                        styles.timelineIcon,
                        { borderColor: primaryColor },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="star"
                        size={16}
                        color={useIconColor}
                      />
                    </View>

                    {/* Connector Line */}
                    {!isLastItem && (
                      <View
                        style={[
                          styles.connectorLine,
                          { backgroundColor: useIconColor },
                        ]}
                      />
                    )}
                  </View>

                  {/* Timeline Right Column - Content */}
                  <View style={styles.timelineContent}>
                    {/* Time */}
                    <Text
                      style={[
                        styles.timeText,
                        { color: textColor },
                      ]}
                    >
                      {item.time}
                    </Text>

                    {/* Title */}
                    <Text
                      style={[
                        styles.itemTitle,
                        { color: textColor },
                      ]}
                    >
                      {toTitleCase(item.title)}
                    </Text>

                    {/* Description */}
                    {item.short_description && item.short_description.trim() && (
                      <View style={styles.descriptionContainer}>
                        <MarkdownDisplay style={markdownStyles}>
                          {item.short_description}
                        </MarkdownDisplay>
                      </View>
                    )}

                    {/* Image thumbnail */}
                    {item.imageUrl && (
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.itemImage}
                        resizeMode="cover"
                      />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
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
                  color={primaryColor}
                />
              }
              label="Edit"
              ariaLabel="Edit Agenda"
              onPress={handleEditPress}
              textColor={primaryColor}
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  iconContainer: {
    paddingTop: 2,
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Lexend',
    lineHeight: 28,
  },
  timelineContainer: {
    paddingHorizontal: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  timelineIconColumn: {
    alignItems: 'center',
    paddingRight: 12,
    paddingTop: 4,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  connectorLine: {
    width: 2,
    height: 24,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Lexend',
    lineHeight: 20,
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Lexend',
    lineHeight: 20,
    marginBottom: 6,
  },
  descriptionContainer: {
    marginBottom: 8,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
});
