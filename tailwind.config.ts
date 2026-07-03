import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#12211E",
        zellige: "#0F5C53",
        zellige2: "#0B443D",
        saffron: "#D9A62E",
        saffronDeep: "#B5841B",
        sand: "#F3ECDC",
        sandDeep: "#E7DCC0",
        clay: "#B5482B",
        rose: "#C1543F",
        mist: "#EFE9DA",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        "zellige-pattern":
          "radial-gradient(circle at 1px 1px, rgba(15,92,83,0.14) 1px, transparent 0)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.5s ease-out both",
        pulseSoft: "pulseSoft 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
