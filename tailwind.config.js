/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:  '#1A3A5C',
        accent:   '#8B1A2E',
        surface:  '#FFFFFF',
        bg:       '#F8F9FA',
        text:     '#1F2937',
      },
      fontFamily: { sans: ['"DM Sans"', 'sans-serif'] },
      boxShadow: {
        card:  '0 1px 3px 0 rgba(0,0,0,.08), 0 1px 2px -1px rgba(0,0,0,.06)',
        modal: '0 20px 60px -10px rgba(0,0,0,.25)',
      },
    },
  },
  plugins: [],
}
