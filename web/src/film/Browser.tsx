import { useFilm } from '../engine/FilmContext';
import { AmberTab } from './Story';
import { BODY, C, kick } from './tokens';
import { clamp, keys, mix, reveal, tint, tw, win } from './motion';

// ——— the line: TAB's one voice, sliding in under the chrome ———
interface Said { a: number; b: number; t: string; ch?: [string, string]; press?: number; meta?: string }

const LINES: Said[] = [
  { a: 58.4, b: 65.4, t: "Morning. I'm TAB — one line, once a room, only when it matters." },
  { a: 66.8, b: 71.2, t: 'Good morning. Three things today. Want me to take you through them?', ch: ['Out loud + on screen', "I've got it"] },
  { a: 71.2, b: 77.6, t: '§4 pricing is the one thing between you and noon. Pin it to the center?', ch: ['Pin it', 'Leave it'], press: 74.6 },
  { a: 85.4, b: 89.6, t: "Northwind in five. I'll hold your place — nothing to save.", ch: ['Take me there', 'Two more minutes'], press: 88.6, meta: '10:25' },
  { a: 90.8, b: 101.4, t: "Here. Statement pinned, answers ready. I'm on notes, off camera.", meta: 'LIVE' },
  { a: 102.8, b: 113.4, t: "That's the day. Two alerts that are real — nothing else." },
];
const OPEN: [number, number][] = [[58.4, 65.4], [66.8, 77.6], [85.4, 89.6], [90.8, 101.4], [102.8, 113.4]];
// [from, to, zoom, origin x, origin y]
const CAMS: [number, number, number, number, number][] = [[71.6, 77.8, 1.08, 640, 300], [79, 85.2, 1.28, 480, 420], [96.2, 101.8, 1.16, 420, 560], [106.6, 113.4, 1.06, 1100, 420]];

const lineOpen = (T: number) => OPEN.reduce((s, o) => s + win(T, o[0], o[1], 0.6), 0);
const currentLine = (T: number) => { let L = LINES[0]; LINES.forEach(l => { if (T >= l.a - 0.01) L = l; }); return L; };

function Line({ T }: { T: number }) {
  const p = lineOpen(T), L = currentLine(T);
  const n = L.t.split(' ').length, prog = clamp((T - L.a - 0.3) / (n * 0.17), 0, 1);
  const [said, rest] = reveal(L.t, prog), chO = L.ch ? tw(T, L.a + 0.3 + n * 0.17, 0.4) : 0;
  const swap = L === LINES[2] ? tw(T, 71.2, 0.4) : 1;
  const pressed = L.press != null && T >= L.press, bump = L.press != null ? 1 - 0.08 * win(T, L.press - 0.1, L.press + 0.25, 0.12) : 1;
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

/** Top of the room's content: pushed down while the line is open. */
const ct = (T: number, base = 104) => base + lineOpen(T) * (currentLine(T).ch ? 140 : 96);
const hl = (a: number) => `3px solid ${tint(C.cyan, a)}`;

// ——— chrome ———
const MESSY = ['Spec v1', 'Spec v2', 'Spec v3', 'Spec v4', 'Q3 memo', 'Cohort chart', 'Cohort chart (copy)', '#launch-chat', 'Inbox (11)', 'Calendar', 'Northwind CRM', 'Pricing v4', 'Legal notes', 'Weekend reading'];
const CLEAN = [['Day', '3 things'], ['Write', 'spec v4 · 2 copies'], ['Call', '10:30 Northwind'], ['Close', '17:48']];

function Chrome({ T }: { T: number }) {
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

// ——— the morning, before TAB ———
const DOCS: [number, number, number, string, string][] = [[90, 40, 440, 'Onboarding spec — v2', 'Section 4 TBD. See v3?'], [320, 140, 460, 'Onboarding spec — v4', 'Pricing tiers: Starter, Team, Scale…'], [140, 300, 420, 'Q3 memo', 'Activation targets for the pilot cohort.'], [470, 380, 400, 'Cohort chart (copy)', 'Duplicate of “Cohort chart”.']];
const TOAST = ['Dana · Re: pricing?', '#launch-chat · 14 new', 'Omar · 1:1 moved?', 'Legal · trial length', 'Standup · 9:30', 'Rina · seat limits', '+5 more'];

function Messy({ T }: { T: number }) {
  const o = 1 - tw(T, 20.4, 0.4);
  return <div style={{ position: 'absolute', inset: 0, opacity: o }}>
    {DOCS.map((d, i) => {
      const e = tw(T, 9.4 + i * 0.5, 0.6, 'pop'), f = tw(T, 19.5, 0.8, 'draw');
      return <div key={i} style={{ position: 'absolute', left: d[0], top: d[1] + 70, width: d[2], padding: '22px 26px', background: '#fff', boxShadow: 'var(--shadow-md)', opacity: Math.min(tw(T, 9.4 + i * 0.5, 0.3), 1 - f), transform: `scale(${mix(0.85, 1, e) * mix(1, 0.94, f)})` }}>
        <div style={{ fontSize: 24, fontWeight: 600 }}>{d[3]}</div><div style={{ fontSize: 17, color: C.n7, marginTop: 6 }}>{d[4]}</div></div>;
    })}
    {TOAST.map((t, i) => {
      const a = 10.6 + i * 0.45, f = tw(T, 19.4 + i * 0.08, 0.8, 'draw');
      return <div key={i} style={{ position: 'absolute', left: 880, top: 80 + i * 66, width: 300, padding: '12px 16px', background: '#fff', boxShadow: 'var(--shadow-sm)', fontSize: 17, opacity: Math.min(tw(T, a, 0.3), 1 - f), transform: `translateX(${(1 - tw(T, a, 0.5)) * 40 + f * 380}px) scale(${mix(1, 0.4, f)})`, transformOrigin: '100% 50%' }}>{t}</div>;
    })}
  </div>;
}

// ——— room 1: day, the assistant ———
const BRIEF: [string, string, string, string?, string?][] = [['by 12:00', 'Onboarding spec — ship it.', 'Sections one to three settled. ', '§4 pricing tiers', ' still open.'], ['9:30', 'Standup — three lines, drafted.', 'The one blocker to raise: the pricing decision.'], ['when free', 'Replies — Dana first.', 'Her answer unblocks the spec. Then Omar, then Legal.']];

function DayRoom({ T }: { T: number }) {
  const h1 = Math.max(win(T, 21.6, 29.6, 0.5), win(T, 72, 77.8, 0.5));
  return <div style={{ position: 'absolute', inset: 0, opacity: win(T, 20.4, 78.3) }}>
    <div style={{ position: 'absolute', left: 112, top: ct(T), width: 850 }}>
      <div style={{ ...kick, color: C.mag }}>MONDAY 5 OCTOBER</div>
      <div style={{ margin: '8px 0 0', fontSize: 64, fontWeight: 600, lineHeight: 1.02 }}>Good morning. Here is your day.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 34 }}>
        {BRIEF.map((it, i) => <div key={i} style={{ display: 'grid', gridTemplateColumns: '64px 110px 1fr', gap: 20, alignItems: 'baseline', padding: '10px 14px', margin: '0 -14px', outline: i === 0 ? hl(h1) : 'none', outlineOffset: -3, opacity: tw(T, 20.9 + i * 0.4, 0.6), transform: `translateY(${(1 - tw(T, 20.9 + i * 0.4, 0.6)) * 16}px)` }}>
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

// ——— room 2: write, the editor ———
const P1 = 'Onboarding is offered in three tiers: Starter, Team, Scale. Trial length is 14 days across all of them.';
const P2 = 'Open: does Starter include the guided checklist? Decision owner: Dana.';

function WriteRoom({ T }: { T: number }) {
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

// ——— room 3: call, the wingman ———
const QA = [['What are the seat limits?', 'Team is 50 seats; Scale is unlimited. You need 40 — Team fits.'], ['Can we keep pilot pricing?', 'Pilot rate holds through Q1 on an annual plan.'], ['How fast can we start?', 'Earliest Nov 3. Legal needs ten days on the contract.'], ['Does Starter include the checklist?', 'Dana decides by 11:00 — “yes, on Team and above” if pressed.']];

function CallRoom({ T }: { T: number }) {
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
        {QA.map((q, i) => <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 24, alignItems: 'baseline', padding: '6px 10px', margin: '0 -10px', background: i === 0 ? tint(C.cyan1, h0) : 'transparent', opacity: tw(T, 92.4 + i * 0.6, 0.6), transform: `translateY(${(1 - tw(T, 92.4 + i * 0.6, 0.6)) * 12}px)` }}>
          <div style={{ fontSize: 19, lineHeight: 1.3, fontStyle: 'italic', fontFamily: BODY }}>“{q[0]}”</div><div style={{ fontSize: 19, lineHeight: 1.3 }}>{q[1]}</div></div>)}
      </div>
    </div>
    <div style={{ position: 'absolute', left: 1000, top: ct(T, 110), width: 196, opacity: tw(T, 91.6, 0.8) }}>
      <div style={{ ...kick, fontSize: 12, color: C.n7 }}>RINA KAPLAN · NORTHWIND</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8, fontSize: 15, lineHeight: 1.35 }}><div>Signed the pilot in August; 81% activation.</div><div style={{ background: tint(C.cyan1, h0) }}>Asked twice about seat limits.</div><div>Prefers short calls — last one ran 22 min.</div></div>
    </div>
  </div>;
}

// ——— room 4: close, the librarian ———
const REP = [['11:42', 'spec sent, 18 min early'], ['Team', 'tier agreed with Northwind; start Nov 3'], ['2', 'decisions left to you, both made']];
const AL = [['Legal comment 2 still conflicts with the 14-day trial', 'Legal reviews tomorrow', 'Add to tomorrow'], ["Omar's 1:1 moved to 14:00 — pending his OK", 'Changes someone else’s calendar', 'Nudge Omar']];
const DID = [['Folded 14 weekend tabs into three things', 'Same goal, one place'], ['Muted #launch-chat until 10:00', '14 messages, none mention you'], ['Snapshotted spec v4 before Dana’s copy', 'Your way back'], ['Held the spec through the call', 'Nothing to save, nothing lost'], ['Moved 11 replies to the 14:00 digest', 'Your Monday setting']];

function CloseRoom({ T }: { T: number }) {
  const col = (i: number) => ({ opacity: tw(T, 103 + i * 0.5, 0.7), transform: `translateY(${(1 - tw(T, 103 + i * 0.5, 0.7)) * 16}px)` });
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>{DID.map((d, i) => {
            const ck = tw(T, 107 + i * 0.6, 0.4, 'pop');
            return <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
              <div><div style={{ fontSize: 16, lineHeight: 1.3, color: ck > 0.5 ? C.cyan7 : C.ink }}>{d[0]}</div><div style={{ fontSize: 13, color: C.n6, fontStyle: 'italic' }}>{d[1]}</div></div>
              <span style={{ flex: 'none', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: tint(C.cyan1, ck), color: ck > 0.5 ? C.cyan7 : C.n4 }}><svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor" style={{ transform: `scale(${mix(0.8, 1, ck)})` }}><path d="M229.66 77.66l-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69 218.34 66.34a8 8 0 0 1 11.32 11.32Z" /></svg></span>
            </div>;
          })}</div>
          <div style={{ fontSize: 13, color: C.n6, marginTop: 10 }}>Every line reversible for 7 days. Check means you looked.</div>
        </div>
      </div>
    </div>
  </div>;
}

// ——— the browser window: grows out of the Day card, then shrinks into one cell of the company grid ———
const BKEYS = [{ t: 8, x: 820, y: 340, s: 0.78 }, { t: 9, x: 820, y: 300, s: 0.78 }, { t: 55.2, x: 820, y: 300, s: 0.78 }, { t: 55.21, x: 120, y: 438, s: 0.3047 }, { t: 56, x: 120, y: 438, s: 0.3047 }, { t: 57.6, x: 712, y: 250, s: 0.85 }, { t: 65.6, x: 712, y: 250, s: 0.85 }, { t: 67, x: 288, y: 190, s: 1.05 }, { t: 113.8, x: 288, y: 190, s: 1.05 }, { t: 115.4, x: 120, y: 330, s: 0.025 }];

export function Browser() {
  const { T } = useFilm();
  const b = keys(T, BKEYS), o = win(T, 8.1, 29.9, 0.6) + win(T, 55.2, 115.6, 0.4);
  const cam = CAMS.find(c => T >= c[0] && T <= c[1]) || CAMS[0], cs = 1 + (cam[2] - 1) * win(T, cam[0], cam[1], 1.1);
  const tabRing = T > 60.2 && T < 61.6 ? (T - 60.2) / 1.4 : T > 62.4 && T < 63.8 ? (T - 62.4) / 1.4 : 0;
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
  </div>;
}
