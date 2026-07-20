# Citronauts Escape — Mission Control

Mars-themed escape room webapp for EE Week at UCF. Citronaut is stranded on
Mars; the group completes 4 physical engineering tasks, each yielding a number
that decodes to letters, assembling the launch password (**GO KNIGHT**) that
launches the rocket.

Two synchronized views run in the same browser on one laptop:

| Route | Who sees it | Purpose |
| --- | --- | --- |
| `/display` | **Projected** for the group | Story, mission clock, ship status, animations |
| `/control` | **Facilitator only** (laptop screen) | Enter task results, run the clock, authorize launch |

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
- `finalPassword` — checked ignoring case and spaces
- per task: `correctAnswer` (the number the physical puzzle yields) and
  `decode` (number → two-letter pair shown on screen)
- all story/flavor text

Each task's number decodes to a **two-letter pair**; the four correct pairs in
task order assemble the password: `GO` + `KN` + `IG` + `HT` → "GO KNIGHT". The
design doc only specified the first letter of the decoy pairs, so the decoys'
second letters in the config are placeholders — match them to your printed
decode cards.

## Running a group (facilitator flow)

1. **Reset for Next Group** (if not fresh) — clears tasks and the clock.
2. **Begin Mission** — display leaves the story screen; clock starts (25:00).
3. As the group finishes each physical task, type the number they report into
   that task's card and **Submit**. Correct → the ship system powers up on the
   display; wrong → brief "repair failed" flicker, retry any time. Typo? Hit
   **undo** on the card.
4. When all 4 are online the display shows the collected letters and asks for
   the launch password. The group tells you the password; enter it in the
   Control Panel. Wrong → "ACCESS DENIED" flash (retriable). Right → 10-second
   launch countdown, liftoff, success screen.

Timer Start / Pause / Reset controls are always available in the control bar.
