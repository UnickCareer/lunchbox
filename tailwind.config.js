/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        emerald: {
          950: "#04120D",
          900: "#0A1F19",
          850: "#0E2A21",
          800: "#123D2E",
          700: "#175A3F",
          500: "#12B76A",
          400: "#2FD98A",
        },
        amber: {
          400: "#F5A524",
          500: "#E0921A",
          600: "#C87F0A",
        },
        cream: {
          50: "#FBFAF6",
          100: "#F6F5EF",
          200: "#EDEAE0",
        },
        ink: {
          900: "#0D1512",
          700: "#2A3733",
          500: "#5C6B65",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(4, 18, 13, 0.28)",
        glow: "0 0 0 1px rgba(47, 217, 138, 0.15), 0 8px 24px rgba(18, 183, 106, 0.18)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        steam: {
          "0%": { transform: "translateY(0) scaleX(1)", opacity: "0.5" },
          "50%": { transform: "translateY(-18px) scaleX(1.15)", opacity: "0.25" },
          "100%": { transform: "translateY(-36px) scaleX(0.9)", opacity: "0" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "80%, 100%": { transform: "scale(1.4)", opacity: "0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        steam: "steam 2.8s ease-in infinite",
        pulseRing: "pulseRing 2s cubic-bezier(0.4,0,0.6,1) infinite",
      },
    },
  },
  plugins: [],
};
