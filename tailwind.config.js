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
  safelist: mentorColors.flatMap((color) => [
    `bg-${color}-950/40`,
    `border-${color}-500/30`,
    `text-${color}-300`,
  ]),
  theme: {
    extend: {},
  },
  plugins: [],
}
