/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
          burger: {
              orange: '#FF5722', 
              charcoal: '#1A1A1A', 
              dark: '#0D0D0D'      
          }
      },
      fontFamily: {
          heading: ['Montserrat', 'sans-serif'],
          body: ['Archivo', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
