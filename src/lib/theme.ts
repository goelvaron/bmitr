// Theme configuration for the application

export const colors = {
  // Mid Brown Soil color palette - Natural earth tones
  midBrownSoil: {
    50: "#faf8f5",
    100: "#f2ede6",
    200: "#e8dcc9",
    300: "#d9c5a3",
    400: "#c9a876",
    500: "#a67c52", // Base mid brown soil
    600: "#8b6240",
    700: "#6f4e32",
    800: "#5a3f28",
    900: "#4a3422",
    950: "#2d1f15",
  },

  // Clay Brown color palette - Complementary clay tones
  clayBrown: {
    50: "#f9f6f3",
    100: "#f0e9e1",
    200: "#e3d4c4",
    300: "#d1b89e",
    400: "#bc9674",
    500: "#9d7a56", // Base clay brown
    600: "#85634a",
    700: "#6b4f3c",
    800: "#574032",
    900: "#47352b",
    950: "#261c16",
  },

  // Mustard Brown color palette - Warm mustard tones
  mustardBrown: {
    50: "#fefbf3",
    100: "#fdf4e1",
    200: "#fae8c2",
    300: "#f6d898",
    400: "#f0c464",
    500: "#e6a83d", // Base mustard brown
    600: "#d18f2a",
    700: "#b07424",
    800: "#8f5d24",
    900: "#754d21",
    950: "#3f2710",
  },

  // Red-fired Mustard Brown color palette - Mustard with red firing tones
  redFiredMustard: {
    50: "#fef9f3",
    100: "#fdf1e1",
    200: "#fae2c2",
    300: "#f6cc98",
    400: "#f0b464",
    500: "#e69a3d", // Base red-fired mustard
    600: "#d1802a",
    700: "#b86524", // Darker with red undertones
    800: "#9f4d24", // Strong red firing tone
    900: "#7d3e21",
    950: "#4a2210",
  },
};

// Theme configuration to be imported in tailwind.config.js
export const themeConfig = {
  colors: {
    border: "hsl(var(--border))",
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
    // Replace all brown colors with redFiredMustard
    redFiredMustard: colors.redFiredMustard,
    // Keep redFiredMustard as the primary brown color
    midBrownSoil: colors.redFiredMustard,
    clayBrown: colors.redFiredMustard,
    mustardBrown: colors.redFiredMustard,
  },
};
