/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        sans: ['system-ui', 'sans-serif'],
      },
      colors: {
        cream: '#F5F0E8',
        terracotta: '#C4622D',
        olive: '#6B7C45',
        navy: '#1C2B4A',
        gold: '#D4A843',
        stone: '#8C7B6B',
      },
    },
  },
  plugins: [],
}
