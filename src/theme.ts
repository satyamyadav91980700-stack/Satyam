import { interpolate, spring } from 'remotion';

/**
 * Shared Theme — Premium Minimal SaaS Motion Graphics
 * Alternating Cream (#F7F4EE) and Black (#05060B) scenes with Accent Blue (#2F6BFF).
 */
export const THEME = {
  colors: {
    cream: '#F7F4EE',
    creamSubtle: '#EFECE4',
    creamCard: '#EAE5DB',
    creamBorder: '#DFDBD0',
    mutedLight: '#8E8B82',
    black: '#05060B',
    darkSurface: '#0D101B',
    darkCard: '#121728',
    darkBorder: '#1E2742',
    accentBlue: '#2F6BFF',
    glowBlue: '#7FA8FF',
    softBlueBg: '#E7EFFF',
    textDark: '#111111',
    textDarkMuted: '#66645E',
    textLight: '#FFFFFF',
    textLightMuted: '#949DB2',
  },
  fonts: {
    sans: "'Inter', 'Noto Sans Devanagari', sans-serif",
  },
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    bold: 700,
  },
  springs: {
    snappy: { damping: 18, stiffness: 190, mass: 0.75 },
    smooth: { damping: 24, stiffness: 120, mass: 0.9 },
    gentle: { damping: 28, stiffness: 90, mass: 1.05 },
    impact: { damping: 14, stiffness: 220, mass: 0.7 },
  },
};

export const EASING = {
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInCubic: (t: number) => t * t * t,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeOutQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  easeInOutQuart: (t: number) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
};

export function clampInterp(
  frame: number,
  input: number[],
  output: number[],
  easing?: (t: number) => number
) {
  return interpolate(frame, input, output, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    ...(easing ? { easing } : {}),
  });
}

export function springAt(
  frame: number,
  fps: number,
  startFrame = 0,
  config = THEME.springs.smooth
) {
  if (frame < startFrame) return 0;
  return spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config,
  });
}

/**
 * Evaluates a 2D Cubic Bezier curve at t in [0, 1].
 * Supports both (p0, p1, p2, p3, t) and (t, p0, p1, p2, p3) signatures.
 */
export function cubicBezierPoint(
  a: any,
  b: any,
  c: any,
  d: any,
  e: any
): { x: number; y: number } {
  const isTFirst = typeof a === 'number';
  const t: number = isTFirst ? a : e;
  const p0 = isTFirst ? b : a;
  const p1 = isTFirst ? c : b;
  const p2 = isTFirst ? d : c;
  const p3 = isTFirst ? e : d;

  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;
  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
  };
}
