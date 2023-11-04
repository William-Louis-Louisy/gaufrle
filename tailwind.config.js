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
        accntLight: "#856C1E",
        accntDark: "#F2D482",

        // Sun
        sun: "#765403",

        // Moon
        moon: "#FBCC60",

        // Valid
        valid: "#38b000",

        // Almost valid
        almostValid: "#ffc300",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
