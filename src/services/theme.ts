import { apiClient } from './api';

const BASE = '/c56/theme-library';

// ─── Type Definitions ──────────────────────────────────────────────────────

export interface Colours {
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
}

export interface Theme {
  id: string;
  name: string;
  title?: string;
  main_banner_url?: string[];
  colours?: Colours;
  description?: string;
  creator_type?: string;
  created_by?: string;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ThemeTag {
  id: string;
  name: string;
  description?: string;
}

export interface ThemeLibraryAssociation {
  id: string;
  theme_id: string;
  library_id: string;
  is_default: boolean;
  theme?: Theme;
}

export interface ThemeLibrary {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  created_by?: string;
  themes?: ThemeLibraryAssociation[];
  created_at?: string;
}

export interface ThemeObjectFavourite {
  id: string;
  theme_id: string;
  object_id: string;
  object_type: string;
  is_recent?: boolean;
  theme?: Theme;
  last_used?: string;
}

export interface LibraryObjectAssociation {
  id: string;
  library_id: string;
  object_id: string;
  object_type: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  error?: string;
  status: number;
}

export interface SystemThemesResponse extends PaginatedResponse<Theme> {}

export interface CreateThemePayload {
  name: string;
  title?: string;
  colours?: Colours;
  main_banner_url?: string[];
  description?: string;
  is_public?: boolean;
}

export interface UpdateThemePayload {
  name?: string;
  title?: string;
  colours?: Colours;
  main_banner_url?: string[];
  description?: string;
  is_public?: boolean;
}

export interface CopyThemePayload {
  source_theme_id: string;
  user_id: string;
  theme_title?: string;
  colours?: Colours;
  main_banner_url?: string[];
}

export interface RemoveBannerPayload {
  theme_id: string;
}

export interface CreateLibraryPayload {
  name: string;
  description?: string;
  is_public?: boolean;
}

export interface UpdateLibraryPayload {
  name?: string;
  description?: string;
  is_public?: boolean;
}

export interface CreateAssociationPayload {
  theme_id: string;
  library_id: string;
}

export interface CreateLibraryObjectPayload {
  library_id: string;
  object_id: string;
  object_type: string;
}

export interface ToggleFavouritePayload {
  theme_id: string;
  object_id: string;
  object_type: string;
}

export interface MarkUsedPayload {
  theme_id: string;
  object_id: string;
  object_type: string;
}

export interface ExtractColorsPayload {
  image_url: string;
}

export interface ExtractColorsResponse extends ApiResponse<Colours> {}

// ─── Helper Functions ──────────────────────────────────────────────────────

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error';
}

/**
 * Normalize theme data from the API.
 * The backend sometimes returns colors as objects {hex, name, rgb} instead of strings.
 * We normalize these to hex strings for frontend consistency.
 */
function normalizeTheme(theme: any): Theme {
  if (!theme) return theme;

  const getHex = (color: any) => (color && typeof color === 'object' ? color.hex : color);

  const colours = theme.colours || {};
  return {
    ...theme,
    colours: {
      ...colours,
      primary: getHex(colours.primary),
      secondary: getHex(colours.secondary),
      background: colours.background ? {
        primary: getHex(colours.background.primary),
        secondary: getHex(colours.background.secondary),
      } : undefined,
      font: colours.font ? {
        primary: getHex(colours.font.primary),
        secondary: getHex(colours.font.secondary),
      } : undefined,
    }
  };
}

function normalizeAssociation(assoc: any): ThemeLibraryAssociation {
  if (!assoc || !assoc.theme) return assoc;
  return {
    ...assoc,
    theme: normalizeTheme(assoc.theme),
  };
}

function normalizeLibrary(lib: any): ThemeLibrary {
  if (!lib || !lib.themes) return lib;
  return {
    ...lib,
    themes: lib.themes.map(normalizeAssociation),
  };
}

// ─── 1. Theme CRUD ──────────────────────────────────────────────────────────

/**
 * POST /theme-library/themes — Create a Theme
 */
export const createTheme = async (
  payload: CreateThemePayload,
): Promise<ApiResponse<Theme>> => {
  try {
    const response = await apiClient.post<Theme>(`${BASE}/themes`, payload);
    if (response.error) {
      throw new Error(`Failed to create theme: ${response.error}`);
    }
    return {
      data: response.data ? normalizeTheme(response.data) : undefined,
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    return {
      status: 0,
      error: errorMsg,
    };
  }
};

/**
 * GET /theme-library/themes/{theme_id} — Get a Theme
 */
export const getTheme = async (
  themeId: string,
): Promise<ApiResponse<Theme>> => {
  try {
    const response = await apiClient.get<Theme>(`${BASE}/themes/${themeId}`);
    if (response.error) {
      throw new Error(`Failed to fetch theme: ${response.error}`);
    }
    return {
      data: response.data ? normalizeTheme(response.data) : undefined,
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    return {
      status: 0,
      error: errorMsg,
    };
  }
};

/**
 * GET /theme-library/themes — List Themes
 */
export const listThemes = async (
  params?: {
    creator_type?: string;
    created_by?: string;
    limit?: number;
    offset?: number;
  }
): Promise<PaginatedResponse<Theme>> => {
  try {
    const response = await apiClient.get<Theme[]>(`${BASE}/themes`);
    if (response.error) {
      throw new Error(`Failed to list themes: ${response.error}`);
    }
    const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
    return {
      data: data.map(normalizeTheme),
      total: Array.isArray(response.data) ? response.data.length : response.data?.total || 0,
      limit: params?.limit ?? 50,
      offset: params?.offset ?? 0,
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    return {
      data: [],
      total: 0,
      limit: params?.limit ?? 50,
      offset: params?.offset ?? 0,
      status: 0,
      error: errorMsg,
    };
  }
};

/**
 * PUT /theme-library/themes/{theme_id} — Update a Theme
 */
export const updateTheme = async (
  themeId: string,
  payload: UpdateThemePayload,
): Promise<ApiResponse<Theme>> => {
  try {
    const response = await apiClient.put<Theme>(`${BASE}/themes/${themeId}`, payload);
    if (response.error) {
      throw new Error(`Failed to update theme: ${response.error}`);
    }
    return {
      data: response.data ? normalizeTheme(response.data) : undefined,
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    return {
      status: 0,
      error: errorMsg,
    };
  }
};

/**
 * DELETE /theme-library/themes/{theme_id} — Soft-Delete a Theme
 */
export const deleteTheme = async (
  themeId: string,
): Promise<ApiResponse<void>> => {
  try {
    const response = await apiClient.delete(`${BASE}/themes/${themeId}`);
    if (response.error) {
      throw new Error(`Failed to delete theme: ${response.error}`);
    }
    return {
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    return {
      status: 0,
      error: errorMsg,
    };
  }
};

// ─── 2. Theme Library CRUD ──────────────────────────────────────────────────

/**
 * POST /theme-library/libraries — Create a Library
 */
export const createLibrary = async (
  payload: CreateLibraryPayload,
): Promise<ApiResponse<ThemeLibrary>> => {
  try {
    const response = await apiClient.post<ThemeLibrary>(`${BASE}/libraries`, payload);
    if (response.error) {
      throw new Error(`Failed to create library: ${response.error}`);
    }
    return {
      data: response.data ? normalizeLibrary(response.data) : undefined,
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    console.error('[ThemeLibraryService] Failed to create library:', errorMsg);
    return {
      status: 0,
      error: errorMsg,
    };
  }
};

/**
 * GET /theme-library/libraries/{library_id} — Get a Library (with themes)
 */
export const getLibrary = async (
  libraryId: string,
): Promise<ApiResponse<ThemeLibrary>> => {
  try {
    const response = await apiClient.get<ThemeLibrary>(`${BASE}/libraries/${libraryId}`);
    if (response.error) {
      throw new Error(`Failed to fetch library: ${response.error}`);
    }
    return {
      data: response.data ? normalizeLibrary(response.data) : undefined,
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    console.error('[ThemeLibraryService] Failed to fetch library:', errorMsg);
    return {
      status: 0,
      error: errorMsg,
    };
  }
};

/**
 * GET /theme-library/libraries — List Libraries
 */
export const listLibraries = async (
  params?: {
    created_by?: string;
    is_public?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<PaginatedResponse<ThemeLibrary>> => {
  try {
    const response = await apiClient.get<ThemeLibrary[]>(`${BASE}/libraries`);
    if (response.error) {
      throw new Error(`Failed to list libraries: ${response.error}`);
    }
    const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
    return {
      data: data.map(normalizeLibrary),
      total: Array.isArray(response.data) ? response.data.length : response.data?.total || 0,
      limit: params?.limit ?? 50,
      offset: params?.offset ?? 0,
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    console.error('[ThemeLibraryService] Failed to list libraries:', errorMsg);
    return {
      data: [],
      total: 0,
      limit: params?.limit ?? 50,
      offset: params?.offset ?? 0,
      status: 0,
      error: errorMsg,
    };
  }
};

/**
 * PUT /theme-library/libraries/{library_id} — Update a Library
 */
export const updateLibrary = async (
  libraryId: string,
  payload: UpdateLibraryPayload,
): Promise<ApiResponse<ThemeLibrary>> => {
  try {
    const response = await apiClient.put<ThemeLibrary>(
      `${BASE}/libraries/${libraryId}`,
      payload,
    );
    if (response.error) {
      throw new Error(`Failed to update library: ${response.error}`);
    }
    return {
      data: response.data ? normalizeLibrary(response.data) : undefined,
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    console.error('[ThemeLibraryService] Failed to update library:', errorMsg);
    return {
      status: 0,
      error: errorMsg,
    };
  }
};

// ─── 3. Theme ↔ Library Associations ────────────────────────────────────────

/**
 * POST /theme-library/associations — Link a Theme to a Library
 */
export const createAssociation = async (
  payload: CreateAssociationPayload,
): Promise<ApiResponse<ThemeLibraryAssociation>> => {
  try {
    const response = await apiClient.post<ThemeLibraryAssociation>(
      `${BASE}/associations`,
      payload,
    );
    if (response.error) {
      throw new Error(`Failed to create association: ${response.error}`);
    }
    return {
      data: response.data ? normalizeAssociation(response.data) : undefined,
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    console.error('[ThemeLibraryService] Failed to create association:', errorMsg);
    return {
      status: 0,
      error: errorMsg,
    };
  }
};

/**
 * PUT /theme-library/associations/{assoc_id}/set-default — Set Default Theme
 */
export const setDefaultAssociation = async (
  assocId: string,
): Promise<ApiResponse<void>> => {
  try {
    const response = await apiClient.put(
      `${BASE}/associations/${assocId}/set-default`,
    );
    if (response.error) {
      throw new Error(`Failed to set default theme: ${response.error}`);
    }
    return {
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    console.error('[ThemeLibraryService] Failed to set default theme:', errorMsg);
    return {
      status: 0,
      error: errorMsg,
    };
  }
};

/**
 * DELETE /theme-library/associations/{assoc_id} — Remove Theme from Library
 */
export const deleteAssociation = async (
  assocId: string,
): Promise<ApiResponse<void>> => {
  try {
    const response = await apiClient.delete(`${BASE}/associations/${assocId}`);
    if (response.error) {
      throw new Error(`Failed to delete association: ${response.error}`);
    }
    return {
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    console.error('[ThemeLibraryService] Failed to delete association:', errorMsg);
    return {
      status: 0,
      error: errorMsg,
    };
  }
};

// ─── 4. Library ↔ User/Org Associations ─────────────────────────────────────

/**
 * POST /theme-library/library-objects — Link a Library to a User/Org
 */
export const createLibraryObject = async (
  payload: CreateLibraryObjectPayload,
): Promise<ApiResponse<LibraryObjectAssociation>> => {
  try {
    const response = await apiClient.post<LibraryObjectAssociation>(
      `${BASE}/library-objects`,
      payload,
    );
    if (response.error) {
      throw new Error(`Failed to create library-object link: ${response.error}`);
    }
    return {
      data: response.data,
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    console.error('[ThemeLibraryService] Failed to create library-object link:', errorMsg);
    return {
      status: 0,
      error: errorMsg,
    };
  }
};

/**
 * GET /theme-library/library-objects/user/{user_id} — Get User's Libraries
 */
export const getUserLibraries = async (
  userId: string,
): Promise<ApiResponse<ThemeLibrary[]>> => {
  try {
    const response = await apiClient.get<ThemeLibrary[]>(
      `${BASE}/library-objects/user/${userId}`,
    );
    if (response.error) {
      throw new Error(`Failed to fetch user libraries: ${response.error}`);
    }
    const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
    return {
      data: data.map(normalizeLibrary),
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    console.error('[ThemeLibraryService] Failed to fetch user libraries:', errorMsg);
    return {
      data: [],
      status: 0,
      error: errorMsg,
    };
  }
};

/**
 * DELETE /theme-library/library-objects/{assoc_id} — Unlink Library from User
 */
export const deleteLibraryObject = async (
  assocId: string,
): Promise<ApiResponse<void>> => {
  try {
    const response = await apiClient.delete(
      `${BASE}/library-objects/${assocId}`,
    );
    if (response.error) {
      throw new Error(`Failed to delete library-object link: ${response.error}`);
    }
    return {
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    console.error('[ThemeLibraryService] Failed to delete library-object link:', errorMsg);
    return {
      status: 0,
      error: errorMsg,
    };
  }
};

// ─── 5. Favourites & Usage Tracking ─────────────────────────────────────────

/**
 * POST /theme-library/favourites — Toggle Favourite
 */
export const toggleFavourite = async (
  payload: ToggleFavouritePayload,
): Promise<ApiResponse<ThemeObjectFavourite>> => {
  try {
    const response = await apiClient.post<ThemeObjectFavourite>(
      `${BASE}/favourites`,
      payload,
    );
    if (response.error) {
      throw new Error(`Failed to toggle favourite: ${response.error}`);
    }
    return {
      data: response.data,
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    console.error('[ThemeLibraryService] Failed to toggle favourite:', errorMsg);
    return {
      status: 0,
      error: errorMsg,
    };
  }
};

/**
 * GET /theme-library/favourites/user/{user_id} — Get User's Favourites
 */
export const getUserFavourites = async (
  userId: string,
  params?: { limit?: number; offset?: number }
): Promise<PaginatedResponse<ThemeObjectFavourite>> => {
  try {
    const response = await apiClient.get<ThemeObjectFavourite[]>(
      `${BASE}/favourites/user/${userId}`,
    );
    if (response.error) {
      throw new Error(`Failed to fetch user favourites: ${response.error}`);
    }
    const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
    return {
      data: data.map((fav: any) => ({
        ...fav,
        theme: fav.theme ? normalizeTheme(fav.theme) : undefined
      })),
      total: Array.isArray(response.data) ? response.data.length : response.data?.total || 0,
      limit: params?.limit ?? 20,
      offset: params?.offset ?? 0,
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    console.error('[ThemeLibraryService] Failed to fetch user favourites:', errorMsg);
    return {
      data: [],
      total: 0,
      limit: params?.limit ?? 20,
      offset: params?.offset ?? 0,
      status: 0,
      error: errorMsg,
    };
  }
};

/**
 * POST /theme-library/favourites/mark-used — Mark Theme as Recently Used
 */
export const markThemeUsed = async (
  payload: MarkUsedPayload,
): Promise<ApiResponse<ThemeObjectFavourite>> => {
  try {
    const response = await apiClient.post<ThemeObjectFavourite>(
      `${BASE}/favourites/mark-used`,
      payload,
    );
    if (response.error) {
      throw new Error(`Failed to mark theme as used: ${response.error}`);
    }
    return {
      data: response.data,
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    console.error('[ThemeLibraryService] Failed to mark theme as used:', errorMsg);
    return {
      status: 0,
      error: errorMsg,
    };
  }
};

/**
 * GET /theme-library/user/{user_id}/recent — Get Recently Used Themes
 */
export const getUserRecent = async (
  userId: string,
  params?: { limit?: number }
): Promise<ApiResponse<ThemeObjectFavourite[]>> => {
  try {
    const response = await apiClient.get<ThemeObjectFavourite[]>(
      `${BASE}/user/${userId}/recent`,
    );
    if (response.error) {
      throw new Error(`Failed to fetch recent themes: ${response.error}`);
    }
    const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
    return {
      data: data.map((recent: any) => ({
        ...recent,
        theme: recent.theme ? normalizeTheme(recent.theme) : undefined
      })),
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    console.error('[ThemeLibraryService] Failed to fetch recent themes:', errorMsg);
    return {
      data: [],
      status: 0,
      error: errorMsg,
    };
  }
};

// ─── 6. Convenience / Flow Endpoints ────────────────────────────────────────

/**
 * GET /theme-library/user/{user_id}/default — Get User's Default Theme
 */
export const getUserDefault = async (
  userId: string,
): Promise<ApiResponse<Theme>> => {
  try {
    const response = await apiClient.get<Theme>(`${BASE}/user/${userId}/default`);
    if (response.error) {
      throw new Error(`Failed to fetch default theme: ${response.error}`);
    }
    return {
      data: response.data ? normalizeTheme(response.data) : undefined,
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    console.error('[ThemeLibraryService] Failed to fetch default theme:', errorMsg);
    return {
      status: 0,
      error: errorMsg,
    };
  }
};

/**
 * POST /theme-library/setup-default/{user_id} — First-Event Setup
 */
export const setupDefault = async (
  userId: string,
): Promise<ApiResponse<{ theme_library_id: string; default_theme: Theme }>> => {
  try {
    const response = await apiClient.post<{ theme_library_id: string; default_theme: Theme }>(
      `${BASE}/setup-default/${userId}`,
    );
    if (response.error) {
      throw new Error(`Failed to setup default theme: ${response.error}`);
    }
    return {
      data: response.data ? {
        ...response.data,
        default_theme: normalizeTheme(response.data.default_theme),
      } : undefined,
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    console.error('[ThemeLibraryService] Failed to setup default theme:', errorMsg);
    return {
      status: 0,
      error: errorMsg,
    };
  }
};

/**
 * POST /theme-library/copy-theme — Copy-on-Write
 */
export const copyTheme = async (
  payload: CopyThemePayload,
): Promise<ApiResponse<Theme>> => {
  try {
    const response = await apiClient.post<Theme>(
      `${BASE}/copy-theme`,
      payload,
    );
    if (response.error) {
      throw new Error(`Failed to copy theme: ${response.error}`);
    }
    return {
      data: response.data ? normalizeTheme(response.data) : undefined,
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    console.error('[ThemeLibraryService] Failed to copy theme:', errorMsg);
    return {
      status: 0,
      error: errorMsg,
    };
  }
};

/**
 * Helper: Copy system theme with customizations
 */
export const copyAndCustomizeTheme = async (
  sourceThemeId: string,
  userId: string,
  customizations: {
    title?: string;
    colours?: Partial<Theme['colours']>;
    bannerUrl?: string[];
  },
): Promise<ApiResponse<Theme>> => {
  const payload: CopyThemePayload = {
    source_theme_id: sourceThemeId,
    user_id: userId,
    theme_title: customizations.title,
    colours: customizations.colours as Colours,
    main_banner_url: customizations.bannerUrl,
  };
  return copyTheme(payload);
};

/**
 * POST /theme-library/themes/remove-banner — Remove Banner from Theme
 */
export const removeBanner = async (
  payload: RemoveBannerPayload,
): Promise<ApiResponse<Theme>> => {
  try {
    const response = await apiClient.post<Theme>(
      `${BASE}/themes/remove-banner`,
      payload,
    );
    if (response.error) {
      throw new Error(`Failed to remove banner: ${response.error}`);
    }
    return {
      data: response.data ? normalizeTheme(response.data) : undefined,
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    console.error('[ThemeLibraryService] Failed to remove banner:', errorMsg);
    return {
      status: 0,
      error: errorMsg,
    };
  }
};

// ─── 7. Color Extraction ────────────────────────────────────────────────────

/**
 * POST /theme-library/extract-colors — Extract Palette from Image
 */
export const extractColors = async (
  payload: ExtractColorsPayload,
): Promise<ExtractColorsResponse> => {
  try {
    const response = await apiClient.post<Colours>(
      `${BASE}/extract-colors-openai-poc`,
      payload,
    );
    if (response.error) {
      throw new Error(`Failed to extract colors: ${response.error}`);
    }
    return {
      data: response.data,
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    console.error('[ThemeLibraryService] Failed to extract colors:', errorMsg);
    return {
      status: 0,
      error: errorMsg,
    };
  }
};

// ─── 8. Theme Tagging (System Themes) ───────────────────────────────────────

/**
 * GET /theme-library/tags/system — List System Theme Tags
 */
export const getSystemTags = async (): Promise<ApiResponse<ThemeTag[]>> => {
  try {
    const response = await apiClient.get<ThemeTag[]>(`${BASE}/tags/system`);
    if (response.error) {
      throw new Error(`Failed to fetch system tags: ${response.error}`);
    }
    return {
      data: Array.isArray(response.data) ? response.data : response.data?.data || [],
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    console.error('[ThemeLibraryService] Failed to fetch system tags:', errorMsg);
    return {
      data: [],
      status: 0,
      error: errorMsg,
    };
  }
};

/**
 * GET /theme-library/tags/{tag_id}/themes — List System Themes by Tag
 */
export const getThemesByTag = async (
  tagId: string,
  params?: { limit?: number; offset?: number }
): Promise<SystemThemesResponse> => {
  try {
    const response = await apiClient.get<Theme[]>(
      `${BASE}/tags/${tagId}/themes`,
    );
    if (response.error) {
      throw new Error(`Failed to fetch themes by tag: ${response.error}`);
    }
    const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
    return {
      data: data.map(normalizeTheme),
      total: Array.isArray(response.data) ? response.data.length : response.data?.total || 0,
      limit: params?.limit ?? 50,
      offset: params?.offset ?? 0,
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    console.error('[ThemeLibraryService] Failed to fetch themes by tag:', errorMsg);
    return {
      data: [],
      total: 0,
      limit: params?.limit ?? 50,
      offset: params?.offset ?? 0,
      status: 0,
      error: errorMsg,
    };
  }
};

/**
 * GET /theme-library/themes/{theme_id}/tags — Get Tags for a Theme
 */
export const getThemeTags = async (
  themeId: string,
): Promise<ApiResponse<ThemeTag[]>> => {
  try {
    const response = await apiClient.get<ThemeTag[]>(
      `${BASE}/themes/${themeId}/tags`
    );
    if (response.error) {
      throw new Error(`Failed to fetch theme tags: ${response.error}`);
    }
    return {
      data: Array.isArray(response.data) ? response.data : response.data?.data || [],
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    console.error('[ThemeLibraryService] Failed to fetch theme tags:', errorMsg);
    return {
      data: [],
      status: 0,
      error: errorMsg,
    };
  }
};

/**
 * POST /theme-library/themes/{theme_id}/tags/{tag_id} — Associate Tag with Theme
 */
export const associateTagWithTheme = async (
  themeId: string,
  tagId: string,
): Promise<ApiResponse<{ tagId: string; themeId: string; status: string }>> => {
  try {
    const response = await apiClient.post<{ tagId: string; themeId: string; status: string }>(
      `${BASE}/themes/${themeId}/tags/${tagId}`
    );
    if (response.error) {
      throw new Error(`Failed to associate tag with theme: ${response.error}`);
    }
    return {
      data: response.data,
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    console.error('[ThemeLibraryService] Failed to associate tag with theme:', errorMsg);
    return {
      status: 0,
      error: errorMsg,
    };
  }
};

/**
 * DELETE /theme-library/themes/{theme_id}/tags/{tag_id} — Remove Tag from Theme
 */
export const removeTagFromTheme = async (
  themeId: string,
  tagId: string,
): Promise<ApiResponse<void>> => {
  try {
    const response = await apiClient.delete(
      `${BASE}/themes/${themeId}/tags/${tagId}`
    );
    if (response.error) {
      throw new Error(`Failed to remove tag from theme: ${response.error}`);
    }
    return {
      status: response.status,
    };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    console.error('[ThemeLibraryService] Failed to remove tag from theme:', errorMsg);
    return {
      status: 0,
      error: errorMsg,
    };
  }
};

// ─── Service Instance ──────────────────────────────────────────────────────

export const themeLibraryService = {
  createTheme,
  getTheme,
  listThemes,
  updateTheme,
  deleteTheme,
  createLibrary,
  getLibrary,
  listLibraries,
  updateLibrary,
  createAssociation,
  setDefaultAssociation,
  deleteAssociation,
  createLibraryObject,
  getUserLibraries,
  deleteLibraryObject,
  toggleFavourite,
  getUserFavourites,
  markThemeUsed,
  getUserRecent,
  getUserDefault,
  setupDefault,
  copyTheme,
  copyAndCustomizeTheme,
  removeBanner,
  extractColors,
  getSystemTags,
  getThemesByTag,
  getThemeTags,
  associateTagWithTheme,
  removeTagFromTheme,
};
