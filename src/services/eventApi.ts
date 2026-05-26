import { apiClient } from '@/core/api/api';

export interface CreateEventPayload {
  created_by: string;
  title: string;
  host_names: string;
  invites: string;
  event_type_id: string;
}

interface EventResponse {
  event_id: string;
  status: string;
}

export interface EventDetailsResponse {
  event: {
    event_id: string;
    title: string;
    content_block?: {
      subtitle?: string;
      header_text?: string;
      location_notes?: string;
    };
    meta_data?: {
      host_names?: string;
    };
    theme_instance_data?: {
      theme_data?: {
        colors?: Record<string, any>;
        assets?: Record<string, any>;
      };
    };
    program?: any;
    event_date?: string;
    start_timestamp?: number;
    end_timestamp?: number;
    timezone?: string;
    venue_data?: {
      name?: string;
      address_line1?: string;
      address_line2?: string;
      city?: string;
      pincode?: string;
      lat?: number;
      lon?: number;
      map_url?: string;
    };
  };
}

export async function createEvent(payload: CreateEventPayload): Promise<EventResponse> {
  const response = await apiClient.post<EventResponse>('/c56/events/createEvent', payload);
  if (response.error || !response.data) {
    throw new Error(response.error || 'Failed to create event');
  }
  return response.data;
}

export async function fetchEventById(eventId: string): Promise<EventDetailsResponse> {
  const response = await apiClient.get<EventDetailsResponse>(`/c56/events/${eventId}`);
  if (response.error || !response.data) {
    throw new Error(response.error || 'Failed to fetch event');
  }
  return response.data;
}

export async function getEventLink(eventId: string): Promise<{ data: { shortUrl: string } }> {
  const response = await apiClient.get<{ shortUrl: string }>(`/c56/events/${eventId}/link`);
  if (response.error || !response.data) {
    throw new Error(response.error || 'Failed to get event link');
  }
  return {
    data: {
      shortUrl: response.data.shortUrl || `https://zapigo.app/event/${eventId}`,
    },
  };
}

export async function updateEvent(eventId: string, payload: any): Promise<void> {
  const response = await apiClient.put<void>(`/c56/events/updateEvent/${eventId}`, payload);
  if (response.error) {
    throw new Error(response.error || 'Failed to update event');
  }
}

export async function deleteEvent(eventId: string, userId: string): Promise<void> {
  const response = await apiClient.delete<void>(`/c56/events/${eventId}`);
  if (response.error) {
    throw new Error(response.error || 'Failed to delete event');
  }
}
