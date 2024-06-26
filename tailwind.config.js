const defaultTheme = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    fontFamily: {
      chakra: ["Chakra Petch", ...defaultTheme.fontFamily.sans],
      sans: ["Inter", ...defaultTheme.fontFamily.sans],
      dm: ["DM Mono", ...defaultTheme.fontFamily.mono],
      mono: ["DM Mono", ...defaultTheme.fontFamily.mono],
    },
    fontSize: {
      // body texts
      lg: ["18px", { lineHeight: "22px" }],
      md: ["16px", { lineHeight: "20px" }],

      // design doc says `sm` should have 16px lineHeight, but it looks too
      // squeezed when there are 2 lines of text, so we are intentionally
      // deviating by a few pixels to make running text look better
      sm: ["14px", { lineHeight: "18px" }],

      xs: ["12px", { lineHeight: "14px" }],
      "2xs": ["10px", { lineHeight: "12px" }],
      // Headings
      h1: ["64px", { lineHeight: "77px" }],
      h2: ["40px", { lineHeight: "48px" }],
      h3: ["32px", { lineHeight: "38px" }],
      h4: ["24px", { lineHeight: "30px" }],
      h5: ["20px", { lineHeight: "28px" }],
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        "border-secondary": "hsl(var(--border-secondary))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
