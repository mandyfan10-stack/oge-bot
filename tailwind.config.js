/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{svelte,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tahoma', 'Arial', 'sans-serif'],
      },
      colors: {
        vk: {
          header:   '#517396',
          header2:  '#4a6f96',
          bg:       '#edeef0',
          panel:    '#ffffff',
          border:   '#e7e8ec',
          text:     '#000000',
          text2:    '#333333',
          muted:    '#777777',
          link:     '#2b587a',
          btn:      '#5b88bd',
          btnHover: '#6d97c4',
          rowHover: '#f0f3f7',
        },
      },
    },
  },
  plugins: [],
}
