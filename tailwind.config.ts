import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark palette
        dark: {
          bg: '#0F0F14',
          surface: '#1A1A24',
          surfaceVariant: '#252533',
          primary: '#7C5CFC',
          primaryContainer: '#3D2E7E',
          secondary: '#5CE1E6',
          onPrimary: '#FFFFFF',
          onBg: '#F0F0F5',
          onSurface: '#D0D0DD',
          onSurfaceVariant: '#8888A0',
          outline: '#35354A',
        },
        // Light palette
        light: {
          bg: '#F5F5FA',
          surface: '#FFFFFF',
          surfaceVariant: '#EDECF5',
          primary: '#6341E0',
          primaryContainer: '#E0D6FF',
          secondary: '#00B4D8',
          onPrimary: '#FFFFFF',
          onBg: '#1A1A2E',
          onSurface: '#2E2E42',
          onSurfaceVariant: '#6E6E85',
          outline: '#D5D5E0',
        },
        // Set type badge colors
        setType: {
          work: '#7C5CFC',
          warmup: '#FF9F43',
          drop: '#A855F7',
          failure: '#EF4444',
          backoff: '#14B8A6',
          amrap: '#F59E0B',
          restPause: '#3B82F6',
          superset: '#EC4899',
          custom: '#9C27B0',
        },
      },
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
