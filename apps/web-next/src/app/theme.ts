import type { Config } from '@sel/shared';
import { clampChroma, converter, formatHex, modeOklch, modeRgb, useMode } from 'culori/fn';

useMode(modeRgb);
useMode(modeOklch);

const toOklch = converter('oklch');

const steps = [
  { step: 50, lightness: 0.975, chroma: 0.29 },
  { step: 100, lightness: 0.945, chroma: 0.45 },
  { step: 200, lightness: 0.895, chroma: 0.65 },
  { step: 300, lightness: 0.82, chroma: 0.85 },
  { step: 400, lightness: 0.72, chroma: 1 },
  { step: 500, lightness: 0.62, chroma: 1 },
  { step: 600, lightness: 0.53, chroma: 0.86 },
  { step: 700, lightness: 0.46, chroma: 0.75 },
  { step: 800, lightness: 0.39, chroma: 0.63 },
  { step: 900, lightness: 0.32, chroma: 0.52 },
  { step: 950, lightness: 0.24, chroma: 0.38 },
];

export function applyTheme(theme: Config['theme']) {
  const { style } = document.documentElement;

  const ranges = {
    primary: theme.primaryColor,
    accent: theme.accentColor,
  };

  for (const [name, color] of Object.entries(ranges)) {
    // An instance without a color keeps the default range.
    if (color === '') {
      continue;
    }

    for (const [step, value] of Object.entries(colorRange(color))) {
      style.setProperty(`--${name}-${step}`, value);
    }
  }

  if (theme.customCss) {
    const style = document.createElement('style');

    document.head.appendChild(style);
    style.innerText = theme.customCss;
  }
}

export function colorRange(hex: string): Record<number, string> {
  const { c: chroma = 0, h: hue } = toOklch(hex) ?? {};

  const getColor = (step: { lightness: number; chroma: number }) => {
    return clampChroma({ mode: 'oklch', l: step.lightness, c: chroma * step.chroma, h: hue }, 'oklch');
  };

  return Object.fromEntries(steps.map((step) => [step.step, formatHex(getColor(step))]));
}
