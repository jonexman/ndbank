import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#C41E3A",
          dark: "#9B1730",
          light: "#E01E44",
          50: "#FCE8EB",
          100: "#F8D1D8",
          200: "#F1A3B1",
          500: "#C41E3A",
          600: "#9B1730",
        },
        navy: {
          DEFAULT: "#0F2847",
          dark: "#0A1C32",
          light: "#1A3A5C",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F8FAFC",
          muted: "#F1F5F9",
        },
        success: { DEFAULT: "#059669", light: "#D1FAE5", dark: "#047857" },
        error: { DEFAULT: "#DC2626", light: "#FEE2E2", dark: "#B91C1C" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-lg": ["2.25rem", { lineHeight: "2.5rem", fontWeight: "700" }],
        "display-md": ["1.875rem", { lineHeight: "2.25rem", fontWeight: "600" }],
        "display-sm": ["1.5rem", { lineHeight: "2rem", fontWeight: "600" }],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(15, 40, 71, 0.06), 0 1px 2px -1px rgba(15, 40, 71, 0.06)",
        cardHover: "0 4px 6px -1px rgba(15, 40, 71, 0.08), 0 2px 4px -2px rgba(15, 40, 71, 0.06)",
        cardElevated: "0 10px 15px -3px rgba(15, 40, 71, 0.08), 0 4px 6px -4px rgba(15, 40, 71, 0.06)",
        sidebar: "4px 0 24px -4px rgba(0, 0, 0, 0.08)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
