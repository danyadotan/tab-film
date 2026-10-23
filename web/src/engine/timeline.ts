// The film is one tree rendered as a pure function of authored time T.
// Each scene is a slice of that axis: `nat` is its authored length, `dur` the
// length it actually plays for (stretched to fit the recorded voiceover).
// Playback time is warped per scene onto authored time, so choreography keyed
// to T retimes with the scene instead of being cut off.

export interface Scene {
  name: string;
  dur: number;
  nat: number;
  desc: string;
}

interface Section {
  playStart: number;
  dur: number;
  authStart: number;
  nat: number;
}

export interface Timeline {
  sections: Section[];
  cues: Record<string, number>;
  total: number;
  authoredTotal: number;
}

export function deriveTimeline(scenes: Scene[]): Timeline {
  let playStart = 0, authStart = 0;
  const sections: Section[] = [];
  const cues: Record<string, number> = {};
  for (const s of scenes) {
    sections.push({ playStart, dur: s.dur, authStart, nat: s.nat });
    if (!(s.name in cues)) cues[s.name] = Math.round(authStart * 1000) / 1000;
    playStart += s.dur;
    authStart += s.nat;
  }
  return {
    sections,
    cues,
    total: Math.round(playStart * 1000) / 1000,
    authoredTotal: Math.round(authStart * 1000) / 1000,
  };
}

export function warp(tl: Timeline, time: number): number {
  const ss = tl.sections;
  if (!ss.length) return 0;
  const s = ss.find(x => time < x.playStart + x.dur) ?? ss[ss.length - 1];
  const local = Math.min(Math.max(time - s.playStart, 0), s.dur);
  return Math.min(s.authStart + local * (s.nat / s.dur), tl.authoredTotal);
}
