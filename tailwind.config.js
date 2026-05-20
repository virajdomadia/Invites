/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007AFF',
        secondary: '#5AC8FA',
        success: '#34C759',
        error: '#FF3B30',
        warning: '#FF9500',
      },
      fontFamily: {
        caveatbrush: ['CaveatBrush_400Regular', "'Caveat Brush'", 'cursive'],
        lexend: ['Lexend_400Regular', 'Lexend_500Medium', 'Lexend_600SemiBold'],
        literata: ['Literata_400Regular', 'Literata_500Medium', 'Literata_600SemiBold'],
      },
    },
  },
  plugins: [],
};
