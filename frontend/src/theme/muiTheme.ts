// src/theme/muiTheme.ts
import { extendTheme } from "@mui/material/styles";

export const muiTheme = extendTheme({
  cssVarPrefix: "app",
 colorSchemeSelector: "class",
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#18181b",
          light: "#3f3f46",
          dark: "#09090b",
          contrastText: "#fafafa",
        },
        secondary: {
          main: "#71717a",
          light: "#a1a1aa",
          dark: "#52525b",
          contrastText: "#fafafa",
        },
        success: { main: "#10b981" },
        warning: { main: "#f59e0b" },
        error: { main: "#ef4444" },
        info: { main: "#3b82f6" },

        background: { default: "#fafafa", paper: "#ffffff" },
        text: { primary: "#09090b", secondary: "#71717a" },
        divider: "#e4e4e7",
      },
    },

    dark: {
      palette: {
        primary: {
          main: "#fafafa",
          light: "#ffffff",
          dark: "#e4e4e7",
          contrastText: "#09090b",
        },
        secondary: {
          main: "#a1a1aa",
          light: "#d4d4d8",
          dark: "#71717a",
          contrastText: "#09090b",
        },
        success: { main: "#10b981" },
        warning: { main: "#f59e0b" },
        error: { main: "#ef4444" },
        info: { main: "#60a5fa" },

        background: { default: "#09090b", paper: "#18181b" },
        text: { primary: "#fafafa", secondary: "#a1a1aa" },
        divider: "#27272a",
      },
    },
  },

  shape: { borderRadius: 8 },
 

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // keep body clean; Tailwind also uses tokens
          margin: 0,
        },
      },
    },

    MuiButtonBase: { defaultProps: { disableRipple: true } },

    MuiButton: {
      defaultProps: { disableElevation: true, disableRipple: true },
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          transition: "all .15s ease",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 12,
          border: "1px solid var(--app-palette-divider)",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: "1px solid var(--app-palette-divider)",
          boxShadow: "var(--app-shadows-2)",
        },
      },
    },

    MuiTextField: { defaultProps: { size: "small" } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 6 } } },
  },
});
