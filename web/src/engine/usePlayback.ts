import { useCallback, useEffect, useRef, useState } from 'react';
import { clamp } from './easing';

// Plays the film once and holds the last frame. While the voiceover is
// running it is the master clock (so a buffering track never drifts from the
// picture); before and after it, a rAF clock advances time on its own.
export function usePlayback(total: number, audioEnd: number, startAt = 0) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [time, setTime] = useState(() => clamp(startAt, 0, total));
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const timeRef = useRef(time);
  timeRef.current = time;

  const startAudio = useCallback((t: number) => {
    const a = audioRef.current;
    if (!a) return;
    if (t >= audioEnd) { a.pause(); return; }
    if (Math.abs(a.currentTime - t) > 0.05) a.currentTime = t;
    if (a.paused) a.play().then(() => setBlocked(false)).catch(() => setBlocked(true));
  }, [audioEnd]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0, last: number | null = null;
    const step = (ts: number) => {
      const dt = last == null ? 0 : (ts - last) / 1000;
      last = ts;
      const a = audioRef.current;
      let next = a && !a.paused && !a.ended && timeRef.current < audioEnd ? a.currentTime : timeRef.current + dt;
      if (next >= total) { next = total; setPlaying(false); }
      timeRef.current = next;
      setTime(next);
      if (next < total) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, total, audioEnd]);

  const play = useCallback(() => {
    const t = timeRef.current >= total ? 0 : timeRef.current;
    setTime(t);
    timeRef.current = t;
    setPlaying(true);
    startAudio(t);
  }, [total, startAudio]);

  const pause = useCallback(() => {
    setPlaying(false);
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => (playing ? pause() : play()), [playing, play, pause]);

  const seek = useCallback((t: number) => {
    const next = clamp(t, 0, total);
    timeRef.current = next;
    setTime(next);
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.min(next, audioEnd);
    if (playing) startAudio(next);
  }, [total, audioEnd, playing, startAudio]);

  useEffect(() => { if (audioRef.current) audioRef.current.muted = muted; }, [muted]);

  return { audioRef, time, playing, play, pause, toggle, seek, muted, setMuted, blocked, unblock: () => startAudio(timeRef.current) };
}
