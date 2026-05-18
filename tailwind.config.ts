import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#071A1D",
        card: "#0E2A2F",
        primary: {
          DEFAULT: "#8DC63F",
          foreground: "#071A1D",
        },
        "primary-hover": "#A8E063",
        secondary: {
          DEFAULT: "#1F6F78",
          foreground: "#F5F7FA",
        },
        foreground: "#F5F7FA",
        muted: {
          DEFAULT: "#B7C4C8",
          foreground: "#B7C4C8",
        },
        border: "rgba(255,255,255,0.08)",
        accent: {
          DEFAULT: "#1F6F78",
          foreground: "#F5F7FA",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-glow":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(141,198,63,0.15), transparent)",
        "card-glow":
          "radial-gradient(ellipse at top left, rgba(141,198,63,0.08), transparent 50%)",
      },
      boxShadow: {
        glow: "0 0 40px rgba(141, 198, 63, 0.15)",
        "glow-sm": "0 0 20px rgba(141, 198, 63, 0.1)",
        card: "0 4px 24px rgba(0, 0, 0, 0.3)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
