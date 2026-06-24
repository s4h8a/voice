import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17211b',
        muted: '#66736b',
        line: '#d9e2dc',
        panel: '#ffffff',
        canvas: '#f6f8f4',
        brand: '#176f55',
        accent: '#c25a32',
        warn: '#a16400',
        danger: '#b3261e'
      },
      boxShadow: {
        soft: '0 8px 28px rgba(23, 33, 27, 0.08)'
      }
    }
  },
  plugins: []
};

export default config;
