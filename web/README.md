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
- The film ends on a contact card that stays on screen: three bulletins from the film plus LinkedIn, email and a QR code to the desk at tab-at-work.com. The links on it are clickable. Contact details live in `CONTACT` in `src/film/Contact.tsx`.

## The desk

- TAB greets on arrival and offers a walkthrough of the day's three things, out loud and on screen (browser speech) or on screen only. Then it proposes one pin.
- Each room has a single amber line. It speaks once on arrival and then waits. Typed asks in the line route you to the right room ("the call with Rina" opens Call).
- In Write, TAB interrupts once on its own, 14 seconds in, to bring you to the Northwind call.
- The sideline holds TAB, Glossary, Settings (brightness and warmth apply live) and Back. The bottom bar switches rooms, restarts the demo, or shows all four rooms at once.
- **Write → Ready to send:** TAB checks three facts (two confirmed, one left out as unconfirmed), lists what it shredded, and offers two versions of the employee's own words. Sending one is the first of the day's three approvals.
- **Call** runs in three phases: *Before* (notes from the last call, three questions to ask, her likely questions), *During* (video tiles, her answers filled in under your questions), *After* (what you heard, follow-ups with owners, the summary filed).
- **Close** is the 16:45–17:00 end-of-day: report, two Closure Gate decisions, the Bouncer's count for the day.
- **TAB steps out:** press **T** (or "● TAB" in the bottom bar) and the amber tab leaves the desk as its own entity. **T** or **Esc** brings it back.
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

## Domains

`web/vercel.json` gives each domain its own front page from the same deployment:

- **tab-at-work.com** (and www) opens straight into the Desk at `/`. The film is at `/film`.
- **Any other domain** (e.g. tab.dynamicbridge.io) opens the film at `/`. The desk is at `/desk.html`.

The Desk fills the window in both directions: the 1280×800 room scales between fit-to-screen and 160%.

## Webinar live Q&A (11 November 2026, 20:00 Israel)

The five `/voice/tab-1.mp3` … `tab-5.mp3` recordings work independently of the
live API, its credentials and browser speech recognition. Open Desk, press **T**,
then **→ / PageDown** for the next recording, **← / PageUp** to replay.

For live questions, press **L**. Enter the presenter access token into the masked
field (before sharing the screen). It stays only in component memory and is
cleared by **סיום Q&A** or closing the card. Do not put it in a URL or a Vite
variable. Legacy `?live=...` parameters are discarded when the card opens; old
links should no longer be used. This is a presenter credential, not an audience
link; share the plain Desk URL with attendees.

Use **הקראת שאלה** to recognise Hebrew (`he-IL`) or type the question and press
**שליחת שאלה**. Speech recognition may use the browser vendor's remote service;
ask only public webinar questions. The question is sent to Anthropic. Browser
speech reads the live reply only when a Hebrew voice is available; otherwise the
complete answer remains visible for the presenter to read. Recorded audio uses
the existing files, not the model or browser voice.

### Deployment and security

- Vercel project Root Directory must be `web`, framework Vite. `/api/tab.ts`
  exports a standalone default `fetch` handler. The page-specific routes finish
  with `handle: filesystem` to resolve the function, static assets and audio.
  `vite preview` serves static output only; it cannot validate deployed API routing.
- Server-only `ANTHROPIC_API_KEY` and `TAB_LIVE_TOKEN` are both required. Never
  add a `VITE_` prefix. Configure them directly in the intended Vercel environment.
- Missing/wrong token or unset server token: 401, no provider request. Valid token
  but missing model key: 503. Only POST JSON is accepted; questions are 1–600
  trimmed characters and bodies at most 4096 bytes. Cross-origin browser requests
  are refused. Responses are `no-store`; provider error details are never returned.
- The shared token authorises model usage. Anyone who obtains it can use the API;
  it is not per-user authentication or a distributed spending limit. Keep it private,
  use provider spending controls and rotate it directly in Vercel if disclosed.
- Provider timeout: 18 seconds, no SDK retries, bounded output. UI deadline:
  22 seconds. Recognition deadline: 12 seconds. Errors give a visible recovery
  message. **עצירה**, another recording or closing the card cancels the client
  request and prevents stale answers speaking over the next turn. An already
  started provider request may still complete on the server.

### Checks performed on 2 November 2026

- Public `POST https://tab-at-work.com/api/tab` without a token returned **404**.
- Vercel reports the custom domain on production commit `4028ace`; the latest
  main commit `9bd5b08` deployment failed `npm run build` with missing `StrictMode`.
  This branch fixes that import as well as the live-path issues.
- Both required variable names exist as sensitive **production** variables;
  values were not decrypted or copied. Preview availability is not confirmed.
- `npm test` builds and typechecks both UI and API, then runs server transport
  tests using the real SDK with a mocked upstream and React lifecycle tests with
  mocked recognition, speech, audio and fetch. It scans built JS for server
  credential references and checks the five MP3 files remain present.
- These are not real-browser/microphone or live-provider tests. Chromium could
  not be installed in the execution environment. No production config, secret,
  deployment or domain was changed; no paid model request was made.

### Remaining acceptance before the broadcast

After reviewing/merging and deploying through the normal release process:

1. In the intended deployment, unauthenticated POST `/api/tab` must return 401
   (not HTML, 404 or 500); GET must return 405. Confirm recordings and `/film`,
   `/desk`, `/demo` page routes still work.
2. On the actual broadcast computer in Chrome over HTTPS, allow microphone,
   open **T → L**, enter the token privately and ask one Hebrew question. Confirm
   the transcript, actual provider/model availability, full Hebrew answer and
   Hebrew speaker output. The existing model identifier and beta options are
   preserved; their live availability has not been verified.
3. Deny microphone permission and submit the same question by typing. Disable
   the connection: verify the visible error/deadline, then **→** still plays the
   next recording. Check sound reaches the webinar audience, not just headphones.
4. If any live check fails, use the five recordings and let Danya answer audience
   questions herself. The scripted interview needs neither live credentials nor
   recognition. For fully offline rehearsal, serve the built `dist/` locally.

Tests require Node 24 (matching this Vercel project): `npm ci && npm test`.

## ElevenLabs voice for live answers

Live answers now appear in full immediately, then POST their text to
`/api/tab-voice` for Hebrew MP3 generation (`eleven_v3`, language `he`). The same
presenter token protects both APIs. The voice endpoint accepts at most 2000
characters/12000 bytes, fixes the voice/model server-side, limits audio to 2 MB,
uses a 15-second deadline and never retries paid generation automatically.

Configure these **server-only** variables in the intended Preview branch first:

| Variable | Value |
| --- | --- |
| `ELEVENLABS_API_KEY` | A restricted ElevenLabs API key with Text to Speech access; save as Secret |
| `ELEVENLABS_VOICE_ID` | ID of the selected voice accessible to that account; preferably the voice used for the existing recordings |

Create/manage the key at https://elevenlabs.io/app/api/api-keys and choose a voice
at https://elevenlabs.io/app/voice-library. Preview scope for the webinar test is
`fix/webinar-live-qa`; the existing branch-specific `TAB_LIVE_TOKEN` is reused.
Redeploy that branch after saving variables. Do not put provider credentials in
the presenter token field or a `VITE_` variable. No key/voice was configured by
this code change. Provider cost/access depends on the ElevenLabs account.

Only the answer text is sent to ElevenLabs. This is cloud processing and provider
retention follows your account settings; do not describe it as local processing
or guaranteed zero retention. The endpoint sends no prompt, question history or
presenter token to the provider and returns only MP3 audio, not provider headers.
The browser keeps the clip in memory for replay; it is revoked when the turn is
stopped/replaced or the card closes. Audio is not persisted to files/storage.

If playback is blocked by browser autoplay rules, use **השמעת התשובה** to play
the cached clip without another provider request. If generation fails or times
out, the complete answer remains, with browser Hebrew speech used if available.
The live text request and five recorded interview files remain independent.

Acceptance: test one actual Hebrew answer with the chosen voice, check first
audio latency and pronunciation, replay, Stop during generation/playback, next
recording and provider failure. `npm test` covers these transport/component
boundaries with mocked services; actual ElevenLabs audio quality and account
permissions have not yet been tested because the credentials are not configured.
