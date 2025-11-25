import { DefaultTheme } from "@react-navigation/native";

const Primary = {
  "50": "#fef2f3",
  "100": "#fde6e7",
  "200": "#fbd0d5",
  "300": "#f7aab2",
  "400": "#f27a8a",
  "500": "#ea546c",
  "600": "#d5294d",
  "700": "#b31d3f",
  "800": "#961b3c",
  "900": "#811a39",
  "950": "#48091a",
};

const Gray = {
  50: "#fafafa",
  100: "#f4f4f5",
  200: "#e4e4e7",
  300: "#d4d4d8",
  400: "#a1a1aa",
  500: "#71717a",
  600: "#52525b",
  700: "#3f3f46",
  800: "#27272a",
  900: "#18181b",
  950: "#09090b",
};

export const Colors = {
  primary: {
    ...Primary,
  },
  gray: { ...Gray },
  error: {
    "50": "#fef2f2",
    "100": "#fee2e2",
    "200": "#fecaca",
    "300": "#fca5a5",
    "400": "#f87171",
    "500": "#ef4444",
    "600": "#dc2626",
    "700": "#b91c1c",
    "800": "#991b1b",
    "900": "#7f1d1d",
    "950": "#450a0a",
  },
  white: "#ffffff",

  text: Primary["950"],
  lightText: Gray["400"],
  headerText: Primary["50"],
  ripple: "rgba(0, 0, 0, 0.1)",
};

export const Fonts = {
  regular: "fira-sans",
  semiBold: "fira-sans-semi-bold",
  bold: "fira-sans-bold",
};

export const Spacing = {
  "2xs": 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
  "4xl": 64,
  "5xl": 80,
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  default: 16,
  md: 18,
  lg: 20,
  xl: 23,
  xxl: 24,
  xxxl: 28,
};

export const Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary["500"],
    background: Colors.primary["50"],
    card: Colors.primary["700"],
    tint: Colors.primary["500"],
    icon: Colors.primary["500"],
  },
};

export const DefaultScreenOptions = {
  tabBarStyle: {
    backgroundColor: Colors.white,
  },
  headerTitleStyle: {
    fontFamily: Fonts.regular,
  },
  headerRightContainerStyle: {
    paddingRight: Spacing.md,
  },
  tabBarLabelStyle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
  },
  headerTintColor: Colors.white,
  tabBarInactiveTintColor: Colors.gray["400"],
};
