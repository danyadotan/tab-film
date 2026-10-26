# TAB — film and desk

Two pages, one static Vite + React app:

- **`/` — TAB Film.** The 2:45 film (`project/TAB Film.dc.html`) at 1920×1080, scaled to fit the window and synced to the ElevenLabs voiceover.
- **`/desk.html` — TAB Desk.** The clickable employee demo: the desktop the employee shares with TAB, in four rooms (Day: the assistant; Write: the editor; Call: the wingman; Close: the librarian). Ported from the `TAB - Desk` Claude Design export.

```sh
npm install
npm run dev       # http://localhost:5173
npm run build     # static site in dist/
```

## Film controls

- Click the film or press **Space** to play or pause. **← / →** step 0.1 s (hold Shift for 1 s), and **0** or **Home** jumps back to the start.
- Use the scrub bar to seek. Hovering over it previews that frame.
- Add `#t=SECONDS` to the URL to open the film paused at that moment, e.g. `/#t=128` for the ROI math or `/#t=165` for the closing card.
- The film ends on a contact card that stays on screen: three bulletins from the film plus LinkedIn, email and a LinkedIn QR code. The links on it are clickable. Contact details live in `CONTACT` in `src/film/Contact.tsx`.

## The desk

- TAB greets on arrival and offers a walkthrough of the day's three things, out loud and on screen (browser speech) or on screen only. Then it proposes one pin.
- Each room has a single amber line. It speaks once on arrival and then waits. Typed asks in the line route you to the right room ("the call with Rina" opens Call).
- In Write, TAB interrupts once on its own, 14 seconds in, to bring you to the Northwind call.
- The sideline holds TAB, Glossary, Settings (brightness and warmth apply live) and Back. The bottom bar switches rooms, restarts the demo, or shows all four rooms at once.
- The logic in `src/desk/Desk.tsx` is a one-to-one port of the prototype's component class: same timers, word pacing and copy.

## How it's built

- `src/engine/timeline.ts`: each scene has an authored length (`nat`) and a playback length (`dur`, stretched to fit the recorded voiceover). Playback time is mapped onto authored time `T` scene by scene.
- `src/engine/usePlayback.ts`: while the voiceover plays, its `currentTime` drives the clock, so picture and voice can't drift apart. Before and after the voiceover, a `requestAnimationFrame` clock takes over. The film plays once and holds its last frame.
- `src/film/*`: every layer stays mounted and is drawn only from `T`, with three easing curves (`enter`, `draw`, `pop`). All timings, copy and layout are carried over unchanged from `project/TAB-Film.jsx`.
- `src/styles/broadsheet.css` is a verbatim copy of the Broadsheet design-system stylesheet.

Prototype-only features that were left out: the Claude Design tweaks panel, the host timeline and video-export hooks, and the browser speech-synthesis fallback.

## Deploy

This is a plain static Vite build. On Vercel, import the repo and set **Root Directory** to `web`. Vite is detected automatically. Netlify works too: build command `npm run build`, publish directory `web/dist`.

The ledger and ROI figures are still illustrative placeholders. Replace them in `src/film/Company.tsx` once the Tikshoov pilot results are in.
