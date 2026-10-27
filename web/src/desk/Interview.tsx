import { useEffect, useRef, useState } from 'react';

// The webinar interview, shown on TAB's step-out card. The presenter asks each
// question aloud and presses → (or a clicker's PageDown); TAB answers in its own
// voice from the shared script. ← replays the last answer. L listens for an
// audience question the presenter reads aloud and answers it live (needs ?live=<token>).
export const SCRIPT = [
  'אצלך. הטיוטות והמילון שלך נשארים במחשב שלך. את המייל אני קורא במקום, בהרשאות שלך, בלי להעתיק. לארגון מגיעות רק ספירות. בלי תוכן, בלי שמות.',
  'מה שרגיש, כאן לידך. כשצריך לנסח או לסכם, אני פונה לענן שהארגון שלך כבר אישר. רק עם מה שהמשימה צריכה, ושם לא נשמר כלום.',
  'מי שעושה משימה אחת טוב, מציין מקור לכל טענה, ויודע להגיד ״אני לא בטוח״. התנאים: גישה רק למה שהמשימה צריכה. מה שפרטי והפיך, עושים. מה שנוגע באדם אחר, מביאים אליי. ואני מביא לעובדת רק שתיים־שלוש כאלה ביום.',
  'היום הגיעו ארבעים ושבעה תוצרים מהסוכנים. עשרים וחמישה עברו בשקט, שישה עשר אוחדו, שלושה חזרו בלי מקור. שלושה הגיעו אלייך: המייל לרינה, אורך תקופת הניסיון, וההזזה של עומר. זה מה שתראו בחדר Close.',
  'כשכל דבר מבקש אישור, אישור הופך לרפלקס, ואנשים מאשרים בלי לקרוא. החדש הוא שהמכסה חלה על הסוכנים, לא עלייך. הם צריכים לעשות עבודה טובה יותר כדי להגיע אלייך.',
];

const AMBER = 'oklch(0.7 0.17 65)';
let played = 0; // survives closing and reopening the card during the webinar

type Recognition = { lang: string; interimResults: boolean; continuous: boolean; start: () => void; abort: () => void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };

function hebrewVoice() {
  const vs = window.speechSynthesis?.getVoices() ?? [];
  return vs.find(v => /^he|^iw/i.test(v.lang)) ?? null;
}

export function Interview({ onActive }: { onActive: (on: boolean) => void }) {
  const [text, setText] = useState('');
  const [shown, setShown] = useState(0);
  const [status, setStatus] = useState<'' | 'speaking' | 'listening' | 'thinking'>('');
  const [heard, setHeard] = useState('');
  const audio = useRef<HTMLAudioElement | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const rec = useRef<Recognition | null>(null);
  const token = useRef(new URLSearchParams(location.search).get('live') ?? '');
  const turn = useRef(0); // bumped by every stop, so a late live answer can't talk over what came after it

  const stop = () => {
    turn.current += 1;
    rec.current?.abort(); rec.current = null;
    window.clearInterval(timer.current);
    audio.current?.pause();
    window.speechSynthesis?.cancel();
  };

  // Reveal the words in step with the voice: by the audio's length when we have a file, else at speaking pace.
  const reveal = (t: string, seconds: number) => {
    const words = t.split(' ');
    setText(t); setShown(0); onActive(true);
    let n = 0;
    window.clearInterval(timer.current);
    timer.current = window.setInterval(() => { n += 1; setShown(n); if (n >= words.length) window.clearInterval(timer.current); }, Math.max(120, (seconds * 1000) / words.length));
  };

  const speakBrowser = (t: string) => {
    const u = new SpeechSynthesisUtterance(t), v = hebrewVoice();
    u.lang = 'he-IL'; u.rate = 0.95;
    if (v) u.voice = v;
    u.onend = () => setStatus('');
    setStatus('speaking');
    reveal(t, t.split(' ').length * 0.42);
    window.speechSynthesis?.speak(u);
  };

  const play = (i: number) => {
    stop();
    const t = SCRIPT.at(i);
    if (!t) return;
    const a = new Audio(`/voice/tab-${i + 1}.mp3`);
    audio.current = a;
    setHeard('');
    a.onloadedmetadata = () => { setStatus('speaking'); reveal(t, a.duration); };
    a.onended = () => setStatus('');
    let fell = false; // a missing file fails both play() and onerror; read the line once
    const fallback = () => { if (!fell) { fell = true; speakBrowser(t); } };
    a.onerror = fallback; // no recorded file: the browser's voice reads the same line
    void a.play().catch(fallback);
  };

  const askLive = async (q: string) => {
    setHeard(q); setStatus('thinking'); setText(''); onActive(true);
    const mine = turn.current;
    try {
      const r = await fetch('/api/tab', { method: 'POST', headers: { 'content-type': 'application/json', 'x-tab-live': token.current }, body: JSON.stringify({ q }) });
      const { answer } = r.ok ? ((await r.json()) as { answer: string }) : { answer: '' };
      if (mine !== turn.current) return;
      if (answer) speakBrowser(answer);
      else setStatus('');
    } catch {
      if (mine === turn.current) setStatus('');
    }
  };

  const listen = () => {
    const W = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const R = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!R || !token.current) return;
    stop();
    const r = new R();
    r.lang = 'he-IL'; r.interimResults = false; r.continuous = false;
    r.onresult = e => { if (rec.current !== r) return; const q = e.results[0]?.[0]?.transcript?.trim(); if (q) void askLive(q); };
    r.onend = () => { if (rec.current === r) setStatus(st => (st === 'listening' ? '' : st)); };
    r.onerror = () => { if (rec.current === r) setStatus(''); };
    rec.current = r;
    setStatus('listening'); setHeard(''); onActive(true);
    r.start();
  };

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); if (played < SCRIPT.length) play(played++); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); if (played > 0) play(played - 1); }
      else if (e.key === 'l' || e.key === 'L') listen();
    };
    window.addEventListener('keydown', key);
    return () => { window.removeEventListener('keydown', key); stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!text && !status) return null;
  const words = text.split(' ');
  return <div dir="rtl" style={{ alignSelf: 'stretch', background: '#fff', outline: `1.5px solid ${AMBER}`, borderRadius: 24, padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
    {heard && <div style={{ fontSize: 15, color: 'var(--color-neutral-600)', fontStyle: 'italic' }}>״{heard}״</div>}
    <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
      <span style={{ width: 12, height: 12, flex: 'none', borderRadius: '50%', background: AMBER, boxShadow: `0 0 0 ${status === 'speaking' ? 6 : 0}px oklch(0.9 0.1 80)`, transition: 'box-shadow .25s' }}></span>
      <div style={{ fontSize: 24, lineHeight: 1.4 }}>
        {status === 'listening' && <span style={{ color: 'var(--color-neutral-500)' }}>מקשיב…</span>}
        {status === 'thinking' && !text && <span style={{ color: 'var(--color-neutral-500)' }}>…</span>}
        <span>{words.slice(0, shown).join(' ')}</span>
      </div>
    </div>
  </div>;
}
