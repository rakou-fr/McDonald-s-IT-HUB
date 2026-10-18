/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mcd: {
          yellow: '#FFC72C',
          green: '#004C23', // Vert d'entreprise
          white: '#FFFFFF',
          light: '#F3F4F6', // Gris très clair (fonds)
          border: '#E5E7EB',
          text: '#1F2937', // Gris foncé/noir
          muted: '#6B7280'
        }
      },
      borderRadius: {
        // Limitation des arrondis pour un aspect plus sérieux (IT)
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
      }
    },
  },
  plugins: [],
}