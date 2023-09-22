/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Background
        bgLight: "#FBFBF2",
        bgDark: "#232629",

        // Text
        txtLight: "#232629",
        txtDark: "#FBFBF2",

        // Element
        lmntLight: "#E5E6E4",
        lmntDark: "#121213",

        // Accent
        accnt: "#273469",

        // Sun
        sun: "#765403",

        // Moon
        moon: "#FBCC60",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
