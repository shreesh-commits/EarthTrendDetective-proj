/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nature: {
          forest: '#355E3B',
          'forest-dark': '#29492E',
          'forest-light': '#44754B',
          olive: '#526B43',
          'olive-dark': '#3F5333',
          sage: '#A3B18A',
          'sage-light': '#B8C4A4',
          mint: '#DDE5D0',
          'mint-light': '#EFF4E8',
          cream: '#F7F5ED',
          'cream-light': '#FCFAF5',
          sand: '#E8E1D1',
          'sand-dark': '#D5CDBE',
          earth: '#8A7155',
          'earth-dark': '#6E5A44',
          water: '#789BA6',
          'water-dark': '#5B7F8A',
          charcoal: '#343A32',
          'charcoal-light': '#4A5247',
          'charcoal-muted': '#6B7367',
          terracotta: '#C06C54',
          'terracotta-dark': '#A3523B',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
        display: ['DM Serif Display', 'Lora', 'serif'],
        mono: ['DM Sans', 'monospace'],
      },
      boxShadow: {
        'organic': '0 2px 12px -2px rgba(52, 58, 50, 0.06), 0 1px 3px rgba(52, 58, 50, 0.04)',
        'organic-lg': '0 8px 24px -4px rgba(52, 58, 50, 0.08), 0 2px 6px rgba(52, 58, 50, 0.04)',
      }
    },
  },
  plugins: [],
}
