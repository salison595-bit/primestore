/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        black: "#050505",
        graphite: "#1a1a1a",
        yellow: "#f2c200",
        "primary": "#d4af37",
        "background-dark": "#050505",
        "card-bg": "#0f0f0f",
        "surface": "#161616",
      },
      fontFamily: {
        "display": ["var(--font-manrope)", "sans-serif"],
        "sans": ["var(--font-inter)", "sans-serif"]
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.25)"
      },
      borderRadius: {
        xl: "1rem"
      }
    }
  },
  plugins: []
};
