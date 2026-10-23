import type { Scene } from '../engine/timeline';

// `nat` is each scene's authored length; `dur` is how long it plays, stretched
// to the recorded voiceover (Cecily, ElevenLabs, second take).
export const SCENES: Scene[] = [
  { name: 'Opening', dur: 7.8, nat: 8, desc: 'Dateline rules draw; TAB introduced as a co-worker in the browser' },
  { name: 'Morning', dur: 13.4, nat: 10, desc: 'A browser fills with fourteen tabs, docs and pings' },
  { name: 'Intention', dur: 12.8, nat: 12, desc: 'Noise is filed into the amber tab; three principles appear' },
  { name: 'EightPages', dur: 9.93, nat: 12, desc: 'The first map: eight page cards plus the Unified backroom' },
  { name: 'TheCut', dur: 14.84, nat: 14, desc: 'Pages are struck and merged into four rooms, with the reasons' },
  { name: 'RuleOfOne', dur: 12.73, nat: 10, desc: 'Day grows into the browser; voice, place and color are named' },
  { name: 'Day', dur: 13.7, nat: 12, desc: 'The assistant briefs three things and proposes the pin' },
  { name: 'Write', dur: 15.61, nat: 12, desc: 'The editor: typing in your copy, then the uninvited nudge' },
  { name: 'Call', dur: 11.99, nat: 12, desc: 'The wingman: goal pinned, video, answers under it' },
  { name: 'Close', dur: 12.5, nat: 12, desc: 'The librarian: report, two alerts, traced added value' },
  { name: 'Company', dur: 21.12, nat: 20, desc: 'The employee browser becomes one cell of 2,500; an anonymous friction ledger and its ROI' },
  { name: 'Outro', dur: 5.4, nat: 6, desc: 'One thing at a time' },
  { name: 'Statement', dur: 7.4, nat: 7.4, desc: "Closing statement for the buyer: attention looked after, nights slept better" },
  { name: 'Contact', dur: 6, nat: 6, desc: 'Held last frame: three bulletins from the film, then contact details and a LinkedIn QR code' },
];

/** Where the voiceover track ends, in playback seconds. */
export const VOICEOVER_END = 151.41;
