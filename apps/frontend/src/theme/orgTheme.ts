// src/theme/orgTheme.ts
type RGB = `${number} ${number} ${number}`;

export type OrgTheme = Partial<{
  primary: RGB;
  primaryContrast: RGB;
  bg: RGB;
  surface: RGB;
  border: RGB;
  text: RGB;
  muted: RGB;
  success: RGB;
  warning: RGB;
  danger: RGB;
  info: RGB;
  radiusMd: string; // "8px"
}>;

const map: Record<keyof OrgTheme, string> = {
  primary: "--c-primary",
  primaryContrast: "--c-primary-contrast",
  bg: "--c-bg",
  surface: "--c-surface",
  border: "--c-border",
  text: "--c-text",
  muted: "--c-muted",
  success: "--c-success",
  warning: "--c-warning",
  danger: "--c-danger",
  info: "--c-info",
  radiusMd: "--radius-md",
};

export function applyOrgTheme(theme: OrgTheme) {
  const root = document.documentElement;
  for (const [k, v] of Object.entries(theme)) {
    const cssVar = map[k as keyof OrgTheme];
    if (!cssVar) continue;
    root.style.setProperty(cssVar, String(v));
  }
}

export function clearOrgTheme() {
  const root = document.documentElement;
  Object.values(map).forEach((cssVar) => root.style.removeProperty(cssVar));
}
