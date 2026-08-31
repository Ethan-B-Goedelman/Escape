import React, { useEffect, useRef } from 'react';
import { CONFIG } from './config.js';
import {
  useGameState,
  remainingMs,
  formatClock,
  onlineCount,
  taskConfig,
  currentHint,
  finalCipherLetters,
  useLeaderboard,
  sortedLeaderboard,
} from './store.js';
import { useNow } from './hooks.js';
import Citronaut, { CitronautFace } from './Citronaut.jsx';
import FXOverlay from './fx.jsx';
import MarsScene from './MarsScene.jsx';
import { sfx } from './sound.js';

const EVENT_BANNER_MS = 5000;
const DENIED_MS = 3000;

// Launch sequence timeline (ms since launchAt)
const T_COUNTDOWN_START = 2500;
const T_LIFTOFF = T_COUNTDOWN_START + 10000; // after 10..1
const T_ASCEND_END = T_LIFTOFF + 4200; // rocket clears the Mars sky, ground recedes into starfield
const T_SPACE_END = T_ASCEND_END + 4500; // ship crosses deep space toward Earth
const T_SUCCESS = T_SPACE_END;

function Rocket({ launched }) {
  return (
    <svg className={`rocket ${launched ? 'rocket-launched' : ''}`} viewBox="0 0 120 260" aria-hidden="true">
      <g className="rocket-body">
        {/* nose */}
        <path d="M60 10 C 72 34, 78 54, 78 78 L 42 78 C 42 54, 48 34, 60 10 Z" fill="#c8ccd4" />
        {/* body */}
        <rect x="42" y="78" width="36" height="92" rx="4" fill="#e8eaee" />
        {/* porthole with Citronaut looking out */}
        <circle cx="60" cy="104" r="11" fill="#0b1420" stroke="#ffc904" strokeWidth="3" />
        <g transform="translate(50.5 94.5)">
          <CitronautFace size={19} />
        </g>
        <rect x="42" y="140" width="36" height="8" fill="#ffc904" />
        {/* fins */}
        <path d="M42 150 L 20 190 L 42 182 Z" fill="#b8410e" />
        <path d="M78 150 L 100 190 L 78 182 Z" fill="#b8410e" />
        {/* nozzle */}
        <path d="M50 170 L 46 184 L 74 184 L 70 170 Z" fill="#8a8f99" />
        {/* flame (visible when launched) */}
        <g className="rocket-flame">
          <path d="M52 186 C 52 210, 60 226, 60 240 C 60 226, 68 210, 68 186 Z" fill="#ffc904" />
          <path d="M56 186 C 56 202, 60 212, 60 222 C 60 212, 64 202, 64 186 Z" fill="#fff3d6" />
        </g>
      </g>
    </svg>
  );
}

// Small simplified rocket icon for the deep-space transit beat — a
// separate, lighter component rather than reusing <Rocket> so its CSS
// animation (flying toward Earth) doesn't collide with <Rocket>'s own
// launch-ascend animation.
function TransitRocket() {
  return (
    <svg viewBox="0 0 30 60" className="transit-rocket-svg" aria-hidden="true">
      <path d="M15 2 C 19 8, 21 14, 21 20 L 9 20 C 9 14, 11 8, 15 2 Z" fill="#e8eaee" />
      <rect x="9" y="20" width="12" height="20" fill="#c8ccd4" />
      <path d="M9 40 L4 50 L9 46 Z" fill="#b8410e" />
      <path d="M21 40 L26 50 L21 46 Z" fill="#b8410e" />
      <path d="M12 44 C 12 51, 15 55, 15 59 C 15 55, 18 51, 18 44 Z" fill="#ffc904" />
    </svg>
  );
}

// Leaderboard shown on the success screen — fastest time first, with the
// crew that just launched highlighted.
function MissionLeaderboard({ highlightId }) {
  const lb = useLeaderboard();
  const sorted = sortedLeaderboard(lb).slice(0, 8);
  if (sorted.length === 0) return null;
  return (
    <div className="mission-leaderboard hud-panel">
      <div className="section-title">LEADERBOARD</div>
      <div className="lb-display-list">
        {sorted.map((entry, i) => (
          <div
            key={entry.id}
            className={`lb-display-row ${entry.id === highlightId ? 'lb-display-you' : ''}`}
          >
            <span className="lb-display-rank">#{i + 1}</span>
            <span className="lb-display-name">{entry.name}</span>
            <span className="lb-display-time">{formatClock(entry.timeUsedMs)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Deterministic pseudo-random telemetry that drifts about once a second —
// pure flavor, keeps the display feeling like a live console.
function tv(bucket, i, min, max, dec = 0) {
  const x = Math.abs(Math.sin(bucket * 7.13 + i * 13.7)) * (max - min) + min;
  return x.toFixed(dec);
}
function TelemetryRow({ now }) {
  const b = Math.floor(now / 900);
  const items = [
    ['PWR', `${tv(b, 1, 91, 99)}%`],
    ['O2', `${tv(b, 2, 95, 99)}%`],
    ['HULL', `-${tv(b, 3, 58, 64)}°C`],
    ['SIG', `${tv(b, 4, 72, 88)}dB`],
    ['VIB', `${tv(b, 5, 0.2, 0.9, 2)}g`],
  ];
  return (
    <div className="telemetry">
      {items.map(([k, v]) => (
        <span key={k} className="tele-item">
          <span className="tele-k">{k}</span> {v}
        </span>
      ))}
      <span className="tele-link">▮ TELEMETRY LINK ACTIVE</span>
    </div>
  );
}

function Ticker({ items }) {
  const text = (items ?? CONFIG.story.ticker).join('  ▸  ');
  return (
    <div className="ticker">
      <div className="ticker-inner">
        <span>{text}&nbsp;&nbsp;▸&nbsp;&nbsp;</span>
        <span>{text}&nbsp;&nbsp;▸&nbsp;&nbsp;</span>
      </div>
    </div>
  );
}

// Where each system lives on the ship, left (tail) to right (nose) — used
// both for the callout's horizontal position and which icon/side it gets.
// injector sits by the engines it feeds, fuel is the tank behind it,
// electrical is the mid-body conduit run, diagnostics is the nose/cockpit
// computer core, right where Citronaut is already drawn looking out.
const ROCKET_ZONES = [
  { id: 'injector', cx: 315, side: 'top', icon: '🔥' },
  { id: 'fuel', cx: 445, side: 'bottom', icon: '⛽' },
  { id: 'electrical', cx: 575, side: 'top', icon: '⚡' },
  { id: 'diagnostics', cx: 705, side: 'bottom', icon: '🖥' },
];

function RocketCallout({ zone, state, justChangedType }) {
  const cfg = taskConfig(zone.id);
  const st = state.tasks[zone.id];
  const online = st.status === 'correct';
  const cls = [
    'rocket-callout',
    zone.side,
    online ? 'callout-online' : 'callout-offline',
    justChangedType === 'task-online' ? 'callout-just-online' : '',
    justChangedType === 'task-failed' ? 'callout-just-failed' : '',
  ].join(' ');
  return (
    <div className={cls} style={{ left: `${zone.cx / 10}%` }}>
      <div className="rocket-callout-name">{cfg.system}</div>
      <div className={`rocket-callout-status ${online ? '' : 'glitch'}`} data-text={online ? 'ONLINE' : 'OFFLINE'}>
        {online ? 'ONLINE' : 'OFFLINE'}
      </div>
      <div className="rocket-callout-readout">
        {online ? `${st.value}${cfg.unit} → ${cfg.letterPair}` : 'AWAITING REPAIR'}
      </div>
    </div>
  );
}

const ZONE_RIVET_OFFSETS = [
  [10, 10],
  [104, 10],
  [10, 74],
  [104, 74],
];

// Wide cutaway rocket the four systems actually live on, instead of four
// generic boxes. Nose (with Citronaut still visible in the porthole) faces
// right toward the diagnostics/cockpit zone; engines are on the left, fed
// by the injector zone right beside them. Colors match the launch-sequence
// <Rocket> exactly (nose/body/band/fin/nozzle) — same ship, so it should
// read as the same ship. Engine glow builds with onlineCount so the ship
// visibly "comes alive" as more systems are restored.
function RocketDiagram({ state, now }) {
  const ev = state.lastEvent;
  const evFresh = ev && now - ev.at < EVENT_BANNER_MS;
  const online = onlineCount(state);
  const zoneClass = (id) => (state.tasks[id].status === 'correct' ? 'zone-online' : 'zone-offline');
  const zoneJustType = (id) => (evFresh && ev.taskId === id ? ev.type : null);

  return (
    <div className="rocket-diagram">
      {/* svg and the HTML callouts below share this exact box (both use the
          same 1000x300 coordinate space) so percentage-positioned callouts
          always line up with the SVG geometry regardless of render size */}
      <div className="rocket-diagram-inner">
        <svg viewBox="0 0 1000 300" className="rocket-diagram-svg" aria-hidden="true">
          {ROCKET_ZONES.map((z) => (
            <line
              key={z.id}
              className={`rocket-leader ${zoneClass(z.id)}`}
              x1={z.cx}
              y1={z.side === 'top' ? 98 : 190}
              x2={z.cx}
              y2={z.side === 'top' ? 54 : 236}
            />
          ))}

          {/* engine nozzles + idle-to-roaring glow, tied to how many systems are back */}
          <path d="M250 98 L188 110 L188 146 L250 138 Z" className="rocket-nozzle" />
          <path d="M250 142 L188 154 L188 190 L250 182 Z" className="rocket-nozzle" />
          <g className={`rocket-engine-flame flame-level-${online}`}>
            <ellipse cx="180" cy="128" rx="13" ry="9" />
            <ellipse cx="180" cy="160" rx="13" ry="9" />
          </g>

          {/* fins — rust orange, matching the launch rocket's fins exactly */}
          <path d="M300 96 L 252 54 L 372 96 Z" className="rocket-fin" />
          <path d="M300 184 L 252 226 L 372 184 Z" className="rocket-fin" />

          {/* body */}
          <rect x="250" y="90" width="520" height="100" rx="18" className="rocket-body-hull" />
          <rect x="694" y="90" width="16" height="100" className="rocket-band" />

          {/* nose, with the porthole + Citronaut exactly as in the launch sequence */}
          <path d="M770 90 C 850 90, 920 110, 920 140 C 920 170, 850 190, 770 190 Z" className="rocket-nose-hull" />
          <circle cx="822" cy="140" r="18" className="rocket-porthole" />
          <g transform="translate(807.5 125.5)">
            <CitronautFace size={29} />
          </g>
          <circle cx="895" cy="120" r="3.2" className="rocket-nav-light red" />
          <circle cx="895" cy="160" r="3.2" className="rocket-nav-light green" />

          {/* zone panels */}
          {ROCKET_ZONES.map((z) => {
            const justType = zoneJustType(z.id);
            return (
              <g
                key={z.id}
                className={[
                  'rocket-zone',
                  zoneClass(z.id),
                  justType === 'task-online' ? 'zone-just-online' : '',
                  justType === 'task-failed' ? 'zone-just-failed' : '',
                ].join(' ')}
              >
                <rect x={z.cx - 57} y="98" width="114" height="84" rx="8" className="rocket-zone-panel" />
                <rect x={z.cx - 57} y="98" width="20" height="84" className="rocket-zone-shine" />
                {ZONE_RIVET_OFFSETS.map(([dx, dy]) => (
                  <circle key={`${dx}-${dy}`} cx={z.cx - 57 + dx} cy={98 + dy} r="2" className="rocket-zone-rivet" />
                ))}
                <text x={z.cx} y="146" textAnchor="middle" className="rocket-zone-icon">{z.icon}</text>
                {justType === 'task-online' && (
                  <rect x={z.cx - 57} y="98" width="114" height="84" rx="8" className="rocket-zone-flash" />
                )}
              </g>
            );
          })}
        </svg>
        {ROCKET_ZONES.map((z) => (
          <RocketCallout
            key={z.id}
            zone={z}
            state={state}
            justChangedType={zoneJustType(z.id)}
          />
        ))}
      </div>
    </div>
  );
}

// Persistent Citronaut hint bubble — stays on screen (no timeout) as long as
// its task remains unsolved, escalating from a gentle nudge to a near-answer
// after the 3rd wrong attempt. Swaps to whichever task most recently failed.
function HintBubble({ state }) {
  const hint = currentHint(state);
  if (!hint) return null;
  return (
    <div className={`hint-bubble hint-level-${hint.level}`}>
      <Citronaut size={68} className="hint-mascot citro-bob" />
      <div className="hint-speech">
        <div className="hint-speech-tail" />
        <div className="hint-speech-label">CITRONAUT · {hint.task.system}</div>
        <div className="hint-speech-text">{hint.text}</div>
      </div>
    </div>
  );
}

// Pre-mission "surface cam" idle screen — calm, looping, nothing wrong yet.
// Deliberately light on chrome: it's meant to read as a live camera feed
// with small HUD readouts, not a title card. Shown until the facilitator
// hits START, which plays Citronaut's distress call (IntroScreen).
function IdleScreen({ now }) {
  const s = CONFIG.story;
  return (
    <div className="disp-idle">
      <MarsScene />
      <div className="idle-live-tag">
        <span className="idle-dot" /> {s.idleTag}
      </div>
      <div className="idle-title-card hud-panel">
        <h1 className="disp-title idle-title">{s.title}</h1>
        <div className="disp-subtitle">{s.subtitle}</div>
      </div>
      <div className="idle-hud">
        <TelemetryRow now={now} />
        <div className="idle-status-line">
          <span className="idle-status-dot" /> {s.idleStatus}
        </div>
      </div>
      <div className="idle-standby-tag">
        <span className="idle-dot" /> {s.idleStandby}
      </div>
      <Ticker items={s.idleLog} />
    </div>
  );
}

// Timing for the pre-mission distress call: a red-alert flash, then each
// conversation line stays up long enough to read (character-paced, with a
// floor) before the next one takes over.
const ALERT_FLASH_MS = 2200;
const MIN_LINE_MS = 3200;
const MS_PER_CHAR = 42;

function lineDurationMs(text) {
  return Math.max(MIN_LINE_MS, text.length * MS_PER_CHAR);
}

// Walks the scripted conversation by elapsed time so the whole sequence is
// derived purely from `state.lastEvent.at` — no extra state needed. Once
// the last line's window passes, it just holds there (`done: true`).
function pickIntroLine(elapsedMs, lines) {
  let acc = 0;
  for (let i = 0; i < lines.length; i++) {
    const dur = lineDurationMs(lines[i].text);
    if (elapsedMs < acc + dur) return { line: lines[i], index: i, done: false };
    acc += dur;
  }
  return { line: lines[lines.length - 1], index: lines.length - 1, done: true };
}

function AlertFlash() {
  return (
    <div className="alert-flash-overlay" aria-hidden="true">
      <div className="alert-flash-pulse" />
    </div>
  );
}

function DialogueBubble({ line }) {
  const s = CONFIG.story;
  const isCitronaut = line.from === 'citronaut';
  const name = isCitronaut ? s.citronautName : s.commandName;
  return (
    <div className={`intro-bubble ${isCitronaut ? 'from-citronaut' : 'from-command'}`}>
      <div className="intro-bubble-avatar">
        {isCitronaut ? <Citronaut size={54} className="citro-bob" /> : <span className="intro-command-badge">📡</span>}
      </div>
      <div className="intro-bubble-card">
        <div className="intro-bubble-name">{name}</div>
        <div className="intro-bubble-text">{line.text}</div>
      </div>
    </div>
  );
}

// Pre-mission distress call. The live surface feed NEVER cuts away — a
// red-alert flash plays over it, then the Mission Control <-> Citronaut
// conversation plays out as holographic message bubbles layered on top,
// same live rover/habitat/rocket still animating in the background.
function TransmissionScreen({ state, now }) {
  const s = CONFIG.story;
  const startedAt = state.lastEvent?.at ?? now;
  const elapsed = Math.max(0, now - startedAt);
  const inAlert = elapsed < ALERT_FLASH_MS;
  const { line, index, done } = pickIntroLine(Math.max(0, elapsed - ALERT_FLASH_MS), s.introConversation);

  useEffect(() => {
    sfx.alert();
  }, [state.lastEvent?.at]);

  return (
    <div className={`disp-idle ${inAlert ? 'alert-shake' : ''}`}>
      <MarsScene />
      <div className="idle-live-tag">
        <span className="idle-dot" /> {s.idleTag}
      </div>
      <div className="intro-alert-banner">
        ⚠ {s.alertBanner} ⚠
      </div>
      <div className="idle-hud">
        <TelemetryRow now={now} />
        <div className="intro-status-line">
          <span className="intro-status-dot" /> {s.transmissionStatus}
        </div>
      </div>
      {inAlert && <AlertFlash />}
      {!inAlert && (
        <div className="intro-dialogue">
          <DialogueBubble key={index} line={line} />
        </div>
      )}
      {!inAlert && done && (
        <div className="idle-standby-tag">
          <span className="idle-dot" /> {s.awaiting}
        </div>
      )}
      <Ticker />
    </div>
  );
}

function ActiveScreen({ state, now }) {
  const left = remainingMs(state.timer, now);
  const online = onlineCount(state);
  const expired = left === 0 && state.timer.remainingMs !== CONFIG.timerMinutes * 60 * 1000;
  const ev = state.lastEvent;
  const evFresh = ev && now - ev.at < EVENT_BANNER_MS;
  const evTask = evFresh && ev.taskId ? taskConfig(ev.taskId) : null;

  useEffect(() => {
    if (ev?.type === 'task-online') sfx.taskCorrect();
    else if (ev?.type === 'task-failed') sfx.taskWrong();
  }, [ev?.at, ev?.type]);

  return (
    <div className={`disp-active ${expired ? 'disp-expired' : ''}`}>
      <header className="disp-header">
        <div className="disp-brand">
          <Citronaut size={52} className="disp-brand-mascot" />
          <div>
            <div className="disp-brand-title">CITRONAUTS ESCAPE</div>
            <div className="disp-brand-sub">ARES BASIN · MARS · KNIGHTS MC</div>
          </div>
        </div>
        <div className={`disp-clock ${left < 60000 ? 'clock-critical' : ''} ${expired ? 'clock-expired' : ''}`}>
          {formatClock(left)}
        </div>
        <div className="disp-online-count">
          SYSTEMS ONLINE
          <span className="disp-count">{online}/{CONFIG.tasks.length}</span>
        </div>
      </header>

      <TelemetryRow now={now} />

      <RocketDiagram state={state} now={now} />

      <footer className="disp-footer">
        {expired ? (
          <span className="alert-text">{CONFIG.story.timeExpired}</span>
        ) : (
          CONFIG.story.activeHint
        )}
      </footer>
      <Ticker />

      {evFresh && ev.type === 'task-online' && evTask && (
        <FXOverlay task={evTask} praise={CONFIG.story.praise[(online - 1) % CONFIG.story.praise.length]} />
      )}
      {evFresh && ev.type === 'task-failed' && evTask && (
        <div className="event-banner banner-bad">
          {evTask.system}: REPAIR ATTEMPT FAILED — RECALIBRATE AND RETRY
        </div>
      )}
      <HintBubble state={state} />
    </div>
  );
}

function FinalScreen({ state, now }) {
  const left = remainingMs(state.timer, now);
  // The recovered "codes" are each task's fixed cipherDigit, not the raw
  // measured value — a resistance/weight reading isn't a usable hand-shift
  // key, and cipherDigit is what finalCipherLetters() actually shifted by.
  const codes = CONFIG.tasks.map((t) => t.cipherDigit);
  const cipher = finalCipherLetters();
  const denied = state.deniedAt && now - state.deniedAt < DENIED_MS;
  const ev = state.lastEvent;
  const finishTask = ev && ev.type === 'all-online' && ev.taskId ? taskConfig(ev.taskId) : null;
  const fxFresh = finishTask && now - ev.at < EVENT_BANNER_MS;

  useEffect(() => {
    if (state.deniedAt) sfx.denied();
  }, [state.deniedAt]);

  // The 4th/final task's completion swaps lastEvent.type to 'all-online'
  // (and swaps ActiveScreen out for FinalScreen in the same instant), so
  // it never passes through ActiveScreen's own task-online sound trigger.
  useEffect(() => {
    if (ev?.type === 'all-online') sfx.taskCorrect();
  }, [ev?.at, ev?.type]);

  return (
    <div className="disp-center final">
      <div className="disp-clock disp-clock-small">{formatClock(left)}</div>
      <div className="final-allonline">ALL SYSTEMS ONLINE</div>
      <h1 className="disp-title">{CONFIG.story.finalTitle}</h1>
      <div className="disp-subtitle">{CONFIG.story.finalSubtitle}</div>

      <div className="final-codes-label">{CONFIG.story.codesLabel}</div>
      <div className="final-codes">
        {codes.map((code, i) => (
          <span key={i} className="code-chip" style={{ animationDelay: `${i * 0.15}s` }}>
            {code}
          </span>
        ))}
      </div>

      <div className="final-codes-label">{CONFIG.story.cipherLabel}</div>
      <div className="final-letters">
        {cipher.map((seg, i) => (
          <span key={i} className="final-segment" style={{ animationDelay: `${0.6 + i * 0.15}s` }}>
            {seg}
          </span>
        ))}
      </div>

      <div className="cipher-instruction">{CONFIG.story.cipherInstruction}</div>

      <div className="final-prompt">
        {CONFIG.story.finalHint}
        <span className="cursor">▮</span>
      </div>
      <Ticker />
      {fxFresh && (
        <FXOverlay task={finishTask} praise={CONFIG.story.praise[CONFIG.story.praise.length - 1]} />
      )}
      {denied && (
        <div className="denied-overlay">
          <div className="denied-text glitch" data-text={CONFIG.story.denied}>
            {CONFIG.story.denied}
          </div>
        </div>
      )}
    </div>
  );
}

// The launch plays out on the actual Mars surface (reusing MarsScene) —
// countdown and liftoff happen right on the same pad the team was staring
// at all mission — then the ground recedes into starfield as the camera
// "follows" the ship up, and a final deep-space beat shows it shrinking
// toward Earth in the distance before the success screen.
function LaunchScreen({ state, now }) {
  const t = now - state.launchAt;
  // Sound triggers live up here, before any early return, since hooks must
  // run in the same order every render regardless of which phase's JSX
  // ends up rendering below.
  const ascendingForSound = t >= T_LIFTOFF;
  const inCountdown = t >= T_COUNTDOWN_START && !ascendingForSound;
  const countdownN = 10 - Math.floor((t - T_COUNTDOWN_START) / 1000);
  const inSuccessForSound = t >= T_SUCCESS;

  useEffect(() => {
    if (inCountdown && countdownN >= 1 && countdownN <= 10) sfx.countdownBeep(countdownN === 1);
  }, [inCountdown, countdownN]);

  useEffect(() => {
    if (ascendingForSound) sfx.liftoff();
  }, [ascendingForSound]);

  useEffect(() => {
    if (inSuccessForSound) sfx.fanfare();
  }, [inSuccessForSound]);

  // Phase 4: deep space transit, ship dwindling toward a distant Earth.
  if (t >= T_ASCEND_END && t < T_SPACE_END) {
    return (
      <div className="disp-center launch-space">
        <div className="starfield" />
        <div className="distant-earth" />
        <div className="transit-rocket">
          <TransitRocket />
        </div>
        <div className="transit-text">{CONFIG.story.enRoute}</div>
      </div>
    );
  }

  // Phase 5: success.
  if (t >= T_SUCCESS) {
    const used = state.timeUsedMs ?? 0;
    return (
      <div className="disp-center success">
        <div className="starfield" />
        <div className="sparks" aria-hidden="true">
          {Array.from({ length: 16 }).map((_, i) => (
            <span
              key={i}
              style={{ left: `${(i * 61) % 100}%`, animationDelay: `${(i * 0.37) % 2.4}s` }}
            />
          ))}
        </div>
        <div className="success-badge">✦ MISSION ACCOMPLISHED ✦</div>
        <Citronaut size={140} className="citro-bob success-mascot" />
        <h1 className="disp-title success-title">{CONFIG.story.successTitle}</h1>
        <div className="success-sub">{CONFIG.story.successSub}</div>
        <div className="success-stats">
          MISSION TIME: {formatClock(used)} · SYSTEMS RESTORED: {CONFIG.tasks.length}/{CONFIG.tasks.length}
        </div>
        <MissionLeaderboard highlightId={state.leaderboardEntryId} />
      </div>
    );
  }

  // Phases 1-3: grounded on the pad (authorization / countdown), then
  // liftoff — the Mars scene stays underneath throughout, receding into
  // starfield once the engines light.
  const ascending = t >= T_LIFTOFF;
  const n = 10 - Math.floor((t - T_COUNTDOWN_START) / 1000);
  return (
    <div className={`launch-surface ${ascending ? 'launch-ascend' : ''}`}>
      <div className="launch-mars-layer">
        <MarsScene showIdleRocket={false} />
      </div>
      {ascending && <div className="launch-atmosphere" />}
      {ascending && <div className="starfield launch-stars-in" />}

      <div className={`hero-rocket-wrap ${ascending ? 'hero-rocket-ascending' : ''}`}>
        {!ascending && (
          <div className="hero-smoke">
            <div className="hero-smoke-haze" />
            {Array.from({ length: 22 }).map((_, i) => (
              <span
                key={i}
                className={i % 2 === 0 ? 'hero-smoke-left' : 'hero-smoke-right'}
                style={{ animationDelay: `${i * 0.065}s`, width: `${22 - (i % 8)}px`, height: `${22 - (i % 8)}px` }}
              />
            ))}
          </div>
        )}
        {ascending && (
          <div className="rocket-trail">
            <div className="rocket-trail-core" />
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="rocket-trail-puff" style={{ animationDelay: `${i * 0.045}s` }} />
            ))}
          </div>
        )}
        <Rocket launched={ascending} />
      </div>

      {t < T_COUNTDOWN_START && (
        <div className="launch-overlay">
          <div className="auth-confirmed flicker-in">LAUNCH AUTHORIZATION CONFIRMED</div>
          <div className="auth-sub">IGNITION SEQUENCE START</div>
        </div>
      )}
      {t >= T_COUNTDOWN_START && !ascending && (
        <div className="launch-overlay">
          <div className="countdown-label">T-MINUS</div>
          <div key={n} className="countdown-number">{n}</div>
        </div>
      )}
      {ascending && (
        <div className="launch-overlay">
          <div className="liftoff-text">IGNITION — LIFTOFF!</div>
        </div>
      )}
    </div>
  );
}

export default function MissionDisplay() {
  const state = useGameState();
  const now = useNow(true, 100);

  return (
    <div className="display crt">
      <div className="bg-grid" aria-hidden="true" />
      {state.phase === 'idle' && <IdleScreen now={now} />}
      {state.phase === 'intro' && <TransmissionScreen state={state} now={now} />}
      {state.phase === 'active' && <ActiveScreen state={state} now={now} />}
      {state.phase === 'final' && <FinalScreen state={state} now={now} />}
      {state.phase === 'launch' && <LaunchScreen state={state} now={now} />}
    </div>
  );
}
