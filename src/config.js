// ============================================================================
// CITRONAUTS ESCAPE — GAME CONFIGURATION
// ============================================================================
// EVERYTHING about the puzzles lives in this one file. Before the event you
// can safely change:
//   - timerMinutes          (mission clock length)
//   - finalPassword         (the launch password the final cipher decodes to)
//   - each task's correctAnswer (the real measured value the puzzle yields —
//     can be any number: a whole code, ohms, grams, whatever)
//   - each task's tolerance     (+/- range counted as correct; 0 = exact)
//   - each task's unit          (shown next to the input, e.g. 'Ω', 'g')
//   - each task's letterPair    (the fixed two letters that task contributes
//     to the password — see "HOW THE DECODE WORKS" below)
//   - each task's cipherDigit   (the fixed 1-9 shift digit that task
//     contributes to the final cipher — see "HOW THE FINAL CIPHER WORKS")
//   - each task's hints          (gentle -> gentle -> obvious, shown by Citronaut)
//   - all names / story / flavor text
// Nothing else in the app hardcodes answers.
//
// HOW THE DECODE WORKS
// Each task's `correctAnswer` is the REAL value the physical puzzle yields —
// it can be anything (an ohm reading, a weight, a whole-number code) and is
// checked with `tolerance` (0 = exact match). This value is NOT used to look
// anything up — each task instead has a fixed `letterPair` it always
// contributes once solved. In task order those four pairs assemble the
// launch password: Task 1 -> "GO", Task 2 -> "KN", Task 3 -> "IG",
// Task 4 -> "HT" => "GO" + "KN" + "IG" + "HT" = "GO KNIGHT".
//
// Password checking ignores spaces and capitalization ("goknight" works).
//
// HOW THE FINAL CIPHER WORKS
// The Mission Display does NOT reveal the password directly. Once all 4
// systems are online, it shows the four tasks' `cipherDigit` values (fixed,
// small, single-digit — NOT the raw measured correctAnswer, which is often
// too large/decimal to use as a hand-computable shift) as a repeating shift
// key, plus `finalPassword` run through a Caesar shift using that key as
// ciphertext. The team shifts each ciphertext letter BACKWARD by the
// matching key digit (repeating the 4-digit key) to recover the real
// password by hand. This is computed automatically from cipherDigit +
// finalPassword — you never need to hand-write the ciphertext. Because
// cipherDigit is independent of correctAnswer, the team doesn't need to
// notice or derive anything extra from their measurement — the code is
// simply awarded once the facilitator confirms it's within tolerance.
//
// HOW HINTS WORK
// Each task has a `hints` array of exactly 3 strings: shown by a persistent
// Citronaut speech bubble on the Mission Display after the team's 1st, 2nd,
// and 3rd+ wrong submission for that task. Hint 1-2 should be gentle nudges;
// hint 3 should all but hand them the answer. The hint stays on screen (no
// timeout) until that task is solved or a different task's wrong answer
// takes priority.
// ============================================================================

// Pulled out so the intro dialogue below can reference it directly instead
// of hardcoding a number that could drift out of sync.
const TIMER_MINUTES = 25;

export const CONFIG = {
  // Mission clock, in minutes.
  timerMinutes: TIMER_MINUTES,

  // When the facilitator hits "Begin Mission", also start the clock.
  autoStartTimerOnBegin: true,

  // The final launch password. Compared ignoring case/spaces.
  finalPassword: 'GO KNIGHT',

  // The four engineering tasks, in the order their letters assemble.
  tasks: [
    {
      id: 'fuel',
      system: 'FUEL LINES', // label on the Mission Display status panel
      name: 'Task 1 — Fuel System Recovery',
      description: 'PVC pipe maze. Team reports the fuel tank weight.',
      correctAnswer: 5,
      tolerance: 0.5, // accepts 4.5–5.5 lbs
      unit: 'lb',
      letterPair: 'GO',
      cipherDigit: 2,
      onlineMessage: 'FUEL LINES RESTORED — PROPELLANT FLOW NOMINAL',
      fx: 'fuel', // completion animation: fuel | electric | injector | diagnostics
      // PLACEHOLDER — edit to match your actual pipe maze puzzle.
      hints: [
        'Citronaut says: Double-check every joint in the fuel line — one connector might be feeding the wrong path, and that changes how much ends up in the tank.',
        'Citronaut says: Trace the run from the tank backward, one section at a time, then weigh the tank on the scale — report it in pounds.',
        'Citronaut says: Once the maze is fully connected, the tank should weigh close to 5 lbs. Way off that? Recheck the last junction before the tank.',
      ],
    },
    {
      id: 'electrical',
      system: 'ELECTRICAL',
      name: 'Task 2 — Electrical Circuit Restoration',
      description: 'Circuit repair. Team reports the measured resistance.',
      correctAnswer: 2000,
      tolerance: 0,
      unit: 'Ω',
      letterPair: 'KN',
      cipherDigit: 1,
      onlineMessage: 'ELECTRICAL BUS ONLINE — POWER AT 100%',
      fx: 'electric',
      // PLACEHOLDER — edit to match your actual circuit puzzle.
      hints: [
        'Citronaut says: Check your connections before you check your math — a loose lead throws the whole reading off.',
        'Citronaut says: Recount which resistors are in series versus parallel here — that changes which formula you need.',
        'Citronaut says: Measure straight across the two marked test points with your multimeter set to ohms — you should land right around 2000Ω.',
      ],
    },
    {
      id: 'injector',
      system: 'FUEL INJECTOR',
      name: 'Task 3 — Fuel Injector Verification',
      description: 'CAD / SolidWorks model. Team reports the injector weight.',
      correctAnswer: 27.933,
      tolerance: 1, // accepts 26.933–28.933
      unit: 'g',
      letterPair: 'IG',
      cipherDigit: 3,
      onlineMessage: 'FUEL INJECTOR VERIFIED — PRESSURE NOMINAL',
      fx: 'injector',
      // PLACEHOLDER — edit to match your actual CAD assembly puzzle.
      hints: [
        "Citronaut says: Not every part in that assembly is the one you're supposed to weigh — check the part list again.",
        'Citronaut says: Make sure you are reading the mass of the FINAL, fully-assembled injector body, not a sub-component, and that your units are set to grams.',
        'Citronaut says: Open Mass Properties on the completed assembly (not a single part) — it should come out close to 27.9 grams.',
      ],
    },
    {
      id: 'diagnostics',
      system: 'DIAGNOSTICS',
      name: 'Task 4 — System Diagnostics',
      description:
        'Debug task at the diagnostics laptop. Fix the bug in life_support.py, run it, and report the code it prints.',
      // MUST match what the fixed diagnostics-station/life_support.py
      // actually prints — it's computed (vent_count), not a literal
      // constant in that file, so verify by running it rather than
      // assuming this number is still right after editing the script.
      correctAnswer: 3,
      tolerance: 0,
      unit: '',
      letterPair: 'HT',
      cipherDigit: 3,
      onlineMessage: 'DIAGNOSTICS COMPLETE — ALL SYSTEMS GREEN',
      fx: 'diagnostics',
      hints: [
        'Citronaut says: Run life_support.py first and read what it prints — it will tell you exactly what kind of fault this is.',
        "Citronaut says: The bug is inside check_co2(). Read the comparison out loud — does it vent when CO2 is HIGH, or when it's low?",
        "Citronaut says: That comparison is backward. Change '<' to '>' in check_co2(), save the file, and run it again.",
      ],
    },
  ],

  // Story / flavor text shown on the Mission Display.
  story: {
    title: 'CITRONAUTS ESCAPE',
    subtitle: 'UCF EE WEEK · MARS EMERGENCY RESPONSE',
    org: 'UNIVERSITY OF CENTRAL FLORIDA · KNIGHTS MISSION CONTROL',
    // Scrolling telemetry ticker along the bottom of the mission display.
    ticker: [
      'KNIGHTS MISSION CONTROL — LINK NOMINAL',
      'CHARGE ON',
      'BOUNCE HOUSE KICKOFF ETA 25:00',
      'ARES BASIN WEATHER: DUSTY, -63°C',
      'GO KNIGHTS',
      'EE WEEK · COLLEGE OF ENGINEERING & COMPUTER SCIENCE',
      'PROPELLANT RESERVE 12%',
      'PEGASUS UPLINK STANDING BY',
    ],
    // Played as a red-alert flash, then a back-and-forth of holographic
    // message bubbles OVER the still-running live feed (Mission Display
    // never cuts away from it) — see TransmissionScreen in
    // MissionDisplay.jsx. `from` is 'citronaut' or 'command'.
    alertBanner: 'PRIORITY TRANSMISSION INCOMING',
    transmissionStatus: 'SIGNAL DEGRADED — RELAY IN PROGRESS',
    commandName: 'MISSION CONTROL',
    citronautName: 'CITRONAUT',
    introConversation: [
      { from: 'citronaut', text: 'MAYDAY. MAYDAY. This is Citronaut, transmitting from Ares Basin, Mars.' },
      { from: 'command', text: 'Copy that, Citronaut. Knights Mission Control reads you loud and clear. Report your status.' },
      {
        from: 'citronaut',
        text: `A cascading systems failure has knocked out propulsion and electrical power aboard my rocket. Launch window closes in ${TIMER_MINUTES} minutes.`,
      },
      { from: 'command', text: "Copy. We've got an excellent team of engineers standing by to help you out, Citronaut." },
      {
        from: 'citronaut',
        text: 'If I miss it, I miss kickoff at the Bounce House against Bethune-Cookman — the season opener — and Citronaut does NOT miss kickoff.',
      },
      { from: 'command', text: "Then let's get you off that rock. Ground crew — you are GO to assist." },
      { from: 'citronaut', text: 'You are my ground crew. Restore all four ship systems, recover the launch authorization code, and get me off this rock.' },
      { from: 'command', text: 'Copy that. Standing by for system restoration. Good luck, Knights.' },
    ],
    awaiting: 'AWAITING MISSION START — STAND BY',
    // Pre-mission "surface cam" idle screen (shown before the facilitator
    // hits START — everything is calm, nothing has gone wrong yet). Kept
    // deliberately light on chrome: a live feed with small HUD readouts and
    // a rotating log ticker, not a title card.
    idleTag: 'LIVE — ARES BASIN SURFACE CAM',
    idleStatus: 'ALL SYSTEMS NOMINAL',
    idleStandby: 'STANDING BY — AWAITING MISSION START',
    // Rotates through the bottom ticker on the idle screen only — short,
    // in-character log lines/comments from Citronaut. Edit freely.
    idleLog: [
      'CITRONAUT LOG 06:41 — solar arrays at 94%, dust accumulation nominal.',
      'CITRONAUT LOG 07:03 — rover diagnostics green, nothing to report.',
      'CITRONAUT LOG 07:55 — still no word on the season opener. Somebody update me.',
      'CITRONAUT LOG 08:12 — habitat pressure steady. Coffee reserves: concerning.',
      'CITRONAUT LOG 08:44 — surface winds light, visibility excellent today.',
      'CITRONAUT LOG 09:10 — rover completed its loop. Good rover.',
    ],
    activeHint: 'COMPLETE THE ENGINEERING TASKS TO BRING SHIP SYSTEMS ONLINE',
    finalTitle: 'FINAL LAUNCH AUTHORIZATION',
    finalSubtitle: 'CIPHER LOCK ENGAGED',
    codesLabel: 'RECOVERED CODES · YOUR SHIFT KEY',
    cipherLabel: 'ENCRYPTED AUTHORIZATION SIGNAL',
    cipherInstruction:
      'Citronaut says: The signal above is scrambled. Shift each letter BACKWARD through the alphabet by your recovered codes, in order, repeating the sequence — that spells the launch password.',
    finalHint: 'REPORT THE LAUNCH PASSWORD TO MISSION CONTROL',
    denied: 'ACCESS DENIED — INVALID AUTHORIZATION CODE',
    // Shown by Citronaut on the task-completion animation, indexed by how
    // many systems are online after that success (1st, 2nd, 3rd, 4th).
    praise: [
      'Nice work, ground crew — first system online! Citronaut can feel it already.',
      'Two systems green! You’re on a roll down there.',
      'Three online! Citronaut is already loosening the launch straps.',
      'ALL FOUR SYSTEMS GREEN! Citronaut is doing a happy dance in the cockpit.',
    ],
    // Shown during the deep-space transit beat, after liftoff clears the
    // Mars sky and before the success screen.
    enRoute: 'EN ROUTE TO EARTH — SEE YOU AT KICKOFF',
    successTitle: 'CITRONAUT IS GO FOR LAUNCH',
    successSub: 'SEE YOU AT KICKOFF — GO KNIGHTS! CHARGE ON! ⚡',
    timeExpired: 'MISSION CLOCK EXPIRED — LAUNCH WINDOW CLOSING',
  },
};
