import React from 'react';

// Per-task completion animations, shown full-screen on the Mission Display
// when a system comes online. Which animation a task uses is set by its
// `fx` field in src/config.js — all pure CSS/SVG, no external assets.

// Task 1 — fuel flows through the pipe run and the tank fills.
function FuelFX() {
  return (
    <svg className="fxsvg" viewBox="0 0 320 200" aria-hidden="true">
      <path className="fx-pipe-base" d="M8 172 H70 V52 H160 V96" />
      <path className="fx-pipe-base" d="M250 172 H312" />
      <path className="fx-pipe-flow" d="M8 172 H70 V52 H160 V96" />
      {/* tank */}
      <rect x="130" y="96" width="60" height="76" rx="4" className="fx-tank-outline" />
      <rect x="134" y="100" width="52" height="68" rx="2" className="fx-tank-fill" />
      <circle className="fx-bubble b1" cx="150" cy="160" r="3.4" />
      <circle className="fx-bubble b2" cx="162" cy="164" r="2.6" />
      <circle className="fx-bubble b3" cx="172" cy="158" r="3" />
      <path className="fx-pipe-flow fx-flow-late" d="M190 172 H312" />
      <text className="fx-svg-label" x="160" y="30" textAnchor="middle">FUEL PRESSURE ▲</text>
    </svg>
  );
}

// Task 2 — circuit trace energizes, nodes light, bolt flashes.
function ElectricFX() {
  return (
    <svg className="fxsvg" viewBox="0 0 320 200" aria-hidden="true">
      <polyline className="fx-trace-base" points="8,120 70,120 90,70 150,70 175,150 235,150 255,110 312,110" />
      <polyline className="fx-trace" points="8,120 70,120 90,70 150,70 175,150 235,150 255,110 312,110" />
      <circle className="fx-node fxn1" cx="70" cy="120" r="6" />
      <circle className="fx-node fxn2" cx="150" cy="70" r="6" />
      <circle className="fx-node fxn3" cx="235" cy="150" r="6" />
      <polygon className="fx-bolt" points="160,8 138,80 156,80 132,168 186,66 160,66 182,8" />
      <text className="fx-svg-label" x="160" y="196" textAnchor="middle">BUS VOLTAGE NOMINAL ⚡</text>
    </svg>
  );
}

// Task 3 — injector nozzle sprays, pressure needle sweeps into the green.
function InjectorFX() {
  return (
    <svg className="fxsvg" viewBox="0 0 320 200" aria-hidden="true">
      {/* nozzle */}
      <path className="fx-nozzle" d="M138 12 H182 L192 52 H128 Z" />
      <rect x="150" y="52" width="20" height="12" className="fx-nozzle" />
      {/* spray drops */}
      {Array.from({ length: 12 }).map((_, i) => (
        <circle
          key={i}
          className={`fx-drop fxd${i % 4}`}
          cx={160}
          cy={70}
          r={i % 3 === 0 ? 4 : 2.8}
          style={{ animationDelay: `${0.5 + i * 0.14}s` }}
        />
      ))}
      {/* pressure gauge */}
      <path className="fx-gauge-arc" d="M 30 168 A 50 50 0 0 1 130 168" />
      <line className="fx-needle" x1="0" y1="0" x2="0" y2="-42" />
      <circle cx="80" cy="168" r="5" className="fx-gauge-hub" />
      <text className="fx-svg-label" x="248" y="160" textAnchor="middle">PSI ▲ NOMINAL</text>
    </svg>
  );
}

// Task 4 — diagnostic terminal scrolls its checks.
const DIAG_LINES = [
  '> MEMCHECK 0x0000–0xFFFF ....... OK',
  '> NAV ALIGNMENT ................ OK',
  '> THRUSTER CTRL LOOP ........... OK',
  '> COMMS UPLINK / PEGASUS ....... OK',
  '> LIFE SUPPORT ................. OK',
  '> ALL CHECKS PASSED ✓',
];
function DiagnosticsFX() {
  return (
    <div className="fx-term">
      {DIAG_LINES.map((line, i) => (
        <div
          key={i}
          className={`fx-term-line ${i === DIAG_LINES.length - 1 ? 'fx-term-final' : ''}`}
          style={{ animationDelay: `${0.3 + i * 0.5}s` }}
        >
          {line}
        </div>
      ))}
    </div>
  );
}

const FX_MAP = {
  fuel: FuelFX,
  electric: ElectricFX,
  injector: InjectorFX,
  diagnostics: DiagnosticsFX,
};

// Full-screen celebration overlay for a task coming online.
export default function FXOverlay({ task }) {
  const Fx = FX_MAP[task.fx];
  return (
    <div className="fx-overlay">
      <div className="fx-stage">{Fx ? <Fx /> : null}</div>
      <div className="fx-sys">{task.system} · ONLINE</div>
      <div className="fx-msg">{task.onlineMessage}</div>
    </div>
  );
}
