import React from 'react';
import Citronaut from './Citronaut.jsx';

// Per-task completion animations, shown full-screen on the Mission Display
// when a system comes online. Which animation a task uses is set by its
// `fx` field in src/config.js — all pure CSS/SVG, no external assets.

// Task 1 — fuel flows through the pipe run, the tank fills, and a
// continuous energy pulse keeps running the line to sell "still flowing".
// Inlet and outlet are mirror images of each other, both meeting the tank
// at its vertical center — a single clean "flows in, through, and out"
// read, with the base (housing) and flow paths always identical lengths
// so no segment is ever left looking unconnected.
function FuelFX() {
  return (
    <svg className="fxsvg" viewBox="0 0 320 200" aria-hidden="true">
      <path className="fx-pipe-base" d="M8 172 H40 V134 H130" />
      <path className="fx-pipe-flow" d="M8 172 H40 V134 H130" />
      <path className="fx-pipe-pulse" d="M8 172 H40 V134 H130" />
      <path className="fx-pipe-base" d="M190 134 H280 V172 H312" />
      <circle className="fx-tank-glow" cx="160" cy="134" r="46" />
      {/* tank, with small connector flanges where the pipes meet its walls */}
      <rect x="124" y="128" width="10" height="12" className="fx-pipe-flange" />
      <rect x="186" y="128" width="10" height="12" className="fx-pipe-flange" />
      <rect x="130" y="96" width="60" height="76" rx="4" className="fx-tank-outline" />
      <rect x="134" y="100" width="52" height="68" rx="2" className="fx-tank-fill" />
      {Array.from({ length: 6 }).map((_, i) => (
        <circle
          key={i}
          className={`fx-bubble b${(i % 3) + 1}`}
          cx={146 + i * 6}
          cy={162 - ((i * 7) % 14)}
          r={2.4 + (i % 3) * 0.5}
          style={{ animationDelay: `${2.1 + i * 0.18}s` }}
        />
      ))}
      <path className="fx-pipe-flow fx-flow-late" d="M190 134 H280 V172 H312" />
      <path className="fx-pipe-pulse fx-flow-late" d="M190 134 H280 V172 H312" />
      <text className="fx-svg-label" x="160" y="30" textAnchor="middle">FUEL PRESSURE ▲</text>
    </svg>
  );
}

// Task 2 — circuit trace energizes, nodes ping outward like sonar, the main
// bolt strikes down directly onto the middle node (not spanning past it
// into empty space), and small sparks fan tightly off the two flanking
// nodes instead of floating below the trace as separate, unrelated zaps.
function ElectricFX() {
  const nodes = [
    { cx: 70, cy: 120, cls: 'fxn1' },
    { cx: 150, cy: 70, cls: 'fxn2' },
    { cx: 235, cy: 150, cls: 'fxn3' },
  ];
  return (
    <svg className="fxsvg" viewBox="0 0 320 200" aria-hidden="true">
      <polyline className="fx-trace-base" points="8,120 70,120 90,70 150,70 175,150 235,150 255,110 312,110" />
      <polyline className="fx-trace" points="8,120 70,120 90,70 150,70 175,150 235,150 255,110 312,110" />
      <polygon className="fx-bolt" points="150,-10 130,34 148,34 126,78 176,28 152,28 172,-10" />
      {nodes.map((n) => (
        <g key={n.cls}>
          <circle className={`fx-ping ${n.cls}`} cx={n.cx} cy={n.cy} r="6" />
          <circle className={`fx-node ${n.cls}`} cx={n.cx} cy={n.cy} r="6" />
        </g>
      ))}
      <g className="fx-spark-group fxn1">
        <line className="fx-spark" x1="70" y1="120" x2="58" y2="113" />
        <line className="fx-spark" x1="70" y1="120" x2="70" y2="106" />
        <line className="fx-spark" x1="70" y1="120" x2="82" y2="113" />
      </g>
      <g className="fx-spark-group fxn3">
        <line className="fx-spark" x1="235" y1="150" x2="247" y2="157" />
        <line className="fx-spark" x1="235" y1="150" x2="235" y2="164" />
        <line className="fx-spark" x1="235" y1="150" x2="223" y2="157" />
      </g>
      <text className="fx-svg-label" x="160" y="196" textAnchor="middle">BUS VOLTAGE NOMINAL ⚡</text>
    </svg>
  );
}

// Task 3 — injector nozzle sprays into a combustion chamber (instead of
// fading into empty space), which pressurizes and reports down a connector
// line to the gauge — one continuous system instead of two unrelated
// diagrams sharing a canvas.
function InjectorFX() {
  return (
    <svg className="fxsvg" viewBox="0 0 320 200" aria-hidden="true">
      {/* nozzle */}
      <path className="fx-nozzle" d="M138 12 H182 L192 52 H128 Z" />
      <rect x="150" y="52" width="20" height="12" className="fx-nozzle" />
      <ellipse className="fx-mist" cx="160" cy="85" rx="28" ry="14" />
      {/* chamber that actually receives the spray */}
      <rect x="118" y="66" width="84" height="96" rx="10" className="fx-chamber-outline" />
      <rect x="122" y="70" width="76" height="88" rx="7" className="fx-chamber-fill" />
      {/* spray drops, landing inside the chamber */}
      {Array.from({ length: 16 }).map((_, i) => (
        <circle
          key={i}
          className={`fx-drop fxd${i % 4}`}
          cx={160}
          cy={70}
          r={i % 3 === 0 ? 4 : 2.8}
          style={{ animationDelay: `${0.5 + i * 0.09}s` }}
        />
      ))}
      {/* pressure line carrying the reading from the chamber to the gauge */}
      <path className="fx-pressure-line-base" d="M202 114 H215 V140" />
      <path className="fx-pressure-line" d="M202 114 H215 V140" />
      {/* pressure gauge */}
      <path className="fx-gauge-arc" d="M 215 140 A 35 35 0 0 1 285 140" />
      <path className="fx-gauge-green" d="M 276.8 117.5 A 35 35 0 0 1 285 140" />
      <circle className="fx-gauge-burst" cx="250" cy="140" r="6" />
      <line className="fx-needle" x1="0" y1="0" x2="0" y2="-29" />
      <circle cx="250" cy="140" r="5" className="fx-gauge-hub" />
      <text className="fx-svg-label" x="250" y="188" textAnchor="middle">PSI ▲ NOMINAL</text>
    </svg>
  );
}

// Task 4 — diagnostic terminal scrolls its checks under a scanning sweep,
// then the whole terminal picks up a green glow once everything's green.
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
      <div className="fx-term-scan" />
      <div className="fx-term-titlebar">
        <span className="fx-term-dot d1" />
        <span className="fx-term-dot d2" />
        <span className="fx-term-dot d3" />
        <span className="fx-term-titletext">DIAG://life_support</span>
      </div>
      {DIAG_LINES.map((line, i) => {
        const isFinal = i === DIAG_LINES.length - 1;
        return (
          <div
            key={i}
            className={`fx-term-line ${isFinal ? 'fx-term-final' : ''}`}
            style={{ animationDelay: `${0.3 + i * 0.5}s` }}
          >
            {line}
            {isFinal && <span className="fx-term-cursor" />}
          </div>
        );
      })}
    </div>
  );
}

const FX_MAP = {
  fuel: FuelFX,
  electric: ElectricFX,
  injector: InjectorFX,
  diagnostics: DiagnosticsFX,
};

// Full-screen celebration overlay for a task coming online. `praise` is an
// optional congratulatory line from Citronaut, shown below the system
// message — see CONFIG.story.praise.
export default function FXOverlay({ task, praise }) {
  const Fx = FX_MAP[task.fx];
  return (
    <div className="fx-overlay">
      <div className="fx-flash" aria-hidden="true" />
      <div className="fx-burst" aria-hidden="true">
        <span /><span /><span />
      </div>
      <div className="fx-frame">
        <div className="fx-stage">{Fx ? <Fx /> : null}</div>
      </div>
      <div className="fx-sys">{task.system} · ONLINE</div>
      <div className="fx-msg">{task.onlineMessage}</div>
      {praise && (
        <div className="fx-praise">
          <Citronaut size={54} className="citro-bob" />
          <div className="fx-praise-text">{praise}</div>
        </div>
      )}
    </div>
  );
}
