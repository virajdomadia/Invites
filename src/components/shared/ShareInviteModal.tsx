import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  Modal,
  VStack,
  HStack,
  Text,
  Pressable,
  ScrollView,
  Icon,
  Box,
  Heading,
  Spinner,
  Center,
} from '@gluestack-ui/themed';
import {
  Share,
  Platform,
  Clipboard,
  KeyboardAvoidingView,
  TextInput as RNTextInput,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { X, Share2, Copy, CheckCircle, Smartphone } from 'lucide-react-native';

import { useToast } from '@/core/hooks/useToast';
import { Button } from '@/components/ui/Button';

interface ShareInviteModalProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle?: string;
  eventTitleDisplay?: string;
  inviteLink?: string;
  event?: {
    title?: string;
    meta_data?: {
      host_names?: string;
      [key: string]: unknown;
    } | null;
    content_block?: {
      header_text?: string;
      subtitle?: string;
      [key: string]: unknown;
    } | null;
    [key: string]: unknown;
  } | null;
}

export const ShareInviteModal: React.FC<ShareInviteModalProps> = ({
  open,
  onClose,
  eventId,
  eventTitle,
  eventTitleDisplay,
  inviteLink,
  event,
}) => {
  const { showToast } = useToast();
  const shareMessageTextareaRef = useRef<TextInput>(null);

  // Detect iOS device
  const isIOS = useMemo(() => {
    return Platform.OS === 'ios';
  }, []);

  // Detect Android device
  const isAndroid = useMemo(() => {
    return Platform.OS === 'android';
  }, []);

  // Fetch share link
  const { data: shareLinkData, isLoading: isShareLinkLoading } = useQuery({
    queryKey: ['eventLink', eventId],
    queryFn: async () => {
      // Replace with your actual API call
      return { data: { shortUrl: inviteLink } };
    },
    enabled: open && !!eventId,
    staleTime: 5 * 60 * 1000,
  });

  const shareInviteLink = useMemo(() => {
    return shareLinkData?.data?.shortUrl || inviteLink || '';
  }, [shareLinkData, inviteLink]);

  const shareInviteMessage = useMemo(() => {
    const link = shareInviteLink || 'https://zapigo.co/oqEJ1';
    const title = event?.title || eventTitle || eventTitleDisplay || "Event";
    const hostName = event?.meta_data?.host_names || 'Host';
    const headerText = event?.content_block?.header_text || 'We are getting together for';
    const subtitle = event?.content_block?.subtitle || 'and you are invited!';
    return [
      headerText,
      title,
      subtitle,
      `~ ${hostName}`,
      'Hope you can join us!',
      'Please view the details and confirm (RSVP)',
      'via this link:',
      link,
    ].join('\n');
  }, [shareInviteLink, event?.title, eventTitle, eventTitleDisplay, event?.meta_data?.host_names, event?.content_block?.header_text, event?.content_block?.subtitle]);

  const [shareMessage, setShareMessage] = useState('');
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  // Initialize editable share message when modal opens or link is ready
  useEffect(() => {
    if (open && shareInviteLink) {
      const title = event?.title || eventTitle || eventTitleDisplay || '';
      const hostName = event?.meta_data?.host_names || '';
      const headerText = event?.content_block?.header_text || 'We are getting together for';
      const subtitle = event?.content_block?.subtitle || 'and you are invited!';
      setShareMessage(
        `${headerText}\n${title}\n${subtitle}\n~ ${hostName}\nHope you can join us!\nPlease view the details and confirm (RSVP)\nvia this link:\n${shareInviteLink}`,
      );
    }
  }, [open, shareInviteLink, event?.title, eventTitle, eventTitleDisplay, event?.meta_data?.host_names, event?.content_block?.header_text, event?.content_block?.subtitle]);

  const handleCopyShareMessage = useCallback(async () => {
    const messageToCopy = shareMessage.trim() || shareInviteMessage.trim();
    if (!messageToCopy) {
      showToast('Message not available yet', 'error');
      return;
    }
    try {
      await Clipboard.setString(messageToCopy);
      showToast('Invitation message copied to clipboard', 'success', 1500);
    } catch {
      showToast('Copy failed, please try again', 'error');
    }
  }, [shareInviteMessage, shareMessage, showToast]);

  const handleCopyInviteLink = useCallback(async () => {
    if (!shareInviteLink) {
      showToast('Link not available yet', 'error');
      return;
    }
    try {
      await Clipboard.setString(shareInviteLink);
      setIsLinkCopied(true);
      showToast('Invite link copied to clipboard', 'success', 1500);
      setTimeout(() => setIsLinkCopied(false), 2000);
    } catch {
      showToast('Copy failed, please try again', 'error');
    }
  }, [shareInviteLink, showToast]);

  const handleShareInviteMessage = useCallback(async () => {
    const messageToShare = shareMessage.trim() || shareInviteMessage;
    if (!messageToShare) {
      showToast('Message not available yet', 'error');
      return;
    }

    try {
      await Share.share({
        message: messageToShare,
        title: 'Share Event Invite',
      });
      showToast('Invite message shared successfully', 'success', 1500);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'User did not share') {
        return;
      }
      // Fallback to copy
      await handleCopyShareMessage();
    }
  }, [handleCopyShareMessage, shareInviteMessage, shareMessage, showToast]);

  return (
    <Modal isOpen={open} onClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Center flex={1} bg="rgba(0, 0, 0, 0.5)" px="$4">
          <Box
            bg="$white"
            borderRadius="$lg"
            w="$full"
            maxWidth="$96"
            maxHeight="90%"
            shadowColor="$black"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.25}
            shadowRadius={4}
            elevation={5}
          >
            <HStack justifyContent="flex-end" position="absolute" top="$3" right="$3" zIndex={10}>
              <Pressable onPress={onClose} p="$2">
                <Icon as={X} size="lg" color="$gray900" />
              </Pressable>
            </HStack>

            <VStack pb="$0" pt="$6">
              <VStack px="$4" pb="$4" borderBottomWidth={1} borderBottomColor="$gray200">
                <Heading size="lg" color="$gray900">
                  Share Your Invite
                </Heading>
              </VStack>

              <ScrollView showsVerticalScrollIndicator={true} scrollEventThrottle={16}>
                {isShareLinkLoading ? (
                  <Center py="$8">
                    <VStack alignItems="center" space="md">
                      <Spinner size="large" color="$gray900" />
                      <Text fontSize="$sm" color="$gray600">
                        Loading share options...
                      </Text>
                    </VStack>
                  </Center>
                ) : (
                  <VStack px="$4" py="$4" space="md" pb="$8">
                    <VStack space="md">
                      <Text fontSize="$md" fontWeight="$600" color="$gray900">
                        Preview & Edit Message
                      </Text>
                      <Box
                        borderWidth={1}
                        borderColor="$gray300"
                        borderRadius="$md"
                        p="$3"
                        minHeight="$32"
                      >
                        <RNTextInput
                          ref={shareMessageTextareaRef}
                          value={shareMessage || shareInviteMessage}
                          onChangeText={setShareMessage}
                          multiline
                          numberOfLines={10}
                          placeholder="You are invited!!"
                          placeholderTextColor="#999"
                          style={{
                            fontSize: 14,
                            color: '#374151',
                            textAlignVertical: 'top',
                          }}
                        />
                      </Box>
                      <Text fontSize="$xs" color="$gray600">
                        You can edit this message before sharing
                      </Text>
                    </VStack>

                    {isAndroid && (
                      <Box
                        borderWidth={1}
                        borderColor="$blue100"
                        bg="$blue50"
                        borderRadius="$md"
                        p="$4"
                      >
                        <HStack space="sm" alignItems="flex-start" mb="$2">
                          <Icon as={Smartphone} color="$blue600" size="md" mt="$0.5" />
                          <Text fontSize="$sm" fontWeight="$600" color="$gray900">
                            How to share on Android:
                          </Text>
                        </HStack>
                        <VStack space="xs" ml="$6">
                          <Text fontSize="$xs" color="$gray900">
                            1. Tap &quot;Share Invite&quot; and select WhatsApp/Messages
                          </Text>
                          <Text fontSize="$xs" color="$gray900">
                            2. Send the message!
                          </Text>
                        </VStack>
                      </Box>
                    )}

                    {isIOS && (
                      <Box
                        borderWidth={1}
                        borderColor="$blue100"
                        bg="$blue50"
                        borderRadius="$md"
                        p="$4"
                      >
                        <HStack space="sm" alignItems="flex-start" mb="$2">
                          <Icon as={Smartphone} color="$blue600" size="md" mt="$0.5" />
                          <Text fontSize="$sm" fontWeight="$600" color="$gray900">
                            How to share on iOS:
                          </Text>
                        </HStack>
                        <VStack space="xs" ml="$6">
                          <Text fontSize="$xs" color="$gray900">
                            1. Tap &quot;Share Invite&quot; and select WhatsApp/Messages
                          </Text>
                          <Text fontSize="$xs" color="$gray900">
                            2. Send the message!
                          </Text>
                        </VStack>
                      </Box>
                    )}

                    <VStack space="sm">
                      <Button
                        variant="primary"
                        size="md"
                        onPress={handleShareInviteMessage}
                        icon={<Share2 size={18} />}
                      >
                        Share Invite
                      </Button>

                      <Pressable
                        borderWidth={1}
                        borderColor="$gray300"
                        bg={isLinkCopied ? '$green50' : '$gray100'}
                        borderRadius="$md"
                        px="$4"
                        py="$3"
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="center"
                        gap="$2"
                        onPress={handleCopyInviteLink}
                        disabled={isShareLinkLoading || !shareInviteLink}
                      >
                        <Icon
                          as={isLinkCopied ? CheckCircle : Copy}
                          size="md"
                          color={isLinkCopied ? '$green600' : '$gray900'}
                        />
                        <Text
                          fontSize="$sm"
                          fontWeight="$600"
                          color={isLinkCopied ? '$green600' : '$gray900'}
                        >
                          {isLinkCopied ? 'Link Copied!' : 'Copy Invite Link'}
                        </Text>
                      </Pressable>
                    </VStack>
                  </VStack>
                )}
              </ScrollView>
            </VStack>
          </Box>
        </Center>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ShareInviteModal;
