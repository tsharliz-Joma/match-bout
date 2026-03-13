import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#0b0d10",
        charcoal: "#101317",
        ember: "#d12b2b",
        emberGlow: "#ff3b3b",
        muted: "#7d8590",
        steel: "#1b1f26",
        midnight: "#0a0b0d"
      },
      fontFamily: {
        display: ["Bebas Neue", "sans-serif"],
        body: ["Manrope", "sans-serif"]
      },
      boxShadow: {
        soft: "0 20px 50px rgba(0,0,0,0.35)",
        glow: "0 0 30px rgba(209,43,43,0.35)"
      },
      backgroundImage: {
        "ring-gradient": "radial-gradient(circle at top, rgba(255,59,59,0.2), transparent 45%)"
      }
    }
  },
  plugins: []
};

export default config;
