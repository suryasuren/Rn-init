/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        cinemaRed: "#7a0000",      // deep label color
        cinemaRedDark: "#8b0f0f",  // chevron color
      },
      spacing: {
        18: "4.5rem",
      },
      fontWeight: {
        extrabold: "800",
      },
    },
  },
  plugins: [],
};
