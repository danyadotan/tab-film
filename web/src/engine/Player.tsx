import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { clamp } from './easing';
import { FilmContext } from './FilmContext';
import { deriveTimeline, warp, type Scene } from './timeline';
import { usePlayback } from './usePlayback';

interface PlayerProps {
  width: number;
  height: number;
  bg: string;
  scenes: Scene[];
  audioSrc: string;
  audioEnd: number;
  children: ReactNode;
}

const BAR_H = 44;
const MONO = 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace';
const UI = 'Inter, system-ui, sans-serif';

const fmt = (t: number) => {
  const v = Math.max(0, t);
  return `${Math.floor(v / 60)}:${String(Math.floor(v % 60)).padStart(2, '0')}.${String(Math.floor((v * 100) % 100)).padStart(2, '0')}`;
};

/** `#t=95.5` opens the film paused at that playback second. */
const hashTime = () => { const m = /[#&]t=([\d.]+)/.exec(location.hash); return m ? parseFloat(m[1]) : 0; };

export function Player({ width, height, bg, scenes, audioSrc, audioEnd, children }: PlayerProps) {
  const tl = useMemo(() => deriveTimeline(scenes), [scenes]);
  const pb = usePlayback(tl.total, audioEnd, hashTime());
  const [hover, setHover] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => setScale(Math.max(0.05, Math.min(el.clientWidth / width, (el.clientHeight - BAR_H) / height)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, height]);

  const { toggle, seek, time } = pb;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); toggle(); }
      else if (e.code === 'ArrowLeft') seek(time - (e.shiftKey ? 1 : 0.1));
      else if (e.code === 'ArrowRight') seek(time + (e.shiftKey ? 1 : 0.1));
      else if (e.key === '0' || e.code === 'Home') seek(0);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle, seek, time]);

  const shown = hover ?? pb.time;
  const film = useMemo(() => ({ T: warp(tl, shown), time: shown, playing: pb.playing }), [tl, shown, pb.playing]);
  const [started, setStarted] = useState(false);
  useEffect(() => { if (pb.playing) setStarted(true); }, [pb.playing]);
  const atStart = !started && !pb.playing && hashTime() === 0;

  return (
    <div ref={rootRef} style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#0a0a0a', fontFamily: UI }}>
      <div style={{ flex: 1, width: '100%', minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ width: width * scale, height: height * scale, flexShrink: 0, position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }} onClick={toggle}>
          <div style={{ width, height, background: bg, position: 'relative', overflow: 'hidden', transform: `scale(${scale})`, transformOrigin: '0 0' }}>
            <FilmContext.Provider value={film}>{children}</FilmContext.Provider>
          </div>
          {atStart && <button className="btn btn-primary" onClick={e => { e.stopPropagation(); pb.play(); }} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', fontSize: 20, padding: '14px 28px' }}>▶ Play film</button>}
        </div>
      </div>
      {pb.blocked && pb.playing && !pb.muted && <button className="btn btn-primary" onClick={pb.unblock} style={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}>Turn sound on</button>}
      <PlaybackBar time={shown} duration={tl.total} playing={pb.playing} muted={pb.muted}
        onPlayPause={toggle} onReset={() => seek(0)} onSeek={seek} onHover={setHover} onMute={() => pb.setMuted(m => !m)} />
      <audio ref={pb.audioRef} src={audioSrc} preload="auto" />
    </div>
  );
}

interface BarProps {
  time: number;
  duration: number;
  playing: boolean;
  muted: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onSeek: (t: number) => void;
  onHover: (t: number | null) => void;
  onMute: () => void;
}

function PlaybackBar({ time, duration, playing, muted, onPlayPause, onReset, onSeek, onHover, onMute }: BarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const at = (x: number) => {
    const r = trackRef.current!.getBoundingClientRect();
    return clamp((x - r.left) / r.width, 0, 1) * duration;
  };

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => onSeek(at(e.clientX));
    const up = () => setDragging(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  });

  const pct = duration > 0 ? (time / duration) * 100 : 0;
  const num = { fontFamily: MONO, fontSize: 12, fontVariantNumeric: 'tabular-nums', width: 64 } as const;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', margin: '0 0 6px', background: 'rgba(20,20,20,0.92)', borderTop: '1px solid rgba(255,255,255,0.08)', width: '100%', maxWidth: 680, boxSizing: 'border-box', borderRadius: 6, color: '#f6f4ef', userSelect: 'none', flexShrink: 0 }}>
      <IconButton onClick={onPlayPause} title="Play/pause (space)">
        {playing
          ? <svg width="14" height="14" viewBox="0 0 14 14"><rect x="3" y="2" width="3" height="10" fill="currentColor" /><rect x="8" y="2" width="3" height="10" fill="currentColor" /></svg>
          : <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 2l9 5-9 5V2z" fill="currentColor" /></svg>}
      </IconButton>
      <IconButton onClick={onReset} title="Return to start (0)">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 2v10M12 2L5 7l7 5V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" /></svg>
      </IconButton>
      <div style={{ ...num, textAlign: 'right' }}>{fmt(time)}</div>
      <div ref={trackRef}
        onPointerMove={e => { if (!dragging) onHover(at(e.clientX)); }}
        onPointerLeave={() => onHover(null)}
        onPointerDown={e => { setDragging(true); onHover(null); onSeek(at(e.clientX)); }}
        style={{ flex: 1, height: 22, position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', touchAction: 'none' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 2 }} />
        <div style={{ position: 'absolute', left: 0, width: `${pct}%`, height: 4, background: 'oklch(72% 0.12 250)', borderRadius: 2 }} />
        <div style={{ position: 'absolute', left: `${pct}%`, top: '50%', width: 12, height: 12, marginLeft: -6, marginTop: -6, background: '#fff', borderRadius: 6, boxShadow: '0 2px 4px rgba(0,0,0,0.4)' }} />
      </div>
      <div style={{ ...num, color: 'rgba(246,244,239,0.55)' }}>{fmt(duration)}</div>
      <IconButton onClick={onMute} title={muted ? 'Unmute' : 'Mute'}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 5h2.5L8 2v10L4.5 9H2V5z" fill="currentColor" />
          {muted
            ? <path d="M10 5l3 4M13 5l-3 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            : <path d="M10 4.5a3.5 3.5 0 0 1 0 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />}
        </svg>
      </IconButton>
    </div>
  );
}

function IconButton({ children, onClick, title }: { children: ReactNode; onClick: () => void; title: string }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} title={title} aria-label={title} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: hover ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, color: '#f6f4ef', cursor: 'pointer', padding: 0, transition: 'background 120ms' }}>
      {children}
    </button>
  );
}
