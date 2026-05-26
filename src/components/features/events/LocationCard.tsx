import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MarkdownDisplay from 'react-native-markdown-display';

import { type EventDetailsResponse } from '@/services/eventApi';
import { CircleActionButton } from '@/components/shared/CircleActionButton';
import { EditActionsBar } from '@/components/features/events/EditActionsBar';

interface LocationCardProps {
  venueName?: string;
  addressLine1?: string;
  addressLine2?: string | null;
  city?: string;
  pincode?: string;
  mapUrl?: string;
  lat?: number;
  lng?: number;
  locationNotes?: string;
  showGatePassLink?: boolean;
  myGateLink?: string;
  eventData?: EventDetailsResponse | null;
  colors?: {
    primary?: string;
    secondary?: string;
    background?: {
      primary?: string;
      secondary?: string;
    };
    font?: {
      primary?: string;
    };
  };
  delay?: number;
  ishost?: boolean;
  eventId?: string;
  onEdit?: () => void;
  backgroundColor?: string;
}

type EventDetailsScreenRouteProp = RouteProp<{ EventDetails: { eventId: string } }, 'EventDetails'>;
type NavigationProp = NativeStackNavigationProp<any, 'EventDetails'>;

export const LocationCard: React.FC<LocationCardProps> = ({
  venueName,
  addressLine1,
  addressLine2,
  city,
  pincode,
  mapUrl,
  lat,
  lng,
  locationNotes,
  showGatePassLink = false,
  myGateLink,
  eventData,
  ishost = false,
  eventId,
  onEdit,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EventDetailsScreenRouteProp>();
  const routeEventId = route.params?.eventId;
  const effectiveEventId = eventId || routeEventId;

  const primaryBgColor = eventData?.event?.theme_instance_data?.theme_data?.colors?.panel;
  const fontColor = eventData?.event?.theme_instance_data?.theme_data?.colors?.text;
  const iconColor = eventData?.event?.theme_instance_data?.theme_data?.colors?.icons;

  const mapsUrl = mapUrl || (lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : null);

  const handleOpenMaps = async () => {
    if (mapsUrl) {
      try {
        await Linking.openURL(mapsUrl);
      } catch (err) {
        // Silently fail - user will see map is unavailable
      }
    }
  };

  const handleEditPress = () => {
    if (onEdit) {
      onEdit();
    } else if (effectiveEventId) {
      navigation.navigate('EditLocation', { eventId: effectiveEventId });
    }
  };

  const handleMyGatePress = async () => {
    if (myGateLink) {
      try {
        await Linking.openURL(myGateLink);
      } catch (err) {
        // Silently fail - user will see link is unavailable
      }
    }
  };

  const fullAddress =
    addressLine1 && (
      <>
        {addressLine1}
        {addressLine2 && `, ${addressLine2}`}
        {city && `, ${city}`}
        {pincode && ` ${pincode}`}
      </>
    );

  const markdownStyles = {
    text: {
      color: fontColor,
      fontSize: 16,
      lineHeight: 24,
    },
    paragraph: {
      color: fontColor,
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 8,
    },
    link: {
      color: primaryBgColor,
      textDecorationLine: 'underline',
    },
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          { backgroundColor: primaryBgColor },
        ]}
      >
        {/* Venue Name & Address Section */}
        {venueName || addressLine1 || city ? (
          <View style={styles.section}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="map-marker"
                size={24}
                color={iconColor}
              />
            </View>
            <View style={styles.contentContainer}>
              {venueName && (
                <Text
                  style={[
                    styles.mainText,
                    { color: fontColor },
                  ]}
                >
                  {venueName}
                </Text>
              )}
              {addressLine1 && (
                <Text
                  style={[
                    styles.subtextText,
                    { color: fontColor },
                  ]}
                >
                  {fullAddress}
                </Text>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="map-marker"
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
                Location not finalized
              </Text>
            </View>
          </View>
        )}

        {/* Open in Maps Button */}
        {mapsUrl && (
          <>
            <View style={styles.mapsButtonContainer}>
              <TouchableOpacity
                style={styles.mapsButton}
                onPress={handleOpenMaps}
              >
                <Text style={[styles.mapsButtonText, { color: fontColor }]}>
                  Open in Maps
                </Text>
                <MaterialCommunityIcons
                  name="login"
                  size={20}
                  color={iconColor}
                />
              </TouchableOpacity>
            </View>
            {(locationNotes || showGatePassLink) && (
              <View
                style={[
                  styles.divider,
                  { backgroundColor: fontColor, opacity: 0.05 },
                ]}
              />
            )}
          </>
        )}

        {/* Divider - Only show if no maps URL but has content after it */}
        {!mapsUrl && (locationNotes || showGatePassLink) && (
          <View
            style={[
              styles.divider,
              { backgroundColor: fontColor, opacity: 0.05 },
            ]}
          />
        )}

        {/* Directions / Parking Instructions */}
        {locationNotes && (
          <>
            <View style={styles.section}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="compass"
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
                  Directions / Parking Instructions
                </Text>
                <View style={styles.notesContainer}>
                  <MarkdownDisplay style={markdownStyles}>
                    {locationNotes}
                  </MarkdownDisplay>
                </View>
              </View>
            </View>
            {showGatePassLink && (
              <View
                style={[
                  styles.divider,
                  { backgroundColor: fontColor, opacity: 0.05 },
                ]}
              />
            )}
          </>
        )}

        {/* MyGate Entry Pass */}
        {showGatePassLink && (
          <TouchableOpacity
            style={styles.myGateButton}
            onPress={handleMyGatePress}
            disabled={!myGateLink}
          >
            <View style={styles.section}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="ticket"
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
                  MyGate Entry Pass
                </Text>
                <Text
                  style={[
                    styles.subtextText,
                    { color: fontColor },
                  ]}
                >
                  Click to view your pass
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>

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
              ariaLabel="Edit Location"
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
    marginBottom: 12,
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
  notesContainer: {
    marginTop: 8,
  },
  mapsButtonContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  mapsButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  mapsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Lexend',
  },
  myGateButton: {
    opacity: 1,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
    marginVertical: 0,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
  },
});
