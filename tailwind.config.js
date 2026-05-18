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
    },
  },
  plugins: [],
};
