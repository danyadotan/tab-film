# TAB co-worker walkthrough feature

_Started 2026-10-03 17:44 UTC_

---

## User

Continuing from "TAB AI Browser Concept".

## Assistant

We've been building a JITAI (Just-In-Time Adaptive Intervention) browser mockup for knowledge workers that starts greeting the user before they even open it. The goal: weave AI assistance, sensory personalization, and app skills into a seamless focus tool that handles cognitive load intelligently.

We settled on a desktop prototype following one product manager's Monday morning: boot greeting → sensory setup → four task-specific desktops (Briefs, Text, Call, Parked) → TAB's proposals and actions → end-of-day wrap. The core philosophy is center the main task, hide everything else in toggleable side sections, and let TAB handle low-stakes work while proposing high-stakes decisions.

Key decisions made:
- Right-edge tabbed sideline (Glossary, Settings, Back) instead of floating—cleaner, always accessible.
- Three-column layout: left side for navigation/context, center for main content, right for toggleable metadata.
- "Enlarge" button to expand center and collapse right column, with memory per screen.
- Main content anchored left with proper spacing (not drifting right).
- Documents shown as two-version comparison with clear diff markers; older/archive docs hidden under tags (last week, next week, hierarchy).
- Briefs screen includes optional TAB co-worker walkthrough for accessibility; Text screen prioritizes document editing; Call screen shows pre-call briefing (caller info, smart opener, focus statement) with TAB managing room checks and docs.

Current state: all screens 1–8 built and laid out correctly. The layout fix from the last check moved main content back to the left edge and widened it (850px). You just sent inspiration images; we're applying those now.

Open next steps: integrate visual direction from the inspiration images, refine typography/color treatment if needed, and prepare for any final polish.

Files: TAB Browser.dc.html, TAB Browser v2.dc.html, TAB Sideline v2.dc.html, TAB Glossary.dc.html, TAB Chrome.dc.html, Broadsheet (design system).

## User

i need TAB to slide in as the user's co-worker/body-double. begin with walkthrough: if i chose both visual and spoken and i hear and see nothing from it - it fails. TAB should  sit as the first tab on the sideline before glossary in orange-yellow color. and when the user opens the briefs page it should seamlessly open a search-like one line intro suggesting that for anything, just TAB it (hint to its position on the sideline) and shrink back to its place. then if i choose a walkthrough that is spoken - opens that one-line and speaks the brief while the words are running inside that search-like one-line conversation.

## Assistant

_[tool: read_file]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Now the browser: TAB line on Briefs, speech-driven walkthrough, `on-tab` wiring.

_[tool: run_script]_

_[tool: ready_for_verification]_

Done — out for review.

What changed:
- **Sideline**: amber-orange **TAB** tab now sits first, above Glossary, on every screen. Clicking it opens the TAB line (and jumps to Briefs if you're elsewhere).
- **Briefs intro**: on first arrival the TAB line slides out from the sideline as a one-line, search-like pill, types "For anything… just TAB it — I'm the amber tab on the right," then shrinks back.
- **Walkthrough**: Start → cards highlight in turn *and* the TAB line opens with the brief running word by word. In Spoken/Both the words are synced to real speech; each brief auto-advances to the next, ending with the §4 pin suggestion. Visual-only runs the line silently. Stop cancels voice and closes the line.

One caveat: browsers only allow voice after a click, so speech starts on "Start walkthrough" — not on the intro line. If you still hear nothing, check system volume / browser site permissions for sound.

## User

its great. now what would you change, whats really good, what is noise

## Assistant

**Really good**
- The spine: boot → room → briefs → wrap. TAB greets, sets, briefs, closes. That arc *is* the product.
- One pinned question per screen (§4 pricing; "leave with a tier and a date"). Strongest idea here — the browser holds the thread for you.
- Low-stakes/high-stakes split on Handoff. Clear, defensible, and the one line investors/buyers will repeat.
- The TAB line as body-double: a voice that appears, says one thing, and shrinks back. Keep it the *only* way TAB talks.
- Sideline tabs: always there, never in the way.

**What I'd change**
- Make the TAB line the single TAB voice. Right now TAB also speaks via the magenta `*` notes in the right column on every screen. Two voices = two personalities. Fold the `*` notes into the line (one line on arrival, then quiet).
- Briefs cards: three big numbers (72 %, 50 min, 3 of 14) compete with the pinned question. Mute two; let the one that moves today lead.
- Right column is doing too much on Text and Call (Projects, Also on the table, Cleared, Room check, Caller, Folder, Sent, EOD). Keep two per screen; move the rest behind "Enlarge"'s opposite — a "More" tab on the sideline.
- The intro line auto-closes with no way to answer it. It's search-shaped; let typing in it work (even faked) or it breaks its own promise.
- Walkthrough controls live in the right rail while the words run top-right — eyes split. Put Next / Stop inside the line.
- Call screen: the four video tiles are placeholders that say nothing. Shrink to a strip; the briefing is the content.

**Noise**
- The colored blob field on Boot and Wrap (decorative, off the Broadsheet voice).
- "From 3 reopens, 0 edits — a workflow event, nothing about you." Good principle, wrong place; one glossary entry covers it.
- "Skills for today · 4", status pills with percent bars, "Sent · where you stand" — data for the sake of fullness.
- The sensory "Live preview" card restates what the sliders already show live on the page itself.
- Tab-count copy ("14 tabs, filed. None lost.", "3 of 14", "11 others held") repeats across four screens — say it once.

If you want, I'll do the three structural ones first: single TAB voice, two-item rails, controls inside the line.

## User

1. clear the noise. nothing should repeat itself like a flag of doing where its not needed. so any info we keep in each page or column is only the related and at where it belong. including voices - from zero to 2? keep the one that is less mechanic-tint oriented. 2. i agree with colored blobs - it was merely an inspirational thing. also the colored apple-like rectangles. it should be either full color blocks or only framed. not half baked. 3. also, i understand the need of the header: 1. boot 2. room ... 8. wrap navigator - it shows the whole idea in one consecutive flow but with the "see all 8 screens" is it just for the demo or part of the interface design schema? cause maybe later on it can move to the bottom. or it can become a side-line numbered-tabs to choose from - like a brief with 8 sections. i do like the way the upper row says: tab  briefs 3 folders  text 4 versions  call.... i am with you on the changes you suggested and the clearence too.

## Assistant

_[tool: read_file]_

_[tool: run_script]_

_[tool: dc_write]_

Now the TAB Line as its own small component (it repeats on 5 screens, has controls).

_[tool: dc_write]_

_[tool: ready_for_verification]_

**TAB Browser v3** is out for review (v2 untouched).

**Cleared**
- One voice: the `*` notes are gone. TAB speaks only in the TAB line — one sentence on first arrival at each desktop, then quiet. Walkthrough and confirmations (pin, ask Dana) also speak there; Next/Stop now live inside the line.
- Rails are two items max, each specific to its screen: Briefs → proposal + walkthrough; Text → ask Dana + folded docs; Call → caller + what's shareable; Handoff → done by TAB + close the day. Parked has no rail.
- Removed: Skills, Projects/percent bars, Room check, Sent, EOD-on-Call, Live preview card, "3 reopens…" footnote, all tab counts except the Chrome's "14 tabs".
- Briefs: only the spec leads with a big figure (12:00); the other two are quiet.

**Visuals**
- No blobs, no gradients, no dot screens. Brief cards are flat ink blocks (magenta / cyan / near-black). Parked cards and call participants are framed only. Sideline tabs are flat pills; TAB is amber.

**Navigator**
- It's demo scaffolding, not product — so it's now a slim "Prototype map" at the bottom. The real product nav is the chrome row (Briefs · Text · Call · Parked), unchanged. If you later want the 8-step flow *inside* the product, the sideline is the right home (numbered tabs, like a brief with sections) — say so and I'll build that variant.

## User

Found issues — fixing…

## User

Found issues — fixing…

## User

Found issues — fixing…

## Assistant

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

## User

Found issues — fixing…

## Assistant

Root cause: a single-line 640px pill can't hold 90–110-char sentences at 19px. Fix: let the pill grow to its content (max 1000px, fits left of the sideline) and allow two lines.

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

Also drop the duplicated "TAB" meta on arrival lines.

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

## User

done by tab" istead of undo and not being sure what i just undeed better put a symbol of an eye and a check mark so it will be possible to check it out when or if needed. for that create a 5th tab named unified (workspace for all material tab did - to keep a record of them, traced, and double checked if want). also, tame TAB. its like a sprint and hard to catch. also, it doesnt open to text or reply.

## Assistant

_[tool: dc_write]_

Now Chrome gets the 5th tab, and the browser gets the Unified screen, tamed pacing, replies, and eye/check on Handoff.

_[tool: dc_js_str_replace]_

_[tool: run_script]_

_[tool: grep]_

Script failed atomically (nothing written); rerunning with that line fixed.

_[tool: run_script]_

_[tool: ready_for_verification]_

## User

Found issues — fixing…

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

## User

Found issues — fixing…

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

## User

the call page needs a hint of a video screen it can start as a rectagle on the right side under share from

## Assistant

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Added a video placeholder on the Call rail under "Share from": a dark 16:9 tile ("Northwind · waiting room, camera off until you join", amber TAB dot) with a "Join · expands to center" button. Say if you want Join wired to actually swap the video into the center and push the briefing to the rail.

## User

make sure all cta' leads to something or not at all

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

## User

why did you add unified as part of the workflow and not only as the 5th tab - like a backroom? i wish to understand the logic. i think it should not be presented like its a mendatory station to go from boot to wrap.

## Assistant

You're right. The only reason it landed in the map is that the map lists every screen for the demo — I numbered it along with the rest without thinking about what the numbering says. Numbering reads as "station on the way", and Unified isn't one: it's a backroom you go into when you want to check or reverse something, reached from the 5th tab or the eye icon. Fixing the map to say exactly that.

_[tool: run_script]_

_[tool: ready_for_verification]_

The map is back to 8 numbered stations (Boot → Wrap). Unified sits apart at the right as "BACKROOM · Unified", amber when you're in it; in the product it's only reached via the 5th chrome tab, the eye icon on Handoff, or asking TAB for the record.

## User

is it a good demo?

## Assistant

Honest read: it's a good *concept* demo, not yet a good *pitch* demo.

**What works as a demo**
- The story is one person, one morning, one open question (§4). A viewer can follow it without narration.
- TAB has one voice, one place, one color. Easy to point at: "that amber tab, that line."
- Three principles are visible, not claimed: center the one thing (pin), do/ask split (Handoff), everything traced (Unified).
- It's clickable end to end — every button does something.

**What weakens it**
- Boot and Room are two screens before the product appears. Viewers judge in the first 20 seconds; the first "aha" (the line sliding out) comes on screen 3.
- The walkthrough — the feature you care most about — is hidden behind a collapsed "Walk me through +" in the rail. In a demo, no one finds it.
- Timing depends on a live browser voice: works beautifully or hears nothing, depending on the machine. A demo can't gamble on that.
- Nothing shows the *JITAI* part: TAB intervening at the right moment. Pin is a proposal you click; nothing arrives uninvited mid-task (a stall detected, a call in 5 minutes, audio dropped → dial-in).
- Parked and Wrap are pleasant but prove nothing new; they stretch the runtime.

**What would make it good**
1. Open on Briefs with the line already sliding out; move Boot/Room to the back as "how the morning started."
2. Put the walkthrough as the first thing TAB offers in the line ("Want the three briefs — on screen, out loud?"), not a rail toggle.
3. Add one unprompted intervention: at 10:25 on Text, the line opens on its own — "Northwind in 5. I'll hold the spec where you are." That's the thesis in one moment.
4. Record the spoken track as audio files so voice is guaranteed, with live synthesis as fallback.
5. Cut the demo to Briefs → Text → interruption → Call → Handoff → Wrap. Parked becomes something TAB says, not a screen.

Want me to build the demo cut (1–3, 5) as a separate "TAB Demo" file and leave v3 as the full map?

## User

yes!!!!!! you just gace the original 4 pages unified workspace: the vip assistant, the text editor, the geeky wingman, the librarian.  that is the hero page: welcome sir, here is your day: 1, 2, 3. text editor where the person actually writes their own words and has 2-3 copies and not 20 to each client - the old version of word (me'abed tamlilim), Zoom/Meet is where TAB is the friend that gives you all the answers to the test and the 4th page is a report of the day, preperation for tomorrow, alerts that are real, extra points for added value and goodbye

## Assistant

_[tool: dc_write]_

_[tool: dc_write]_

Now the demo itself — four rooms, four personas.

_[tool: dc_write]_

_[tool: ready_for_verification]_

## User

Found issues — fixing…

## Assistant

Root cause: the line's fixed 142px band crosses the hero headline and the Call statement. Fix at the root: the line now slides in under the chrome (top 66px) and *pushes* the page content down while it's open — a co-worker leaning in, not a sticker over the headline.

_[tool: run_script]_

_[tool: ready_for_verification]_

## User

Found issues — fixing…

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

**TAB Demo** is ready — four rooms, four personas, v3 untouched as the full map.

How it runs:
1. **Day — the assistant.** Opens straight on "Good morning. Here is your day." with 1, 2, 3. TAB slides in under the chrome and *offers* the walkthrough first: out loud + on screen / on screen / I've got it. Then proposes the pin.
2. **Write — the editor.** Your copy is a real editable page (type in it). Two copies on the table, "one more at most." After ~14s TAB leans in uninvited: "Northwind in five minutes. I hold the spec here — Take me there."
3. **Call — the wingman.** Statement pinned; "If she asks · you answer" cheat sheet; Join expands the video and keeps the answers under it.
4. **Close — the librarian.** Report, tomorrow already filed, two real alerts, added value traced with check marks, goodbye.

Known caveats: voice still depends on the viewer's browser (only after they click a choice); the 14s nudge is a timer, not a real calendar. "Restart demo" at the bottom resets everything for the next viewer.

## User

brilliant work!

## Assistant

Thank you. When you're ready for the next pass, the two things I'd do first: record the walkthrough audio so voice is guaranteed on any machine, and give the Write room a third copy (Legal) so "never twenty" is shown, not told.

## User

will continue tomorrow. please remind me

## Assistant

_[tool: googlecalendar__create_event]_

_[tool: tool_search_tool_bm25]_

_[tool: snip]_

Reminder set: **Sunday 5 Oct, 09:00** (Asia/Jerusalem) — "TAB Browser — continue the demo", popup at the time plus an email an hour before. The event notes carry the file name and the three next passes (recorded audio, third Legal copy, v3 vs demo review). Good night.

