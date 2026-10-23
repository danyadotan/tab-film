# TAB Film

The 2:39 TAB film (`project/TAB Film.dc.html`) built as a standalone Vite + React app. It plays at 1920×1080, scales to fit the window, and stays synced to the ElevenLabs voiceover.

```sh
npm install
npm run dev       # http://localhost:5173
npm run build     # static site in dist/
```

## Controls

- Click the film or press **Space** to play or pause. **← / →** step 0.1 s (hold Shift for 1 s), and **0** or **Home** jumps back to the start.
- Use the scrub bar to seek. Hovering over it previews that frame.
- Add `#t=SECONDS` to the URL to open the film paused at that moment, e.g. `/#t=128` for the ROI math.

## How it's built

- `src/engine/timeline.ts`: each scene has an authored length (`nat`) and a playback length (`dur`, stretched to fit the recorded voiceover). Playback time is mapped onto authored time `T` scene by scene.
- `src/engine/usePlayback.ts`: while the voiceover plays, its `currentTime` drives the clock, so picture and voice can't drift apart. Before and after the voiceover, a `requestAnimationFrame` clock takes over. The film plays once and holds its last frame.
- `src/film/*`: every layer stays mounted and is drawn only from `T`, with three easing curves (`enter`, `draw`, `pop`). All timings, copy and layout are carried over unchanged from `project/TAB-Film.jsx`.
- `src/styles/broadsheet.css` is a verbatim copy of the Broadsheet design-system stylesheet.

Prototype-only features that were left out: the Claude Design tweaks panel, the host timeline and video-export hooks, and the browser speech-synthesis fallback.

## Deploy

This is a plain static Vite build. On Vercel, import the repo and set **Root Directory** to `web`. Vite is detected automatically. Netlify works too: build command `npm run build`, publish directory `web/dist`.

The ledger and ROI figures are still illustrative placeholders. Replace them in `src/film/Company.tsx` once the Tikshoov pilot results are in.
