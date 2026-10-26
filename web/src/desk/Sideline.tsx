import { useState, type CSSProperties } from 'react';

export interface Prefs { bright: number; warm: number; sound: string; quiet: string; text: string }

const TERMS: [string, string][] = [
  ['Brief', 'A folder TAB builds around one goal for today: the doc, the people and the data it needs.'],
  ['Thread', 'Everything for one task opened together as a single surface, then put away again.'],
  ['Parked', 'Tabs filed away, not closed. Restorable any time.'],
  ['Skill card', 'A small tool (compare, calendar, timer) that appears only when the task needs it.'],
  ['Digest', 'Notifications held back and delivered together at a set time.'],
  ['Main doc / Possible merge', 'The version you work in, and the one candidate TAB suggests folding into it.'],
  ['Low- / high-stakes', 'Reversible and private, TAB does. Sends, shares or changes someone else\'s day, TAB asks.'],
  ['Tier', 'A pricing level: Starter, Team, Scale.'],
  ['Activation cohort', 'Users grouped by signup week, tracked to their first key action.'],
];
const GROUPS: [string, keyof Prefs, string[]][] = [['Sound', 'sound', ['Off', 'Soft', 'Ambient']], ['Alerts', 'quiet', ['Quiet', 'Digest', 'All']], ['Text', 'text', ['Compact', 'Roomy', 'Large']]];

const panel: CSSProperties = { width: 340, height: '100%', background: '#fff', boxShadow: 'var(--shadow-lg)', padding: '40px 28px 28px', boxSizing: 'border-box', overflow: 'auto' };
// Square-edged: the prototype declared a 999px radius with !important, which its runtime dropped — this matches what it renders.
const pill = (bg: string, extra: CSSProperties = {}): CSSProperties => ({ all: 'unset', cursor: 'pointer', writingMode: 'vertical-rl', whiteSpace: 'nowrap', padding: '14px 7px', display: 'flex', alignItems: 'center', gap: 10, background: bg, color: '#fff', fontSize: 14, letterSpacing: '.14em', transformOrigin: 'right center', transition: 'transform .25s ease', ...extra });

interface SidelineProps {
  prefs: Prefs;
  onPref: <K extends keyof Prefs>(k: K, v: Prefs[K]) => void;
  backTo: string;
  onBack: () => void;
  onTab: () => void;
}

/** The sideline at the right edge: the amber TAB pill, glossary, settings and back. */
export function Sideline({ prefs: p, onPref, backTo, onBack, onTab }: SidelineProps) {
  const [open, setOpen] = useState<'g' | 's' | null>(null);
  const [q, setQ] = useState('');
  const terms = TERMS.filter(t => !q || (t[0] + t[1]).toLowerCase().includes(q.toLowerCase()));
  return <div style={{ position: 'absolute', right: 0, top: 56, height: 744, zIndex: 20 }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', height: '100%', fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
      {open === 'g' && <div style={panel}>
        <div style={{ fontSize: 13, letterSpacing: '.14em', color: 'var(--color-accent-700)', fontWeight: 700 }}>GLOSSARY · TODAY'S TERMS</div>
        <h3 style={{ margin: '8px 0 14px', fontSize: 28, lineHeight: 1.1, fontWeight: 600 }}>Words on your screen</h3>
        <input className="input" placeholder="Look up a term" value={q} onChange={e => setQ(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', fontSize: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
          {terms.map(t => <div key={t[0]}><div style={{ fontSize: 18, fontWeight: 600 }}>{t[0]}</div><div style={{ fontSize: 15, lineHeight: 1.45, color: 'var(--color-neutral-700)', marginTop: 2 }}>{t[1]}</div></div>)}
        </div>
      </div>}
      {open === 's' && <div style={panel}>
        <div style={{ fontSize: 13, letterSpacing: '.14em', color: 'var(--color-accent-2-700)', fontWeight: 700 }}>YOUR USUAL SETTINGS</div>
        <h3 style={{ margin: '8px 0 6px', fontSize: 28, lineHeight: 1.1, fontWeight: 600 }}>Adjust without leaving</h3>
        <p style={{ margin: '0 0 20px', fontSize: 15, lineHeight: 1.45, color: 'var(--color-neutral-700)' }}>Changes apply right away. You stay on this screen.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 16 }}>
          <div><div style={{ marginBottom: 4 }}>Brightness</div><input type="range" min={40} max={100} value={p.bright} onChange={e => onPref('bright', +e.target.value)} style={{ width: '100%', accentColor: 'var(--color-accent)' }} /></div>
          <div><div style={{ marginBottom: 4 }}>Warmth</div><input type="range" min={0} max={80} value={p.warm} onChange={e => onPref('warm', +e.target.value)} style={{ width: '100%', accentColor: 'var(--color-accent)' }} /></div>
          {GROUPS.map(([label, key, opts]) => <div key={key}><div style={{ marginBottom: 6 }}>{label}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {opts.map(o => <button key={o} onClick={() => onPref(key, o)} style={{ all: 'unset', cursor: 'pointer', padding: '5px 12px', fontSize: 15, borderRadius: 2, background: p[key] === o ? 'var(--color-accent)' : 'var(--color-neutral-200)', color: p[key] === o ? '#fff' : 'var(--color-text)' }}>{o}</button>)}
            </div></div>)}
        </div>
      </div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 84, marginRight: 2, alignItems: 'center' }}>
        <button className="side-pill" onClick={() => { setOpen(null); onTab(); }} title="For anything, just TAB it" style={pill('oklch(0.7 0.17 65)', { padding: '16px 8px', fontSize: 15, fontWeight: 700, letterSpacing: '.18em' })}>TAB</button>
        <button className="side-pill" onClick={() => setOpen(open === 'g' ? null : 'g')} style={pill('var(--color-accent-600)')}>GLOSSARY</button>
        <button className="side-pill" onClick={() => setOpen(open === 's' ? null : 's')} style={pill('var(--color-accent-2-600)')}>SETTINGS</button>
        <button className="side-pill" onClick={() => { setOpen(null); onBack(); }} style={pill('var(--color-neutral-800)', { opacity: backTo ? 1 : 0.45 })}>{backTo ? 'BACK · ' + backTo.toUpperCase() : 'BACK'}</button>
      </div>
    </div>
  </div>;
}
