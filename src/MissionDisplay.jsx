import React from 'react';
import { CONFIG } from './config.js';
import {
  useGameState,
  remainingMs,
  formatClock,
  collectedSegments,
  onlineCount,
  taskConfig,
} from './store.js';
import { useNow } from './hooks.js';
import Citronaut, { CitronautFace } from './Citronaut.jsx';
import FXOverlay from './fx.jsx';

const EVENT_BANNER_MS = 5000;
const DENIED_MS = 3000;

// Launch sequence timeline (ms since launchAt)
const T_COUNTDOWN_START = 2500;
const T_LIFTOFF = T_COUNTDOWN_START + 10000; // after 10..1
const T_SUCCESS = T_LIFTOFF + 4000;

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

function Ticker() {
  const text = CONFIG.story.ticker.join('  ▸  ');
  return (
    <div className="ticker">
      <div className="ticker-inner">
        <span>{text}&nbsp;&nbsp;▸&nbsp;&nbsp;</span>
        <span>{text}&nbsp;&nbsp;▸&nbsp;&nbsp;</span>
      </div>
    </div>
  );
}

function SystemPanel({ task, taskState, justChangedType }) {
  const online = taskState.status === 'correct';
  const cls = [
    'sys-panel',
    online ? 'sys-online' : 'sys-offline',
    justChangedType === 'task-online' ? 'sys-just-online' : '',
    justChangedType === 'task-failed' ? 'sys-just-failed' : '',
  ].join(' ');
  return (
    <div className={cls}>
      <div className="sys-name">{task.system}</div>
      <div className={`sys-status ${online ? '' : 'glitch'}`} data-text={online ? 'ONLINE' : 'OFFLINE'}>
        {online ? 'ONLINE' : 'OFFLINE'}
      </div>
      <div className="sys-bar"><div className="sys-bar-fill" /></div>
      <div className="sys-readout">
        {online ? `CODE ${taskState.value} → ${task.decode[taskState.value]}` : 'AWAITING REPAIR'}
      </div>
    </div>
  );
}

function IntroScreen() {
  const s = CONFIG.story;
  return (
    <div className="disp-center intro">
      <div className="intro-transmission">▚▚ INCOMING TRANSMISSION ▞▞</div>
      <div className="patch">
        <div className="patch-ring" />
        <div className="patch-ring patch-ring-2" />
        <Citronaut size={130} className="citro-bob" />
      </div>
      <h1 className="disp-title">{s.title}</h1>
      <div className="disp-subtitle">{s.subtitle}</div>
      <div className="disp-org">{s.org}</div>
      <div className="intro-story">
        {s.intro.map((p, i) => (
          <p key={i} style={{ animationDelay: `${0.6 + i * 0.9}s` }}>{p}</p>
        ))}
      </div>
      <div className="blink awaiting">{s.awaiting}</div>
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

      <div className="sys-grid">
        {CONFIG.tasks.map((t) => (
          <SystemPanel
            key={t.id}
            task={t}
            taskState={state.tasks[t.id]}
            justChangedType={evFresh && ev.taskId === t.id ? ev.type : null}
          />
        ))}
      </div>

      <footer className="disp-footer">
        {expired ? (
          <span className="alert-text">{CONFIG.story.timeExpired}</span>
        ) : (
          CONFIG.story.activeHint
        )}
      </footer>
      <Ticker />

      {evFresh && ev.type === 'task-online' && evTask && <FXOverlay task={evTask} />}
      {evFresh && ev.type === 'task-failed' && evTask && (
        <div className="event-banner banner-bad">
          {evTask.system}: REPAIR ATTEMPT FAILED — RECALIBRATE AND RETRY
        </div>
      )}
    </div>
  );
}

function FinalScreen({ state, now }) {
  const left = remainingMs(state.timer, now);
  const segments = collectedSegments(state);
  const denied = state.deniedAt && now - state.deniedAt < DENIED_MS;
  const ev = state.lastEvent;
  const finishTask = ev && ev.type === 'all-online' && ev.taskId ? taskConfig(ev.taskId) : null;
  const fxFresh = finishTask && now - ev.at < EVENT_BANNER_MS;

  return (
    <div className="disp-center final">
      <div className="disp-clock disp-clock-small">{formatClock(left)}</div>
      <div className="final-allonline">ALL SYSTEMS ONLINE</div>
      <h1 className="disp-title">{CONFIG.story.finalTitle}</h1>
      <div className="final-letters">
        {segments.map((seg, i) => (
          <span key={i} className="final-segment" style={{ animationDelay: `${i * 0.25}s` }}>
            {seg}
          </span>
        ))}
      </div>
      <div className="final-prompt">
        {CONFIG.story.finalHint}
        <span className="cursor">▮</span>
      </div>
      <Ticker />
      {fxFresh && <FXOverlay task={finishTask} />}
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

function LaunchScreen({ state, now }) {
  const t = now - state.launchAt;

  if (t < T_COUNTDOWN_START) {
    return (
      <div className="disp-center launch">
        <div className="auth-confirmed flicker-in">LAUNCH AUTHORIZATION CONFIRMED</div>
        <div className="auth-sub">IGNITION SEQUENCE START</div>
      </div>
    );
  }

  if (t < T_LIFTOFF) {
    const n = 10 - Math.floor((t - T_COUNTDOWN_START) / 1000);
    return (
      <div className="disp-center launch">
        <div className="countdown-label">T-MINUS</div>
        <div key={n} className="countdown-number">{n}</div>
        <Rocket launched={false} />
      </div>
    );
  }

  if (t < T_SUCCESS) {
    return (
      <div className="disp-center launch liftoff">
        <div className="liftoff-text">IGNITION — LIFTOFF!</div>
        <div className="starfield" />
        <Rocket launched={true} />
      </div>
    );
  }

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
      <Citronaut size={170} className="citro-bob success-mascot" />
      <h1 className="disp-title success-title">{CONFIG.story.successTitle}</h1>
      <div className="success-sub">{CONFIG.story.successSub}</div>
      <div className="success-stats">
        MISSION TIME: {formatClock(used)} · SYSTEMS RESTORED: {CONFIG.tasks.length}/{CONFIG.tasks.length}
      </div>
    </div>
  );
}

export default function MissionDisplay() {
  const state = useGameState();
  const now = useNow(true, 100);

  return (
    <div className="display crt">
      <div className="bg-grid" aria-hidden="true" />
      {state.phase === 'intro' && <IntroScreen />}
      {state.phase === 'active' && <ActiveScreen state={state} now={now} />}
      {state.phase === 'final' && <FinalScreen state={state} now={now} />}
      {state.phase === 'launch' && <LaunchScreen state={state} now={now} />}
    </div>
  );
}
