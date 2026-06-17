/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          primary: '#00565f',
          light: '#7db8b3',
          pale: '#daedf0',
          dark: '#005761',
        },
        coral: {
          primary: '#eb6e54',
          light: '#f5c5b0',
        },
        gold: {
          primary: '#fcc46a',
          light: '#f5c97a',
        },
        cream: '#FAFAF9',
      },
      fontFamily: {
        sans: ['TT Commons', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
