import { Component, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { Chrome } from './Chrome';
import { Line, type Choice, type LineState } from './Line';
import { Sideline, type Prefs } from './Sideline';

type Room = 'a' | 'w' | 'c';

interface State extends Prefs {
  stage: number;
  prev: number | null;
  board: boolean;
  pinned: boolean;
  asked: boolean;
  taken: boolean;
  copy: 'mine' | 'dana';
  joined: boolean;
  ok: Record<number, string>;
  checked: Record<number, boolean>;
  z: number;
  walk: number;
  walkMode: 'Both' | 'Visual';
  said: Record<number, boolean>;
  nudged: boolean;
  wide: Partial<Record<Room, boolean>>;
  line: LineState;
}

const INIT: State = { stage: 0, prev: null, board: false, bright: 85, warm: 25, sound: 'Soft', quiet: 'Digest', text: 'Roomy', motion: 'Reduced', pinned: false, asked: false, taken: false, copy: 'mine', joined: false, ok: {}, checked: {}, z: 1, walk: 0, walkMode: 'Both', said: {}, nudged: false, wide: {}, line: { open: false, words: [], shown: 0, meta: '', speaking: false, controls: false, idle: false, choices: null } };

const ARRIVE = [
  null,
  'Your words, your copies — two on the table, never twenty. I keep the third for Legal.',
  'I\'m your second screen. Her likely questions are on the left with your answers. I\'m on notes, off camera.',
  'That\'s the day. Two alerts that are real, nothing else. The room resets when you go.',
];
const BRIEF = ['One. Onboarding spec, due at noon. Sections one to three are settled; only pricing tiers are open.', 'Two. Standup at nine thirty. Your three lines are drafted; the one blocker to raise is pricing.', 'Three. Replies. Dana first — her answer unblocks the spec. Then Omar, then Legal.'];
const NAMES = ['Day', 'Write', 'Call', 'Close'], WHO = ['the assistant', 'the editor', 'the wingman', 'the librarian'];
const TABS = [['Day', '3 things'], ['Write', 'spec v4 · 2 copies'], ['Call', '10:30 Northwind'], ['Close', '17:48']];
const TIMES = ['Mon 5 Oct · 8:40', 'Mon 5 Oct · 10:24', 'Mon 5 Oct · 10:30', 'Mon 5 Oct · 17:48'];
const PEOPLE = ['You', 'Rina Kaplan · Northwind', 'Tom Ruiz · Northwind', 'Dana'];
const QA = [['What are the seat limits?', 'Team is 50 seats; Scale is unlimited. You need 40 — Team fits.'], ['Can we keep pilot pricing?', 'Pilot rate holds through Q1 on an annual plan.'], ['How fast can we start?', 'Earliest Nov 3. Legal needs ten days on the contract.'], ['Does Starter include the checklist?', 'Dana decides by 11:00 — say “yes, on Team and above” if pressed.']];
// The two real alerts, as Bridge-iT Bouncer closure-gate decisions: only what
// materially changed, why it needs you, two choices, and how it closes.
interface Decision { title: string; changed: string; why: string; choices: { id: string; label: string; closed: string; say: string }[] }
const ALERTS: Decision[] = [
  {
    title: 'Settle the trial length before Legal reviews the spec tomorrow.',
    changed: 'Legal comment 2 asks for 30 days; the sent spec says 14 (+16 days).',
    why: 'It changes what Northwind was told — an external commitment.',
    choices: [
      { id: 'tomorrow', label: 'Add to tomorrow', closed: 'Filed · first on tomorrow\'s review ✓', say: 'Filed. Comment 2 opens tomorrow\'s review — I checked the agenda; it\'s there.' },
      { id: 'thirty', label: 'Offer 30 days', closed: 'Spec updated to 30 days · Northwind not yet told', say: 'Spec now says 30 days. Telling Northwind is a separate call — it stays with you.' },
    ],
  },
  {
    title: 'Confirm moving Omar\'s 1:1 to 14:00.',
    changed: '11:00 → 14:00 (+3 h), on someone else\'s calendar.',
    why: 'You approved the move; Omar hasn\'t. Only you can nudge him or release the slot.',
    choices: [
      { id: 'nudge', label: 'Nudge Omar', closed: 'Waiting on Omar · slot held till he answers', say: 'One line sent to Omar. It stays open until he answers — I\'ll tell you when.' },
      { id: 'keep', label: 'Keep 11:00', closed: 'Back at 11:00 · Omar\'s calendar restored ✓', say: 'Back at 11:00. Omar\'s calendar is as he had it — checked.' },
    ],
  },
];
// What the bouncer did with today's agent work before any of it reached you.
const GATE = [['25', 'passed silently'], ['16', 'consolidated'], ['3', 'returned to their agents'], ['2', 'brought to you']];
const DID = [['Folded 14 weekend tabs into three things', 'Same goal, one place'], ['Muted #launch-chat until 10:00', '14 messages, none mention you'], ['Snapshotted spec v4 before Dana\'s copy', 'Your way back'], ['Held the spec through the call', 'Nothing to save, nothing lost'], ['Moved 11 replies to the 14:00 digest', 'Your Monday setting']];

const EASE = 'cubic-bezier(.2,.8,.2,1)';
const kick = (color: string, size = 12): CSSProperties => ({ fontSize: size, letterSpacing: '.14em', fontWeight: 700, color });
const roomBox: CSSProperties = { width: 1280, height: 800, overflow: 'hidden', position: 'relative', background: 'var(--color-bg)', boxShadow: 'var(--shadow-md)', fontFamily: 'var(--font-heading)' };
const briefRow: CSSProperties = { display: 'grid', gridTemplateColumns: '64px 110px 1fr', gap: 20, alignItems: 'baseline', padding: '10px 14px', margin: '0 -14px', outlineOffset: -3, transition: 'outline-color .3s' };

/**
 * TAB Desk — the employee and TAB's shared desktop: four rooms (Day, Write,
 * Call, Close), one line that speaks once per room, and a sideline at the edge.
 */
export class Desk extends Component<object, State> {
  state: State = { ...INIT };
  // Full view: the 1280×800 room fills the window in both directions (minus the
  // 24px margin and the bottom demo bar), growing on large screens too.
  private fit = () => this.setState({ z: Math.min(1.6, (window.innerWidth - 56) / 1280, (window.innerHeight - 48 - 72) / 800) });
  private lastStage = 0;
  private gen = 0;
  private nudgeT?: number;
  private lineT?: number;
  private roomT?: number;
  private closeT?: number;
  private wordT?: number;
  private u: SpeechSynthesisUtterance | null = null;
  private keepLine = false;
  private typingNow = false;
  private voiceOK = false;

  componentDidMount() {
    this.fit();
    window.addEventListener('resize', this.fit);
    if (window.speechSynthesis) speechSynthesis.getVoices();
    this.lastStage = 0;
    this.arrive(0);
  }
  componentWillUnmount() { window.removeEventListener('resize', this.fit); this.stopLine(); clearTimeout(this.nudgeT); clearTimeout(this.closeT); }
  componentDidUpdate() {
    const st = this.state.stage;
    if (st === this.lastStage) return;
    this.lastStage = st;
    clearTimeout(this.nudgeT);
    if (this.state.walk) this.walkStop(); else if (this.state.line.open && !this.keepLine) this.closeLine();
    this.keepLine = false;
    if (!this.state.said[st]) this.arrive(st);
    if (st === 1 && !this.state.nudged) this.nudgeT = window.setTimeout(() => this.nudge(), 14000);
  }

  // ——— the line ———
  arrive(st: number) {
    this.setState(s => ({ said: { ...s.said, [st]: true } }));
    if (st === 0) { this.lineT = window.setTimeout(() => this.say('Good morning. Three things today. Want me to take you through them?', '', false, () => this.rest(), [{ id: 'both', label: 'Out loud + on screen' }, { id: 'visual', label: 'On screen only' }, { id: 'no', label: 'I\'ve got it' }]), 900); return; }
    this.lineT = window.setTimeout(() => this.say(ARRIVE[st]!, '', false, () => this.rest()), 700);
  }
  nudge() {
    if (this.state.stage !== 1 || this.state.nudged) return;
    this.setState({ nudged: true });
    this.say('Northwind in five minutes. I hold the spec exactly here — nothing to save. Go when ready.', '10:25', this.voiceOK, () => this.rest(), [{ id: 'call', label: 'Take me there' }, { id: 'later', label: 'Two more minutes' }]);
  }
  choose = (id: string) => {
    if (id === 'both' || id === 'visual') { this.voiceOK = id === 'both'; this.setState({ walkMode: id === 'both' ? 'Both' : 'Visual' }); this.runBrief(1); }
    else if (id === 'pin') { this.setState({ pinned: true }); this.say('Pinned. §4 sits at the center until noon; everything else is held.', 'DONE', false, () => this.rest()); }
    else if (id === 'call') { this.keepLine = true; this.setState(s => ({ stage: 2, prev: s.stage })); this.roomT = window.setTimeout(() => this.say('Here. Statement pinned, answers ready. Join when she\'s in.', '', false, () => this.rest()), 800); }
    else this.rest();
  };
  rest() { this.setLine({ idle: true, controls: false, speaking: false, choices: null }); this.armClose(); }
  armClose() { clearTimeout(this.closeT); this.closeT = window.setTimeout(() => { if (!this.typingNow) this.setLine({ open: false, idle: false }); else this.armClose(); }, 7000); }
  stopLine() {
    clearTimeout(this.lineT); clearTimeout(this.roomT); clearInterval(this.wordT);
    this.gen += 1;
    if (this.u) { this.u.onend = this.u.onerror = this.u.onboundary = null; this.u = null; }
    if (window.speechSynthesis) speechSynthesis.cancel();
  }
  setLine(patch: Partial<LineState>) { this.setState(st => ({ line: { ...st.line, ...patch } })); }
  closeLine = () => { this.stopLine(); clearTimeout(this.closeT); this.setLine({ open: false, speaking: false, controls: false, idle: false, choices: null }); };
  /** Reveals text word by word (in step with the voice when speaking), then rests or offers choices. */
  say(text: string, meta: string, voice: boolean, done: () => void, choices?: Choice[] | null, controls?: boolean) {
    this.stopLine(); clearTimeout(this.closeT);
    const gen = this.gen, words = text.split(' ');
    this.setLine({ open: true, words, shown: 0, meta, speaking: voice, controls: !!controls, idle: false, choices: choices || null });
    let n = 0, ended = false;
    const show = (k: number) => { if (gen !== this.gen) return; n = Math.max(n, k); this.setLine({ shown: Math.min(n, words.length) }); };
    const finish = () => {
      if (ended || gen !== this.gen) return;
      ended = true; clearInterval(li); show(words.length); this.setLine({ speaking: false });
      this.lineT = window.setTimeout(() => { if (gen === this.gen && !(choices && choices.length)) done(); }, 2600);
    };
    const li = window.setInterval(() => { show(n + 1); if (n >= words.length) finish(); }, voice ? 330 : 170);
    this.wordT = li;
    if (voice && window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(text), vs = speechSynthesis.getVoices();
      u.rate = .92; this.u = u;
      const v = vs.find(v => /en/i.test(v.lang) && /Samantha|Google UK English Female|Karen|Moira|Female/i.test(v.name)) || vs.find(v => /en/i.test(v.lang));
      if (v) u.voice = v;
      u.onboundary = e => { if (e.name === 'word') show(text.slice(0, e.charIndex).split(' ').length); };
      u.onend = finish; u.onerror = finish;
      speechSynthesis.speak(u);
    }
  }
  runBrief(i: number) {
    const voice = this.state.walkMode !== 'Visual';
    this.setState({ walk: i });
    this.say(BRIEF[i - 1], (voice ? 'SPEAKING · ' : '') + i + ' OF 3', voice, () => i < 3 ? this.runBrief(i + 1) : this.walkDone(), null, true);
  }
  walkDone() { this.setState({ walk: 0 }); this.say('That\'s the three. §4 pricing is the one thing between you and noon. Pin it to the center?', '', this.state.walkMode !== 'Visual', () => this.rest(), [{ id: 'pin', label: 'Pin it' }, { id: 'no', label: 'Leave it' }]); }
  walkStop() { this.closeLine(); this.setState({ walk: 0 }); }
  tabIt = () => { this.say('Yes? Say it or type it — small things I do, big things I bring back to you.', 'LISTENING', false, () => this.rest()); };
  ask = (t: string) => {
    const q = t.toLowerCase();
    let reply = 'Noted — I\'ll do it and it goes on the day\'s record.', dest: number | null = null;
    if (/dana|pricing|spec|tier|write|doc/.test(q)) { reply = 'That lives in the spec — opening §4, your copy.'; dest = 1; }
    else if (/call|rina|northwind|10:30|answer/.test(q)) { reply = 'Call room — statement pinned, answers ready.'; dest = 2; }
    else if (/day|report|tomorrow|close|did|record/.test(q)) { reply = 'Here is the day — report, tomorrow, and what I did.'; dest = 3; }
    else if (/morning|brief|three|list/.test(q)) { reply = 'Back to your three things.'; dest = 0; }
    if (dest != null && dest !== this.state.stage) {
      const to = dest;
      this.keepLine = true;
      this.setState(s => ({ stage: to, prev: s.stage, said: { ...s.said, [to]: true } }));
      this.roomT = window.setTimeout(() => this.say(reply, 'DONE', false, () => this.rest()), 800);
    } else this.say(reply, 'DONE', false, () => this.rest());
  };

  // ——— navigation ———
  nav = (n: number) => this.setState(st => st.stage === n ? { ...st, board: false } : { ...st, stage: n, prev: st.stage, board: false });
  go = (n: number) => (e?: MouseEvent) => { e?.preventDefault(); this.nav(n); };
  restart = () => { this.closeLine(); clearTimeout(this.nudgeT); this.lastStage = 0; this.setState({ ...INIT, z: this.state.z }, () => this.arrive(0)); };

  // ——— render ———
  room(i: number, children: ReactNode) {
    const s = this.state;
    return <div style={{ display: s.board || s.stage === i ? 'block' : 'none', zoom: s.board ? Math.min(.44, s.z * .44) : s.z }}>
      <div style={{ fontSize: 30, margin: '0 0 6px', color: 'var(--color-neutral-600)', display: s.board ? 'block' : 'none' }}>{i + 1} · {NAMES[i]} — {WHO[i]}</div>
      <div style={{ ...roomBox, filter: `brightness(${(s.bright / 100 + .1).toFixed(2)}) sepia(${(s.warm / 160).toFixed(2)})` }}>
        <Chrome active={i} tabs={TABS} time={TIMES[i]} onGo={this.nav} />
        {children}
        <Sideline prefs={s} onPref={(k, v) => this.setState({ [k]: v } as Pick<State, typeof k>)} backTo={s.prev != null ? NAMES[s.prev] : ''} onBack={() => s.prev != null && this.setState({ stage: s.prev, prev: s.stage, board: false })} onTab={this.tabIt} />
        {s.stage === i && <Line top={66} line={s.line} nextLabel={s.walk === 3 ? 'Done' : 'Next'} onNext={() => s.walk === 3 ? this.walkDone() : this.runBrief(s.walk + 1)} onStop={() => s.walk ? this.walkStop() : this.closeLine()} onAsk={this.ask} onTyping={on => { this.typingNow = on; if (!on) this.armClose(); }} onChoice={this.choose} />}
      </div>
    </div>;
  }

  enlarge(k: Room) {
    const on = !!this.state.wide[k];
    return {
      l: on ? 96 : 112, w: on ? 1090 : 850, rail: on ? 'none' : 'flex',
      button: <button onClick={() => this.setState(st => ({ wide: { ...st.wide, [k]: !st.wide[k] } }))} style={{ position: 'absolute', top: 66, right: 56, zIndex: 15, whiteSpace: 'nowrap', display: this.state.line.open ? 'none' : 'inline-flex' }} className="btn btn-ghost">{on ? '↙ Side column' : '↗ Enlarge'}</button>,
    };
  }

  render() {
    const s = this.state, w = s.walk;
    const ct = s.line.open ? 200 : 104, rt = s.line.open ? 206 : 110;
    const hl = (i: number) => w === i ? '3px solid oklch(0.7 0.17 65)' : '3px solid transparent';
    const main = (m: { l: number; w: number }): CSSProperties => ({ position: 'absolute', left: m.l, top: ct, width: m.w, transition: `left .3s,width .3s,top .6s ${EASE}` });
    const rail = (m: { rail: string }, gap = 28): CSSProperties => ({ position: 'absolute', left: 1000, top: rt, width: 196, transition: `top .6s ${EASE}`, display: m.rail, flexDirection: 'column', gap, fontSize: 15 });
    const A = this.enlarge('a'), W = this.enlarge('w'), Cl = this.enlarge('c');

    return <div style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text)', paddingBottom: 64 }}>
      <div style={{ padding: 24, display: 'flex', flexWrap: 'wrap', gap: 28, justifyContent: 'center', alignItems: 'flex-start' }}>

        {/* 1 DAY · the assistant */}
        {this.room(0, <>
          <div style={main(A)}>
            <div style={{ fontSize: 13, letterSpacing: '.14em', color: 'var(--color-accent-2)', fontWeight: 700 }}>MONDAY 5 OCTOBER</div>
            <h1 style={{ margin: '8px 0 0', fontSize: 64, fontWeight: 600, lineHeight: 1.02, letterSpacing: '-.01em' }}>Good morning. Here is your day.</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 34 }}>
              <div style={{ ...briefRow, outline: hl(1) }}>
                <div style={{ fontSize: 48, lineHeight: 1, color: 'var(--color-accent)' }}>1</div><div style={{ fontSize: 16, color: 'var(--color-neutral-600)' }}>by 12:00</div>
                <div><div style={{ fontSize: 30, lineHeight: 1.15 }}>Onboarding spec — ship it.</div><div style={{ fontSize: 17, marginTop: 4, color: 'var(--color-neutral-700)' }}>Sections one to three settled. <span style={{ color: 'var(--color-accent-2)' }}>§4 pricing tiers</span> still open.</div></div></div>
              <div style={{ ...briefRow, outline: hl(2) }}>
                <div style={{ fontSize: 48, lineHeight: 1, color: 'var(--color-accent)' }}>2</div><div style={{ fontSize: 16, color: 'var(--color-neutral-600)' }}>9:30</div>
                <div><div style={{ fontSize: 30, lineHeight: 1.15 }}>Standup — three lines, drafted.</div><div style={{ fontSize: 17, marginTop: 4, color: 'var(--color-neutral-700)' }}>The one blocker to raise: the pricing decision.</div></div></div>
              <div style={{ ...briefRow, outline: hl(3) }}>
                <div style={{ fontSize: 48, lineHeight: 1, color: 'var(--color-accent)' }}>3</div><div style={{ fontSize: 16, color: 'var(--color-neutral-600)' }}>when free</div>
                <div><div style={{ fontSize: 30, lineHeight: 1.15 }}>Replies — Dana first.</div><div style={{ fontSize: 17, marginTop: 4, color: 'var(--color-neutral-700)' }}>Her answer unblocks the spec. Then Omar, then Legal. Eleven others held till 14:00.</div></div></div>
            </div>
            {s.pinned && <div style={{ marginTop: 36, display: 'flex', gap: 18, alignItems: 'baseline' }}>
              <div style={{ fontSize: 13, letterSpacing: '.14em', color: 'var(--color-accent-2)', fontWeight: 700, whiteSpace: 'nowrap' }}>PINNED UNTIL 12:00</div>
              <div style={{ fontSize: 24, lineHeight: 1.2 }}>§4 Pricing tiers — <a href="#" onClick={this.go(1)}>open it</a></div>
            </div>}
          </div>
          <div style={rail(A)}>
            <div>
              <div style={kick('var(--color-accent-2)')}>TAB PROPOSES</div>
              <p style={{ margin: '6px 0 10px', fontSize: 16, lineHeight: 1.45 }}>You reopened the spec three times without editing. Pin §4 to the center until noon?</p>
              <button className="btn btn-primary" onClick={() => { if (!s.pinned) this.choose('pin'); }} style={{ whiteSpace: 'nowrap' }}>{s.pinned ? 'Pinned ✓' : 'Pin it'}</button>
            </div>
            <div>
              <div style={kick('var(--color-neutral-700)')}>HELD BACK</div>
              <p style={{ margin: '6px 0 0', fontSize: 16, lineHeight: 1.45, color: 'var(--color-neutral-700)' }}>14 weekend tabs, 11 messages, 2 duplicate docs. Filed, not closed — ask me for any of them.</p>
            </div>
          </div>
          {A.button}
        </>)}

        {/* 2 WRITE · the editor */}
        {this.room(1, <>
          <div style={main(W)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 20 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {([['mine', 'Yours · v4 · 10:12'], ['dana', 'Dana\'s · Fri']] as const).map(c => <button key={c[0]} onClick={() => this.setState({ copy: c[0] })} style={{ all: 'unset', cursor: 'pointer', padding: '6px 14px', fontSize: 16, borderRadius: 2, background: s.copy === c[0] ? 'var(--color-accent)' : 'var(--color-neutral-200)', color: s.copy === c[0] ? '#fff' : 'var(--color-text)', whiteSpace: 'nowrap' }}>{c[1]}</button>)}
                <span style={{ padding: '6px 10px', fontSize: 14, color: 'var(--color-neutral-500)', whiteSpace: 'nowrap' }}>+ one more, at most</span>
              </div>
              <div style={{ fontSize: 14, color: 'var(--color-neutral-600)', whiteSpace: 'nowrap' }}>{s.copy === 'mine' ? 'Saved as you type · v4' : 'Comparing · yours untouched'}</div>
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 14, fontSize: 15, color: 'var(--color-neutral-700)' }}>
              <span style={{ padding: '3px 9px', fontWeight: 700 }}>B</span><span style={{ padding: '3px 9px', fontStyle: 'italic' }}>I</span><span style={{ padding: '3px 9px', textDecoration: 'underline' }}>U</span><span style={{ padding: '3px 9px' }}>H1</span><span style={{ padding: '3px 9px' }}>H2</span><span style={{ padding: '3px 9px' }}>¶</span><span style={{ padding: '3px 9px' }}>“ ”</span><span style={{ padding: '3px 9px' }}>§</span>
            </div>
            <div style={{ marginTop: 26, background: '#fff', padding: '48px 56px', minHeight: 420, boxSizing: 'border-box', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 13, letterSpacing: '.14em', color: 'var(--color-neutral-600)' }}>ONBOARDING SPEC · {s.copy === 'mine' ? 'YOUR COPY' : 'DANA\'S COPY · READ ONLY'}</div>
              <h2 style={{ margin: '10px 0 18px', fontSize: 34, fontWeight: 600, lineHeight: 1.1 }}>§4 Pricing tiers</h2>
              {s.copy === 'mine' && <div contentEditable suppressContentEditableWarning style={{ fontSize: 22, lineHeight: 1.55, minHeight: 200, cursor: 'text', caretColor: 'var(--color-accent)' }}>
                <p style={{ margin: '0 0 14px' }}>Onboarding is offered in three tiers: Starter, Team, Scale. Trial length is 14 days across all of them.</p>
                <p style={{ margin: '0 0 14px' }}>Open: does Starter include the guided checklist? Decision owner: Dana.</p>
                <p style={{ margin: 0, color: 'var(--color-neutral-500)' }}>Keep writing here — your words, nothing generated.</p>
              </div>}
              {s.copy === 'dana' && <div style={{ fontSize: 22, lineHeight: 1.55, minHeight: 200 }}>
                <p style={{ margin: '0 0 14px' }}>Onboarding is offered in <span style={{ background: 'var(--color-accent-100)' }}>three tiers: Starter, Team, Scale</span>. Trial length is <span style={{ background: 'var(--color-accent-100)' }}>14 days</span> across all of them.</p>
                <p style={{ margin: '0 0 14px', fontStyle: 'italic', color: 'var(--color-neutral-700)', fontFamily: 'var(--font-body)' }}>Dana, Friday: “Northwind asked for exactly this in the pilot. Legal may push for 30 days.”</p>
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button className="btn btn-primary" onClick={() => { this.setState({ taken: true, copy: 'mine' }); this.say('Taken. Her two phrases are in your copy; v4 before that is one ask away.', 'DONE', false, () => this.rest()); }} style={{ whiteSpace: 'nowrap' }}>{s.taken ? 'Taken into yours ✓' : 'Take her wording'}</button>
                  <button className="btn btn-ghost" onClick={() => this.setState({ copy: 'mine' })}>Back to mine</button>
                </div>
              </div>}
            </div>
          </div>
          <div style={rail(W)}>
            <div>
              <div style={kick('var(--color-accent-2)')}>TAB PROPOSES</div>
              <p style={{ margin: '6px 0 10px', fontSize: 16, lineHeight: 1.45 }}>The checklist question is Dana's. Ask her now, so it's answered before noon?</p>
              <button className="btn btn-primary" onClick={() => { this.setState({ asked: true }); this.say('Sent to Dana: “Does Starter include the guided checklist? Need it by 11:00.” Her answer lands here.', 'DONE', false, () => this.rest()); }} style={{ whiteSpace: 'nowrap' }}>{s.asked ? 'Asked ✓' : 'Ask Dana for me'}</button>
              <div style={{ fontSize: 13, lineHeight: 1.4, color: 'var(--color-neutral-600)', fontStyle: 'italic', marginTop: 8 }}>It sends a message in your name, so it waits for you. Taking her wording into your copy doesn't — that one's reversible.</div>
            </div>
            <div>
              <div style={kick('var(--color-neutral-700)')}>FOLDED AWAY</div>
              <p style={{ margin: '6px 0 0', fontSize: 16, lineHeight: 1.45, color: 'var(--color-neutral-700)' }}>v1–v3, the Q3 memo, the cohort chart. Out of sight, one ask away.</p>
            </div>
          </div>
          {W.button}
        </>)}

        {/* 3 CALL · the wingman */}
        {this.room(2, <>
          <div style={main(Cl)}>
            <div style={{ fontSize: 13, letterSpacing: '.14em', color: 'var(--color-accent-2)', fontWeight: 700 }}>PINNED FOR THE WHOLE CALL</div>
            <div style={{ fontSize: 40, fontWeight: 600, lineHeight: 1.15, marginTop: 8 }}>We leave with a tier and a start date for the 40-seat rollout.</div>
            {s.joined && <div style={{ marginTop: 18, height: 180, background: 'var(--color-neutral-800)', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 2, padding: 2, boxSizing: 'border-box' }}>
              {PEOPLE.map(t => <div key={t} style={{ background: 'var(--color-neutral-900)', color: '#fff', display: 'flex', alignItems: 'flex-end', padding: '10px 14px', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden' }}>{t}</div>)}
            </div>}
            <div style={{ marginTop: s.joined ? 16 : 36, fontSize: 13, letterSpacing: '.14em', color: 'var(--color-accent-700)', fontWeight: 700 }}>IF SHE ASKS · YOU ANSWER</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: s.joined ? 8 : 12, marginTop: 10 }}>
              {QA.map(q => <div key={q[0]} style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 24, alignItems: 'baseline' }}><div style={{ fontSize: 19, lineHeight: 1.3, fontStyle: 'italic', fontFamily: 'var(--font-body)' }}>“{q[0]}”</div><div style={{ fontSize: 19, lineHeight: 1.3 }}>{q[1]}</div></div>)}
            </div>
          </div>
          <div style={rail(Cl, 24)}>
            <div>
              <div style={kick('var(--color-neutral-700)')}>RINA KAPLAN · NORTHWIND</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8, lineHeight: 1.35 }}><div>Signed the pilot in August; 81% activation.</div><div>Asked twice about seat limits.</div><div>Prefers short calls — last one ran 22 min.</div></div>
            </div>
            <div>
              <div style={kick('var(--color-neutral-700)')}>SHARE FROM</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8, alignItems: 'flex-start' }}><span className="tag tag-accent">Agenda</span><span className="tag tag-accent">Pricing v4 — shareable</span><span className="tag tag-neutral">Contract — internal</span></div>
            </div>
            <div>
              <div style={{ width: 196, aspectRatio: '16/9', background: 'var(--color-neutral-800)', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10px 12px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, letterSpacing: '.12em' }}><span>NORTHWIND</span><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'oklch(0.7 0.17 65)' }}></span></div>
                <div style={{ fontSize: 13, lineHeight: 1.3, opacity: .85 }}>{s.joined ? 'Live · TAB on notes, off camera' : 'Waiting room · camera off until you join'}</div>
              </div>
              <button className={`btn ${s.joined ? 'btn-secondary' : 'btn-primary'}`} onClick={() => { const j = !s.joined; this.setState({ joined: j }); if (j) this.say('You\'re in. Say “TAB, dial-in” if audio drops. The answers stay under the video.', 'LIVE', false, () => this.rest()); }} style={{ marginTop: 10, whiteSpace: 'nowrap' }}>{s.joined ? 'Leave' : 'Join · expands to center'}</button>
            </div>
          </div>
          {Cl.button}
        </>)}

        {/* 4 CLOSE · the librarian */}
        {this.room(3, <>
          <div style={{ position: 'absolute', left: 96, top: ct, width: 1090, transition: `top .6s ${EASE}` }}>
            <h1 style={{ margin: 0, fontSize: 64, fontWeight: 600, lineHeight: 1.02, letterSpacing: '-.01em' }}>That's the day.</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', gap: 48, marginTop: 30 }}>
              <div>
                <div style={kick('var(--color-neutral-700)')}>REPORT</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
                  {[['11:42', 'spec sent, 18 min early'], ['Team', 'tier agreed with Northwind; start Nov 3'], ['2', 'decisions left to you, both made']].map(r => <div key={r[0]} style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}><span style={{ fontSize: 40, lineHeight: 1, color: 'var(--color-accent)', width: 120 }}>{r[0]}</span><span style={{ fontSize: 17 }}>{r[1]}</span></div>)}
                </div>
                <div style={{ ...kick('var(--color-neutral-700)'), marginTop: 34 }}>TOMORROW · ALREADY FILED</div>
                <div style={{ fontSize: 17, lineHeight: 1.5, marginTop: 8 }}>Legal review first (comment 2 on trial length), then the retro at 11:00. Room set to your Tuesday.</div>
              </div>
              <div>
                <div style={kick('var(--color-accent-2)')}>REAL ALERTS · 2</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                  {ALERTS.map((a, i) => {
                    const pick = a.choices.find(c => c.id === s.ok[i]), open = !pick && ALERTS.findIndex((_, j) => !s.ok[j]) === i;
                    if (pick) return <div key={i}><div style={{ fontSize: 17, lineHeight: 1.3, color: 'var(--color-neutral-700)' }}>{a.title}</div><div style={{ fontSize: 14, color: 'var(--color-accent-700)', marginTop: 3 }}>{pick.closed}</div></div>;
                    if (!open) return <div key={i} style={{ fontSize: 15, color: 'var(--color-neutral-600)' }}><span style={kick('var(--color-neutral-600)', 11)}>NEXT · </span>{a.title}</div>;
                    return <div key={i}>
                      <div style={kick('var(--color-neutral-700)', 11)}>DECISION REQUIRED · {i + 1} OF 2</div>
                      <div style={{ fontSize: 19, lineHeight: 1.25, marginTop: 4 }}>{a.title}</div>
                      <div style={{ fontSize: 14, lineHeight: 1.35, marginTop: 8 }}><span style={{ color: 'var(--color-neutral-600)' }}>What changed · </span>{a.changed}</div>
                      <div style={{ fontSize: 14, lineHeight: 1.35, marginTop: 4 }}><span style={{ color: 'var(--color-neutral-600)' }}>Why it's yours · </span>{a.why}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                        {a.choices.map((c, k) => <button key={c.id} className={`btn ${k === 0 ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { this.setState({ ok: { ...s.ok, [i]: c.id } }); this.say(c.say, 'DONE', false, () => this.rest()); }} style={{ whiteSpace: 'nowrap' }}>{c.label}</button>)}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--color-neutral-600)', fontStyle: 'italic', marginTop: 6 }}>After you choose, I update what it touches and check it before I call it closed.</div>
                    </div>;
                  })}
                </div>
              </div>
              <div>
                <div style={kick('oklch(0.5 0.15 55)')}>ADDED VALUE · TRACED</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  {DID.map((r, i) => { const c = s.checked[i] ? 'var(--color-accent-700)' : 'var(--color-text)'; return <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                    <div><div style={{ fontSize: 16, lineHeight: 1.3, color: c }}>{r[0]}</div><div style={{ fontSize: 13, color: 'var(--color-neutral-600)', fontStyle: 'italic' }}>{r[1]}</div></div>
                    <button className="did-check" onClick={() => this.setState({ checked: { ...s.checked, [i]: !s.checked[i] } })} title="Reviewed" style={{ all: 'unset', cursor: 'pointer', flex: 'none', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: c }}><svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M229.66 77.66l-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69 218.34 66.34a8 8 0 0 1 11.32 11.32Z" /></svg></button>
                  </div>; })}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-neutral-600)', marginTop: 10 }}>Every line reversible for 7 days. Check means you looked.</div>
              </div>
            </div>
            <div style={{ marginTop: 18, display: 'flex', gap: 18, alignItems: 'baseline' }}>
              <div style={kick('var(--color-neutral-700)')}>BRIDGE-IT BOUNCER · TODAY</div>
              <div style={{ fontSize: 16 }}>{GATE.map((g, i) => <span key={g[1]} title={i === 2 ? 'e.g. a drafted reply to Legal claiming Northwind agreed to 30 days — no source, so it went back to its agent, not to you.' : undefined} style={{ cursor: i === 2 ? 'help' : undefined }}>{i > 0 && <span style={{ color: 'var(--color-neutral-400)' }}> · </span>}<span style={{ color: 'var(--color-accent)', fontSize: 20 }}>{g[0]}</span> {g[1]}</span>)}</div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 18, alignItems: 'center' }}>
              <button className="btn btn-primary" onClick={this.go(0)} style={{ fontSize: 18, padding: '12px 24px', whiteSpace: 'nowrap' }}>Goodbye — close the edition</button>
              <span style={{ fontSize: 16, fontStyle: 'italic', color: 'var(--color-neutral-600)', fontFamily: 'var(--font-body)' }}>Brightness, warmth and sound return to how you had them.</span>
            </div>
          </div>
        </>)}
      </div>

      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50, background: 'var(--color-bg)', display: 'flex', alignItems: 'center', gap: 16, padding: '10px 24px', flexWrap: 'wrap', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ fontSize: 11, letterSpacing: '.14em', color: 'var(--color-neutral-600)', fontWeight: 700, whiteSpace: 'nowrap' }}>DEMO · FOUR ROOMS</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 }}>
          {NAMES.map((n, i) => { const on = !s.board && s.stage === i; return <button key={n} onClick={this.go(i)} style={{ all: 'unset', cursor: 'pointer', padding: '4px 10px', fontSize: 14, borderRadius: 2, background: on ? 'var(--color-accent)' : 'transparent', color: on ? '#fff' : 'var(--color-text)', whiteSpace: 'nowrap' }}>{i + 1} · {n} — {WHO[i]}</button>; })}
        </div>
        <button className="btn btn-ghost" onClick={this.restart} style={{ whiteSpace: 'nowrap' }}>Restart demo</button>
        <button className="btn btn-ghost" onClick={() => this.setState({ board: !s.board })}>{s.board ? 'Back to demo' : 'All four'}</button>
      </div>
    </div>;
  }
}
