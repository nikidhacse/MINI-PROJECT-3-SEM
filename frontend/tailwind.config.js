/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aether: {
          primary:  '#8B5CF6',
          secondary:'#C4B5FD',
          accent:   '#A78BFA',
          bg:       '#F8F7FF',
          section:   '#F3F0FF',
          card:     '#FFFFFF',
          border:   '#E9D5FF',
          text:     '#2D1B69',
          subtext:  '#6B7280',
          hover:    '#7C3AED',
          light:    '#F5F3FF',
        }
      },
      borderRadius: {
        card: '18px',
        '2xl': '18px',
        '3xl': '24px'
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif']
      },
      boxShadow: {
        'lavender-sm': '0 2px 8px -2px rgba(139,92,246,.08), 0 1px 4px -1px rgba(45,27,105,.04)',
        'lavender-md': '0 8px 24px -4px rgba(139,92,246,.12), 0 4px 12px -2px rgba(45,27,105,.04)',
        'lavender-lg': '0 20px 32px -8px rgba(139,92,246,.18), 0 8px 16px -4px rgba(45,27,105,.06)',
        'glass':       '0 8px 32px 0 rgba(139,92,246,.08)',
      }
    },
  },
  plugins: [],
}
