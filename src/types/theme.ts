// src/lib/themeLibraryTypes.ts
// Theme Library API Contract V2 — Type Definitions

// ─── Enums ───────────────────────────────────────────────────────────────────

export type CreatorType = 'SYSTEM' | 'USER';

export type BannerType = 'IMAGE' | 'PNG' | 'JPG' | 'WebP' | 'GIF' | 'Video';

export type ObjectType = 'USER' | 'ORGANIZATION';

export type AssociationType = 'CREATOR' | 'FOLLOWER' | 'SUBSCRIBER';

export type LibraryStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'DRAFT';

export type AssociationStatus = 'ACTIVE' | 'INACTIVE';

// ─── Colour Structures ──────────────────────────────────────────────────────

export interface ThemeColours {
  primary?: string;
  secondary?: string;
  background?: {
    primary?: string;
    secondary?: string;
  };
  font?: {
    primary?: string;
    secondary?: string;
  };
  text_color?: string;
}

export interface AdditionalBanner {
  type?: BannerType;
  url?: string;
  section?: string;
}

// ─── Colour Extraction ──────────────────────────────────────────────────────

export interface ColorPaletteItem {
  hex: string;
  name: string;
  percentage: number;
  rgb?: number[];
}

export interface ColorObject {
  hex: string;
  name: string;
  rgb: number[];
}

export interface ExtractColorsResponse {
  status: 'success' | 'error';
  message: string;
  pageBg: ColorObject;
  panel: ColorObject;
  text: ColorObject;
  icons: ColorObject;
  rsvpBar: ColorObject;
  rsvpText: ColorObject;
  bg1: ColorObject;
  bg2: ColorObject;
  bg3: ColorObject;
  color_palette: ColorPaletteItem[];
  model: string;
}

// ─── Theme ──────────────────────────────────────────────────────────────────

export interface Theme {
  theme_id: string;
  theme_title?: string;
  theme_description?: string;
  main_banner_type?: BannerType;
  main_banner_url?: string[] | null;
  additional_banners?: AdditionalBanner[];
  colours?: ThemeColours;
  tags?: Record<string, string>;
  creator_type?: CreatorType;
  creator_display_name?: { name?: string };
  created_by?: string;
  created_at?: string;
  updated_by?: string | null;
  updated_at?: string | null;
  extract_colors?: boolean;
}

// ─── Theme Library ──────────────────────────────────────────────────────────

export interface ThemeLibrary {
  theme_library_id: string;
  title?: string;
  description?: string;
  tags?: Record<string, string>;
  is_public?: boolean;
  is_featured?: boolean;
  creator_type?: CreatorType;
  creator_display_name?: { name?: string };
  status?: LibraryStatus;
  created_by?: string;
  created_at?: string;
  updated_by?: string | null;
  updated_at?: string | null;
  themes?: ThemeLibraryAssociation[];
}

// ─── Theme ↔ Library Association ────────────────────────────────────────────

export interface ThemeLibraryAssociation {
  theme_library_association_id: string;
  theme_id: string;
  theme_library_id?: string;
  is_default?: boolean;
  is_featured?: boolean;
  status?: AssociationStatus;
  theme?: Theme;
}

// ─── Library ↔ User/Org Association ─────────────────────────────────────────

export interface LibraryObjectAssociation {
  id: string;
  theme_library_id: string;
  object_type: ObjectType;
  object_id: string;
  association_type: AssociationType;
  status?: AssociationStatus;
  created_by?: string;
  created_at?: string;
}

// ─── Favourites & Usage Tracking ────────────────────────────────────────────

export interface ThemeObjectFavourite {
  theme_object_association_id: string;
  theme_id: string;
  object_type: string;
  object_id: string;
  is_favourite: boolean;
  last_used?: string;
  created_at?: string;
  updated_at?: string;
  theme?: Theme;
}

// ─── API Response Generics ──────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  total_count?: number;
  pagination?: {
    current_page: number;
    total_pages: number;
    items_per_page: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

// ─── Request Payloads ───────────────────────────────────────────────────────

export interface CreateThemePayload {
  theme_title?: string;
  theme_description?: string;
  main_banner_type?: BannerType;
  main_banner_url?: string[];
  additional_banners?: AdditionalBanner[];
  colours?: ThemeColours;
  tags?: Record<string, string>;
  creator_type?: CreatorType;
  creator_display_name?: { name?: string };
  created_by?: string;
  extract_colors?: boolean;
}

export interface UpdateThemePayload {
  theme_title?: string;
  theme_description?: string;
  main_banner_type?: BannerType;
  main_banner_url?: string[];
  additional_banners?: AdditionalBanner[];
  colours?: ThemeColours;
  tags?: Record<string, string>;
  extract_colors?: boolean;
  updated_by?: string;
}

export interface CopyThemePayload {
  source_theme_id: string;
  user_id: string;
  theme_title?: string;
  main_banner_url?: string[];
  colours?: ThemeColours;
}

export interface RemoveBannerPayload {
  user_id: string;
  event_id: string;
  background_color: string;
  font_color: string;
  theme_title?: string;
}

export interface CreateLibraryPayload {
  title?: string;
  description?: string;
  tags?: Record<string, string>;
  is_public?: boolean;
  is_featured?: boolean;
  creator_type?: CreatorType;
  creator_display_name?: { name?: string };
  created_by?: string;
}

export interface UpdateLibraryPayload {
  title?: string;
  description?: string;
  tags?: Record<string, string>;
  is_public?: boolean;
  is_featured?: boolean;
  status?: LibraryStatus;
  updated_by?: string;
}

export interface CreateAssociationPayload {
  theme_id: string;
  theme_library_id: string;
  is_default?: boolean;
  is_featured?: boolean;
  created_by?: string;
}

export interface CreateLibraryObjectPayload {
  theme_library_id: string;
  object_type: ObjectType;
  object_id: string;
  association_type: AssociationType;
  created_by?: string;
}

export interface ToggleFavouritePayload {
  theme_id: string;
  object_type: string;
  object_id: string;
  is_favourite: boolean;
  created_by?: string;
}

export interface MarkUsedPayload {
  theme_id: string;
  object_type: string;
  object_id: string;
}

export interface ExtractColorsPayload {
  image_url: string;
  num_colors?: number;
  saturation_boost?: number;
}

// ─── Legacy Compatibility (for old theme/variant system) ────────────────────

/** @deprecated Used by /themes/getThemes — not part of the Theme Library V2 API */
export interface LegacyThemeVariant {
  variant_id: string;
  variant_name: string;
  preview_image: string;
  colors: {
    font: { primary: string; secondary: string };
    primary: string;
    secondary: string;
    background: { main: string; primary: string; secondary: string };
  };
  assets: Record<string, {
    type?: string;
    alt_text?: string;
    cdnFolderId?: string;
    uploadedAssetUrl?: string;
    repeat?: boolean;
  }>;
  status: string;
  meta_data: Record<string, unknown>;
  created_timestamp: string;
  updated_timestamp: string;
  is_default: boolean;
}

// ─── Theme Tagging ──────────────────────────────────────────────────────────

export interface ThemeTag {
  id: string;
  displayName: string;
  description?: string | null;
  status: 'Active' | 'Inactive';
  type: 'System';
}

export interface SystemThemesResponse extends ApiResponse<Theme[]> {
  total_count?: number;
  tag?: ThemeTag;
}

/** @deprecated Used by /themes/getThemes — not part of the Theme Library V2 API */
export interface LegacyTheme {
  theme_id: string;
  display_name: string;
  description?: string | null;
  fonts?: Record<string, unknown> | null;
  status: string;
  meta_data: Record<string, unknown>;
  default_theme_variant_id?: string | null;
  created_timestamp: string;
  updated_timestamp: string;
  creator: {
    user_id: string;
    display_name: string;
  };
  associated_tags_count: number;
  theme_variants: LegacyThemeVariant[];
  associated_tags: Array<{
    tag_id: string;
    name: string;
    level: number;
    description: string;
    sort_order: number;
    is_active: boolean;
    created_timestamp: string;
    updated_timestamp: string;
  }>;
}
