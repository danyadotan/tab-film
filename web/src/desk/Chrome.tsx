/** The browser chrome: TAB mark, the four rooms as tabs, and the clock. Compact on phones, where the rooms live in the bottom bar. */
export function Chrome({ compact, active, tabs, time, onGo }: { compact?: boolean; active: number; tabs: string[][]; time: string; onGo: (i: number) => void }) {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: compact ? 12 : 36, height: compact ? 48 : 56, padding: compact ? 0 : '0 48px', fontFamily: 'var(--font-heading)' }}>
    <div style={{ fontWeight: 700, fontSize: 20, letterSpacing: '.14em', color: 'var(--color-accent-2)' }}>TAB</div>
    {!compact && <div style={{ display: 'flex', gap: 28, flex: 1 }}>
      {tabs.map((p, i) => <button key={i} className="chrome-tab" onClick={() => onGo(i)} style={{ all: 'unset', cursor: 'pointer', fontSize: 17, fontWeight: i === active ? 700 : 400, color: i === active ? 'var(--color-accent-700)' : 'var(--color-text)', display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span>{p[0]}</span><span style={{ fontSize: 12, color: 'var(--color-neutral-600)', fontWeight: 400 }}>{p[1]}</span>
      </button>)}
    </div>}
    <div style={{ fontSize: 15, color: 'var(--color-neutral-600)', fontStyle: 'italic' }}>{time}</div>
  </div>;
}
