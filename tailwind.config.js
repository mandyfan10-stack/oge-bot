const mentorColors = [
  'indigo',
  'violet',
  'pink',
  'blue',
  'amber',
  'rose',
  'cyan',
  'fuchsia',
  'teal',
  'orange',
  'lime',
  'green',
  'emerald',
  'sky',
  'slate',
];

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{svelte,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#020617',
          card: 'rgba(30, 41, 59, 0.5)',
          accent: '#6366f1',
        }
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 4s ease-in-out infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  safelist: [
    ...mentorColors.flatMap((color) => [
      `bg-${color}-500/10`,
      `border-${color}-500/20`,
      `text-${color}-400`,
      `bg-${color}-600`,
    ]),
  ],
  plugins: [],
}
