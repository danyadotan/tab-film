import { useEffect, useRef, useState } from 'react';

// The webinar interview, shown on TAB's step-out card. The presenter asks each
// question aloud and presses → (or a clicker's PageDown); TAB answers in its own
// voice from the shared script. ← replays the last answer. L opens presenter controls for a spoken or typed audience question.
// The presenter enters the access token privately; it is kept only in memory.
export const SCRIPT = [
  'אצלך. הטיוטות והמילון שלך נשארים במחשב שלך. את המייל אני קורא במקום, בהרשאות שלך, בלי להעתיק. לארגון מגיעות רק ספירות. בלי תוכן, בלי שמות.',
  'מה שרגיש, כאן לידך. כשצריך לנסח או לסכם, אני פונה לענן שהארגון שלך כבר אישר. רק עם מה שהמשימה צריכה, ושם לא נשמר כלום.',
  'מי שעושה משימה אחת טוב, מציין מקור לכל טענה, ויודע להגיד ״אני לא בטוח״. התנאים: גישה רק למה שהמשימה צריכה. מה שפרטי והפיך, עושים. מה שנוגע באדם אחר, מביאים אליי. ואני מביא לעובדת רק שתיים־שלוש כאלה ביום.',
  'היום הגיעו ארבעים ושבעה תוצרים מהסוכנים. עשרים וחמישה עברו בשקט, שישה עשר אוחדו, שלושה חזרו בלי מקור. שלושה הגיעו אלייך: המייל לרינה, אורך תקופת הניסיון, וההזזה של עומר. זה מה שתראו בחדר Close.',
  'כשכל דבר מבקש אישור, אישור הופך לרפלקס, ואנשים מאשרים בלי לקרוא. החדש הוא שהמכסה חלה על הסוכנים, לא עלייך. הם צריכים לעשות עבודה טובה יותר כדי להגיע אלייך.',
];

export const PRESENTER_QUESTIONS = [
  'דניה, למה בנית אותי כך שאשלים אותך?',
  'מה הסביבה צריכה להחזיק עבור אדם בזמן עבודה?',
  'מי מחליט מה מותר לסוכן לעשות?',
  'איך תדעי שהמערכת עזרה, ואיך תשמרי על בדיקה גם כשהיא נעשית מוכרת?',
];

const AMBER = 'oklch(0.7 0.17 65)';
let played = 0; // survives closing and reopening the card during the webinar

type Recognition = { lang: string; interimResults: boolean; continuous: boolean; start: () => void; abort: () => void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: ((e: { error?: string }) => void) | null };

function hebrewVoice() {
  const vs = window.speechSynthesis?.getVoices() ?? [];
  return vs.find(v => /^he|^iw/i.test(v.lang)) ?? null;
}

export function Interview({ onActive }: { onActive: (on: boolean) => void }) {
  const [text, setText] = useState('');
  const [shown, setShown] = useState(0);
  const [status, setStatus] = useState<'' | 'speaking' | 'listening' | 'thinking' | 'loadingVoice'>('');
  const [heard, setHeard] = useState('');
  const [notice, setNotice] = useState('');
  const [liveOpen, setLiveOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [access, setAccess] = useState('');
  const [canReplay, setCanReplay] = useState(false);
  const voicePending = useRef<AbortController | null>(null);
  const voiceDeadline = useRef<number | undefined>(undefined);
  const voiceURL = useRef<string | null>(null);
  const pending = useRef<AbortController | null>(null);
  const deadline = useRef<number | undefined>(undefined);
  const listenDeadline = useRef<number | undefined>(undefined);
  const audio = useRef<HTMLAudioElement | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const rec = useRef<Recognition | null>(null);
  const token = useRef('');
  const turn = useRef(0); // bumped by every stop, so a late live answer can't talk over what came after it

  const stop = () => {
    turn.current += 1;
    const previous = rec.current; rec.current = null;
    previous?.abort();
    pending.current?.abort(); pending.current = null;
    voicePending.current?.abort(); voicePending.current = null;
    window.clearTimeout(voiceDeadline.current);
    if (voiceURL.current) { URL.revokeObjectURL(voiceURL.current); voiceURL.current = null; }
    setCanReplay(false);
    window.clearTimeout(deadline.current);
    window.clearTimeout(listenDeadline.current);
    setStatus('');
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
    // The answer stays readable even when speech is missing or blocked.
    setText(t); setShown(t.split(' ').length); onActive(true);
    const v = hebrewVoice();
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined' || !v) {
      setStatus(''); setNotice('אין קול עברי זמין. התשובה מוצגת לקריאה.'); return;
    }
    const mine = turn.current;
    const u = new SpeechSynthesisUtterance(t);
    u.lang = 'he-IL'; u.rate = 0.95; u.voice = v;
    u.onend = () => { if (mine === turn.current) setStatus(''); };
    u.onerror = () => { if (mine === turn.current) { setStatus(''); setNotice('ההשמעה אינה זמינה. התשובה מוצגת לקריאה.'); } };
    setStatus('speaking');
    try { window.speechSynthesis.speak(u); }
    catch { setStatus(''); setNotice('ההשמעה אינה זמינה. התשובה מוצגת לקריאה.'); }
  };

  const playVoice = (mine: number) => {
    if (mine !== turn.current || !audio.current || !voiceURL.current) return;
    const a = audio.current;
    a.currentTime = 0;
    setNotice(''); setStatus('speaking');
    a.onended = () => { if (mine === turn.current) setStatus(''); };
    a.onerror = () => { if (mine === turn.current) { setStatus(''); setNotice('לא ניתן להשמיע את הקול. התשובה נשארת לקריאה.'); } };
    void a.play().catch(() => {
      if (mine === turn.current) { setStatus(''); setNotice('לחצי על ״השמעת התשובה״ כדי לאפשר השמעה בדפדפן.'); }
    });
  };

  const speakLive = async (answer: string) => {
    const mine = turn.current;
    setText(answer); setShown(answer.split(' ').length); setStatus('loadingVoice');
    const controller = new AbortController(); voicePending.current = controller;
    voiceDeadline.current = window.setTimeout(() => controller.abort(), 18_000);
    try {
      const response = await fetch('/api/tab-voice', {
        method: 'POST', signal: controller.signal,
        headers: { 'content-type': 'application/json', 'x-tab-live': token.current },
        body: JSON.stringify({ text: answer }),
      });
      if (!response.ok || !response.headers.get('content-type')?.startsWith('audio/')) throw new Error('Voice unavailable');
      const blob = await response.blob();
      if (mine !== turn.current) return;
      if (!blob.size || blob.size > 2_000_000) throw new Error('Invalid audio');
      voiceURL.current = URL.createObjectURL(blob);
      audio.current = new Audio(voiceURL.current);
      setCanReplay(true);
      playVoice(mine);
    } catch {
      if (mine === turn.current) {
        // Browser Hebrew speech remains a fallback when available; text always
        // remains complete. A failed voice request never repeats the model call.
        speakBrowser(answer);
        setNotice('קול TAB אינו זמין כרגע. התשובה מוצגת לקריאה; אם קיים קול עברי בדפדפן הוא יקריא אותה.');
      }
    } finally {
      if (mine === turn.current) { window.clearTimeout(voiceDeadline.current); voicePending.current = null; }
    }
  };

  const play = (i: number) => {
    stop(); setNotice('');
    const t = SCRIPT.at(i);
    if (!t) return;
    const a = new Audio(`/voice/tab-${i + 1}.mp3`);
    audio.current = a;
    setHeard('');
    const mine = turn.current; // stopping (close, next answer) cancels this one, even mid-load
    a.onloadedmetadata = () => { if (mine === turn.current) { setStatus('speaking'); reveal(t, a.duration); } };
    a.onended = () => { if (mine === turn.current) setStatus(''); };
    let fell = false; // a missing file fails both play() and onerror; read the line once
    const fallback = () => { if (!fell && mine === turn.current) { fell = true; speakBrowser(t); } };
    a.onerror = fallback; // no recorded file: the browser's voice reads the same line
    void a.play().catch(fallback);
  };

  const askLive = async (q: string) => {
    if (!q.trim() || q.trim().length > 600) return;
    stop(); setNotice(''); setLiveOpen(true);
    if (!token.current) { setNotice('יש להזין אסימון גישה למגישה. הראיון המוקלט זמין כרגיל.'); onActive(true); return; }
    setHeard(q); setStatus('thinking'); setText(''); onActive(true);
    const mine = turn.current;
    const controller = new AbortController(); pending.current = controller;
    deadline.current = window.setTimeout(() => controller.abort(), 22_000);
    try {
      const r = await fetch('/api/tab', { method: 'POST', signal: controller.signal, headers: { 'content-type': 'application/json', 'x-tab-live': token.current }, body: JSON.stringify({ q: q.trim() }) });
      if (mine !== turn.current) return;
      if (!r.ok) {
        const message = r.status === 401 || r.status === 403 ? 'אסימון הגישה חסר או אינו תקף.' : r.status === 429 ? 'השירות עמוס כרגע.' : 'השירות החי אינו זמין כרגע.';
        throw new Error(message);
      }
      const body: unknown = await r.json();
      const answer = (body as { answer?: unknown } | null)?.answer;
      if (typeof answer !== 'string' || !answer.trim()) throw new Error('לא התקבלה תשובה.');
      if (mine === turn.current) void speakLive(answer);
    } catch (error) {
      if (mine === turn.current) {
        setStatus('');
        setNotice(`${controller.signal.aborted ? 'זמן ההמתנה הסתיים.' : error instanceof Error && !/fetch/i.test(error.message) ? error.message : 'החיבור לשירות נכשל.'} אפשר לנסות שוב או להמשיך בראיון המוקלט באמצעות →.`);
      }
    } finally {
      if (mine === turn.current) { window.clearTimeout(deadline.current); pending.current = null; }
    }
  };

  const askPresenter = (i: number) => {
    stop(); setNotice(''); setLiveOpen(true); onActive(true);
    const q = PRESENTER_QUESTIONS[i];
    if (!q) return;
    if (!token.current) { setNotice('יש להזין אסימון גישה למגישה. השאלה זמינה להקראה מהמסמך.'); return; }
    setHeard('TAB שואל את דניה');
    void speakLive(q);
  };

  const listen = () => {
    stop(); setLiveOpen(true); setNotice(''); onActive(true);
    if (!token.current) { setNotice('יש להזין אסימון גישה למגישה. הראיון המוקלט זמין כרגיל.'); return; }
    const W = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const R = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!R) { setNotice('זיהוי דיבור אינו זמין בדפדפן. אפשר להקליד את השאלה.'); return; }
    const r = new R();
    r.lang = 'he-IL'; r.interimResults = false; r.continuous = false;
    const failed = () => {
      if (rec.current !== r) return;
      rec.current = null; window.clearTimeout(listenDeadline.current);
      r.abort(); setStatus(''); setNotice('לא זוהה דיבור או שהמיקרופון אינו זמין. אפשר להקליד את השאלה.');
    };
    r.onresult = e => {
      if (rec.current !== r) return;
      const q = e.results[0]?.[0]?.transcript?.trim();
      if (q) { setQuestion(q); void askLive(q); } else failed();
    };
    r.onend = failed;
    r.onerror = failed;
    rec.current = r;
    setStatus('listening'); setHeard('');
    listenDeadline.current = window.setTimeout(failed, 12_000);
    try { r.start(); } catch { failed(); }
  };

  useEffect(() => {
    // Legacy presenter links must not keep a credential in browser history.
    const url = new URL(location.href);
    if (url.searchParams.has('live')) {
      url.searchParams.delete('live');
      history.replaceState(null, '', url);
      setLiveOpen(true); setNotice('יש להזין את אסימון הגישה בשדה הפרטי, בלי לצרף אותו לכתובת.');
    }
    const key = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.('input, textarea, [contenteditable="true"]')) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); if (played < SCRIPT.length) play(played++); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); if (played > 0) play(played - 1); }
      else if (e.key === 'l' || e.key === 'L') listen();
    };
    window.addEventListener('keydown', key);
    return () => { window.removeEventListener('keydown', key); stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!text && !status && !notice && !liveOpen) return <button type="button" onClick={() => { setLiveOpen(true); onActive(true); }}>שאלות חיות והחלפת תפקידים</button>;
  const words = text.split(' ');
  return <div dir="rtl" style={{ alignSelf: 'stretch', background: '#fff', outline: `1.5px solid ${AMBER}`, borderRadius: 24, padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
    {liveOpen && <form onSubmit={e => { e.preventDefault(); void askLive(question); }} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <input aria-label="אסימון גישה למגישה" type="password" autoComplete="off" placeholder="אסימון גישה למגישה" value={access} onChange={e => { setAccess(e.target.value); token.current = e.target.value; }} />
      <input aria-label="שאלה מהקהל" placeholder="שאלה מהקהל" maxLength={600} value={question} onChange={e => setQuestion(e.target.value)} />
      <button type="submit" disabled={status === 'thinking' || !question.trim()}>שליחת שאלה</button>
      <button type="button" onClick={listen}>הקראת שאלה</button>
      <button type="button" onClick={() => { stop(); setNotice(''); }}>עצירה</button>
      <button type="button" onClick={() => { stop(); token.current = ''; setAccess(''); setLiveOpen(false); setNotice(''); setText(''); setHeard(''); onActive(false); }}>סיום Q&A</button>
    </form>}
    {liveOpen && <div aria-label="שאלות TAB לדניה" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <div style={{ flexBasis: '100%', fontSize: 16 }}>החלפת תפקידים: בחרי שאלה אחת. TAB מקריא נוסח מוכן; את עונה בקול. אין האזנה או קריאת צ׳אט אוטומטית.</div>
      {PRESENTER_QUESTIONS.map((q, i) => <button type="button" key={q} aria-label={`שאלת TAB ${i + 1}`} onClick={() => askPresenter(i)} disabled={!!status}>שאלת TAB {i + 1}</button>)}
    </div>}
    {canReplay && <button type="button" onClick={() => playVoice(turn.current)}>השמעת התשובה</button>}
    {notice && <div role="status" style={{ fontSize: 16 }}>{notice}</div>}
    {heard && <div style={{ fontSize: 15, color: 'var(--color-neutral-600)', fontStyle: 'italic' }}>״{heard}״</div>}
    <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
      <span style={{ width: 12, height: 12, flex: 'none', borderRadius: '50%', background: AMBER, boxShadow: `0 0 0 ${status === 'speaking' ? 6 : 0}px oklch(0.9 0.1 80)`, transition: 'box-shadow .25s' }}></span>
      <div style={{ fontSize: 24, lineHeight: 1.4 }}>
        {status === 'listening' && <span style={{ color: 'var(--color-neutral-500)' }}>מקשיב…</span>}
        {status === 'loadingVoice' && <span style={{ fontSize: 16, color: 'var(--color-neutral-500)' }}>מכין קול… </span>}
        {status === 'thinking' && !text && <span style={{ color: 'var(--color-neutral-500)' }}>…</span>}
        <span>{words.slice(0, shown).join(' ')}</span>
      </div>
    </div>
  </div>;
}
