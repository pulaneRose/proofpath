/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        pastel: {
          bg: '#f6f4fa',
          lavender: '#ede8f8',
          pink: '#fdf2f8',
          peach: '#fff1f2',
          card: '#ffffff',
          border: 'rgba(230, 225, 245, 0.85)',
          sidebar: 'rgba(255, 255, 255, 0.75)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
        heading: ['Manrope', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(139, 92, 246, 0.08), 0 2px 8px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 10px 30px -5px rgba(112, 102, 140, 0.1), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 20px 40px -8px rgba(124, 58, 237, 0.18), 0 4px 12px -2px rgba(0, 0, 0, 0.06)',
        'pill': '0 4px 15px -1px rgba(124, 58, 237, 0.3)',
      },
      borderRadius: {
        '2.5xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
