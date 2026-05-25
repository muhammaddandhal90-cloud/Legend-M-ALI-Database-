/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
