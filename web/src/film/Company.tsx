import { useFilm } from '../engine/FilmContext';
import { BODY, C, kick } from './tokens';
import { mix, tw, win } from './motion';

// 40 × 15 desks; two hot clusters stall far more often. Events fire at T 116–121.
const GC = 40, GR = 15;
const hash = (i: number, k: number) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };
const CELLS = Array.from({ length: GC * GR }, (_, i) => {
  const c = i % GC, r = Math.floor(i / GC);
  const hot = (c >= 8 && c <= 13 && r >= 3 && r <= 8) || (c >= 26 && c <= 31 && r >= 8 && r <= 13);
  const ev: number[] = [];
  for (let k = 0; k < 4; k++) if (hash(i, k + 10) < (hot ? 0.75 : 0.12)) ev.push(116 + hash(i, k) * 5);
  return { c, r, ev, d: Math.hypot(c, r) };
});
const LEDGER = [['Pricing approval — waiting on a decision owner', '412', '164 h', 'Treated · routed to the owner'], ['Re-keying between CRM and billing', '356', '119 h', 'Routed to the process owner'], ['Hunting for the current contract template', '288', '52 h', 'Treated · one source pinned'], ['Access requests in week one', '201', '88 h', 'Routed to IT · one ticket, not 201']];

const fmt = (v: number) => v.toLocaleString('en-US');

// [figure, caption, color, emphasis kicker, emphasis note] — or a lone operator
type Term = [string] | [string, string, string] | [string, string, string, string, string];

export function Company() {
  const { T } = useFilm();
  const o = win(T, 115.2, 134.2, 0.5), gs = mix(1, 0.45, tw(T, 121, 1.2, 'draw')), go = 1 - tw(T, 127.8, 0.6);
  const n = Math.round(1812 * tw(T, 116, 5.2, 'draw'));
  const roi = tw(T, 128.6, 0.8), tally = (v: number) => Math.round(v * tw(T, 129.2, 2.2, 'draw'));
  const TERMS: Term[] = [
    [fmt(tally(1812)), 'friction events', C.amberInk], ['×'],
    ['0.6 h', 'average stall', C.ink, 'THE PART NOBODY LOGS', '36 minutes gone per event — unlogged, unbilled, paid for all the same.'], ['×'],
    ['$260', 'per employee-hour of downtime · ITIC 2025', C.ink], ['='],
    ['$' + fmt(tally(282672)), 'a week, back on the table', C.cyan7],
  ];
  return <div style={{ position: 'absolute', inset: 0, opacity: o }}>
    <div style={{ position: 'absolute', left: 120, top: 330, width: GC * 40, height: GR * 28, transform: `scale(${gs})`, transformOrigin: '0 0', opacity: go }}>
      {CELLS.map((c, i) => {
        const app = tw(T, 115.2 + c.d * 0.025, 0.4);
        let flash = 0, heat = 0;
        c.ev.forEach(t => { flash = Math.max(flash, win(T, t, t + 0.7, 0.15)); if (T > t) heat++; });
        return <div key={i} style={{ position: 'absolute', left: c.c * 40, top: c.r * 28, width: 32, height: 20, opacity: app, background: `color-mix(in oklch, ${C.amber} ${Math.round(Math.min(90, flash * 85 + heat * 16))}%, var(--color-neutral-200))` }}></div>;
      })}
    </div>
    <div style={{ position: 'absolute', left: 120, top: mix(800, 560, tw(T, 121, 1.2, 'draw')), display: 'flex', flexDirection: 'column', gap: 18, opacity: tw(T, 116.4, 0.6) * go }}>
      {[['2,500', 'seats'], [fmt(n), 'friction events this week'], ['0', 'names']].map((r, i) => <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}><span style={{ fontSize: 44, lineHeight: 1, color: i === 1 ? C.amberInk : C.cyan, width: 150 }}>{r[0]}</span><span style={{ fontSize: 24 }}>{r[1]}</span></div>)}
    </div>
    <div style={{ position: 'absolute', left: 960, top: 330, width: 860, opacity: tw(T, 121.6, 0.7) * go }}>
      <div style={{ ...kick, fontSize: 15, color: C.n7 }}>FRICTION LEDGER · THIS WEEK · ILLUSTRATIVE</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 110px 250px', columnGap: 20, rowGap: 0, marginTop: 18, fontSize: 21, lineHeight: 1.3 }}>
        {['Where it stalls', 'Events', 'Stalled', 'What happened'].map(h => <div key={h} style={{ fontSize: 15, color: C.n6, fontStyle: 'italic', paddingBottom: 10 }}>{h}</div>)}
        {LEDGER.map((l, i) => {
          const e = tw(T, 122.4 + i * 0.7, 0.6);
          return l.map((v, j) => <div key={i + '-' + j} style={{ padding: '14px 0', opacity: e, transform: `translateY(${(1 - e) * 12}px)`, color: j === 1 ? C.amberInk : j === 3 ? C.cyan7 : C.ink, fontSize: j === 1 ? 28 : j === 3 ? 18 : 21 }}>{v}</div>);
        })}
      </div>
    </div>
    <div style={{ position: 'absolute', left: 120, top: 380, opacity: roi, transform: `translateY(${(1 - roi) * 20}px)` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 36 }}>
        {TERMS.map((t, i) => t.length === 1
          ? <div key={i} style={{ fontSize: 96, lineHeight: 1, color: C.n5 }}>{t[0]}</div>
          : <div key={i} style={{ maxWidth: 300 }}>
            <div style={{ fontSize: 96, lineHeight: 1, fontWeight: 600, color: t[2], transform: t.length === 5 ? `scale(${mix(1, 1.07, win(T, 129.8, 131.2, 0.45))})` : 'none', transformOrigin: '0 50%' }}>{t[0]}</div>
            <div style={{ fontFamily: BODY, fontStyle: 'italic', fontSize: 22, color: C.n7, marginTop: 12, lineHeight: 1.3 }}>{t[1]}</div>
            {t.length === 5 && <div style={{ marginTop: 18, opacity: tw(T, 129.8, 0.7), transform: `translateY(${(1 - tw(T, 129.8, 0.7)) * 10}px)` }}>
              <div style={{ height: 3, width: 54, background: C.amber }}></div>
              <div style={{ ...kick, fontSize: 12, color: C.amberInk, marginTop: 10 }}>{t[3]}</div>
              <div style={{ fontSize: 22, lineHeight: 1.35, color: C.ink, marginTop: 6, textWrap: 'pretty' }}>{t[4]}</div>
            </div>}
          </div>)}
      </div>
      <div style={{ marginTop: 70, display: 'flex', flexDirection: 'column', gap: 12, opacity: tw(T, 130.6, 0.8) }}>
        <div style={{ fontSize: 28 }}>The benchmark to beat: <span style={{ color: C.cyan7 }}>28% fewer tickets</span> — Nexthink customer outcomes.</div>
        <div style={{ ...kick, fontSize: 14, color: C.n6 }}>ILLUSTRATIVE FIGURES — THE LANGUAGE OF THE METRIC, NOT A BENCHMARK</div>
      </div>
    </div>
  </div>;
}
