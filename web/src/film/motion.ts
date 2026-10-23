import { clamp, Easing } from '../engine/easing';

// The three motion curves; no easing is used outside them.
const EASE = { enter: Easing.easeOutCubic, draw: Easing.easeInOutCubic, pop: Easing.easeOutBack };
type Ease = keyof typeof EASE;

/** 0→1 over [s, s+d] on curve k. */
export const tw = (T: number, s: number, d: number, k: Ease = 'enter') => EASE[k](clamp((T - s) / d, 0, 1));
/** Fades in at a, out by b, each over f seconds. */
export const win = (T: number, a: number, b: number, f = 0.5) => Math.min(tw(T, a, f), 1 - tw(T, b - f, f, 'draw'));
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;
export const tint = (col: string, a: number) => `color-mix(in oklch, ${col} ${Math.round(clamp(a, 0, 1) * 100)}%, transparent)`;

/** Splits text into [spoken, unspoken] words at progress p. */
export const reveal = (text: string, p: number): [string, string] => {
  const w = text.split(' ');
  const n = Math.round(w.length * clamp(p, 0, 1));
  return [w.slice(0, n).join(' '), w.slice(n).join(' ')];
};

/** Interpolates every numeric field between keyframes on the draw curve. */
export function keys<K extends { t: number }>(T: number, K: K[]): K {
  if (T <= K[0].t) return K[0];
  for (let i = 0; i < K.length - 1; i++) {
    const a = K[i], b = K[i + 1];
    if (T < b.t) {
      const p = EASE.draw((T - a.t) / (b.t - a.t));
      const o = {} as Record<string, number>;
      for (const k in a) o[k] = mix(a[k] as number, b[k] as number, p);
      return o as unknown as K;
    }
  }
  return K[K.length - 1];
}

export { clamp };
