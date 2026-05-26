// Button color darkening percentage (0-100, where 100 is fully black)
export const BUTTON_DARKEN_AMOUNT = 80;

/**
 * Helper to ensure valid hex color
 * @param color - The color string to validate
 * @returns A valid hex color string
 */
export const getValidHexColor = (color: string): string => {
  if (color.startsWith('#')) return color;
  if (/^[0-9A-Fa-f]{6}$/.test(color)) return `#${color}`;
  return color;
};

/**
 * Darkens a hex color by the specified percentage
 * @param color - The hex color string or color object with primary property
 * @param darkPercent - The percentage to darken (0-100), default 50
 * @returns The darkened hex color string
 */
export const darkenColor = (
  color: string | { primary: string } | undefined | null,
  darkPercent = 50
): string => {
  const colorStr = typeof color === 'string' ? color : color?.primary || '#ed873d';
  const hex = colorStr.replace('#', '');
  const factor = 1 - darkPercent / 100;

  return `#${[0, 2, 4]
    .map(i => Math.round(parseInt(hex.slice(i, i + 2), 16) * factor).toString(16).padStart(2, '0'))
    .join('')}`;
};

/**
 * Lightens a hex color by the specified percentage
 * @param color - The hex color string or color object with primary property
 * @param lightPercent - The percentage to lighten (0-100), default 50
 * @returns The lightened hex color string
 */
export const lightenColor = (
  color: string | { primary: string } | undefined | null,
  lightPercent = 50
): string => {
  const colorStr = typeof color === 'string' ? color : color?.primary || '#ed873d';
  const hex = colorStr.replace('#', '');
  const factor = lightPercent / 100;

  return `#${[0, 2, 4]
    .map(i => {
      const value = parseInt(hex.slice(i, i + 2), 16);
      const lightened = Math.round(value + (255 - value) * factor);
      return lightened.toString(16).padStart(2, '0');
    })
    .join('')}`;
};

export function hexToHSL(hex: string | null | undefined): [number, number, number] {
  const colorStr = typeof hex === 'string' ? hex : '#ed873d';
  const r = parseInt(colorStr.slice(1, 3), 16) / 255;
  const g = parseInt(colorStr.slice(3, 5), 16) / 255;
  const b = parseInt(colorStr.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
      default: h = 0; break;
    }
  }

  return [h * 360, s * 100, l * 100];
}

export function hslToHex(h: number, s: number, l: number): string {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return '#' + [r, g, b]
    .map(x => Math.round(x * 255).toString(16).padStart(2, '0'))
    .join('');
}


/**
 * Determines appropriate text color (black or white) based on background brightness
 * @param hex - The hex color string
 * @returns Either '#000000' for dark backgrounds or '#FFFFFF' for light backgrounds
 */
export const getContrastColor = (hex: string | null | undefined): string => {
  const colorStr = typeof hex === 'string' ? hex : '#ed873d';
  const r = parseInt(colorStr.slice(1, 3), 16);
  const g = parseInt(colorStr.slice(3, 5), 16);
  const b = parseInt(colorStr.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function isNearNeutral(s: number, l: number): boolean {
  return s < 25 || l < 10 || l > 92;
}

export function derivePrimary(h: number, s: number, l: number): string {
  if (l >= 70) return hslToHex(h, Math.min(s, 55), Math.min(l + 5, 93));
  return hslToHex(h, Math.min(s, 45), 88);
}

/**
 * Derives a secondary color from HSL values.
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @returns Secondary hex color with adjusted saturation and lightness
 */
export function deriveSecondary(h: number, s: number): string {
  return hslToHex(h, Math.min(Math.max(s, 55), 80), 30);
}

export function deriveText(h: number, s: number, l: number): string {
  if (s < 20 && l > 70) return hslToHex(h, 30, 22);
  return hslToHex(h, Math.min(s * 0.6, 45), 18);
}

/**
 * Extract dominant color from image URL (React Native version)
 * Requires: expo-image-colors or react-native-image-colors
 * @param imageUrl - The image URL to analyze
 * @returns Promise with primary color
 */
export async function extractDominantColors(imageUrl: string): Promise<{
  primary: string;
}> {
  try {
    // Try using expo-image-colors first
    try {
      const { getColors } = await import('expo-image-colors');
      const colors = await getColors(imageUrl);
      return {
        primary: colors.dominant || '#ed873d',
      };
    } catch {
      // Fallback: try react-native-image-colors
      try {
        const ImageColors = await import('react-native-image-colors');
        const colors = await ImageColors.getColors(imageUrl);
        if (colors.type === 'success') {
          return {
            primary: colors.dominant || '#ed873d',
          };
        }
      } catch {
        // If libraries aren't available, return default
        return {
          primary: '#ed873d',
        };
      }
    }
  } catch {
    return {
      primary: '#ed873d',
    };
  }
}

/**
 * Extract dominant colors from image URL (React Native version)
 * Derives primary, secondary, and text colors from the dominant color
 * Requires: expo-image-colors or react-native-image-colors
 * @param imageUrl - The image URL to analyze
 * @returns Promise with primary, secondary, and text colors
 */
export async function extractDominantColorsFromImage(imageUrl: string): Promise<{
  primary: string;
  secondary: string;
  text: string;
}> {
  const defaults = {
    primary: '#ED873D',
    secondary: '#8B4513',
    text: '#FFFFFF',
  };

  try {
    // Try using expo-image-colors first
    try {
      const { getColors } = await import('expo-image-colors');
      const colors = await getColors(imageUrl);
      const dominantColor = colors.dominant || '#ed873d';
      const [h, s, l] = hexToHSL(dominantColor);

      return {
        primary: derivePrimary(h, s, l),
        secondary: deriveSecondary(h, s),
        text: deriveText(h, s, l),
      };
    } catch {
      // Fallback: try react-native-image-colors
      try {
        const ImageColors = await import('react-native-image-colors');
        const colors = await ImageColors.getColors(imageUrl);
        if (colors.type === 'success') {
          const dominantColor = colors.dominant || '#ed873d';
          const [h, s, l] = hexToHSL(dominantColor);

          return {
            primary: derivePrimary(h, s, l),
            secondary: deriveSecondary(h, s),
            text: deriveText(h, s, l),
          };
        }
      } catch {
        // If libraries aren't available, return defaults
        return defaults;
      }
    }
  } catch {
    return defaults;
  }

  return defaults;
}
