/**
 * A+Manager design tokens.
 *
 * Multiple switchable palettes (user picks in Settings) + fixed semantic colors.
 * Semantic rule (fixed across all palettes):
 *   green = profit / stock-in / success
 *   red   = debt / loss / stock-out
 *   amber = warning / partial
 */

import '@/global.css';

import { Platform } from 'react-native';

export type Palette = {
  id: string;
  name: string; // Vietnamese display name
  nameEn: string;
  // brand tokens
  primary: string;
  onPrimary: string;
  secondary: string;
  accent: string;
  onAccent: string;
  gradient: [string, string]; // hero / CTA gradient
  // surfaces
  background: string;
  card: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  // semantic (kept in sync with SEMANTIC)
  success: string;
  onDestructive: string;
  destructive: string;
  warning: string;
  ring: string;
};

export const SEMANTIC = {
  success: '#059669',
  destructive: '#DC2626',
  onDestructive: '#FFFFFF',
  warning: '#D97706',
} as const;

export const PALETTES: Palette[] = [
  {
    id: 'leaf',
    name: 'Lá non',
    nameEn: 'Fresh Green',
    primary: '#0F766E',
    onPrimary: '#FFFFFF',
    secondary: '#115E59',
    accent: '#10B981',
    onAccent: '#FFFFFF',
    gradient: ['#0F766E', '#34D399'],
    background: '#F0FBF7',
    card: '#FFFFFF',
    foreground: '#0B3B36',
    muted: '#DFF2EC',
    mutedForeground: '#5E7A74',
    border: '#CDE8E0',
    success: SEMANTIC.success,
    onDestructive: SEMANTIC.onDestructive,
    destructive: SEMANTIC.destructive,
    warning: SEMANTIC.warning,
    ring: '#10B981',
  },
  {
    id: 'rose',
    name: 'Hồng rực',
    nameEn: 'Vibrant Rose',
    primary: '#9F1239',
    onPrimary: '#FFFFFF',
    secondary: '#BE123C',
    accent: '#F43F5E',
    onAccent: '#FFFFFF',
    gradient: ['#9F1239', '#FB7185'],
    background: '#FFF1F3',
    card: '#FFFFFF',
    foreground: '#4C0519',
    muted: '#FFE1E6',
    mutedForeground: '#9C5A68',
    border: '#FBCBD5',
    success: SEMANTIC.success,
    onDestructive: SEMANTIC.onDestructive,
    destructive: SEMANTIC.destructive,
    warning: SEMANTIC.warning,
    ring: '#F43F5E',
  },
  {
    id: 'ocean',
    name: 'Đại dương',
    nameEn: 'Ocean',
    primary: '#1E3A8A',
    onPrimary: '#FFFFFF',
    secondary: '#1D4ED8',
    accent: '#3B82F6',
    onAccent: '#FFFFFF',
    gradient: ['#1E3A8A', '#38BDF8'],
    background: '#EFF5FF',
    card: '#FFFFFF',
    foreground: '#172554',
    muted: '#DCE9FD',
    mutedForeground: '#5B6E94',
    border: '#C5D8F8',
    success: SEMANTIC.success,
    onDestructive: SEMANTIC.onDestructive,
    destructive: SEMANTIC.destructive,
    warning: SEMANTIC.warning,
    ring: '#3B82F6',
  },
  {
    id: 'coffee',
    name: 'Cà phê',
    nameEn: 'Warm Coffee',
    primary: '#7C2D12',
    onPrimary: '#FFFFFF',
    secondary: '#9A3412',
    accent: '#EA580C',
    onAccent: '#FFFFFF',
    gradient: ['#7C2D12', '#F59E0B'],
    background: '#FFFAF0',
    card: '#FFFFFF',
    foreground: '#431407',
    muted: '#FBE8D2',
    mutedForeground: '#8C6A52',
    border: '#F2D9BC',
    success: SEMANTIC.success,
    onDestructive: SEMANTIC.onDestructive,
    destructive: SEMANTIC.destructive,
    warning: SEMANTIC.warning,
    ring: '#EA580C',
  },
];

export const DEFAULT_PALETTE = PALETTES[0];

// ---------- legacy/template exports (keep for themed-text, themed-view) ----------
export const Colors = {
  light: {
    text: '#0F172A',
    background: '#F8FAFC',
    backgroundElement: '#F2F3F4',
    backgroundSelected: '#E6E8EA',
    textSecondary: '#64748B',
  },
  dark: {
    text: '#F1F5F9',
    background: '#0F172A',
    backgroundElement: '#1E293B',
    backgroundSelected: '#334155',
    textSecondary: '#94A3B8',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 960;
export const BottomTabInset = 0;
