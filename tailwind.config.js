/** @type {import('tailwindcss').Config} */
const { themeConfig, colors } = require("./src/lib/theme");

module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        ...themeConfig.colors,
        // Direct color references for easier use in components - all using redFiredMustard
        redFiredMustard: colors.redFiredMustard,
        midBrownSoil: colors.redFiredMustard,
        clayBrown: colors.redFiredMustard,
        mustardBrown: colors.redFiredMustard,
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-highlight": {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%": {
            opacity: 0.85,
            transform: "scale(1.05)",
            textShadow: "0 0 8px rgba(230, 57, 70, 0.8)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-highlight": "pulse-highlight 2s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
