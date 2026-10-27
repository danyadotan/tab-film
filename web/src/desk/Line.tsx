import type { CSSProperties, KeyboardEvent } from 'react';

const AMBER = 'oklch(0.7 0.17 65)';

export interface Choice { id: string; label: string }
export interface LineState {
  open: boolean;
  words: string[];
  shown: number;
  meta: string;
  speaking: boolean;
  controls: boolean;
  idle: boolean;
  choices: Choice[] | null;
}

interface LineProps {
  phone?: boolean;
  top: number;
  line: LineState;
  nextLabel: string;
  onNext: () => void;
  onStop: () => void;
  onAsk: (text: string) => void;
  onTyping: (on: boolean) => void;
  onChoice: (id: string) => void;
}

/** TAB's one voice: a single line that slides in under the chrome. On phones it sits on top of the room and stays in view while you scroll. */
export function Line({ phone, top, line: L, nextLabel, onNext, onStop, onAsk, onTyping, onChoice }: LineProps) {
  const words = L.words, n = L.shown, ch = L.choices || [];
  const said = words.slice(0, n).join(' ') + (n && n < words.length ? ' ' : ''), rest = words.slice(n).join(' ');
  const idle = L.open && L.idle && !ch.length, hasChoices = L.open && ch.length > 0 && n >= words.length;
  const key = (e: KeyboardEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    if (e.key === 'Enter' && el.value.trim()) { const t = el.value.trim(); el.value = ''; onAsk(t); }
  };
  const place: CSSProperties = phone
    ? { position: 'sticky', top: 8, display: L.open ? 'flex' : 'none', width: '100%', marginTop: 4, padding: '10px 12px', borderRadius: 18 }
    : { position: 'absolute', top, right: 62, display: 'flex', width: L.open ? (L.controls ? 1000 : 900) : 0, maxWidth: 1000, padding: '12px 20px 12px 16px', borderRadius: 32 };
  return <div style={{ ...place, zIndex: 30, flexDirection: 'column', gap: 6, opacity: L.open ? 1 : 0, boxSizing: 'border-box', overflow: 'hidden', background: '#fff', outline: `1.5px solid ${AMBER}`, boxShadow: 'var(--shadow-lg)', transition: 'width .7s cubic-bezier(.2,.8,.2,1),opacity .4s', pointerEvents: L.open ? 'auto' : 'none', fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
    <div style={{ display: 'flex', flexWrap: phone ? 'wrap' : 'nowrap', alignItems: 'center', gap: phone ? 10 : 14, minHeight: 32 }}>
      <span style={{ width: 14, height: 14, flex: 'none', borderRadius: '50%', background: AMBER, boxShadow: `0 0 0 ${L.speaking ? 6 : 0}px oklch(0.9 0.1 80)`, transition: 'box-shadow .25s' }}></span>
      <div style={{ flex: 1, minWidth: phone ? 'calc(100% - 90px)' : 0, fontSize: phone ? 16 : 18, lineHeight: 1.3, textWrap: 'pretty' }}><span style={{ fontWeight: 600, color: 'oklch(0.5 0.15 55)', marginRight: 8 }}>TAB</span><span>{said}</span><span style={{ color: 'var(--color-neutral-400)' }}>{rest}</span></div>
      {(!phone || L.meta) && <span style={{ flex: 'none', fontSize: 12, letterSpacing: '.14em', color: 'var(--color-neutral-600)', whiteSpace: 'nowrap' }}>{L.meta}</span>}
      {L.controls && <div style={{ display: 'flex', gap: 4, flex: 'none' }}>
        <button className="line-next" onClick={onNext} style={{ all: 'unset', cursor: 'pointer', padding: '5px 12px', borderRadius: 999, background: AMBER, color: '#fff', fontSize: 14, whiteSpace: 'nowrap' }}>{nextLabel}</button>
        <button className="line-stop" onClick={onStop} style={{ all: 'unset', cursor: 'pointer', padding: '5px 10px', borderRadius: 999, color: 'var(--color-neutral-700)', fontSize: 14 }}>Stop</button>
      </div>}
      <button className="line-x" onClick={onStop} title="Close" style={{ all: 'unset', cursor: 'pointer', flex: 'none', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'var(--color-neutral-600)', fontSize: 18 }}>×</button>
    </div>
    {hasChoices && <div style={{ display: 'flex', gap: 6, paddingLeft: phone ? 0 : 28, flexWrap: 'wrap' }}>
      {ch.map((c, i) => <button key={c.id} className="line-choice" onClick={() => onChoice(c.id)} style={{ all: 'unset', cursor: 'pointer', padding: '6px 14px', borderRadius: 999, fontSize: 15, whiteSpace: 'nowrap', background: i === 0 ? AMBER : '#fff', color: i === 0 ? '#fff' : 'var(--color-text)', outline: `1.5px solid ${AMBER}` }}>{c.label}</button>)}
    </div>}
    {idle && <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: phone ? 0 : 28 }}>
      <input className="line-input" onKeyDown={key} onFocus={() => onTyping(true)} onBlur={() => onTyping(false)} placeholder="Reply, or ask for anything — then Enter" style={{ all: 'unset', flex: 1, minWidth: 0, fontSize: 17, fontFamily: 'var(--font-heading)', color: 'var(--color-text)', padding: '6px 0', borderBottom: '1px solid var(--color-neutral-300)' }} />
      {!phone && <span style={{ fontSize: 12, letterSpacing: '.14em', color: 'var(--color-neutral-600)', whiteSpace: 'nowrap' }}>OR SAY IT</span>}
    </div>}
  </div>;
}
