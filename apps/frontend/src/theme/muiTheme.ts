// src/theme/muiTheme.ts
import { createTheme } from "@mui/material/styles";

const rgb = (v: string) => `rgb(var(${v}) / 1)`;
const rgba = (v: string, a: number) => `rgb(var(${v}) / ${a})`;

export const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: rgb("--c-primary"), contrastText: rgb("--c-primary-contrast") },
    secondary: { main: rgb("--c-secondary") },
    success: { main: rgb("--c-success") },
    warning: { main: rgb("--c-warning") },
    error: { main: rgb("--c-danger") },
    info: { main: rgb("--c-info") },
    background: { default: rgb("--c-bg"), paper: rgb("--c-surface") },
    text: { primary: rgb("--c-text"), secondary: rgb("--c-muted") },
    divider: rgba("--c-border", 1),
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-sm)",
          border: `1px solid ${rgba("--c-border", 1)}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: "var(--radius-lg)",
          border: `1px solid ${rgba("--c-border", 1)}`,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true, disableRipple: true },
      styleOverrides: {
        root: { borderRadius: "var(--radius-sm)", fontWeight: 600 },
        contained: {
          boxShadow: "var(--shadow-sm)",
          "&:hover": { boxShadow: "var(--shadow-md)" },
        },
      },
    },
  },
});
