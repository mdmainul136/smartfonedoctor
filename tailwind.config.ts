import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "ai-gradient": "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(20, 184, 166, 0.15) 100%)",
        "glass-gradient": "linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)",
      },
      colors: {
        // SmartFoneDoctor Brand & AI Palette
        sfd: {
          dark: "#1d1c1a",        // Brand dark
          card: "#0F172A",        // Primary card background
          cardLight: "#1E293B",   // Elevated component background
          border: "#1E293B",      // Subtle card borders
          borderLight: "#334155", // Hover borders
          teal: "#009691",        // Brand teal
          tealLight: "#14B8A6",   // Vibrant active teal
          tealGlow: "rgba(20, 184, 166, 0.15)",
          red: "#b31924",         // Brand red
          redLight: "#FB7185",
          ai: "#6366F1",          // AI Intelligence Indigo
          aiLight: "#818CF8",
          amber: "#F59E0B",       // Work in Progress / Bench
          emerald: "#10B981",     // Healthy / Tested / Completed
        },
        // Legacy colors (kept for backwards compatibility)
        lamaSky: "#C3EBFA",
        lamaSkyLight: "#EDF9FD",
        lamaPurple: "#CFCEFF",
        lamaPurpleLight: "#F1F0FF",
        lamaYellow: "#FAE27C",
        lamaYellowLight: "#FEFCE8",
      },
      boxShadow: {
        "sfd-glow": "0 0 25px -5px rgba(20, 184, 166, 0.25)",
        "ai-glow": "0 0 25px -5px rgba(99, 102, 241, 0.3)",
        "card-subtle": "0 4px 20px -2px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
