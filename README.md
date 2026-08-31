# Citronauts Escape — Mission Control

Mars-themed escape room webapp for EE Week at UCF. Citronaut is stranded on
Mars; the group completes 4 tasks (3 physical engineering stations + 1 coding
station), each yielding a number. Once all 4 are in, the Mission Display shows
a cipher built from those numbers that the group decodes by hand to recover
the launch password (**GO KNIGHT**) and launch the rocket.

Two synchronized views run in the same browser on one laptop, plus a third,
fully standalone laptop for the coding task:

| Route / folder | Who sees it | Purpose |
| --- | --- | --- |
| `/display` | **Projected** for the group | Story, mission clock, ship status, hints, animations |
| `/control` | **Facilitator only** (laptop screen) | Enter task results, run the clock, authorize launch |
| [`diagnostics-station/`](diagnostics-station/) | **Task 4 station laptop** | Standalone Python file the group debugs to get their 4th code |

The views sync in real time via `BroadcastChannel` (with a `localStorage`
`storage`-event fallback) — no backend, no internet needed at runtime. State is
also persisted to `localStorage`, so an accidental refresh mid-game recovers.

## Quick start

```bash
npm install     # once, needs internet
npm run dev     # http://localhost:5173
```

Open `http://localhost:5173` — the boot menu opens both windows for you. Drag
the Mission Display to the projector and press **F11** for fullscreen. Run the
whole game from the Control Panel.

### Event day (offline-safe)

Build once while you still have internet, then serve the static build:

```bash
npm run build
npm run preview   # serves dist/ at http://localhost:5173, no internet needed
```

Hash routes also work if you ever serve `dist/` with a dumb static server:
`/#/display` and `/#/control`.

## Changing puzzle answers / password

Everything editable lives in **`src/config.js`** — one commented object:

- `timerMinutes` — mission clock length (default 25:00)
- `finalPassword` — the word the final cipher decodes to (checked ignoring
  case and spaces)
- per task: `correctAnswer` (the REAL value the physical puzzle yields — can
  be anything: a whole code, an ohm reading, a weight in grams, not just
  1/2/3), `tolerance` (± range counted as correct, 0 = exact match), `unit`
  (shown next to the input, e.g. `'Ω'`, `'g'`), `letterPair` (the fixed two
  letters that task always contributes to the password once solved),
  `cipherDigit` (see below), and `hints` (see further down)
- all story/flavor text

`correctAnswer` is checked with `Math.abs(reported - correctAnswer) <=
tolerance` — a task with `correctAnswer: null` (Task 1, as of writing, still
TBD) can never be marked correct and shows a warning on the Control Panel
until you fill it in.

## The final cipher (Task 5, effectively)

The Mission Display never shows the password directly. Once all 4 systems are
online, it shows the group each task's `cipherDigit` (in task order) next to
a scrambled "authorization signal" — `finalPassword` run through a Caesar
shift keyed by those four digits. The group shifts each ciphertext letter
**backward** by the matching digit (repeating the 4-digit key) to spell out
the real password by hand — a quick cryptography puzzle that ties the whole
game together. `cipherDigit` is deliberately a small, fixed, hand-computable
1-9 number that's independent of `correctAnswer` — a real measurement like
2000Ω or 27.933g isn't a usable shift key, so each task carries its own
separate digit for this purpose, awarded automatically once the facilitator
confirms the measurement is within tolerance. This is all computed from
`cipherDigit` + `finalPassword`; you never hand-write the ciphertext. The
Control Panel still shows the plain decoded `letterPair`s, but only to the
facilitator, as an answer key for verifying what the group reports.

## Citronaut hints

Each task in `config.js` has a `hints` array of 3 strings (gentle → gentle →
near-answer). After the group's 1st, 2nd, and 3rd+ wrong submission on a task,
a persistent Citronaut speech bubble appears on the Mission Display with that
tier's hint — it does not time out, and stays up until the task is solved.
Only the diagnostics task's hints are tuned to the actual bug shipped in
`diagnostics-station/life_support.py`; the other three are placeholders you
should rewrite to match your actual physical puzzles.

## Task 4 — diagnostics station (separate laptop)

Task 4 is a coding/debugging puzzle, not a number-entry task like the others.
Set up a **third laptop** running only [`diagnostics-station/life_support.py`]
(diagnostics-station/README.md) — a single standalone Python file with one
intentional bug (a flipped comparison operator). The group edits and re-runs
it until it prints a `DIAGNOSTIC CODE`, which they report to you like any
other task. See [`diagnostics-station/README.md`](diagnostics-station/README.md)
for setup and how to re-break it between groups.

## Running a group (facilitator flow)

1. **Reset for Next Group** (if not fresh) — clears tasks and the clock; also
   re-break `life_support.py` on the diagnostics laptop if it's still fixed
   from the last group. This also returns the Mission Display to the idle
   surface-cam screen (see below).
2. Between groups, the Mission Display idles on a looping "surface cam" of
   the Mars landscape — rover trundling around, habitat with a greenhouse
   and scanning dish, rocket idling with steam on its pad — with an "ALL
   SYSTEMS NOMINAL" status. Nothing has gone wrong yet. Also set a **Group
   Name** in the Control Panel any time before launch — it's recorded onto
   the leaderboard entry created when this group launches. When the next
   group is ready, hit **START** — this plays Citronaut's distress call
   (the MAYDAY transmission explaining the rocket failure and the
   Bethune-Cookman kickoff deadline).
3. Once the group has heard the transmission, hit **Begin Mission** — display
   leaves the story screen; clock starts (25:00).
4. As the group finishes each task, type the number they report into that
   task's card and **Submit**. Correct → the ship system powers up on the
   display; wrong → brief "repair failed" flicker plus a persistent Citronaut
   hint that gets more direct on repeated wrong answers. Typo? Hit **undo** on
   the card (hint progress is preserved).
5. When all 4 are online the display shows the cipher puzzle. The group works
   out the password and tells you; enter it in the Control Panel. Wrong →
   "ACCESS DENIED" flash (retriable). Right → the launch sequence plays: a
   10-second countdown right on the Mars pad, liftoff (the ground recedes
   into starfield as the "camera" follows the ship up), a brief deep-space
   beat as the ship dwindles toward a distant Earth, then the success
   screen — which also records this group's time onto the leaderboard.

Timer Start / Pause / Reset controls are always available in the control bar.

## Leaderboard

Every successful launch is recorded — group name + total mission time —
to a leaderboard that's shown on the success screen (fastest time first,
with the just-launched group highlighted) and managed from the Control
Panel. It's stored separately from game state, so **it survives "Reset for
Next Group"** and accumulates across the whole event. From the Control
Panel you can rename any entry inline (fixes typos, or catches up a group
that forgot to set their name before launching) or delete one outright —
useful for clearing out test runs before doors open. There's also a
"clear entire leaderboard" option for a full wipe, gated behind a
confirmation.

TASK ANSWERS:

TASK 1: 5 lbs +/- 0.5 lbs

TASK 2: 2000 Ohms

TASK 3: 27.933g +/- 1g

TASK 4: 3