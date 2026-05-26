import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MarkdownDisplay from 'react-native-markdown-display';

import { type EventDetailsResponse } from '@/services/eventApi';
import { darkenColor } from '@/utils/color';
import { toTitleCase } from '@/utils/string';
import { EventHeroMedia } from './EventHeroMedia';
import { EditActionsBar } from '@/components/features/events/EditActionsBar';
import { CircleActionButton } from '@/components/shared/CircleActionButton';

interface ThemeAssets {
  main_asset_video?: {
    playbackId: string;
    [key: string]: unknown;
  };
  main_asset?: {
    uploadedAssetUrl: string;
    alt_text?: string;
    [key: string]: unknown;
  };
  main_asset_mobile?: {
    uploadedAssetUrl: string;
    alt_text?: string;
    [key: string]: unknown;
  };
  main_asset_desktop?: {
    uploadedAssetUrl: string;
    alt_text?: string;
    [key: string]: unknown;
  };
}

interface EventHeroCardProps {
  assets: ThemeAssets | undefined;
  title: string;
  subtitle?: string;
  headerText?: string;
  hostName?: string;
  eventData?: EventDetailsResponse | null;
  colors?: {
    font?: {
      primary_heading_font?: string;
    };
  };
  ishost?: boolean;
  backgroundColor?: string;
}

type EventDetailsScreenRouteProp = RouteProp<{ EventDetails: { eventId: string } }, 'EventDetails'>;
type NavigationProp = NativeStackNavigationProp<any, 'EventDetails'>;

export const EventHeroCard: React.FC<EventHeroCardProps> = ({
  assets,
  title,
  subtitle,
  headerText,
  hostName,
  eventData,
  colors,
  ishost = false,
  backgroundColor = '#000000',
}) => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EventDetailsScreenRouteProp>();
  const eventId = route.params.eventId;

  const primaryFont = 'Lexend';
  const primaryBgColor = eventData?.event?.theme_instance_data?.theme_data?.colors?.panel;
  const fontColor = eventData?.event?.theme_instance_data?.theme_data?.colors?.text;
  const iconColor = eventData?.event?.theme_instance_data?.theme_data?.colors?.icons;

  const handleTextEdit = () => {
    if (eventId) {
      navigation.navigate('EditEventText', { eventId });
    }
  };

  const handleNoteEdit = () => {
    if (eventId) {
      navigation.navigate('EditEventNote', { eventId });
    }
  };

  const handleDesignEdit = () => {
    if (eventId) {
      navigation.navigate('EditBannerColor', { eventId });
    }
  };

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
  };

  return (
    <View style={styles.container}>
      {/* Main Card */}
      <View
        style={[
          styles.card,
          { backgroundColor: primaryBgColor || '#ffffff' },
        ]}
      >
        {/* Hero Media Section */}
        <View style={styles.mediaContainer}>
          <EventHeroMedia
            assets={assets}
            ishost={ishost}
            eventId={eventId}
            backgroundColor={backgroundColor}
          />
        </View>

        {/* Hero Text Content Section */}
        <View style={styles.contentContainer}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text
              style={[
                styles.headerText,
                {
                  fontFamily: colors?.font?.primary_heading_font || primaryFont,
                  color: fontColor,
                },
              ]}
            >
              {headerText || 'We are getting together for'}
            </Text>

            <Text
              style={[
                styles.mainTitle,
                {
                  fontFamily: colors?.font?.primary_heading_font || primaryFont,
                  color: fontColor,
                },
              ]}
            >
              {toTitleCase(title)}
            </Text>

            <Text
              style={[
                styles.subtitleText,
                {
                  fontFamily: colors?.font?.primary_heading_font || primaryFont,
                  color: fontColor,
                },
              ]}
            >
              {subtitle || 'and you are invited!'}
            </Text>

            {hostName && (
              <View style={styles.hostSection}>
                <MaterialCommunityIcons
                  name="star"
                  size={20}
                  color={iconColor}
                  style={styles.hostIcon}
                />
                <Text
                  style={[
                    styles.hostText,
                    {
                      fontFamily: colors?.font?.primary_heading_font || primaryFont,
                      color: fontColor,
                    },
                  ]}
                >
                  {hostName}
                </Text>
              </View>
            )}
          </View>

          {/* Notes Section */}
          {eventData?.event?.content_block?.notes &&
            eventData.event.content_block.notes !== '<p></p>' && (
              <View
                style={[
                  styles.notesSection,
                  {
                    borderTopColor: darkenColor(primaryBgColor, 20),
                  },
                ]}
              >
                <View style={styles.notesContent}>
                  <MaterialCommunityIcons
                    name="file-document-outline"
                    size={24}
                    color={iconColor}
                    style={styles.notesIcon}
                  />
                  <View style={styles.notesText}>
                    <MarkdownDisplay
                      style={markdownStyles}
                    >
                      {eventData.event.content_block.notes}
                    </MarkdownDisplay>
                  </View>
                </View>
              </View>
            )}
        </View>
      </View>

      {/* Edit Action Buttons - Host Mode Only */}
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
                  name="format-text"
                  size={20}
                  color={primaryBgColor}
                />
              }
              label="Text"
              ariaLabel="Edit Text"
              onPress={handleTextEdit}
              textColor={primaryBgColor}
            />
          </View>

          <View style={styles.actionButton}>
            <CircleActionButton
              icon={
                <MaterialCommunityIcons
                  name="clipboard-outline"
                  size={20}
                  color={primaryBgColor}
                />
              }
              label="Notes"
              ariaLabel="Edit Notes"
              onPress={handleNoteEdit}
              textColor={primaryBgColor}
            />
          </View>

          <View style={styles.actionButton}>
            <CircleActionButton
              icon={
                <MaterialCommunityIcons
                  name="image-outline"
                  size={20}
                  color={primaryBgColor}
                />
              }
              label="Design"
              ariaLabel="Edit Design"
              onPress={handleDesignEdit}
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
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  mediaContainer: {
    width: '100%',
    padding: 8,
  },
  contentContainer: {
    flexDirection: 'column',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    zIndex: 0,
  },
  titleSection: {
    alignItems: 'center',
    width: '100%',
  },
  headerText: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  mainTitle: {
    fontSize: 20,
    lineHeight: 32,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  hostSection: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  hostIcon: {
    marginBottom: 4,
  },
  hostText: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '600',
    textAlign: 'center',
  },
  notesSection: {
    width: '100%',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 16,
    paddingBottom: 16,
  },
  notesContent: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  notesIcon: {
    marginTop: 2,
    flexShrink: 0,
  },
  notesText: {
    flex: 1,
  },
  actionButton: {
    flex: 1,
  },
});
