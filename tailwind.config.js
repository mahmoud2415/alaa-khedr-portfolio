/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wood: {
          900: '#0F0D0B', // Deepest Walnut Charcoal background
          850: '#171412', // Dark wood card
          800: '#221D19', // Elevated wood panel
          700: '#342B24', // Border & divider
          600: '#5A4A3D',
          amber: '#D97706', // Warm Honey Amber
          gold: '#F59E0B',  // Burnished Finish Gold
          cream: '#FAF7F2', // Crisp luxury cream text
          muted: '#A89E94'  // Subdued wood text
        }
      },
      fontFamily: {
        alexandria: ['Alexandria', 'Cairo', 'sans-serif'],
        cairo: ['Cairo', 'sans-serif']
      }
    },
  },
  plugins: [],
}
