const C = { ink: '#201e1d', paper: '#f3f2f2', cyan: 'var(--color-accent)', cyan7: 'var(--color-accent-700)', cyan1: 'var(--color-accent-100)', mag: 'var(--color-accent-2)', amber: 'oklch(0.7 0.17 65)', amberInk: 'oklch(0.5 0.15 55)', n1: 'var(--color-neutral-100)', n2: 'var(--color-neutral-200)', n4: 'var(--color-neutral-400)', n5: 'var(--color-neutral-500)', n6: 'var(--color-neutral-600)', n7: 'var(--color-neutral-700)', n8: 'var(--color-neutral-800)', n9: 'var(--color-neutral-900)' };
const SERIF = 'var(--font-heading), "Source Serif 4", Georgia, serif';
const BODY = 'var(--font-body), "Source Serif 4", Georgia, serif';

// three motion helpers
const EASE = { enter: Easing.easeOutCubic, draw: Easing.easeInOutCubic, pop: Easing.easeOutBack };
const tw = (T, s, d, k = 'enter') => EASE[k](clamp((T - s) / d, 0, 1));
const win = (T, a, b, f = 0.5) => Math.min(tw(T, a, f), 1 - tw(T, b - f, f, 'draw'));
const mix = (a, b, p) => a + (b - a) * p;
const tint = (col, a) => `color-mix(in oklch, ${col} ${Math.round(clamp(a, 0, 1) * 100)}%, transparent)`;
const reveal = (text, p) => { const w = text.split(' '); const n = Math.round(w.length * clamp(p, 0, 1)); return [w.slice(0, n).join(' '), w.slice(n).join(' ')]; };
const keys = (T, K) => { if (T <= K[0].t) return K[0]; for (let i = 0; i < K.length - 1; i++) { const a = K[i], b = K[i + 1]; if (T < b.t) { const p = EASE.draw((T - a.t) / (b.t - a.t)); const o = {}; for (const k in a) o[k] = mix(a[k], b[k], p); return o; } } return K[K.length - 1]; };
const kick = { fontSize: 13, letterSpacing: '.14em', fontWeight: 700 };

const HEADS = [
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
const HM = {
  hero: { x: 120, y: 330, ks: 22, ts: 112, ss: 38, mw: 1500 },
  big: { x: 120, y: 96, ks: 20, ts: 76, ss: 30, mw: 1600 },
  room: { x: 288, y: 52, ks: 17, ts: 46, ss: 0, mw: 1400 },
};

function Heads() {
  const { T } = useComposition();
  return HEADS.map((h, i) => {
    const o = win(T, h.a, h.b, 0.6), m = HM[h.m], rise = (1 - tw(T, h.a, 0.9)) * 22, drift = h.m === 'hero' ? 1 + 0.025 * clamp((T - h.a) / 8, 0, 1) : 1;
    return <div key={i} style={{ position: 'absolute', left: m.x, top: m.y, maxWidth: m.mw, opacity: o, transform: `translateY(${rise}px) scale(${drift})`, transformOrigin: '0 0' }}>      <div style={{ ...kick, fontSize: m.ks, letterSpacing: '.16em', color: C.mag }}>{h.k}</div>
      <div style={{ fontSize: m.ts, fontWeight: 600, lineHeight: 1.04, letterSpacing: '-.01em', marginTop: h.m === 'room' ? 4 : 14, whiteSpace: h.m === 'room' ? 'nowrap' : 'normal', textWrap: 'pretty' }}>{h.t}</div>
      {h.s && <div style={{ fontFamily: BODY, fontStyle: 'italic', fontSize: m.ss, color: C.n7, marginTop: 22, lineHeight: 1.3, opacity: tw(T, h.a + 1.4, 0.8) }}>{h.s}</div>}
    </div>;
  });
}

function Dateline() {
  const { T } = useComposition();
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

function AmberTab({ ring = 0, h = 120, style }) {
  return <div style={{ width: 36, height: h, background: C.amber, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 ${ring * 14}px ${tint(C.amber, (1 - ring) * 0.55)}`, ...style }}>
    <span style={{ writingMode: 'vertical-rl', fontSize: 13, letterSpacing: '.24em', fontWeight: 700 }}>TAB</span>
  </div>;
}

function StageTab() {
  const { T } = useComposition();
  const o = win(T, 1.6, 8.6) + win(T, 44.2, 55.4) + win(T, 135.2, 139.6, 0.8);
  const x = mix(60, 0, Math.max(tw(T, 1.6, 0.9, 'pop'), tw(T, 44.2, 0.9, 'pop'), tw(T, 135.2, 0.9, 'pop')));
  const ring = T > 46 && T < 47.4 ? (T - 46) / 1.4 : 0;
  return <AmberTab ring={ring} h={160} style={{ position: 'absolute', right: 0, top: 460, opacity: o, transform: `translateX(${x}px)` }} />;
}

function Principles() {
  const { T } = useComposition();
  const P = [['Center the one thing.', 'One task in the middle of the page. The rest steps aside.'], ['Hide the noise.', 'Filed, not closed — one ask away.'], ['Speak once.', 'One line under the chrome. Never a sticker.']];
  return <div style={{ position: 'absolute', left: 120, top: 330, width: 640, display: 'flex', flexDirection: 'column', gap: 44 }}>
    {P.map((p, i) => { const a = 21.2 + i * 2.2, o = win(T, a, 29.6, 0.6); return <div key={i} style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: 16, opacity: o, transform: `translateX(${(1 - tw(T, a, 0.8)) * -30}px)` }}>
      <div style={{ fontSize: 72, lineHeight: 0.9, color: C.cyan }}>{i + 1}</div>
      <div><div style={{ fontSize: 42, fontWeight: 600, lineHeight: 1.1 }}>{p[0]}</div><div style={{ fontFamily: BODY, fontStyle: 'italic', fontSize: 24, color: C.n7, marginTop: 8, lineHeight: 1.3 }}>{p[1]}</div></div>
    </div>; })}
  </div>;
}

const EIGHT = [['Boot', 'TAB wakes up', 0, 1], ['Room', 'the desk is set', 0, 1], ['Briefs', 'three things today', 0, 0], ['Text', 'the editor', 1, 0], ['Call', 'the wingman', 2, 0], ['Parked', 'what waits', -1, 1], ['Handoff', 'pass it on', 3, 1], ['Wrap', 'the day closes', 3, 0]];
const FOUR = [['Day', 'the assistant', 'BOOT · ROOM · BRIEFS', 'Waking and setting the desk folded into one greeting.'], ['Write', 'the editor', 'TEXT', 'Kept whole. The work itself.'], ['Call', 'the wingman', 'CALL', 'Kept. The moment that matters most.'], ['Close', 'the librarian', 'HANDOFF · WRAP', 'Handing off and wrapping up are one gesture: done.']];
const CARD = { background: '#fff', boxShadow: 'var(--shadow-sm)', padding: '22px 22px', boxSizing: 'border-box', position: 'absolute', overflow: 'hidden' };

function EightCards() {
  const { T } = useComposition();
  const drift = -24 * clamp((T - 30) / 12, 0, 1);
  return <div>
    {EIGHT.map((c, i) => {
      const enter = tw(T, 30.6 + i * 0.22, 0.7, 'pop'), mv = tw(T, 44.6 + (c[3] ? 0 : 0.2), 1.6, 'draw');
      let x = 120 + i * 220 + drift, y = 420, w = 196, o = Math.min(tw(T, 30.6 + i * 0.22, 0.4), 1);
      if (c[2] >= 0) { x = mix(x, 120 + c[2] * 430, mv); w = mix(196, 390, mv); }
      else { x = mix(x, 1884, mv); w = mix(196, 36, mv); y = mix(420, 460, mv); }
      o *= 1 - tw(T, 46.4, 0.6);
      const strike = c[3] ? tw(T, 43 + [0, 0.3, 0, 0, 0, 0.6, 0.9][i] , 0.5, 'draw') : 0;
      return <div key={i} style={{ ...CARD, left: x, top: y + (1 - enter) * 40, width: w, height: mix(280, c[2] < 0 ? 160 : 280, mv), opacity: o, transform: `scale(${mix(0.9, 1, enter)})` }}>
        <div style={{ fontSize: 44, lineHeight: 1, color: C.cyan }}>{i + 1}</div>
        <div style={{ position: 'relative', display: 'inline-block', marginTop: 70 }}>
          <div style={{ fontSize: 32, fontWeight: 600, color: c[3] ? mix(0, 1, strike) > 0.5 ? C.n5 : C.ink : C.ink }}>{c[0]}</div>
          <div style={{ position: 'absolute', left: -4, right: -4, top: '52%', height: 4, background: C.mag, transform: `scaleX(${strike})`, transformOrigin: '0 50%' }}></div>
        </div>
        <div style={{ fontFamily: BODY, fontStyle: 'italic', fontSize: 19, color: C.n6, marginTop: 6, whiteSpace: 'nowrap' }}>{c[1]}</div>
      </div>;
    })}
    <div style={{ position: 'absolute', left: 120 + drift, top: 760, display: 'flex', gap: 18, alignItems: 'baseline', opacity: win(T, 33, 43.6) }}>
      <span style={{ ...kick, fontSize: 16, color: C.n7 }}>BACKROOM</span>
      <span style={{ fontSize: 26 }}>Unified — TAB's own ledger of what it did.</span>
    </div>
  </div>;
}

function CutResult() {
  const { T } = useComposition();
  const out = 1 - tw(T, 54.8, 0.6);
  return <div>
    {FOUR.map((f, j) => {
      const o = tw(T, 46.4 + j * 0.15, 0.6) * (j === 0 ? 1 - tw(T, 55.0, 0.4) : out);
      return <div key={j}>
        <div style={{ ...CARD, left: 120 + j * 430, top: 420, width: 390, height: 280, opacity: o, transform: `scale(${mix(0.96, 1, tw(T, 46.4 + j * 0.15, 0.7, 'pop'))})` }}>
          <div style={{ fontSize: 44, lineHeight: 1, color: C.cyan }}>{j + 1}</div>
          <div style={{ fontSize: 44, fontWeight: 600, marginTop: 56 }}>{f[0]}</div>
          <div style={{ fontFamily: BODY, fontStyle: 'italic', fontSize: 24, color: C.n7, marginTop: 2 }}>{f[1]}</div>
          <div style={{ ...kick, fontSize: 13, color: C.n6, marginTop: 18 }}>FROM {f[2]}</div>
        </div>
        <div style={{ position: 'absolute', left: 120 + j * 430, top: 730, width: 380, fontFamily: BODY, fontStyle: 'italic', fontSize: 24, lineHeight: 1.3, color: C.n8, opacity: tw(T, 48.4 + j * 1.0, 0.7) * out, transform: `translateY(${(1 - tw(T, 48.4 + j, 0.7)) * 14}px)`, textWrap: 'pretty' }}>{f[3]}</div>
      </div>;
    })}
    <div style={{ position: 'absolute', left: 120, top: 890, display: 'flex', gap: 18, alignItems: 'baseline', opacity: tw(T, 52.4, 0.7) * out }}>
      <span style={{ ...kick, fontSize: 16, color: C.amberInk }}>AND</span>
      <span style={{ fontSize: 28 }}>Parked became the amber sideline. Unified moved to the backroom — off the path.</span>
    </div>
  </div>;
}

function RuleCallouts() {
  const { T } = useComposition();
  const R = [['VOICE', 'The line. It speaks once per room, then goes quiet.'], ['PLACE', 'The amber tab at the edge. Everything TAB holds lives there.'], ['COLOR', 'Amber belongs to TAB alone. Nothing else wears it.']];
  return <div style={{ position: 'absolute', left: 120, top: 330, width: 540, display: 'flex', flexDirection: 'column', gap: 48 }}>
    {R.map((r, i) => { const a = 57.8 + i * 2.2; return <div key={i} style={{ opacity: win(T, a, 65.8, 0.6), transform: `translateX(${(1 - tw(T, a, 0.8)) * -30}px)` }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><span style={{ width: 14, height: 14, borderRadius: '50%', background: C.amber }}></span><span style={{ ...kick, fontSize: 18, color: C.amberInk }}>{r[0]}</span></div>
      <div style={{ fontSize: 36, lineHeight: 1.2, marginTop: 10, textWrap: 'pretty' }}>{r[1]}</div>
    </div>; })}
  </div>;
}

// ——— the browser ———
const LINES = [
  { a: 58.4, b: 65.4, t: "Morning. I'm TAB — one line, once a room, only when it matters." },
  { a: 66.8, b: 71.2, t: 'Good morning. Three things today. Want me to take you through them?', ch: ['Out loud + on screen', "I've got it"] },
  { a: 71.2, b: 77.6, t: '§4 pricing is the one thing between you and noon. Pin it to the center?', ch: ['Pin it', 'Leave it'], press: 74.6 },
  { a: 85.4, b: 89.6, t: "Northwind in five. I'll hold your place — nothing to save.", ch: ['Take me there', 'Two more minutes'], press: 88.6, meta: '10:25' },
  { a: 90.8, b: 101.4, t: "Here. Statement pinned, answers ready. I'm on notes, off camera.", meta: 'LIVE' },
  { a: 102.8, b: 113.4, t: "That's the day. Two alerts that are real — nothing else." },
];
const OPEN = [[58.4, 65.4], [66.8, 77.6], [85.4, 89.6], [90.8, 101.4], [102.8, 113.4]];
const CAMS = [[71.6, 77.8, 1.08, 640, 300], [79, 85.2, 1.28, 480, 420], [96.2, 101.8, 1.16, 420, 560], [106.6, 113.4, 1.06, 1100, 420]];

function Line({ T }) {
  const p = OPEN.reduce((s, o) => s + win(T, o[0], o[1], 0.6), 0);
  let L = LINES[0]; LINES.forEach(l => { if (T >= l.a - 0.01) L = l; });
  const n = L.t.split(' ').length, prog = clamp((T - L.a - 0.3) / (n * 0.17), 0, 1);
  const [said, rest] = reveal(L.t, prog), chO = L.ch ? tw(T, L.a + 0.3 + n * 0.17, 0.4) : 0;
  const swap = L === LINES[2] ? tw(T, 71.2, 0.4) : 1;
  const pressed = L.press && T >= L.press, bump = L.press ? 1 - 0.08 * win(T, L.press - 0.1, L.press + 0.25, 0.12) : 1;
  return <div style={{ position: 'absolute', top: 66, right: 62, width: 900 * p, opacity: p > 0.02 ? 1 : 0, overflow: 'hidden', borderRadius: 32, background: '#fff', outline: `1.5px solid ${C.amber}`, boxShadow: 'var(--shadow-lg)', zIndex: 30 }}>
    <div style={{ width: 900, padding: '12px 20px 12px 16px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minHeight: 32 }}>
        <span style={{ width: 14, height: 14, flex: 'none', borderRadius: '50%', background: C.amber, boxShadow: `0 0 0 ${prog < 1 ? 6 : 0}px oklch(0.9 0.1 80)` }}></span>
        <div style={{ flex: 1, fontSize: 18, lineHeight: 1.3, opacity: swap }}><span style={{ fontWeight: 600, color: C.amberInk, marginRight: 8 }}>TAB</span><span>{said} </span><span style={{ color: C.n4 }}>{rest}</span></div>
        {L.meta && <span style={{ ...kick, fontSize: 12, fontWeight: 400, color: C.n6 }}>{L.meta}</span>}
        <span style={{ width: 28, textAlign: 'center', color: C.n6, fontSize: 18 }}>×</span>
      </div>
      {L.ch && <div style={{ display: 'flex', gap: 6, paddingLeft: 28, opacity: chO, maxHeight: chO * 44, overflow: 'hidden' }}>
        {L.ch.map((c, i) => <span key={i} style={{ padding: '6px 14px', borderRadius: 999, fontSize: 15, whiteSpace: 'nowrap', outline: `1.5px solid ${C.amber}`, background: i === 0 ? (pressed ? 'oklch(0.6 0.17 60)' : C.amber) : '#fff', color: i === 0 ? '#fff' : C.ink, transform: i === 0 ? `scale(${bump})` : 'none' }}>{c}{i === 0 && pressed ? ' ✓' : ''}</span>)}
      </div>}
    </div>
  </div>;
}

function Chrome({ T }) {
  const MESSY = ['Spec v1', 'Spec v2', 'Spec v3', 'Spec v4', 'Q3 memo', 'Cohort chart', 'Cohort chart (copy)', '#launch-chat', 'Inbox (11)', 'Calendar', 'Northwind CRM', 'Pricing v4', 'Legal notes', 'Weekend reading'];
  const CLEAN = [['Day', '3 things'], ['Write', 'spec v4 · 2 copies'], ['Call', '10:30 Northwind'], ['Close', '17:48']];
  const count = Math.round(mix(1, 14, tw(T, 9, 4.6, 'draw'))), mo = 1 - tw(T, 19.8, 0.6), co = tw(T, 20.2, 0.6);
  const act = T < 78 ? 0 : T < 90 ? 1 : T < 102 ? 2 : 3;
  const time = T < 78 ? '8:40' : T < 85.4 ? '10:24' : T < 90 ? '10:25' : T < 102 ? '10:30' : '17:48';
  return <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 56, display: 'flex', alignItems: 'center', gap: 36, padding: '0 48px', zIndex: 25, background: C.paper }}>
    <div style={{ fontWeight: 700, fontSize: 20, letterSpacing: '.14em', color: C.mag }}>TAB</div>
    <div style={{ flex: 1, position: 'relative', height: 56 }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 4, opacity: mo }}>
        {MESSY.slice(0, count).map((m, i) => <div key={i} style={{ flex: '1 1 0', minWidth: 0, padding: '6px 8px', background: i === count - 1 ? '#fff' : C.n2, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{m}</div>)}
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 28, opacity: co }}>
        {CLEAN.map((c, i) => <div key={i} style={{ fontSize: 17, fontWeight: i === act ? 700 : 400, color: i === act ? C.cyan7 : C.ink, display: 'flex', gap: 8, alignItems: 'baseline' }}><span>{c[0]}</span><span style={{ fontSize: 12, color: C.n6, fontWeight: 400 }}>{c[1]}</span></div>)}
      </div>
    </div>
    <div style={{ fontSize: 15, color: C.n6, fontStyle: 'italic' }}>Mon 5 Oct · {time}</div>
  </div>;
}

function Messy({ T }) {
  const DOCS = [[90, 40, 440, 'Onboarding spec — v2', 'Section 4 TBD. See v3?'], [320, 140, 460, 'Onboarding spec — v4', 'Pricing tiers: Starter, Team, Scale…'], [140, 300, 420, 'Q3 memo', 'Activation targets for the pilot cohort.'], [470, 380, 400, 'Cohort chart (copy)', 'Duplicate of “Cohort chart”.']];
  const TOAST = ['Dana · Re: pricing?', '#launch-chat · 14 new', 'Omar · 1:1 moved?', 'Legal · trial length', 'Standup · 9:30', 'Rina · seat limits', '+5 more'];
  const o = 1 - tw(T, 20.4, 0.4);
  return <div style={{ position: 'absolute', inset: 0, opacity: o }}>
    {DOCS.map((d, i) => { const e = tw(T, 9.4 + i * 0.5, 0.6, 'pop'), f = tw(T, 19.5, 0.8, 'draw'); return <div key={i} style={{ position: 'absolute', left: d[0], top: d[1] + 70, width: d[2], padding: '22px 26px', background: '#fff', boxShadow: 'var(--shadow-md)', opacity: Math.min(tw(T, 9.4 + i * 0.5, 0.3), 1 - f), transform: `scale(${mix(0.85, 1, e) * mix(1, 0.94, f)})` }}>
      <div style={{ fontSize: 24, fontWeight: 600 }}>{d[3]}</div><div style={{ fontSize: 17, color: C.n7, marginTop: 6 }}>{d[4]}</div></div>; })}
    {TOAST.map((t, i) => { const a = 10.6 + i * 0.45, f = tw(T, 19.4 + i * 0.08, 0.8, 'draw'); return <div key={i} style={{ position: 'absolute', left: 880, top: 80 + i * 66, width: 300, padding: '12px 16px', background: '#fff', boxShadow: 'var(--shadow-sm)', fontSize: 17, opacity: Math.min(tw(T, a, 0.3), 1 - f), transform: `translateX(${(1 - tw(T, a, 0.5)) * 40 + f * 380}px) scale(${mix(1, 0.4, f)})`, transformOrigin: '100% 50%' }}>{t}</div>; })}
  </div>;
}

const ct = (T, base = 104) => { const p = OPEN.reduce((s, o) => s + win(T, o[0], o[1], 0.6), 0); let L = LINES[0]; LINES.forEach(l => { if (T >= l.a - 0.01) L = l; }); return base + p * (L.ch ? 140 : 96); };
const hl = a => `3px solid ${tint(C.cyan, a)}`;

function DayRoom({ T }) {
  const ITEMS = [['by 12:00', 'Onboarding spec — ship it.', 'Sections one to three settled. ', '§4 pricing tiers', ' still open.'], ['9:30', 'Standup — three lines, drafted.', 'The one blocker to raise: the pricing decision.'], ['when free', 'Replies — Dana first.', 'Her answer unblocks the spec. Then Omar, then Legal.']];
  const h1 = Math.max(win(T, 21.6, 29.6, 0.5), win(T, 72, 77.8, 0.5));
  return <div style={{ position: 'absolute', inset: 0, opacity: win(T, 20.4, 78.3) }}>
    <div style={{ position: 'absolute', left: 112, top: ct(T), width: 850 }}>
      <div style={{ ...kick, color: C.mag }}>MONDAY 5 OCTOBER</div>
      <div style={{ margin: '8px 0 0', fontSize: 64, fontWeight: 600, lineHeight: 1.02 }}>Good morning. Here is your day.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 34 }}>
        {ITEMS.map((it, i) => <div key={i} style={{ display: 'grid', gridTemplateColumns: '64px 110px 1fr', gap: 20, alignItems: 'baseline', padding: '10px 14px', margin: '0 -14px', outline: i === 0 ? hl(h1) : 'none', outlineOffset: -3, opacity: tw(T, 20.9 + i * 0.4, 0.6), transform: `translateY(${(1 - tw(T, 20.9 + i * 0.4, 0.6)) * 16}px)` }}>
          <div style={{ fontSize: 48, lineHeight: 1, color: C.cyan }}>{i + 1}</div><div style={{ fontSize: 16, color: C.n6 }}>{it[0]}</div>
          <div><div style={{ fontSize: 30, lineHeight: 1.15 }}>{it[1]}</div><div style={{ fontSize: 17, marginTop: 4, color: C.n7 }}>{it[2]}{it[3] && <span style={{ color: C.mag }}>{it[3]}</span>}{it[4]}</div></div>
        </div>)}
      </div>
      <div style={{ marginTop: 36, display: 'flex', gap: 18, alignItems: 'baseline', opacity: tw(T, 75, 0.6), transform: `translateY(${(1 - tw(T, 75, 0.6)) * 12}px)` }}>
        <div style={{ ...kick, color: C.mag, whiteSpace: 'nowrap' }}>PINNED UNTIL 12:00</div>
        <div style={{ fontSize: 24 }}>§4 Pricing tiers — <span style={{ color: C.cyan7, textDecoration: 'underline' }}>open it</span></div>
      </div>
    </div>
    <div style={{ position: 'absolute', left: 1000, top: ct(T, 110), width: 196, opacity: tw(T, 20.8, 0.8) }}>
      <div style={{ ...kick, fontSize: 12, color: C.n7 }}>HELD BACK</div>
      <p style={{ margin: '6px 0 0', fontSize: 16, lineHeight: 1.45, color: C.n7 }}>14 weekend tabs, 11 messages, 2 duplicate docs. Filed, not closed — ask me for any of them.</p>
    </div>
  </div>;
}

function WriteRoom({ T }) {
  const P1 = 'Onboarding is offered in three tiers: Starter, Team, Scale. Trial length is 14 days across all of them.';
  const P2 = 'Open: does Starter include the guided checklist? Decision owner: Dana.';
  const c1 = Math.round(P1.length * clamp((T - 79.2) / 3.6, 0, 1)), c2 = Math.round(P2.length * clamp((T - 83) / 2.2, 0, 1));
  const caret = Math.floor(T * 2.4) % 2 === 0 && T < 86;
  const Caret = () => <span style={{ display: 'inline-block', width: 2, height: 24, background: C.cyan, verticalAlign: '-4px', marginLeft: 1, opacity: caret ? 1 : 0 }}></span>;
  return <div style={{ position: 'absolute', inset: 0, opacity: win(T, 77.8, 90.3) }}>
    <div style={{ position: 'absolute', left: 112, top: ct(T), width: 850 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <span style={{ padding: '6px 14px', fontSize: 16, background: C.cyan, color: '#fff' }}>Yours · v4 · 10:12</span>
          <span style={{ padding: '6px 14px', fontSize: 16, background: C.n2 }}>Dana's · Fri</span>
          <span style={{ padding: '6px 10px', fontSize: 14, color: C.n5 }}>+ one more, at most</span>
        </div>
        <div style={{ fontSize: 14, color: C.n6 }}>Saved as you type · v4</div>
      </div>
      <div style={{ display: 'flex', gap: 4, marginTop: 14, fontSize: 15, color: C.n7 }}>{['B', 'I', 'U', 'H1', 'H2', '¶', '“ ”', '§'].map(b => <span key={b} style={{ padding: '3px 9px' }}>{b}</span>)}</div>
      <div style={{ marginTop: 26, background: '#fff', padding: '48px 56px', minHeight: 420, boxSizing: 'border-box', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ ...kick, fontWeight: 400, color: C.n6 }}>ONBOARDING SPEC · YOUR COPY</div>
        <div style={{ margin: '10px 0 18px', fontSize: 34, fontWeight: 600 }}>§4 Pricing tiers</div>
        <div style={{ fontSize: 22, lineHeight: 1.55 }}>
          <p style={{ margin: '0 0 14px' }}>{P1.slice(0, c1)}{c1 < P1.length && <Caret />}</p>
          <p style={{ margin: 0 }}>{P2.slice(0, c2)}{c1 >= P1.length && <Caret />}</p>
        </div>
      </div>
    </div>
    <div style={{ position: 'absolute', left: 1000, top: ct(T, 110), width: 196 }}>
      <div style={{ ...kick, fontSize: 12, color: C.n7 }}>FOLDED AWAY</div>
      <p style={{ margin: '6px 0 0', fontSize: 16, lineHeight: 1.45, color: C.n7 }}>v1–v3, the Q3 memo, the cohort chart. Out of sight, one ask away.</p>
    </div>
  </div>;
}

function CallRoom({ T }) {
  const QA = [['What are the seat limits?', 'Team is 50 seats; Scale is unlimited. You need 40 — Team fits.'], ['Can we keep pilot pricing?', 'Pilot rate holds through Q1 on an annual plan.'], ['How fast can we start?', 'Earliest Nov 3. Legal needs ten days on the contract.'], ['Does Starter include the checklist?', 'Dana decides by 11:00 — “yes, on Team and above” if pressed.']];
  const vid = tw(T, 91.2, 0.8), h0 = win(T, 96.6, 101.8, 0.5);
  return <div style={{ position: 'absolute', inset: 0, opacity: win(T, 89.8, 102.3) }}>
    <div style={{ position: 'absolute', left: 112, top: ct(T), width: 850 }}>
      <div style={{ ...kick, color: C.mag }}>PINNED FOR THE WHOLE CALL</div>
      <div style={{ fontSize: 40, fontWeight: 600, lineHeight: 1.15, marginTop: 8 }}>We leave with a tier and a start date for the 40-seat rollout.</div>
      <div style={{ marginTop: 18 * vid, height: 180 * vid, overflow: 'hidden', background: C.n8, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 2, padding: 2 * vid, boxSizing: 'border-box' }}>
        {['You', 'Rina Kaplan · Northwind', 'Tom Ruiz · Northwind', 'Dana'].map(p => <div key={p} style={{ background: C.n9, color: '#fff', display: 'flex', alignItems: 'flex-end', padding: '10px 14px', fontSize: 14, whiteSpace: 'nowrap' }}>{p}</div>)}
      </div>
      <div style={{ marginTop: 22, ...kick, color: C.cyan7 }}>IF SHE ASKS · YOU ANSWER</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
        {QA.map((q, i) => <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 24, alignItems: 'baseline', padding: '6px 10px', margin: '0 -10px', background: i === 0 ? tint('var(--color-accent-100)', h0) : 'transparent', opacity: tw(T, 92.4 + i * 0.6, 0.6), transform: `translateY(${(1 - tw(T, 92.4 + i * 0.6, 0.6)) * 12}px)` }}>
          <div style={{ fontSize: 19, lineHeight: 1.3, fontStyle: 'italic', fontFamily: BODY }}>“{q[0]}”</div><div style={{ fontSize: 19, lineHeight: 1.3 }}>{q[1]}</div></div>)}
      </div>
    </div>
    <div style={{ position: 'absolute', left: 1000, top: ct(T, 110), width: 196, opacity: tw(T, 91.6, 0.8) }}>
      <div style={{ ...kick, fontSize: 12, color: C.n7 }}>RINA KAPLAN · NORTHWIND</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8, fontSize: 15, lineHeight: 1.35 }}><div>Signed the pilot in August; 81% activation.</div><div style={{ background: tint('var(--color-accent-100)', h0) }}>Asked twice about seat limits.</div><div>Prefers short calls — last one ran 22 min.</div></div>
    </div>
  </div>;
}

function CloseRoom({ T }) {
  const REP = [['11:42', 'spec sent, 18 min early'], ['Team', 'tier agreed with Northwind; start Nov 3'], ['2', 'decisions left to you, both made']];
  const AL = [['Legal comment 2 still conflicts with the 14-day trial', 'Legal reviews tomorrow', 'Add to tomorrow'], ["Omar's 1:1 moved to 14:00 — pending his OK", 'Changes someone else’s calendar', 'Nudge Omar']];
  const DID = [['Folded 14 weekend tabs into three things', 'Same goal, one place'], ['Muted #launch-chat until 10:00', '14 messages, none mention you'], ['Snapshotted spec v4 before Dana’s copy', 'Your way back'], ['Held the spec through the call', 'Nothing to save, nothing lost'], ['Moved 11 replies to the 14:00 digest', 'Your Monday setting']];
  const col = i => ({ opacity: tw(T, 103 + i * 0.5, 0.7), transform: `translateY(${(1 - tw(T, 103 + i * 0.5, 0.7)) * 16}px)` });
  return <div style={{ position: 'absolute', inset: 0, opacity: win(T, 101.8, 116) }}>
    <div style={{ position: 'absolute', left: 96, top: ct(T), width: 1090 }}>
      <div style={{ fontSize: 64, fontWeight: 600, lineHeight: 1.02 }}>That's the day.</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', gap: 48, marginTop: 30 }}>
        <div style={col(0)}>
          <div style={{ ...kick, fontSize: 12, color: C.n7 }}>REPORT</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>{REP.map(r => <div key={r[0]} style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}><span style={{ fontSize: 40, lineHeight: 1, color: C.cyan, width: 120 }}>{r[0]}</span><span style={{ fontSize: 17 }}>{r[1]}</span></div>)}</div>
          <div style={{ ...kick, fontSize: 12, color: C.n7, marginTop: 34 }}>TOMORROW · ALREADY FILED</div>
          <div style={{ fontSize: 17, lineHeight: 1.5, marginTop: 8 }}>Legal review first, then the retro at 11:00. Room set to your Tuesday.</div>
        </div>
        <div style={col(1)}>
          <div style={{ ...kick, fontSize: 12, color: C.mag }}>REAL ALERTS · 2</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>{AL.map(a => <div key={a[0]}><div style={{ fontSize: 19, lineHeight: 1.3 }}>{a[0]}</div><div style={{ fontSize: 15, color: C.n6, fontStyle: 'italic', margin: '3px 0 8px' }}>{a[1]}</div><span className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>{a[2]}</span></div>)}</div>
        </div>
        <div style={col(2)}>
          <div style={{ ...kick, fontSize: 12, color: C.amberInk }}>ADDED VALUE · TRACED</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>{DID.map((d, i) => { const ck = tw(T, 107 + i * 0.6, 0.4, 'pop'); return <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
            <div><div style={{ fontSize: 16, lineHeight: 1.3, color: ck > 0.5 ? C.cyan7 : C.ink }}>{d[0]}</div><div style={{ fontSize: 13, color: C.n6, fontStyle: 'italic' }}>{d[1]}</div></div>
            <span style={{ flex: 'none', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: tint('var(--color-accent-100)', ck), color: ck > 0.5 ? C.cyan7 : C.n4 }}><svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor" style={{ transform: `scale(${mix(0.8, 1, ck)})` }}><path d="M229.66 77.66l-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69 218.34 66.34a8 8 0 0 1 11.32 11.32Z" /></svg></span>
          </div>; })}</div>
          <div style={{ fontSize: 13, color: C.n6, marginTop: 10 }}>Every line reversible for 7 days. Check means you looked.</div>
        </div>
      </div>
    </div>
  </div>;
}

const BKEYS = [{ t: 8, x: 820, y: 340, s: 0.78 }, { t: 9, x: 820, y: 300, s: 0.78 }, { t: 55.2, x: 820, y: 300, s: 0.78 }, { t: 55.21, x: 120, y: 438, s: 0.3047 }, { t: 56, x: 120, y: 438, s: 0.3047 }, { t: 57.6, x: 712, y: 250, s: 0.85 }, { t: 65.6, x: 712, y: 250, s: 0.85 }, { t: 67, x: 288, y: 190, s: 1.05 }, { t: 113.8, x: 288, y: 190, s: 1.05 }, { t: 115.4, x: 120, y: 330, s: 0.025 }];

function Browser() {
  const { T } = useComposition();
  const b = keys(T, BKEYS), o = win(T, 8.1, 29.9, 0.6) + win(T, 55.2, 115.6, 0.4);
  const cam = CAMS.find(c => T >= c[0] && T <= c[1]) || CAMS[0], cs = 1 + (cam[2] - 1) * win(T, cam[0], cam[1], 1.1);
  const tabRing = T > 60.2 && T < 61.6 ? (T - 60.2) / 1.4 : T > 62.4 && T < 63.8 ? (T - 62.4) / 1.4 : 0;
  const colorPulse = win(T, 62.4, 65, 0.4);
  return <div style={{ position: 'absolute', left: 0, top: 0, width: 1280, height: 800, transform: `translate(${b.x}px,${b.y}px) scale(${b.s})`, transformOrigin: '0 0', opacity: o, background: C.paper, boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1244, height: 800, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${cs})`, transformOrigin: `${cam[3]}px ${cam[4]}px` }}>
        <Messy T={T} /><DayRoom T={T} /><WriteRoom T={T} /><CallRoom T={T} /><CloseRoom T={T} />
      </div>
    </div>
    <Chrome T={T} />
    <div style={{ position: 'absolute', right: 0, top: 56, width: 36, height: 744, background: C.n1, zIndex: 26 }}>
      <AmberTab ring={tabRing} style={{ marginTop: 24 }} />
    </div>
    <Line T={T} />
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', outline: `4px solid ${tint(C.amber, colorPulse * 0.5)}`, outlineOffset: -4, zIndex: 40, opacity: 0 }}></div>
  </div>;
}

// ——— for the company ———
const GC = 40, GR = 15;
const hash = (i, k) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };
const CELLS = Array.from({ length: GC * GR }, (_, i) => { const c = i % GC, r = Math.floor(i / GC); const hot = (c >= 8 && c <= 13 && r >= 3 && r <= 8) || (c >= 26 && c <= 31 && r >= 8 && r <= 13); const ev = []; for (let k = 0; k < 4; k++) if (hash(i, k + 10) < (hot ? 0.75 : 0.12)) ev.push(116 + hash(i, k) * 5); return { c, r, ev, d: Math.hypot(c, r) }; });
const LEDGER = [['Pricing approval — waiting on a decision owner', '412', '164 h', 'Treated · routed to the owner'], ['Re-keying between CRM and billing', '356', '119 h', 'Routed to the process owner'], ['Hunting for the current contract template', '288', '52 h', 'Treated · one source pinned'], ['Access requests in week one', '201', '88 h', 'Routed to IT · one ticket, not 201']];

function Company() {
  const { T } = useComposition();
  const o = win(T, 115.2, 134.2, 0.5), gs = mix(1, 0.45, tw(T, 121, 1.2, 'draw')), go = 1 - tw(T, 127.8, 0.6);
  const n = Math.round(1812 * tw(T, 116, 5.2, 'draw'));
  const roi = tw(T, 128.6, 0.8), tally = v => Math.round(v * tw(T, 129.2, 2.2, 'draw'));
  const fmt = v => v.toLocaleString('en-US');
  return <div style={{ position: 'absolute', inset: 0, opacity: o }}>
    <div style={{ position: 'absolute', left: 120, top: 330, width: GC * 40, height: GR * 28, transform: `scale(${gs})`, transformOrigin: '0 0', opacity: go }}>
      {CELLS.map((c, i) => { const app = tw(T, 115.2 + c.d * 0.025, 0.4); let flash = 0, heat = 0; c.ev.forEach(t => { flash = Math.max(flash, win(T, t, t + 0.7, 0.15)); if (T > t) heat++; });
        return <div key={i} style={{ position: 'absolute', left: c.c * 40, top: c.r * 28, width: 32, height: 20, opacity: app, background: `color-mix(in oklch, ${C.amber} ${Math.round(Math.min(90, flash * 85 + heat * 16))}%, var(--color-neutral-200))` }}></div>; })}
    </div>
    <div style={{ position: 'absolute', left: 120, top: mix(800, 560, tw(T, 121, 1.2, 'draw')), display: 'flex', flexDirection: 'column', gap: 18, opacity: tw(T, 116.4, 0.6) * go }}>
      {[['2,500', 'seats'], [fmt(n), 'friction events this week'], ['0', 'names']].map((r, i) => <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}><span style={{ fontSize: 44, lineHeight: 1, color: i === 1 ? C.amberInk : C.cyan, width: 150 }}>{r[0]}</span><span style={{ fontSize: 24 }}>{r[1]}</span></div>)}
    </div>
    <div style={{ position: 'absolute', left: 960, top: 330, width: 860, opacity: tw(T, 121.6, 0.7) * go }}>
      <div style={{ ...kick, fontSize: 15, color: C.n7 }}>FRICTION LEDGER · THIS WEEK · ILLUSTRATIVE</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 110px 250px', columnGap: 20, rowGap: 0, marginTop: 18, fontSize: 21, lineHeight: 1.3 }}>
        {['Where it stalls', 'Events', 'Stalled', 'What happened'].map(h => <div key={h} style={{ fontSize: 15, color: C.n6, fontStyle: 'italic', paddingBottom: 10 }}>{h}</div>)}
        {LEDGER.map((l, i) => { const e = tw(T, 122.4 + i * 0.7, 0.6); return l.map((v, j) => <div key={i + '-' + j} style={{ padding: '14px 0', opacity: e, transform: `translateY(${(1 - e) * 12}px)`, color: j === 1 ? C.amberInk : j === 3 ? C.cyan7 : C.ink, fontSize: j === 1 ? 28 : j === 3 ? 18 : 21 }}>{v}</div>); })}
      </div>
    </div>
    <div style={{ position: 'absolute', left: 120, top: 380, opacity: roi, transform: `translateY(${(1 - roi) * 20}px)` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 36 }}>
        {[[fmt(tally(1812)), 'friction events', C.amberInk], ['×'], ['0.6 h', 'average stall', C.ink, 'THE PART NOBODY LOGS', '36 minutes gone per event — unlogged, unbilled, paid for all the same.'], ['×'], ['$260', 'per employee-hour of downtime · ITIC 2025', C.ink], ['='], ['$' + fmt(tally(282672)), 'a week, back on the table', C.cyan7]].map((t, i) => t.length === 1
          ? <div key={i} style={{ fontSize: 96, lineHeight: 1, color: C.n5 }}>{t[0]}</div>
          : <div key={i} style={{ maxWidth: 300 }}><div style={{ fontSize: 96, lineHeight: 1, fontWeight: 600, color: t[2], transform: t[3] ? `scale(${mix(1, 1.07, win(T, 129.8, 131.2, 0.45))})` : 'none', transformOrigin: '0 50%' }}>{t[0]}</div><div style={{ fontFamily: BODY, fontStyle: 'italic', fontSize: 22, color: C.n7, marginTop: 12, lineHeight: 1.3 }}>{t[1]}</div>
            {t[3] && <div style={{ marginTop: 18, opacity: tw(T, 129.8, 0.7), transform: `translateY(${(1 - tw(T, 129.8, 0.7)) * 10}px)` }}>
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

const VO = [
  ['Opening', "Meet TAB. Not another app — a co-worker that lives inside your browser."],
  ['Morning', "Monday, eight-forty. Fourteen tabs, eleven messages, two copies of the same doc. Everything asks for attention at once."],
  ['Intention', "So we started with one intention. Center the one thing. Hide the noise — filed, not closed. And speak only once."],
  ['EightPages', "The first map had eight pages. Each one was right. Together, they asked you to hold eight things in your head."],
  ['TheCut', "So we cut. Waking up and setting the desk became one greeting. Handoff and wrap became one close. Eight pages, four rooms."],
  ['RuleOfOne', "And one rule held it together. One voice: a single line. One place: the amber tab. One color, TAB's alone."],
  ['Day', "In the morning, TAB is your assistant. Three things, briefed. Then one proposal — pin the spec till noon. You decide."],
  ['Write', "While you write, it's an editor. Your words, nothing generated. And just once, uninvited: Northwind in five. I'll hold your place."],
  ['Call', "On the call, a wingman. The goal stays pinned. Her likely questions, your answers — ready under the video."],
  ['Close', "At the end of the day, a librarian. What got done, two alerts that are real, and a receipt for everything TAB did."],
  ['Company', "Now multiply that by every desk. TAB counts events, not people — anonymous by design. One ledger shows where work stalls, and what happened next. The math is simple: friction events, times the cost of a stall."],
  ['Outro', "TAB. One thing at a time."],
];
function Statement() {
  const { T } = useComposition();
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
  </div>;
}

function Voice({ on }) {
  const { T, CUES, playing } = useComposition();
  const last = React.useRef(-1);
  const tick = Math.floor(T * 4);
  React.useEffect(() => {
    const ss = window.speechSynthesis; if (!ss) return;
    if (!on || !playing) { ss.cancel(); last.current = -1; return; }
    let idx = -1; VO.forEach((v, i) => { if (T >= CUES[v[0]]) idx = i; });
    if (idx === last.current) return;
    last.current = idx;
    if (idx < 0 || T - CUES[VO[idx][0]] > 0.75) return;
    ss.cancel();
    const u = new SpeechSynthesisUtterance(VO[idx][1]), vs = ss.getVoices(); u.rate = 0.96;
    const v = vs.find(v => /en/i.test(v.lang) && /Samantha|Google UK English Female|Karen|Moira|Serena|Female/i.test(v.name)) || vs.find(v => /en/i.test(v.lang));
    if (v) u.voice = v;
    ss.speak(u);
  }, [tick, on, playing]);
  React.useEffect(() => () => window.speechSynthesis && speechSynthesis.cancel(), []);
  return null;
}

function VoiceTrack() {
  const { time, playing } = useComposition();
  const ref = React.useRef(null);
  React.useEffect(() => {
    const a = ref.current; if (!a) return;
    if (playing) { if (Math.abs(a.currentTime - time) > 0.3) a.currentTime = Math.min(time, 151.4); if (a.paused && time < 151.4) a.play().then(() => window.dispatchEvent(new Event('vo-ok'))).catch(() => window.dispatchEvent(new Event('vo-blocked'))); }
    else { if (!a.paused) a.pause(); if (Math.abs(a.currentTime - time) > 0.05) a.currentTime = Math.min(time, 151.4); }
  }, [time, playing]);
  return <video ref={ref} src="voiceover.mp3?v=2" preload="auto" playsInline data-om-exportable-video-play-start="0" data-om-exportable-video-play-end="151.41" style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}></video>;
}

function Piece({ voice }) {
  const { T } = useComposition();
  return <div data-screen-label={`${Math.floor(T)}s`} style={{ position: 'absolute', inset: 0, background: C.paper, fontFamily: SERIF, color: C.ink, overflow: 'hidden' }}>
    <Dateline /><Heads /><Principles /><EightCards /><CutResult /><RuleCallouts /><Company /><Browser /><StageTab /><Statement /><Voice on={voice} /><VoiceTrack />
  </div>;
}

window.TABFilm = function TABFilm() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS || { motionEditor: true });
  const [blocked, setBlocked] = React.useState(false);
  React.useEffect(() => {
    const no = () => setBlocked(true), ok = () => setBlocked(false);
    const unlock = () => { const v = document.querySelector('video[src^="voiceover"]'); if (v && v.paused) v.play().then(() => v.pause()).catch(() => {}); };
    window.addEventListener('vo-blocked', no); window.addEventListener('vo-ok', ok); document.addEventListener('pointerdown', unlock, { once: true });
    return () => { window.removeEventListener('vo-blocked', no); window.removeEventListener('vo-ok', ok); document.removeEventListener('pointerdown', unlock); };
  }, []);
  const soundOn = () => { const v = document.querySelector('video[src^="voiceover"]'); if (v) v.play().then(() => setBlocked(false)).catch(() => {}); };
  return <React.Fragment>
    {blocked && <button onClick={soundOn} className="btn btn-primary" style={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}>Turn sound on</button>}
    <CompositionStage width={1920} height={1080} bg="#f3f2f2" scenes={window.OM_SCENES} playback={window.OM_PLAYBACK}><Piece voice={t.voiceOver === true} /></CompositionStage>
    <TweaksPanel><TweakSection label="Video" /><TweakToggle label="Motion editor" value={t.motionEditor} onChange={v => setTweak('motionEditor', v)} /><TweakToggle label="Read aloud (preview only)" value={t.voiceOver === true} onChange={v => setTweak('voiceOver', v)} /></TweaksPanel>
  </React.Fragment>;
};
