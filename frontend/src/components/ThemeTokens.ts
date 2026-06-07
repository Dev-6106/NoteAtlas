/**
 * Design Tokens — JS bridge to CSS custom properties.
 * Use these in inline styles across the app instead of hard-coded values.
 * All values resolve via var() so they're theme-aware (light / dark).
 */
export const T = {
  /* ── Typography ── */
  font: "var(--font-serif, 'Instrument Serif', Georgia, serif)",
  fontSans: "var(--font-sans, 'DM Sans', system-ui, sans-serif)",
  fontMono: "var(--font-mono, 'DM Mono', monospace)",

  /* ── Backgrounds ── */
  bg: "var(--bg-base)",
  bgSurface: "var(--bg-surface)",
  bgCard: "var(--bg-card)",
  bgCardHover: "var(--bg-card-hover)",
  bgElevated: "var(--bg-elevated)",

  /* ── Borders ── */
  border: "var(--border-default)",
  borderHover: "var(--border-hover)",
  borderAccent: "var(--border-accent)",
  borderStrong: "var(--border-strong)",

  /* ── Brand ── */
  primary: "var(--primary-brand)",
  primaryLight: "var(--primary-light)",
  primaryGlow: "var(--primary-glow)",
  primaryMid: "var(--primary-mid)",
  primarySurface: "var(--primary-surface)",
  primaryBorder: "var(--primary-border)",

  /* ── Text ── */
  text1: "var(--text-1)",
  text2: "var(--text-2)",
  text3: "var(--text-3)",
  text4: "var(--text-4)",
  textOnPrimary: "var(--text-on-primary)",

  /* ── Semantic Colors ── */
  success: "var(--color-success)",
  successLight: "var(--color-success-light)",
  warning: "var(--color-warning)",
  warningLight: "var(--color-warning-light)",
  error: "var(--color-error)",
  errorLight: "var(--color-error-light)",
  info: "var(--color-info)",
  infoLight: "var(--color-info-light)",

  /* ── Accent (static, used in hero / homepage) ── */
  accent: "#c4b5fd",
  green: "#4ade80",

  /* ── Radius ── */
  radius: "var(--radius-l, 16px)",
  radiusSm: "var(--radius-s, 8px)",
  radiusMd: "var(--radius-m, 12px)",
  radiusXl: "var(--radius-xl, 20px)",
  radiusFull: "var(--radius-full, 9999px)",

  /* ── Shadows ── */
  shadow: "var(--shadow-xl)",
  shadowCard: "var(--shadow-card)",
  shadowCardHover: "var(--shadow-card-hover)",
  shadowPrimary: "var(--shadow-primary)",
  shadowPrimaryLg: "var(--shadow-primary-lg)",

  /* ── Overlay / Glass ── */
  overlay: "var(--overlay)",
  glassBg: "var(--glass-bg)",
  glassBorder: "var(--glass-border)",

  /* ── Transitions ── */
  transitionFast: "var(--transition-fast, 0.15s ease)",
  transitionBase: "var(--transition-base, 0.2s ease)",
  transitionSlow: "var(--transition-slow, 0.3s cubic-bezier(0.4, 0, 0.2, 1))",
} as const;
