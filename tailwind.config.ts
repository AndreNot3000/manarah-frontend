import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0E7A3E",
          foreground: "#FFFFFF",
          dark: "#0A5E30",
          light: "#E8F5EE",
        },
        secondary: {
          DEFAULT: "#C8A542",
          foreground: "#1A1A1A",
          dark: "#A88A35",
          light: "#F5EFD6",
        },
        neutral: {
          text: "#333333",
          muted: "#6B7280",
          border: "#E5E7EB",
          background: "#F9FAFB",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      fontSize: {
        display: ["2.25rem", { lineHeight: "2.75rem", fontWeight: "700" }],
        title: ["1.5rem", { lineHeight: "2rem", fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.5rem", fontWeight: "400" }],
        caption: ["0.875rem", { lineHeight: "1.25rem", fontWeight: "400" }],
      },
      spacing: {
        section: "4rem",
        card: "1.5rem",
      },
      borderRadius: {
        card: "0.75rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
