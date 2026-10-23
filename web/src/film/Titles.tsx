import { useFilm } from '../engine/FilmContext';
import { BODY, C, kick } from './tokens';
import { clamp, tw, win } from './motion';

type HeadMode = 'hero' | 'big' | 'room';
interface Head { a: number; b: number; m: HeadMode; k: string; t: string; s?: string }

const HEADS: Head[] = [
  { a: 0, b: 8, m: 'hero', k: 'TAB · A JUST-IN-TIME CO-WORKER', t: 'A co-worker that lives in your browser.', s: 'From an intention, to eight pages, to four rooms.' },
  { a: 9.45, b: 18, m: 'big', k: '01 · THE MORNING', t: 'The morning arrives all at once.', s: 'Every tab, every ping, every draft asks for attention at the same time.' },
  { a: 18, b: 30, m: 'big', k: '02 · THE INTENTION', t: 'A co-worker, not a feed.' },
  { a: 30, b: 42, m: 'big', k: '03 · THE FIRST MAP', t: 'Eight pages. Complete — and too much to feel.', s: 'Each page was right. Together they asked a viewer to hold eight things.' },
  { a: 42, b: 56, m: 'big', k: '04 · THE CUT', t: 'Eight pages became four rooms.' },
  { a: 56, b: 66, m: 'big', k: '05 · THE RULE OF ONE', t: 'One voice. One place. One color.' },
  { a: 66, b: 72, m: 'room', k: 'ROOM 1 · DAY — THE ASSISTANT', t: 'It greets, and briefs three things.' },
  { a: 72, b: 78, m: 'room', k: 'ROOM 1 · DAY — THE ASSISTANT', t: 'It proposes once. You decide.' },
  { a: 78, b: 85, m: 'room', k: 'ROOM 2 · WRITE — THE EDITOR', t: 'Your words. Nothing generated.' },
  { a: 85, b: 90, m: 'room', k: 'ROOM 2 · WRITE — UNINVITED', t: 'The one time TAB interrupts.' },
  { a: 90, b: 96, m: 'room', k: 'ROOM 3 · CALL — THE WINGMAN', t: 'The goal pinned. The answers ready.' },
  { a: 96, b: 102, m: 'room', k: 'ROOM 3 · CALL — THE WINGMAN', t: 'She asks. You already know.' },
  { a: 102, b: 108, m: 'room', k: 'ROOM 4 · CLOSE — THE LIBRARIAN', t: 'A report, two real alerts, a receipt.' },
  { a: 108, b: 114, m: 'room', k: 'ROOM 4 · CLOSE — THE LIBRARIAN', t: 'Every action traced. Every line reversible.' },
  { a: 114, b: 121, m: 'big', k: '06 · FOR THE COMPANY', t: 'Every desk, one ledger.', s: 'Anonymous by design. It counts events, not people.' },
  { a: 121, b: 128, m: 'big', k: '06 · FOR THE COMPANY', t: 'Where work stalls, and what happened.' },
  { a: 128, b: 134, m: 'big', k: '06 · FOR THE COMPANY', t: 'Friction events × the cost of a stall.', s: 'The only math TAB asks a COO to believe.' },
  { a: 134, b: 139.6, m: 'hero', k: 'TAB', t: 'One thing at a time.', s: 'Day · Write · Call · Close — one voice, one place, one color.' },
];

const HM: Record<HeadMode, { x: number; y: number; ks: number; ts: number; ss: number; mw: number }> = {
  hero: { x: 120, y: 330, ks: 22, ts: 112, ss: 38, mw: 1500 },
  big: { x: 120, y: 96, ks: 20, ts: 76, ss: 30, mw: 1600 },
  room: { x: 288, y: 52, ks: 17, ts: 46, ss: 0, mw: 1400 },
};

export function Heads() {
  const { T } = useFilm();
  return <>{HEADS.map((h, i) => {
    const o = win(T, h.a, h.b, 0.6), m = HM[h.m], rise = (1 - tw(T, h.a, 0.9)) * 22, drift = h.m === 'hero' ? 1 + 0.025 * clamp((T - h.a) / 8, 0, 1) : 1;
    return <div key={i} style={{ position: 'absolute', left: m.x, top: m.y, maxWidth: m.mw, opacity: o, transform: `translateY(${rise}px) scale(${drift})`, transformOrigin: '0 0' }}>
      <div style={{ ...kick, fontSize: m.ks, letterSpacing: '.16em', color: C.mag }}>{h.k}</div>
      <div style={{ fontSize: m.ts, fontWeight: 600, lineHeight: 1.04, letterSpacing: '-.01em', marginTop: h.m === 'room' ? 4 : 14, whiteSpace: h.m === 'room' ? 'nowrap' : 'normal', textWrap: 'pretty' }}>{h.t}</div>
      {h.s && <div style={{ fontFamily: BODY, fontStyle: 'italic', fontSize: m.ss, color: C.n7, marginTop: 22, lineHeight: 1.3, opacity: tw(T, h.a + 1.4, 0.8) }}>{h.s}</div>}
    </div>;
  })}</>;
}

export function Dateline() {
  const { T } = useFilm();
  const o = win(T, 0, 9.3, 0.35) + win(T, 134.2, 139.6, 0.6);
  const d = Math.max(tw(T, 0.2, 1.4, 'draw'), tw(T, 134.2, 1.2, 'draw'));
  return <div style={{ position: 'absolute', left: 120, top: 150, width: 1680, opacity: o }}>
    <div style={{ height: 6, background: C.ink, width: `${d * 100}%` }}></div>
    <div style={{ height: 1, background: C.ink, width: `${d * 100}%`, marginTop: 4 }}></div>
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', fontSize: 20, letterSpacing: '.14em', opacity: tw(T, 1, 0.8) + tw(T, 134.8, 0.8) }}>
      <span>MONDAY 5 OCTOBER · 8:40</span><span style={{ fontStyle: 'italic', letterSpacing: 0, color: C.n6 }}>One knowledge worker. One morning.</span>
    </div>
  </div>;
}

export function Statement() {
  const { T } = useFilm();
  const o = win(T, 139.9, 147.4, 0.7), d = tw(T, 141.7, 1.3, 'draw');
  return <div style={{ position: 'absolute', left: 120, top: 240, width: 1680, opacity: o }}>
    <div style={{ ...kick, fontSize: 22, letterSpacing: '.16em', color: C.mag, opacity: tw(T, 140.1, 0.6) }}>FOR THE PERSON WHO SIGNS</div>
    <div style={{ fontSize: 92, fontWeight: 600, lineHeight: 1.06, letterSpacing: '-.01em', maxWidth: 1460, marginTop: 20, textWrap: 'pretty', opacity: tw(T, 140.4, 0.9), transform: `translateY(${(1 - tw(T, 140.4, 0.9)) * 24}px)` }}>Look after your people's attention, and sleep better the night before the deadline.</div>
    <div style={{ marginTop: 52, opacity: tw(T, 141.6, 0.6) }}>
      <div style={{ height: 6, background: C.ink, width: `${d * 100}%` }}></div>
      <div style={{ height: 1, background: C.ink, width: `${d * 100}%`, marginTop: 4 }}></div>
    </div>
    <div style={{ display: 'flex', gap: 96, marginTop: 36 }}>
      <div style={{ fontFamily: BODY, fontStyle: 'italic', fontSize: 34, lineHeight: 1.3, color: C.n7, maxWidth: 760, opacity: tw(T, 142.2, 0.8), transform: `translateY(${(1 - tw(T, 142.2, 0.8)) * 14}px)` }}>Same team. Same week. The hours you were already paying for, handed back.</div>
      <div style={{ fontSize: 26, lineHeight: 1.45, maxWidth: 560, opacity: tw(T, 143.1, 0.8), transform: `translateY(${(1 - tw(T, 143.1, 0.8)) * 14}px)` }}>No new headcount. No new tool to learn. One line, in the browser they already live in.</div>
    </div>
    <a className="btn btn-primary" href="desk.html" onClick={e => e.stopPropagation()} style={{ marginTop: 48, fontSize: 24, padding: '14px 28px', textDecoration: 'none', opacity: tw(T, 144.1, 0.7), transform: `translateY(${(1 - tw(T, 144.1, 0.7)) * 12}px)`, pointerEvents: tw(T, 144.1, 0.7) > 0.5 ? 'auto' : 'none' }}>Try the desk →</a>
  </div>;
}
