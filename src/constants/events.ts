import type { EventType } from '@/types/events';

export const EVENT_TYPE_IDS: Record<EventType, string> = {
  BIRTHDAY: 'event_type_birthday',
  ANNIVERSARY: 'event_type_anniversary',
  WEDDING: 'event_type_wedding',
  CEREMONY: 'event_type_ceremony',
  DINNER: 'event_type_dinner',
  PUJA: 'event_type_puja',
};
