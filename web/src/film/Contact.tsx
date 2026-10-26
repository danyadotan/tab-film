import qrcode from 'qrcode-generator';
import type { MouseEvent } from 'react';
import { useFilm } from '../engine/FilmContext';
import { BODY, C, kick } from './tokens';
import { tw } from './motion';

export const CONTACT = {
  name: 'Danya Dotan',
  org: 'Bridge-iT',
  linkedin: 'https://linkedin.com/in/danya-dotan/',
  desk: 'https://tab-at-work.com',
  email: 'danya@dynamicbridge.io',
};

// [kicker, figure, headline, body] — early, mid and conclusion of the film
const BULLETINS: [string, string, string, string][] = [
  ['EARLY · THE PROBLEM', '14 · 11 · 2', 'The morning arrives all at once.', 'Fourteen tabs, eleven messages, two copies of one doc — before 9:00. TAB centers the one thing and files the rest, one ask away.'],
  ['MID · THE DESIGN', '8 → 4', 'Eight pages became four rooms.', 'Day, Write, Call, Close. One voice, one place, one color — TAB speaks once per room, then goes quiet.'],
  ['CONCLUSION · THE RETURN', '$260 / h', 'Friction events × the cost of a stall.', 'Per employee-hour of downtime (ITIC 2025). TAB counts events, not people — anonymous by design.'],
];

// The QR code as one SVG path, built once; 4-module quiet zone.
const QR = (() => {
  const q = qrcode(0, 'M');
  q.addData(CONTACT.desk);
  q.make();
  const n = q.getModuleCount();
  let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + 4} ${r + 4}h1v1h-1z`;
  return { size: n + 8, d };
})();

const AT = 147.6;
const rise = (T: number, s: number, d = 0.7, px = 14) => ({ opacity: tw(T, s, d), transform: `translateY(${(1 - tw(T, s, d)) * px}px)` });
const keep = (e: MouseEvent) => e.stopPropagation();

function Rules({ p }: { p: number }) {
  return <div>
    <div style={{ height: 6, background: C.ink, width: `${p * 100}%` }}></div>
    <div style={{ height: 1, background: C.ink, width: `${p * 100}%`, marginTop: 4 }}></div>
  </div>;
}

/** The held last frame: three bulletins from the film, then how to reach Danya and where to try the desk. */
export function Contact() {
  const { T } = useFilm();
  const link = { color: C.ink, textDecoration: 'none' };
  const o = tw(T, AT, 0.6);
  // Click-through until it shows, so its links never catch clicks mid-film.
  return <div style={{ position: 'absolute', left: 120, top: 96, width: 1680, opacity: o, pointerEvents: o > 0.5 ? 'auto' : 'none' }}>
    <div style={{ ...kick, fontSize: 20, letterSpacing: '.16em', color: C.mag }}>TAB · FROM INTENTION TO DONE</div>
    <div style={{ marginTop: 18 }}><Rules p={tw(T, AT + 0.2, 1.2, 'draw')} /></div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', columnGap: 60, marginTop: 44 }}>
      {BULLETINS.map((b, i) => <div key={i} style={rise(T, AT + 0.6 + i * 0.6)}>
        <div style={{ ...kick, fontSize: 15, color: C.n7 }}>{b[0]}</div>
        <div style={{ fontSize: 88, lineHeight: 1, color: i === 2 ? C.cyan7 : C.cyan, marginTop: 16, whiteSpace: 'nowrap' }}>{b[1]}</div>
        <div style={{ fontSize: 34, fontWeight: 600, lineHeight: 1.15, marginTop: 20, textWrap: 'pretty' }}>{b[2]}</div>
        <div style={{ fontFamily: BODY, fontStyle: 'italic', fontSize: 22, lineHeight: 1.4, color: C.n7, marginTop: 12, textWrap: 'pretty' }}>{b[3]}</div>
      </div>)}
    </div>

    <div style={{ position: 'absolute', left: 0, top: 590, width: 1680 }}>
      <Rules p={tw(T, AT + 2.2, 1.2, 'draw')} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 96, marginTop: 40 }}>
        <div style={rise(T, AT + 2.8)}>
          <div style={{ ...kick, fontSize: 18, letterSpacing: '.16em', color: C.mag }}>LET'S TALK</div>
          <div style={{ fontSize: 72, fontWeight: 600, lineHeight: 1.04, marginTop: 12 }}>{CONTACT.name}</div>
          <div style={{ fontFamily: BODY, fontStyle: 'italic', fontSize: 32, color: C.n7, marginTop: 8 }}>{CONTACT.org}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26, marginTop: 34, ...rise(T, AT + 3.2) }}>
          <div>
            <div style={{ ...kick, fontSize: 14, color: C.n6 }}>LINKEDIN</div>
            <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" onClick={keep} style={{ ...link, fontSize: 32, display: 'block', marginTop: 4 }}>linkedin.com/in/danya-dotan</a>
          </div>
          <div>
            <div style={{ ...kick, fontSize: 14, color: C.n6 }}>EMAIL</div>
            <a href={`mailto:${CONTACT.email}`} onClick={keep} style={{ ...link, fontSize: 32, display: 'block', marginTop: 4 }}>{CONTACT.email}</a>
          </div>
        </div>
        <a href={CONTACT.desk} target="_blank" rel="noopener noreferrer" onClick={keep} style={{ marginLeft: 'auto', textAlign: 'center', color: C.n6, textDecoration: 'none', ...rise(T, AT + 3.6) }}>
          <svg width={248} height={248} viewBox={`0 0 ${QR.size} ${QR.size}`} shapeRendering="crispEdges" style={{ display: 'block', background: '#fff', boxShadow: 'var(--shadow-sm)' }} role="img" aria-label="QR code to TAB Desk at tab-at-work.com">
            <path d={QR.d} fill={C.ink} />
          </svg>
          <div style={{ fontFamily: BODY, fontStyle: 'italic', fontSize: 18, marginTop: 12 }}>Scan to try the desk · tab-at-work.com</div>
        </a>
      </div>
    </div>
  </div>;
}
