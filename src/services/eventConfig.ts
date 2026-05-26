import { apiClient } from '@/core/api/api';

// --- ConfigFieldStatus (aligns with backend ConfigFieldStatus PyEnum) ---
/** API values for food_preference, food_allergies, and other field status in event config */
export const ConfigFieldStatus = {
  DONT_ASK: "DON'T_ASK",
  OPTIONAL: 'OPTIONAL',
  REQUIRED: 'REQUIRED',
} as const;
export type ConfigFieldStatusValue = (typeof ConfigFieldStatus)[keyof typeof ConfigFieldStatus];

/** Convert boolean (enabled/disabled) to event-config value for food_preference / food_allergies. ON = REQUIRED, OFF = DON'T_ASK */
export function toFoodFieldStatus(enabled: boolean): ConfigFieldStatusValue {
  return enabled ? ConfigFieldStatus.REQUIRED : ConfigFieldStatus.DONT_ASK;
}

/** True if value means we show/ask (OPTIONAL or REQUIRED) */
export function isAskFoodField(value: string | undefined): boolean {
  return value === ConfigFieldStatus.OPTIONAL || value === ConfigFieldStatus.REQUIRED;
}

/** True only when food preference is REQUIRED – hide everywhere when OPTIONAL or DONT_ASK */
export function isFoodPreferenceRequired(value: string | undefined): boolean {
  return value === ConfigFieldStatus.REQUIRED;
}

/** True only when food allergies is REQUIRED – hide everywhere when OPTIONAL or DONT_ASK */
export function isFoodAllergiesRequired(value: string | undefined): boolean {
  return value === ConfigFieldStatus.REQUIRED;
}

// --- Field status (aligns with backend ConfigFieldStatus); API returns "DON'T_ASK" ---
export type FieldStatus = 'REQUIRED' | 'OPTIONAL' | 'DONT_ASK' | "DON'T_ASK";

/** Normalize API value to canonical form for UI (DON'T_ASK -> DONT_ASK). */
export function normalizeFieldStatus(api: string | undefined): 'REQUIRED' | 'OPTIONAL' | 'DONT_ASK' | undefined {
  if (!api) return undefined;
  if (api === "DON'T_ASK" || api === 'DONT_ASK') return 'DONT_ASK';
  if (api === 'REQUIRED' || api === 'OPTIONAL') return api;
  return undefined;
}

/** Value to send in event-config API payload (DONT_ASK -> DON'T_ASK). */
export function toApiFieldStatusValue(ui: 'REQUIRED' | 'OPTIONAL' | 'DONT_ASK'): 'REQUIRED' | 'OPTIONAL' | "DON'T_ASK" {
  return ui === 'DONT_ASK' ? "DON'T_ASK" : ui;
}

// --- Response types (GET /c56/event-config/{event_id}) ---

export type PassTypeValue = 'MY_GATE' | 'NO_BROKER' | string;
export type IdCardTypeValue = 'PASSPORT' | 'GOVT_ID' | string;

export interface PassTypeConfig {
  enabled: boolean;
  type: PassTypeValue;
  link?: string | null;
}

/** API shape for registration window: date (YYYY-MM-DD) and time (HH:MM:SS) */
export interface RegistrationDateTimeApi {
  date: string;
  time: string;
}

export interface RsvpConfigSection {
  allowed_pluses_above_cutoff?: number;
  allowed_pluses_below_cutoff?: number;
  count_pluses_above_cutoff_towards_max?: boolean;
  count_pluses_below_cutoff_towards_max?: boolean;
  pass_type?: PassTypeConfig;
  /** MyGate / gate pass link (API field: gate_pass_link) */
  gate_pass_link?: string | null;
  registration_start?: RegistrationDateTimeApi | null;
  registration_end?: RegistrationDateTimeApi | null;
}

export interface EventConfigSection {
  type?: string; // e.g. YES_NO_MAYBE (ConfigRsvpType)
  food_preference?: string;
  food_allergies?: string;
  gallery_access_policy?: string;
  is_paid?: boolean;
  is_single_day_event?: boolean;
  is_public?: boolean;
  cutoff_age?: number;
  cutoff_age_2?: number;
  /** Overall max guests; -1 means unlimited */
  max_guests?: number;
  /** Max guests at or above cutoff age; -1 means unlimited */
  max_guests_above_cutoff?: number;
  /** Max guests below cutoff age; -1 means unlimited */
  max_guests_below_cutoff?: number;
  waitlist_enabled?: boolean;
  /** Max waitlist size; -1 means unlimited */
  max_waitlist?: number;
  /** Price for primary/main guest */
  price_primary_guest?: number;
  /** Price for additional guests above cutoff age */
  price_above_cutoff?: number;
  /** Price for additional guests below cutoff age */
  price_below_cutoff?: number;
  payment_notes?: string | null;
  /** UPI ImageKit URL for QR code */
  upi_imagekit_url?: string;
  /** UPI ID extracted from QR code */
  upi_id?: string;
  /** Whether to show the gallery on the event page */
  show_gallery?: boolean;
}

export interface AgeFieldConfig {
  above_cutoff?: FieldStatus;
  below_cutoff?: FieldStatus;
}

export interface IdCardOrAddressProofConfig {
  mode?: FieldStatus;
  allowed_types?: IdCardTypeValue[];
  require_image?: boolean;
}

export interface ConfigNestedField {
  primary_guest: FieldStatus;
  pluses_above_cutoff: FieldStatus;
  pluses_below_cutoff: FieldStatus;
}

export interface SystemFieldConfig {
  above_cutoff?: FieldStatus;
  below_cutoff?: FieldStatus;
}

/** System fields: key is field name (dob, photo, name, email, age, id_card, address_proof, etc.) */
export type SystemFieldsMap = Record<
  string,
  FieldStatus | AgeFieldConfig | IdCardOrAddressProofConfig | ConfigNestedField
>;

export interface CustomFieldConfig {
  name: string;
  type: string; // e.g. dropdown, text
  options?: string[];
  required?: boolean;
}

export interface FieldsConfigSection {
  system_fields: SystemFieldsMap;
  custom_fields: CustomFieldConfig[];
}

export interface PaymentInfoSection {
  upi_id?: string;
  upi_imagekit_url?: string;
}

export interface EventConfigData {
  rsvp: RsvpConfigSection;
  event: EventConfigSection;
  fields: FieldsConfigSection;
  payment_info?: PaymentInfoSection;
}

export interface EventConfigResponse {
  status: 'success';
  data: EventConfigData;
}

// --- Payload types (PUT endpoints) ---

/**
 * Payload for PUT /c56/event-config/{event_id}/rsvp
 * @example
 * {
 *   "allowed_pluses_above_cutoff": 2,
 *   "allowed_pluses_below_cutoff": 0,
 *   "pass_type": { "enabled": true, "type": "MY_GATE", "link": "https://..." },
 *   "gate_pass_link": "https://...",
 *   "registration_start": { "date": "2023-12-01", "time": "09:00:00" },
 *   "registration_end": { "date": "2023-12-20", "time": "18:00:00" }
 * }
 */
export interface RsvpConfigPayload {
  allowed_pluses_above_cutoff?: number;
  allowed_pluses_below_cutoff?: number;
  count_pluses_above_cutoff_towards_max?: boolean;
  count_pluses_below_cutoff_towards_max?: boolean;
  pass_type?: PassTypeConfig;
  /** MyGate / gate pass link (API field: gate_pass_link) */
  gate_pass_link?: string | null;
  registration_start?: RegistrationDateTimeApi | null;
  registration_end?: RegistrationDateTimeApi | null;
}

export interface EventSettingsConfigPayload {
  type?: string;
  food_preference?: string;
  food_allergies?: string;
  gallery_access_policy?: string;
  is_paid?: boolean;
  is_single_day_event?: boolean;
  is_public?: boolean;
  cutoff_age?: number;
  cutoff_age_2?: number;
  /** -1 means unlimited */
  max_guests?: number;
  /** -1 means unlimited */
  max_guests_above_cutoff?: number;
  /** -1 means unlimited */
  max_guests_below_cutoff?: number;
  waitlist_enabled?: boolean;
  /** -1 means unlimited */
  max_waitlist?: number;
  /** Price for primary/main guest */
  price_primary_guest?: number;
  /** Price for additional guests above cutoff age */
  price_above_cutoff?: number;
  /** Price for additional guests below cutoff age */
  price_below_cutoff?: number;
  payment_notes?: string | null;
  show_gallery?: boolean;
}

export interface FieldsConfigPayload {
  system_fields?: SystemFieldsMap;
  custom_fields?: CustomFieldConfig[];
}

const EVENT_CONFIG_BASE = '/c56/event-config';

/**
 * GET /c56/event-config/{event_id}
 * Retrieve the complete configuration for an event (host/owner only).
 */
export async function getEventConfig(
  eventId: string
): Promise<EventConfigResponse> {
  const response = await apiClient.get<EventConfigResponse>(
    `${EVENT_CONFIG_BASE}/${eventId}`
  );

  if (response.error) {
    throw new Error(response.error);
  }

  if (!response.data) {
    throw new Error('Failed to fetch event configuration');
  }

  return response.data;
}

/**
 * PUT /c56/event-config/{event_id}/rsvp
 * Update RSVP-specific settings.
 */
export async function updateRsvpConfig(
  eventId: string,
  payload: RsvpConfigPayload
): Promise<{ status: string; data: RsvpConfigSection }> {
  const response = await apiClient.put<{ status: string; data: RsvpConfigSection }>(
    `${EVENT_CONFIG_BASE}/${eventId}/rsvp`,
    payload
  );

  if (response.error) {
    const status = response.status;
    const responseData = response.data as any;
    const errorDetail = responseData?.detail || response.error;

    if (status === 403) {
      throw new Error(
        `Permission denied: ${errorDetail}. You may not be the owner of this event, or the event configuration is not yet available. Please try again in a moment.`
      );
    }

    if (status === 404) {
      throw new Error(`Event configuration not found (event_id: ${eventId}). The event may not exist or may have been deleted.`);
    }

    throw new Error(`Failed to update RSVP config: ${errorDetail}`);
  }

  if (!response.data) {
    throw new Error('Failed to update RSVP config');
  }

  return response.data;
}

/**
 * Update RSVP config by merging partial payload with current config.
 * Use this when updating only some fields (e.g. pass_type, gate_pass_link) so that
 * other RSVP settings (allowed_pluses_*, count_*_towards_max, registration_*) are not reset.
 * This always fetches current config to ensure safe merging and prevent field resets.
 * If GET fails (e.g., 403 on new events), falls back to direct update.
 */
export async function updateRsvpConfigWithMerge(
  eventId: string,
  partial: RsvpConfigPayload
): Promise<{ status: string; data: RsvpConfigSection }> {
  try {
    const current = await getEventConfig(eventId);
    const merged: RsvpConfigPayload = {
      ...current.data.rsvp,
      ...partial,
      // Ensure pass_type is properly merged (not overwrite, but extend)
      ...(partial.pass_type && {
        pass_type: {
          ...current.data.rsvp.pass_type,
          ...partial.pass_type,
        },
      }),
    };
    return updateRsvpConfig(eventId, merged);
  } catch (getConfigError) {
    console.warn(
      `[EventConfig] Failed to fetch current RSVP config for merge (${
        getConfigError instanceof Error ? getConfigError.message : 'unknown error'
      }). Falling back to direct update with partial config.`,
      { eventId }
    );
    // Fallback: If we can't fetch current config, update directly with partial
    // This is safe for new events where only the partial config is being set initially
    return updateRsvpConfig(eventId, partial);
  }
}

/**
 * PUT /c56/event-config/{event_id}/event
 * Update general event settings.
 */
export async function updateEventConfig(
  eventId: string,
  payload: EventSettingsConfigPayload
): Promise<{ status: string; data: EventConfigSection }> {
  const response = await apiClient.put<{ status: string; data: EventConfigSection }>(
    `${EVENT_CONFIG_BASE}/${eventId}/event`,
    payload
  );

  if (response.error) {
    throw new Error(response.error);
  }

  if (!response.data) {
    throw new Error('Failed to update event settings');
  }

  return response.data;
}

/**
 * Update event config by merging partial payload with current config.
 * Use this when updating only a few fields (e.g. food_preference, food_allergies) so that
 * other event settings (cutoff_age, max_guests_*, waitlist_enabled, etc.) are not reset.
 * This always fetches current config to ensure safe merging and prevent field resets.
 */
export async function updateEventConfigWithMerge(
  eventId: string,
  partial: EventSettingsConfigPayload
): Promise<{ status: string; data: EventConfigSection }> {
  const current = await getEventConfig(eventId);
  const merged: EventSettingsConfigPayload = {
    ...current.data.event,
    ...partial,
  };
  return updateEventConfig(eventId, merged);
}

/**
 * PUT /c56/event-config/{event_id}/fields
 * Update system/custom fields collection settings.
 */
export async function updateFieldsConfig(
  eventId: string,
  payload: FieldsConfigPayload
): Promise<{ status: string; data: FieldsConfigSection }> {
  const response = await apiClient.put<{ status: string; data: FieldsConfigSection }>(
    `${EVENT_CONFIG_BASE}/${eventId}/fields`,
    payload
  );

  if (response.error) {
    throw new Error(response.error);
  }

  if (!response.data) {
    throw new Error('Failed to update fields config');
  }

  return response.data;
}

/**
 * Update fields config by merging partial payload with current config.
 * Use this when updating only some fields (e.g. system_fields) so that
 * other fields (e.g. custom_fields or other system_fields) are not reset.
 */
export async function updateFieldsConfigWithMerge(
  eventId: string,
  partial: FieldsConfigPayload
): Promise<{ status: string; data: FieldsConfigSection }> {
  const current = await getEventConfig(eventId);
  const existingFields = current.data.fields ?? { system_fields: {}, custom_fields: [] };
  const merged: FieldsConfigPayload = {
    system_fields:
      partial.system_fields !== undefined
        ? { ...existingFields.system_fields, ...partial.system_fields }
        : existingFields.system_fields,
    custom_fields:
      partial.custom_fields !== undefined
        ? partial.custom_fields
        : existingFields.custom_fields ?? [],
  };
  return updateFieldsConfig(eventId, merged);
}

// --- Default config (aligns with backend DEFAULT_EVENT_CONFIG) ---

export const DEFAULT_EVENT_CONFIG: EventConfigData = {
  rsvp: {
    allowed_pluses_above_cutoff: 1,
    allowed_pluses_below_cutoff: 2,
    count_pluses_above_cutoff_towards_max: false,
    count_pluses_below_cutoff_towards_max: false,
    pass_type: {
      enabled: false,
      type: 'MY_GATE',
      link: null,
    },
  },
  event: {
    type: 'YES_NO_MAYBE',
    food_preference: ConfigFieldStatus.OPTIONAL,
    food_allergies: ConfigFieldStatus.OPTIONAL,
    gallery_access_policy: 'PUBLIC',
    is_paid: false,
    is_single_day_event: false,
    is_public: false,
    cutoff_age: 13,
    cutoff_age_2: 8,
    max_guests: -1,
    max_guests_above_cutoff: -1,
    max_guests_below_cutoff: -1,
    waitlist_enabled: true,
    max_waitlist: -1,
  },
  fields: {
    system_fields: {
      dob: "DON'T_ASK",
      photo: "DON'T_ASK",
      name: {
        primary_guest: 'REQUIRED',
        pluses_above_cutoff: 'REQUIRED',
        pluses_below_cutoff: 'DONT_ASK',
      },
      email: {
        primary_guest: "DON'T_ASK",
        pluses_above_cutoff: "DON'T_ASK",
        pluses_below_cutoff: "DON'T_ASK",
      },
      blood_group: "DON'T_ASK",
      emergency_contact: "DON'T_ASK",
      age: {
        primary_guest: "DON'T_ASK",
        pluses_above_cutoff: "DON'T_ASK",
        pluses_below_cutoff: "DON'T_ASK",
      },
      id_card: {
        mode: "DON'T_ASK",
        allowed_types: ['PASSPORT', 'GOVT_ID'],
        require_image: false,
      },
      address_proof: {
        mode: "DON'T_ASK",
        allowed_types: ['PASSPORT', 'GOVT_ID'],
        require_image: false,
      },
    },
    custom_fields: [],
  },
};

// --- UPI Config ---

export interface UpiConfigResponse {
  status: 'success';
  data: {
    upi_id: string;
    upi_imagekit_url: string;
  };
}

/**
 * POST /c56/event-config/upi-config/{event_id}
 * Upload UPI QR code ImageKit URL and extract UPI ID, or provide manual UPI ID
 */
export async function updateUpiConfig(
  eventId: string,
  imagekitUrl: string,
  manualUpiId?: string
): Promise<UpiConfigResponse> {
  const payload: { imagekit_url: string; upi_id?: string } = {
    imagekit_url: imagekitUrl,
  };

  if (manualUpiId) {
    payload.upi_id = manualUpiId;
  }

  const response = await apiClient.post<UpiConfigResponse>(
    `${EVENT_CONFIG_BASE}/upi-config/${eventId}`,
    payload
  );

  if (response.error) {
    throw new Error(response.error);
  }

  if (!response.data) {
    throw new Error('Failed to update UPI configuration');
  }

  return response.data;
}

/**
 * DELETE /c56/event-config/upi-config/{event_id}
 * Clear/remove UPI configuration for an event
 */
export async function deleteUpiConfig(
  eventId: string
): Promise<{ status: string; message: string }> {
  const response = await apiClient.delete<{ status: string; message: string }>(
    `${EVENT_CONFIG_BASE}/upi-config/${eventId}`
  );

  if (response.error) {
    throw new Error(response.error);
  }

  if (!response.data) {
    throw new Error('Failed to delete UPI configuration');
  }

  return response.data;
}
