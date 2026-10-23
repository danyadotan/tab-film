import type { CSSProperties } from 'react';

// Broadsheet tokens, plus amber — TAB's own color, worn by nothing else.
export const C = {
  ink: '#201e1d', paper: '#f3f2f2',
  cyan: 'var(--color-accent)', cyan7: 'var(--color-accent-700)', cyan1: 'var(--color-accent-100)',
  mag: 'var(--color-accent-2)',
  amber: 'oklch(0.7 0.17 65)', amberInk: 'oklch(0.5 0.15 55)',
  n1: 'var(--color-neutral-100)', n2: 'var(--color-neutral-200)', n4: 'var(--color-neutral-400)', n5: 'var(--color-neutral-500)',
  n6: 'var(--color-neutral-600)', n7: 'var(--color-neutral-700)', n8: 'var(--color-neutral-800)', n9: 'var(--color-neutral-900)',
};

export const SERIF = 'var(--font-heading), "Source Serif 4", Georgia, serif';
export const BODY = 'var(--font-body), "Source Serif 4", Georgia, serif';

export const kick: CSSProperties = { fontSize: 13, letterSpacing: '.14em', fontWeight: 700 };

export const CARD: CSSProperties = { background: '#fff', boxShadow: 'var(--shadow-sm)', padding: '22px 22px', boxSizing: 'border-box', position: 'absolute', overflow: 'hidden' };
