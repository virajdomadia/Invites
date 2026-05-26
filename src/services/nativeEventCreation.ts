import { createEvent, deleteEvent, updateEvent, type CreateEventPayload } from '@/services/eventApi';
import { updateRsvpConfigWithMerge } from '@/services/eventConfig';
import { DEFAULT_RSVP_CONFIG } from '@/constants/rsvp';
import { EVENT_TYPE_IDS } from '@/constants/events';
import type { EventType } from '@/types/events';
import { toTitleCase } from '@/utils/string';
import { logger } from '@/utils/logger';

const MODULE_NAME = 'EventCreation';

interface CreateEventOptions {
  title: string;
  eventType: EventType;
  userId: string;
  displayName?: string;
  onSuccess?: (eventId: string) => void;
  onError?: (error: Error) => void;
  onProgress?: (status: string) => void;
}

interface CreateEventResult {
  success: boolean;
  eventId?: string;
  error?: Error;
}

export async function createEventWithCTA(options: CreateEventOptions): Promise<CreateEventResult> {
  const {
    title,
    eventType,
    userId,
    displayName,
    onSuccess,
    onError,
    onProgress,
  } = options;

  const startTime = Date.now();
  const correlationId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  logger.info(MODULE_NAME, 'Event creation initiated', {
    correlationId,
    eventType,
    userId: userId ? 'present' : 'missing',
    titleLength: title?.length || 0,
    displayName: displayName ? 'present' : 'missing',
  });

  try {
    // Validation: User ID
    if (!userId) {
      const error = new Error('User ID is required. Please log in.');
      logger.error(MODULE_NAME, 'Validation failed: Missing user ID', error, {
        correlationId,
      });
      onError?.(error);
      throw error;
    }

    // Validation: Event title
    if (!title?.trim()) {
      const error = new Error('Event title cannot be empty');
      logger.error(MODULE_NAME, 'Validation failed: Empty event title', error, {
        correlationId,
        titleLength: title?.length || 0,
      });
      onError?.(error);
      throw error;
    }

    // Validation: Event type
    if (!EVENT_TYPE_IDS[eventType]) {
      const error = new Error(`Invalid event type: ${eventType}`);
      logger.error(MODULE_NAME, 'Validation failed: Invalid event type', error, {
        correlationId,
        eventType,
        availableTypes: Object.keys(EVENT_TYPE_IDS),
      });
      onError?.(error);
      throw error;
    }

    logger.info(MODULE_NAME, 'Validation passed, proceeding with event creation', {
      correlationId,
      eventType,
    });

    // Step 1: Create event
    onProgress?.('Creating event...');
    logger.debug(MODULE_NAME, 'Step 1: Creating event', {
      correlationId,
      eventType,
    });

    const payload: CreateEventPayload = {
      created_by: userId,
      title: toTitleCase(title.trim()),
      host_names: displayName || userId,
      invites: 'INVITE',
      event_type_id: EVENT_TYPE_IDS[eventType],
    };

    logger.debug(MODULE_NAME, 'Event payload prepared', {
      correlationId,
      payload: {
        created_by: payload.created_by,
        title: payload.title,
        host_names: payload.host_names,
        event_type_id: payload.event_type_id,
      },
    });

    let createResponse;
    try {
      createResponse = await createEvent(payload);
      logger.info(MODULE_NAME, 'Event created successfully', {
        correlationId,
        eventId: createResponse.event_id,
        status: createResponse.status,
      });
    } catch (createError) {
      logger.error(MODULE_NAME, 'Failed to create event', createError as Error, {
        correlationId,
        step: 'createEvent',
        payload,
      });
      throw new Error(`Event creation failed: ${(createError as Error).message}`);
    }

    const eventId = createResponse.event_id;

    if (!eventId) {
      const error = new Error('Event created but no event ID returned');
      logger.error(MODULE_NAME, 'Missing event ID in response', error, {
        correlationId,
        response: createResponse,
      });
      throw error;
    }

    // Step 2: Publish event
    onProgress?.('Publishing event...');
    logger.debug(MODULE_NAME, 'Step 2: Publishing event', {
      correlationId,
      eventId,
    });

    try {
      const updatePayload = {
        created_by: userId,
        status: 'PUBLISHED',
        host_names: displayName || userId,
        invites: 'INVITE',
      };

      await updateEvent(eventId, updatePayload);
      logger.info(MODULE_NAME, 'Event published successfully', {
        correlationId,
        eventId,
      });
    } catch (publishError) {
      logger.error(MODULE_NAME, 'Failed to publish event, rolling back', publishError as Error, {
        correlationId,
        eventId,
        step: 'publishEvent',
      });

      // Rollback: Delete the created event
      try {
        logger.debug(MODULE_NAME, 'Initiating rollback: deleting event', {
          correlationId,
          eventId,
        });
        await deleteEvent(eventId, userId);
        logger.info(MODULE_NAME, 'Event deleted successfully during rollback', {
          correlationId,
          eventId,
        });
      } catch (deleteError) {
        logger.error(MODULE_NAME, 'Failed to delete event during rollback', deleteError as Error, {
          correlationId,
          eventId,
        });
      }

      throw new Error(`Failed to publish event: ${(publishError as Error).message}`);
    }

    // Step 3: Setup RSVP config
    onProgress?.('Setting up RSVP...');
    logger.debug(MODULE_NAME, 'Step 3: Setting up RSVP configuration', {
      correlationId,
      eventId,
      defaultConfig: DEFAULT_RSVP_CONFIG,
    });

    try {
      const rsvpResult = await updateRsvpConfigWithMerge(eventId, DEFAULT_RSVP_CONFIG);
      logger.info(MODULE_NAME, 'RSVP configuration set successfully', {
        correlationId,
        eventId,
        result: rsvpResult,
      });
    } catch (rsvpError) {
      const rsvpErrorMsg = rsvpError instanceof Error ? rsvpError.message : 'Unknown error';
      const is403PermissionError = rsvpErrorMsg.includes('Permission denied') || rsvpErrorMsg.includes('403');

      logger.error(
        MODULE_NAME,
        is403PermissionError
          ? 'RSVP permission denied - backend authorization issue, rolling back'
          : 'Failed to set RSVP configuration, rolling back',
        rsvpError as Error,
        {
          correlationId,
          eventId,
          step: 'updateRsvpConfig',
          rsvpErrorMessage: rsvpErrorMsg,
          is403PermissionError,
          rsvpErrorStack: (rsvpError as Error).stack,
        }
      );

      // Rollback: Delete the event
      try {
        logger.debug(MODULE_NAME, 'Initiating rollback: deleting event due to RSVP setup failure', {
          correlationId,
          eventId,
          reasonError: rsvpErrorMsg,
        });
        await deleteEvent(eventId, userId);
        logger.info(MODULE_NAME, 'Event deleted successfully during RSVP rollback', {
          correlationId,
          eventId,
        });
      } catch (deleteError) {
        logger.error(MODULE_NAME, 'Failed to delete event during RSVP rollback', deleteError as Error, {
          correlationId,
          eventId,
        });
      }

      throw new Error(`Failed to configure RSVP: ${rsvpErrorMsg}`);
    }

    const duration = Date.now() - startTime;
    onProgress?.('Event created successfully!');
    onSuccess?.(eventId);

    logger.info(MODULE_NAME, 'Event creation completed successfully', {
      correlationId,
      eventId,
      duration: `${duration}ms`,
      steps: ['create', 'publish', 'rsvp_config'],
    });

    return {
      success: true,
      eventId,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const err = error instanceof Error ? error : new Error('Failed to create event');

    logger.error(MODULE_NAME, 'Event creation failed with exception', err, {
      correlationId,
      duration: `${duration}ms`,
      errorMessage: err.message,
    });

    onError?.(err);

    return {
      success: false,
      error: err,
    };
  }
}

export function getEventCreationLogs(correlationId?: string): string {
  const logs = logger.getLogsByModule(MODULE_NAME);
  const filteredLogs = correlationId ? logs.filter((log) => log.data?.correlationId === correlationId) : logs;
  return filteredLogs
    .map((log) => {
      const logLine = `[${log.timestamp}] ${log.level} - ${log.message}`;
      const dataStr = log.data ? ` | ${JSON.stringify(log.data)}` : '';
      const errorStr = log.error ? ` | ERROR: ${log.error.message}` : '';
      return logLine + dataStr + errorStr;
    })
    .join('\n');
}
