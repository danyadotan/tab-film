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
  small: boolean;
  portrait: boolean;
  hintClosed: boolean;
  sendStep: 0 | 1 | 2;
  sendPick: 'a' | 'b' | null;
  callPhase: 'before' | 'live' | 'after';
  answered: number;
  stepOut: boolean;
  walk: number;
  walkMode: 'Both' | 'Visual';
  said: Record<number, boolean>;
  nudged: boolean;
  wide: Partial<Record<Room, boolean>>;
  line: LineState;
}

const INIT: State = { stage: 0, prev: null, board: false, bright: 85, warm: 25, sound: 'Soft', quiet: 'Digest', text: 'Roomy', motion: 'Reduced', pinned: false, asked: false, taken: false, copy: 'mine', joined: false, ok: {}, checked: {}, z: 1, small: false, portrait: false, hintClosed: false, sendStep: 0, sendPick: null, callPhase: 'before', answered: 0, stepOut: false, walk: 0, walkMode: 'Both', said: {}, nudged: false, wide: {}, line: { open: false, words: [], shown: 0, meta: '', speaking: false, controls: false, idle: false, choices: null } };

const ARRIVE = [
  null,
  'Your words, your copies — two on the table, never twenty. I keep the third for Legal.',
  'I\'m your second screen: last call\'s notes, your three questions and her likely ones, all on the left. I\'m on notes, off camera.',
  'It\'s 16:45 — that\'s the day. Two alerts that are real, nothing else. The room resets when you go.',
];
const BRIEF = ['One. Onboarding spec, due at noon. Sections one to three are settled; only pricing tiers are open.', 'Two. Standup at nine thirty. Your three lines are drafted; the one blocker to raise is pricing.', 'Three. Replies. Dana first — her answer unblocks the spec. Then Omar, then Legal.'];
const NAMES = ['Day', 'Write', 'Call', 'Close'], WHO = ['the assistant', 'the editor', 'the wingman', 'the librarian'];
const TABS = [['Day', '3 things'], ['Write', 'spec v4 · 2 copies'], ['Call', '10:30 Northwind'], ['Close', '16:45']];
const TIMES = ['Mon 5 Oct · 8:40', 'Mon 5 Oct · 10:24', 'Mon 5 Oct · 10:30', 'Mon 5 Oct · 16:45'];
const PEOPLE = ['You', 'Rina Kaplan · Northwind', 'Tom Ruiz · Northwind', 'Dana'];
// Call: the three phases of one meeting. Before = last call + what to ask; during = answers as they come; after = follow-up + filing.
const LAST_CALL = ['Asked twice about seat limits — she needs 40.', 'Wants to start before the year ends.', 'Prefers short calls — the last one ran 22 min.'];
const ASK = [['Which tier do we sign — Team, for 40 seats?', 'Team, 40 seats — agreed.'], ['Can we fix the start date at Nov 3?', 'Nov 3 — agreed, once Legal has its ten days.'], ['Who signs on Northwind\'s side?', 'Rina signs; Tom Ruiz approves the budget.']];
const FOLLOW = [['Send Rina the order form', 'You · today'], ['Contract review, ten days', 'Legal · by Nov 3'], ['Confirm the checklist on Team', 'Dana · 11:00']];
// Write: what TAB checked before the send, and the two versions of the employee's own words.
const CHECKS: [string, string, boolean][] = [['“14-day trial”', 'matches the contract draft', true], ['“Team: up to 50 seats”', 'matches the price list', true], ['“Starter includes the checklist”', 'not confirmed — Dana decides by 11:00, so it is left out of both', false]];
const VERSIONS = [
  { id: 'a' as const, name: 'A · Tightened for Rina', why: 'She prefers short — 31 words.', text: 'Rina — §4 attached: Starter, Team and Scale, each with a 14-day trial. Team covers your 40 seats. Talk at 10:30.' },
  { id: 'b' as const, name: 'B · As you wrote it, cleaned', why: 'Your full wording — 48 words.', text: 'Hi Rina, ahead of our 10:30 call I\'ve attached the pricing section. There are three tiers — Starter, Team and Scale — each with a 14-day trial. For 40 seats, Team is the natural fit; happy to walk through it together.' },
];
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
const GATE = [['25', 'passed silently'], ['16', 'consolidated'], ['3', 'returned to their agents'], ['3', 'brought to you']];
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
  // margin and the bottom demo bar), growing on large screens too. Measured on the
  // layout viewport: on phones innerWidth grows once content overflows, which fed
  // the old fit a too-large width and cropped the room.
  private fit = () => {
    const W = document.documentElement.clientWidth, H = document.documentElement.clientHeight, small = W < 760 || H < 520;
    const pad = small ? 8 : 24, bar = small ? 44 : 72;
    this.setState({ small, portrait: small && H > W, z: Math.min(1.6, (W - 2 * pad - 8) / 1280, (H - 2 * pad - bar) / 800) });
  };
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
  private answerT: number[] = [];
  // T steps TAB out of the desk (and back); Esc returns. Ignored while typing.
  private onKey = (e: KeyboardEvent) => {
    const el = e.target as HTMLElement | null;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
    if (e.key === 't' || e.key === 'T') this.setState(st => ({ stepOut: !st.stepOut }));
    else if (e.key === 'Escape' && this.state.stepOut) this.setState({ stepOut: false });
  };

  componentDidMount() {
    this.fit();
    window.addEventListener('resize', this.fit);
    window.addEventListener('keydown', this.onKey);
    if (window.speechSynthesis) speechSynthesis.getVoices();
    this.lastStage = 0;
    this.arrive(0);
  }
  componentWillUnmount() { window.removeEventListener('resize', this.fit); window.removeEventListener('keydown', this.onKey); this.answerT.forEach(clearTimeout); this.stopLine(); clearTimeout(this.nudgeT); clearTimeout(this.closeT); }
  componentDidUpdate() {
    const st = this.state.stage;
    if (st === this.lastStage) return;
    this.lastStage = st;
    clearTimeout(this.nudgeT);
    if (this.state.walk) this.walkStop(); else if (this.state.line.open && !this.keepLine) this.closeLine();
    this.keepLine = false;
    if (!this.state.said[st]) this.arrive(st);
    if (st === 1 && !this.state.nudged && this.state.callPhase === 'before') this.nudgeT = window.setTimeout(() => this.nudge(), 14000);
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
  joinCall = () => {
    this.answerT.forEach(clearTimeout);
    this.setState({ callPhase: 'live', answered: 0 });
    this.answerT = [5000, 10000, 15000].map((ms, i) => window.setTimeout(() => this.setState({ answered: i + 1 }), ms));
    this.say('You\'re in. Say “TAB, dial-in” if audio drops. I note her answers under your questions as they come.', 'LIVE', false, () => this.rest());
  };
  leaveCall = () => {
    this.answerT.forEach(clearTimeout);
    this.setState({ callPhase: 'after', answered: ASK.length });
    this.say('Filed under Northwind › Calls. Three follow-ups: one is yours, the other two went to their owners.', 'DONE', false, () => this.rest());
  };
  sendVersion = (v: 'a' | 'b') => {
    this.setState({ sendStep: 2, sendPick: v });
    this.say(`Sent — version ${v.toUpperCase()}, your words. A copy is filed under Northwind; nothing else left your desk.`, 'DONE', false, () => this.rest());
  };
  restart = () => { this.answerT.forEach(clearTimeout); this.closeLine(); clearTimeout(this.nudgeT); this.lastStage = 0; this.setState(({ z, small, portrait, hintClosed }) => ({ ...INIT, z, small, portrait, hintClosed }), () => this.arrive(0)); };

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
      <div style={{ padding: s.small ? 8 : 24, display: 'flex', flexWrap: 'wrap', gap: s.small ? 12 : 28, justifyContent: 'center', alignItems: 'flex-start' }}>

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
              <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
                <div style={{ fontSize: 14, color: 'var(--color-neutral-600)', whiteSpace: 'nowrap' }}>{s.copy === 'mine' ? 'Saved as you type · v4' : 'Comparing · yours untouched'}</div>
                {s.copy === 'mine' && s.sendStep === 0 && <button className="btn btn-primary" onClick={() => { this.setState({ sendStep: 1 }); this.say('Checked and cleaned — your words stay yours. Two versions below; pick one to send.', '', false, () => this.rest()); }} style={{ whiteSpace: 'nowrap' }}>Ready to send →</button>}
              </div>
            </div>
            {s.sendStep === 0 && <div style={{ display: 'flex', gap: 4, marginTop: 14, fontSize: 15, color: 'var(--color-neutral-700)' }}>
              <span style={{ padding: '3px 9px', fontWeight: 700 }}>B</span><span style={{ padding: '3px 9px', fontStyle: 'italic' }}>I</span><span style={{ padding: '3px 9px', textDecoration: 'underline' }}>U</span><span style={{ padding: '3px 9px' }}>H1</span><span style={{ padding: '3px 9px' }}>H2</span><span style={{ padding: '3px 9px' }}>¶</span><span style={{ padding: '3px 9px' }}>“ ”</span><span style={{ padding: '3px 9px' }}>§</span>
            </div>}
            {s.sendStep > 0 && <div style={{ marginTop: 12, background: '#fff', padding: '20px 32px', boxSizing: 'border-box', boxShadow: 'var(--shadow-sm)' }}>
              <div style={kick('var(--color-neutral-600)', 13)}>TO RINA KAPLAN · NORTHWIND · §4 ATTACHED</div>
              {s.sendStep === 1 && <>
                <div style={{ ...kick('var(--color-accent-700)', 12), marginTop: 14 }}>TAB CHECKED · YOUR WORDS UNCHANGED</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {CHECKS.map(c => <div key={c[0]} style={{ fontSize: 16, lineHeight: 1.35 }}><span style={{ color: c[2] ? 'var(--color-accent-700)' : 'oklch(0.5 0.15 55)', fontWeight: 700, marginRight: 8 }}>{c[2] ? '✓' : '!'}</span>{c[0]} <span style={{ color: 'var(--color-neutral-600)' }}>— {c[1]}</span></div>)}
                </div>
                <div style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--color-neutral-600)', marginTop: 8 }}>Shredded: the v3 paragraph on annual discounts (superseded) and two repeated sentences.</div>
                <div style={{ ...kick('var(--color-accent-2)', 12), marginTop: 18 }}>SEND ONE · APPROVAL 1 OF 3 TODAY</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 10 }}>
                  {VERSIONS.map(v => <div key={v.id} style={{ border: '1px solid var(--color-divider)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{v.name}</div>
                    <div style={{ fontSize: 15, lineHeight: 1.45, flex: 1 }}>{v.text}</div>
                    <div style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--color-neutral-600)' }}>{v.why}</div>
                    <button className={`btn ${v.id === 'a' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => this.sendVersion(v.id)} style={{ alignSelf: 'flex-start', whiteSpace: 'nowrap' }}>Send {v.id.toUpperCase()}</button>
                  </div>)}
                </div>
                <button className="btn btn-ghost" onClick={() => this.setState({ sendStep: 0 })} style={{ marginTop: 4 }}>Back to editing</button>
              </>}
              {s.sendStep === 2 && <>
                <div style={{ fontSize: 28, fontWeight: 600, marginTop: 12 }}>Sent · 10:26 ✓</div>
                <div style={{ fontSize: 17, lineHeight: 1.5, marginTop: 12, paddingLeft: 14, borderLeft: '3px solid var(--color-accent-200)' }}>{VERSIONS.find(v => v.id === s.sendPick)?.text}</div>
                <div style={{ fontSize: 14, color: 'var(--color-neutral-600)', marginTop: 12 }}>Your words, version {s.sendPick?.toUpperCase()}. Copy filed under Northwind › Emails. The unconfirmed checklist line stayed out.</div>
                <button className="btn btn-ghost" onClick={() => this.setState({ sendStep: 0 })} style={{ marginTop: 12 }}>Back to the spec</button>
              </>}
            </div>}
            {s.sendStep === 0 && <div style={{ marginTop: 26, background: '#fff', padding: '48px 56px', minHeight: 420, boxSizing: 'border-box', boxShadow: 'var(--shadow-sm)' }}>
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
            </div>}
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
            <div style={{ fontSize: 34, fontWeight: 600, lineHeight: 1.15, marginTop: 8 }}>We leave with a tier and a start date for the 40-seat rollout.</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
              {(['before', 'live', 'after'] as const).map((ph, i) => <button key={ph} onClick={() => this.setState({ callPhase: ph, answered: ph === 'before' ? 0 : ph === 'after' ? ASK.length : s.answered })} style={{ all: 'unset', cursor: 'pointer', padding: '4px 12px', fontSize: 13, letterSpacing: '.12em', fontWeight: 700, borderRadius: 2, background: s.callPhase === ph ? 'var(--color-accent)' : 'var(--color-neutral-200)', color: s.callPhase === ph ? '#fff' : 'var(--color-neutral-700)' }}>{i + 1} · {['BEFORE', 'DURING', 'AFTER'][i]}</button>)}
            </div>
            {s.callPhase === 'before' && <>
              <div style={{ ...kick('var(--color-neutral-700)', 13), marginTop: 18 }}>FROM THE LAST CALL · AUG 28</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>{LAST_CALL.map(t => <div key={t} style={{ fontSize: 17, lineHeight: 1.35 }}>· {t}</div>)}</div>
              <div style={{ ...kick('var(--color-accent-2)', 13), marginTop: 16 }}>ASK HER · BEFORE YOU HANG UP</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>{ASK.map((q, i) => <div key={q[0]} style={{ fontSize: 17, lineHeight: 1.35 }}><span style={{ color: 'var(--color-accent)', marginRight: 8 }}>{i + 1}</span>{q[0]}</div>)}</div>
            </>}
            {s.callPhase === 'live' && <>
              <div style={{ marginTop: 14, height: 130, background: 'var(--color-neutral-800)', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 2, padding: 2, boxSizing: 'border-box' }}>
                {PEOPLE.map(t => <div key={t} style={{ background: 'var(--color-neutral-900)', color: '#fff', display: 'flex', alignItems: 'flex-end', padding: '10px 14px', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden' }}>{t}</div>)}
              </div>
              <div style={{ ...kick('var(--color-accent-2)', 13), marginTop: 14 }}>YOUR QUESTIONS · HER ANSWERS AS THEY COME</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>{ASK.map((q, i) => <div key={q[0]} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'baseline', fontSize: 16, lineHeight: 1.3 }}><div><span style={{ color: 'var(--color-accent)', marginRight: 8 }}>{i + 1}</span>{q[0]}</div><div style={{ color: i < s.answered ? 'var(--color-accent-700)' : 'var(--color-neutral-400)', fontStyle: i < s.answered ? 'normal' : 'italic' }}>{i < s.answered ? `✓ ${q[1]}` : 'listening…'}</div></div>)}</div>
            </>}
            {s.callPhase === 'after' && <>
              <div style={{ ...kick('var(--color-neutral-700)', 13), marginTop: 18 }}>WHAT YOU HEARD · CALL ENDED 10:52</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>{ASK.map(q => <div key={q[0]} style={{ fontSize: 17, lineHeight: 1.35, color: 'var(--color-accent-700)' }}>✓ <span style={{ color: 'var(--color-text)' }}>{q[1]}</span></div>)}</div>
              <div style={{ ...kick('var(--color-accent-2)', 13), marginTop: 16 }}>FOLLOW-UP</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>{FOLLOW.map(f => <div key={f[0]} style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 20, fontSize: 17, lineHeight: 1.35 }}><div>{f[0]}</div><div style={{ color: 'var(--color-neutral-600)' }}>{f[1]}</div></div>)}</div>
              <div style={{ fontSize: 15, color: 'var(--color-neutral-600)', fontStyle: 'italic', marginTop: 14 }}>Summary filed under Northwind › Calls › 5 Oct. Reversible for 7 days.</div>
            </>}
            {s.callPhase !== 'after' && <>
              <div style={{ ...kick('var(--color-accent-700)', 13), marginTop: 16 }}>IF SHE ASKS · YOU ANSWER</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: s.callPhase === 'live' ? 4 : 6, marginTop: 6 }}>
                {QA.map(q => <div key={q[0]} style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 20, alignItems: 'baseline', fontSize: s.callPhase === 'live' ? 15 : 16, lineHeight: 1.3 }}><div style={{ fontStyle: 'italic', fontFamily: 'var(--font-body)' }}>“{q[0]}”</div><div>{q[1]}</div></div>)}
              </div>
            </>}
          </div>
          <div style={rail(Cl, 24)}>
            <div>
              <div style={kick('var(--color-neutral-700)')}>ON THE CALL</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8, lineHeight: 1.3 }}><div><b style={{ fontWeight: 600 }}>Rina Kaplan</b><br /><span style={{ color: 'var(--color-neutral-600)' }}>Head of Ops · signed the pilot, 81% activation</span></div><div><b style={{ fontWeight: 600 }}>Tom Ruiz</b><br /><span style={{ color: 'var(--color-neutral-600)' }}>Finance · approves the budget</span></div><div><b style={{ fontWeight: 600 }}>Dana</b><br /><span style={{ color: 'var(--color-neutral-600)' }}>Your side · owns the checklist</span></div></div>
            </div>
            <div>
              <div style={kick('var(--color-neutral-700)')}>SHARE FROM</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8, alignItems: 'flex-start' }}><span className="tag tag-accent">Agenda</span><span className="tag tag-accent">Pricing v4 — shareable</span><span className="tag tag-neutral">Contract — internal</span></div>
            </div>
            <div>
              <div style={{ width: 196, aspectRatio: '16/9', background: 'var(--color-neutral-800)', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10px 12px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, letterSpacing: '.12em' }}><span>NORTHWIND</span><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'oklch(0.7 0.17 65)' }}></span></div>
                <div style={{ fontSize: 13, lineHeight: 1.3, opacity: .85 }}>{s.callPhase === 'live' ? 'Live · TAB on notes, off camera' : s.callPhase === 'after' ? 'Call ended · 10:52' : 'Waiting room · camera off until you join'}</div>
              </div>
              <button className={`btn ${s.callPhase === 'live' ? 'btn-secondary' : 'btn-primary'}`} onClick={() => s.callPhase === 'live' ? this.leaveCall() : this.joinCall()} style={{ marginTop: 10, whiteSpace: 'nowrap' }}>{s.callPhase === 'live' ? 'Leave · file the call' : s.callPhase === 'after' ? 'Rejoin' : 'Join · expands to center'}</button>
            </div>
          </div>
          {Cl.button}
        </>)}

        {/* 4 CLOSE · the librarian */}
        {this.room(3, <>
          <div style={{ position: 'absolute', left: 96, top: ct, width: 1090, transition: `top .6s ${EASE}` }}>
            <div style={kick('var(--color-accent-2)', 13)}>END OF DAY · 16:45–17:00</div>
            <h1 style={{ margin: '6px 0 0', fontSize: 56, fontWeight: 600, lineHeight: 1.02, letterSpacing: '-.01em' }}>That's the day.</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', gap: 48, marginTop: 24 }}>
              <div>
                <div style={kick('var(--color-neutral-700)')}>REPORT</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
                  {[['11:42', 'spec sent, 18 min early'], ['Team', 'tier agreed with Northwind; start Nov 3'], ['3', `approvals asked of you today: ${s.sendStep === 2 ? 'the send is done' : 'the send is waiting'}, two below`]].map(r => <div key={r[0]} style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}><span style={{ fontSize: 40, lineHeight: 1, color: 'var(--color-accent)', width: 120 }}>{r[0]}</span><span style={{ fontSize: 17 }}>{r[1]}</span></div>)}
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

      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50, background: 'var(--color-bg)', display: 'flex', alignItems: 'center', gap: s.small ? 4 : 16, padding: s.small ? '4px 8px' : '10px 24px', flexWrap: s.small ? 'nowrap' : 'wrap', overflowX: 'auto', boxShadow: 'var(--shadow-sm)' }}>
        {!s.small && <div style={{ fontSize: 11, letterSpacing: '.14em', color: 'var(--color-neutral-600)', fontWeight: 700, whiteSpace: 'nowrap' }}>DEMO · FOUR ROOMS</div>}
        <div style={{ display: 'flex', gap: 4, flexWrap: s.small ? 'nowrap' : 'wrap', flex: 1 }}>
          {NAMES.map((n, i) => { const on = !s.board && s.stage === i; return <button key={n} onClick={this.go(i)} style={{ all: 'unset', cursor: 'pointer', padding: s.small ? '6px 8px' : '4px 10px', fontSize: s.small ? 13 : 14, borderRadius: 2, background: on ? 'var(--color-accent)' : 'transparent', color: on ? '#fff' : 'var(--color-text)', whiteSpace: 'nowrap' }}>{i + 1} · {n}{s.small ? '' : ` — ${WHO[i]}`}</button>; })}
        </div>
        <button className="btn btn-ghost" onClick={() => this.setState({ stepOut: true })} title="TAB steps out of the desk (T)" style={{ whiteSpace: 'nowrap', fontSize: s.small ? 13 : undefined, color: 'oklch(0.5 0.15 55)' }}>● TAB</button>
        <button className="btn btn-ghost" onClick={this.restart} style={{ whiteSpace: 'nowrap', fontSize: s.small ? 13 : undefined }}>{s.small ? 'Restart' : 'Restart demo'}</button>
        <button className="btn btn-ghost" onClick={() => this.setState({ board: !s.board })} style={{ whiteSpace: 'nowrap', fontSize: s.small ? 13 : undefined }}>{s.board ? 'Back to demo' : s.small ? 'All 4' : 'All four'}</button>
      </div>

      {/* TAB steps out of the desk: the amber tab leaves the edge and stands on its own. */}
      {s.stepOut && <div className="tab-out-backdrop" onClick={() => this.setState({ stepOut: false })} style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'color-mix(in srgb, var(--color-bg) 88%, transparent)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'var(--font-heading)' }}>
        <div className="tab-out-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 18 }}>
          <div style={{ background: 'oklch(0.7 0.17 65)', color: '#fff', fontWeight: 700, letterSpacing: '.24em', fontSize: 56, padding: '10px 28px 10px 34px' }}>TAB</div>
          <div style={kick('var(--color-accent-2)', 14)}>A CO-WORKER, NOT A FEATURE</div>
          <div style={{ fontSize: 44, fontWeight: 600, lineHeight: 1.08 }}>TAB isn't the desk. It's who works beside you at it.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 21, lineHeight: 1.35 }}>
            <div><b style={{ color: 'oklch(0.5 0.15 55)' }}>One voice</b> — a single line, once per room.</div>
            <div><b style={{ color: 'oklch(0.5 0.15 55)' }}>One place</b> — the amber tab at the edge of any screen.</div>
            <div><b style={{ color: 'oklch(0.5 0.15 55)' }}>One color</b> — amber, TAB's alone.</div>
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: 19, lineHeight: 1.4, color: 'var(--color-neutral-700)' }}>TAB@Work is one desk it works at. It measures friction in the flow of work — never feelings.</div>
          <button className="btn btn-primary" onClick={() => this.setState({ stepOut: false })}>Back to the desk</button>
          <div style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>Press T or Esc to return.</div>
        </div>
      </div>}

      {/* Phones held upright: the desk is a 1280×800 desktop, so suggest turning sideways. */}
      {s.portrait && !s.hintClosed && <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'color-mix(in srgb, var(--color-bg) 96%, transparent)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 28px', gap: 14, fontFamily: 'var(--font-heading)' }}>
        <div style={kick('var(--color-accent-2)')}>TAB · A SHARED DESK</div>
        <div style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.1 }}>Turn your phone sideways.</div>
        <div style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: 18, lineHeight: 1.4, color: 'var(--color-neutral-700)' }}>TAB Desk is a full workday on one screen. It reads best in landscape, or on a computer at tab-at-work.com.</div>
        <button className="btn btn-primary" onClick={() => this.setState({ hintClosed: true })} style={{ alignSelf: 'flex-start', marginTop: 8 }}>Continue anyway</button>
      </div>}
    </div>;
  }
}
