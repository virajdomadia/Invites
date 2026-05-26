# Theme Library Integration Setup

## Overview
Successfully integrated the Theme Library Service into the React Native app with animations and dynamic theme fetching.

## Components Created/Modified

### 1. **themeLibraryService** (`src/core/api/themeLibraryService.ts`)
- Complete V2 API contract implementation
- Key methods:
  - `getSystemTags()` - Fetch all system theme tags
  - `getThemesByTag(tagId)` - Fetch themes for a specific tag with pagination
  - `listThemes()` - List all themes
  - `getTheme(themeId)` - Get single theme details
  - `getUserDefault(userId)` - Get user's default theme
  - `getUserRecent(userId)` - Get recently used themes
- Type definitions for Theme, ThemeTag, ThemeLibrary, etc.
- Error handling and response normalization

### 2. **ThemeImagesSection** (`src/components/home/ThemeImagesSection.tsx`)
- Dynamic theme image carousel with smooth animations
- Features:
  - Fetches themes from backend API
  - Responsive grid layout (2-column mobile, scrollable desktop)
  - Smooth zoom in/out transitions every 6 seconds
  - 3D rotation animation using react-native-reanimated
  - Loading and error states
  - Auto-cycles through themes

### 3. **NewHomePage** (`src/components/home/NewHomePage.tsx`)
- Added ThemeImagesSection between HeroSection and HostPartySection
- Integrated into main page flow

### 4. **Core Index** (`src/core/index.ts`)
- Exported themeLibraryService for easy access across the app

## API Endpoints Used

```
GET /theme-library/tags/system
GET /theme-library/tags/{tag_id}/themes
GET /theme-library/themes
GET /theme-library/themes/{theme_id}
GET /theme-library/user/{user_id}/default
GET /theme-library/user/{user_id}/recent
```

## Animation Details

The ThemeImagesSection uses react-native-reanimated for:
- **Entry Animation**: Zoom in from 0.88 → 1 scale over 800ms
- **Floating Effect**: Subtle 3D rotation and Y-axis translation continuously
- **Swap Transition**: 
  - Zoom out to 0.85 scale over 800ms
  - Load next theme image
  - Zoom in back to 1 over 800ms
  - Repeats every 6 seconds

## Usage

```tsx
import { ThemeImagesSection } from '@/components/home';
import { themeLibraryService } from '@/core';

// Section is automatically integrated in NewHomePage
// To use the service directly:
const tags = await themeLibraryService.getSystemTags();
const themes = await themeLibraryService.getThemesByTag(tagId);
```

## Type Safety

All API responses are typed with proper TypeScript interfaces:
- `Theme` - Individual theme data
- `ThemeTag` - System theme tags
- `ApiResponse<T>` - Standard API response format
- `PaginatedResponse<T>` - Paginated list responses

## Error Handling

- Service methods return typed responses with error fields
- Component displays loading spinner during fetch
- User-friendly error messages if themes can't load
- Graceful fallback if no images available

## Configuration

The service uses the existing `apiClient` configured in `src/core/api/api.ts` which reads the API URL from:
- `expo-constants` (app.json)
- Environment variables
- Defaults to `http://192.168.0.105:8000` in development

Update the API URL in `app.json` if needed:
```json
{
  "extra": {
    "apiUrl": "your-api-url"
  }
}
```

## Next Steps

1. Ensure backend API endpoints are implemented
2. Upload theme banner images to backend
3. Test the component by running the app
4. Customize animation timing/styles as needed
5. Consider implementing theme selection/filtering UI
