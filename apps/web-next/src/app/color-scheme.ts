export const colorSchemes = ['light', 'dark', 'system'] as const;

export type ColorScheme = (typeof colorSchemes)[number];

const storageKey = 'color-scheme';
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

export function getColorScheme(): ColorScheme {
  const stored = localStorage.getItem(storageKey);

  if (!isColorScheme(stored)) {
    return 'system';
  }

  return stored;
}

function isColorScheme(value: unknown): value is ColorScheme {
  return colorSchemes.includes(value as ColorScheme);
}

export function setColorScheme(scheme: ColorScheme) {
  localStorage.setItem(storageKey, scheme);
  applyColorScheme();
}

export function watchColorScheme() {
  applyColorScheme();
  darkQuery.addEventListener('change', applyColorScheme);
}

function applyColorScheme() {
  const scheme = getColorScheme();
  const dark = scheme === 'dark' || (scheme === 'system' && darkQuery.matches);

  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}
