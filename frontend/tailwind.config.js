/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nubank: {
          purple: '#820ad1',
          light: '#a45ee0',
          dark: '#5c0694',
          bg: '#f5f5f5',
          text: '#191919'
        }
      },
      fontFamily: {
        sans: ['Graphik', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
