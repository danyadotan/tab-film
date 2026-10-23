import type { CSSProperties } from 'react';
import { useFilm } from '../engine/FilmContext';
import { BODY, C, CARD, kick } from './tokens';
import { clamp, mix, tint, tw, win } from './motion';

export function AmberTab({ ring = 0, h = 120, style }: { ring?: number; h?: number; style?: CSSProperties }) {
  return <div style={{ width: 36, height: h, background: C.amber, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 ${ring * 14}px ${tint(C.amber, (1 - ring) * 0.55)}`, ...style }}>
    <span style={{ writingMode: 'vertical-rl', fontSize: 13, letterSpacing: '.24em', fontWeight: 700 }}>TAB</span>
  </div>;
}

/** The amber tab at the stage's right edge, outside the browser. */
export function StageTab() {
  const { T } = useFilm();
  const o = win(T, 1.6, 8.6) + win(T, 44.2, 55.4) + win(T, 135.2, 139.6, 0.8);
  const x = mix(60, 0, Math.max(tw(T, 1.6, 0.9, 'pop'), tw(T, 44.2, 0.9, 'pop'), tw(T, 135.2, 0.9, 'pop')));
  const ring = T > 46 && T < 47.4 ? (T - 46) / 1.4 : 0;
  return <AmberTab ring={ring} h={160} style={{ position: 'absolute', right: 0, top: 460, opacity: o, transform: `translateX(${x}px)` }} />;
}

const PRINCIPLES: [string, string][] = [['Center the one thing.', 'One task in the middle of the page. The rest steps aside.'], ['Hide the noise.', 'Filed, not closed — one ask away.'], ['Speak once.', 'One line under the chrome. Never a sticker.']];

export function Principles() {
  const { T } = useFilm();
  return <div style={{ position: 'absolute', left: 120, top: 330, width: 640, display: 'flex', flexDirection: 'column', gap: 44 }}>
    {PRINCIPLES.map((p, i) => {
      const a = 21.2 + i * 2.2, o = win(T, a, 29.6, 0.6);
      return <div key={i} style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: 16, opacity: o, transform: `translateX(${(1 - tw(T, a, 0.8)) * -30}px)` }}>
        <div style={{ fontSize: 72, lineHeight: 0.9, color: C.cyan }}>{i + 1}</div>
        <div><div style={{ fontSize: 42, fontWeight: 600, lineHeight: 1.1 }}>{p[0]}</div><div style={{ fontFamily: BODY, fontStyle: 'italic', fontSize: 24, color: C.n7, marginTop: 8, lineHeight: 1.3 }}>{p[1]}</div></div>
      </div>;
    })}
  </div>;
}

// [name, gloss, room it merges into (-1 = the sideline), struck?]
const EIGHT: [string, string, number, number][] = [['Boot', 'TAB wakes up', 0, 1], ['Room', 'the desk is set', 0, 1], ['Briefs', 'three things today', 0, 0], ['Text', 'the editor', 1, 0], ['Call', 'the wingman', 2, 0], ['Parked', 'what waits', -1, 1], ['Handoff', 'pass it on', 3, 1], ['Wrap', 'the day closes', 3, 0]];
const FOUR: [string, string, string, string][] = [['Day', 'the assistant', 'BOOT · ROOM · BRIEFS', 'Waking and setting the desk folded into one greeting.'], ['Write', 'the editor', 'TEXT', 'Kept whole. The work itself.'], ['Call', 'the wingman', 'CALL', 'Kept. The moment that matters most.'], ['Close', 'the librarian', 'HANDOFF · WRAP', 'Handing off and wrapping up are one gesture: done.']];
const STRIKE_DELAY = [0, 0.3, 0, 0, 0, 0.6, 0.9];

export function EightCards() {
  const { T } = useFilm();
  const drift = -24 * clamp((T - 30) / 12, 0, 1);
  return <div>
    {EIGHT.map((c, i) => {
      const enter = tw(T, 30.6 + i * 0.22, 0.7, 'pop'), mv = tw(T, 44.6 + (c[3] ? 0 : 0.2), 1.6, 'draw');
      let x = 120 + i * 220 + drift, y = 420, w = 196, o = Math.min(tw(T, 30.6 + i * 0.22, 0.4), 1);
      if (c[2] >= 0) { x = mix(x, 120 + c[2] * 430, mv); w = mix(196, 390, mv); }
      else { x = mix(x, 1884, mv); w = mix(196, 36, mv); y = mix(420, 460, mv); }
      o *= 1 - tw(T, 46.4, 0.6);
      const strike = c[3] ? tw(T, 43 + (STRIKE_DELAY[i] ?? 0), 0.5, 'draw') : 0;
      return <div key={i} style={{ ...CARD, left: x, top: y + (1 - enter) * 40, width: w, height: mix(280, c[2] < 0 ? 160 : 280, mv), opacity: o, transform: `scale(${mix(0.9, 1, enter)})` }}>
        <div style={{ fontSize: 44, lineHeight: 1, color: C.cyan }}>{i + 1}</div>
        <div style={{ position: 'relative', display: 'inline-block', marginTop: 70 }}>
          <div style={{ fontSize: 32, fontWeight: 600, color: c[3] && strike > 0.5 ? C.n5 : C.ink }}>{c[0]}</div>
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

export function CutResult() {
  const { T } = useFilm();
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

const RULES: [string, string][] = [['VOICE', 'The line. It speaks once per room, then goes quiet.'], ['PLACE', 'The amber tab at the edge. Everything TAB holds lives there.'], ['COLOR', 'Amber belongs to TAB alone. Nothing else wears it.']];

export function RuleCallouts() {
  const { T } = useFilm();
  return <div style={{ position: 'absolute', left: 120, top: 330, width: 540, display: 'flex', flexDirection: 'column', gap: 48 }}>
    {RULES.map((r, i) => {
      const a = 57.8 + i * 2.2;
      return <div key={i} style={{ opacity: win(T, a, 65.8, 0.6), transform: `translateX(${(1 - tw(T, a, 0.8)) * -30}px)` }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><span style={{ width: 14, height: 14, borderRadius: '50%', background: C.amber }}></span><span style={{ ...kick, fontSize: 18, color: C.amberInk }}>{r[0]}</span></div>
        <div style={{ fontSize: 36, lineHeight: 1.2, marginTop: 10, textWrap: 'pretty' }}>{r[1]}</div>
      </div>;
    })}
  </div>;
}
