import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Verde-sálvia: calmo, associado a crescimento sem ser "banco tradicional".
        brand: {
          50: '#F0F7F5',
          100: '#DDEEE9',
          200: '#BEDDD5',
          300: '#93C4B8',
          400: '#66A597',
          500: '#468B7C',
          600: '#387063',
          700: '#2F5A51',
          800: '#294A43',
          900: '#243E38',
        },
        canvas: '#F6F8F7',
        line: '#E5EAE7',
        ink: { DEFAULT: '#1E2B29', soft: '#485753', muted: '#7B8884' },
        income: { DEFAULT: '#3D8C70', soft: '#E4F2EC' },
        expense: { DEFAULT: '#B8645F', soft: '#F8ECEA' },
        warn: { DEFAULT: '#A9803A', soft: '#F6EFE0' },
      },
      fontFamily: { sans: ['var(--font-sans)', 'system-ui', 'sans-serif'] },
      boxShadow: {
        card: '0 1px 2px rgba(30,43,41,0.04), 0 6px 20px rgba(30,43,41,0.04)',
        pop: '0 16px 48px rgba(30,43,41,0.16)',
      },
      keyframes: {
        'sheet-in': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'sheet-in': 'sheet-in 180ms ease-out',
        'toast-in': 'toast-in 160ms ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
