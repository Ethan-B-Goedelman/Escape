// ============================================================================
// CITRONAUTS ESCAPE — GAME CONFIGURATION
// ============================================================================
// EVERYTHING about the puzzles lives in this one file. Before the event you
// can safely change:
//   - timerMinutes          (mission clock length)
//   - finalPassword         (the launch password the letters spell)
//   - each task's correctAnswer (the number the physical puzzle yields)
//   - each task's decode legend  (number -> letter pair shown on screen)
//   - all names / story / flavor text
// Nothing else in the app hardcodes answers.
//
// HOW THE DECODE WORKS
// Each task yields a number (1–3). Each number decodes to a TWO-LETTER pair.
// The four correct pairs, in task order, assemble the launch password:
//   Task 1 -> "GO", Task 2 -> "KN", Task 3 -> "IG", Task 4 -> "HT"
//   => "GO" + "KN" + "IG" + "HT" = "GO KNIGHT"
// The design doc only specified the FIRST letter of each decoy pair
// (e.g. Task 2: 1=K, 2=A, 3=P) — the second letters of the WRONG pairs
// below are placeholders. Change them to whatever your printed decode
// cards actually say.
//
// Password checking ignores spaces and capitalization ("goknight" works).
// ============================================================================

export const CONFIG = {
  // Mission clock, in minutes.
  timerMinutes: 25,

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
      description: 'PVC pipe maze. Team reports the fuel tank weight code.',
      correctAnswer: 2, // 2 -> "GO"
      decode: { 1: 'HI', 2: 'GO', 3: 'NO' },
      onlineMessage: 'FUEL LINES RESTORED — PROPELLANT FLOW NOMINAL',
      fx: 'fuel', // completion animation: fuel | electric | injector | diagnostics
    },
    {
      id: 'electrical',
      system: 'ELECTRICAL',
      name: 'Task 2 — Electrical Circuit Restoration',
      description: 'Circuit repair. Team reports the measured resistance code (ohms).',
      correctAnswer: 1, // 1 -> "KN"
      decode: { 1: 'KN', 2: 'AB', 3: 'PL' }, // decoy 2nd letters are placeholders
      onlineMessage: 'ELECTRICAL BUS ONLINE — POWER AT 100%',
      fx: 'electric',
    },
    {
      id: 'injector',
      system: 'FUEL INJECTOR',
      name: 'Task 3 — Fuel Injector Verification',
      description: 'CAD / SolidWorks model. Team reports the injector weight code.',
      correctAnswer: 3, // 3 -> "IG"
      decode: { 1: 'AC', 2: 'FU', 3: 'IG' }, // decoy 2nd letters are placeholders
      onlineMessage: 'FUEL INJECTOR VERIFIED — PRESSURE NOMINAL',
      fx: 'injector',
    },
    {
      id: 'diagnostics',
      system: 'DIAGNOSTICS',
      name: 'Task 4 — System Diagnostics',
      description: 'Debug task. Team reports the diagnostic result code.',
      correctAnswer: 3, // 3 -> "HT"
      decode: { 1: 'CT', 2: 'DR', 3: 'HT' }, // decoy 2nd letters are placeholders
      onlineMessage: 'DIAGNOSTICS COMPLETE — ALL SYSTEMS GREEN',
      fx: 'diagnostics',
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
    intro: [
      'MAYDAY. MAYDAY. This is Citronaut, transmitting from Ares Basin, Mars.',
      'A cascading systems failure has knocked out propulsion and electrical power aboard my rocket. Launch window closes in 25 minutes.',
      'If I miss it, I miss kickoff at the Bounce House — and Citronaut does NOT miss kickoff.',
      'You are my ground crew. Restore all four ship systems, recover the launch authorization code, and get me off this rock.',
    ],
    awaiting: 'AWAITING MISSION START — STAND BY',
    activeHint: 'COMPLETE THE ENGINEERING TASKS TO BRING SHIP SYSTEMS ONLINE',
    finalTitle: 'FINAL LAUNCH AUTHORIZATION',
    finalHint: 'REPORT THE LAUNCH PASSWORD TO MISSION CONTROL',
    denied: 'ACCESS DENIED — INVALID AUTHORIZATION CODE',
    successTitle: 'CITRONAUT IS GO FOR LAUNCH',
    successSub: 'SEE YOU AT KICKOFF — GO KNIGHTS! CHARGE ON! ⚡',
    timeExpired: 'MISSION CLOCK EXPIRED — LAUNCH WINDOW CLOSING',
  },
};
