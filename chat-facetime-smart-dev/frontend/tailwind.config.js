/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#8D538B",
        primaryHover: "#714270", 
        brand: {
          text: "#8D538B",
          title:"#472A46",
          Blue:"#00b0eb",
          bg: "#8D538B",
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(60deg, #feebf6 30%, #e5f9ff)',
      },
    },
  },
  plugins: [],
}
