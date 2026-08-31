import React from 'react';

// Ambient "surface cam" loop for the pre-mission idle screen: a blocky,
// pixel-art-inspired Mars landscape — layered ridgelines, a habitat module
// with a scanning dish and glowing windows, a comms relay tower, a rover
// with a recognizable rocker-bogie/camera-mast silhouette trundling back
// and forth, and the rocket idling on its pad with faint steam (no flame —
// this is the calm-before-the-storm screen). Pure CSS/SVG, loops forever,
// no external assets — same offline-first constraint as the rest of the app.
// `showIdleRocket` hides the idle screen's own small decorative rocket
// (pad + gantry stay put as scene furniture) — used when this scene is
// reused as the launch sequence's backdrop, where a bigger animated hero
// rocket sits in that same spot instead.
export default function MarsScene({ showIdleRocket = true }) {
  return (
    <div className="mars-scene" aria-hidden="true">
      <div className="mars-sky" />
      <div className="mars-sun" />
      <div className="mars-dust" />
      <div className="dust-devil" />

      <svg className="mars-mountains" viewBox="0 0 400 60" preserveAspectRatio="none">
        <polygon points="0,60 0,38 40,14 80,34 130,10 190,32 240,16 300,36 340,20 400,40 400,60" />
      </svg>
      <svg className="mars-ridge-near" viewBox="0 0 400 44" preserveAspectRatio="none">
        <polygon points="0,44 0,28 55,10 100,26 150,6 210,24 270,12 330,28 400,16 400,44" />
      </svg>

      <div className="mars-ground">
        <div className="ground-texture" />
        <svg className="mars-rocks" viewBox="0 0 100 30" preserveAspectRatio="none">
          <ellipse cx="6" cy="26" rx="3" ry="1.4" fill="#4a2410" opacity="0.5" />
          <ellipse cx="34" cy="24" rx="2" ry="1" fill="#3a1c0c" opacity="0.4" />
          <ellipse cx="58" cy="27" rx="2.6" ry="1.2" fill="#4a2410" opacity="0.5" />
          <ellipse cx="72" cy="22" rx="1.6" ry="0.8" fill="#3a1c0c" opacity="0.4" />
          <ellipse cx="90" cy="25" rx="2.2" ry="1" fill="#4a2410" opacity="0.45" />
          <circle cx="20" cy="19" r="1.6" fill="#2a1408" opacity="0.35" />
          <circle cx="48" cy="17" r="1.2" fill="#2a1408" opacity="0.3" />
          <circle cx="80" cy="14" r="1" fill="#2a1408" opacity="0.25" />
        </svg>

        {/* habitat: main dome + connector module, solar array, scanning dish */}
        <div className="hab">
          <svg className="hab-svg" viewBox="0 0 150 74">
            {/* small connector module */}
            <rect x="0" y="52" width="24" height="12" fill="#6b7078" />
            <rect x="0" y="48" width="24" height="4" fill="#4a4e55" />
            <circle cx="12" cy="46" r="9" fill="#8a8f99" stroke="#4a4e55" strokeWidth="2" />
            <rect className="hab-glow" x="8" y="43" width="8" height="5" rx="1" fill="#ffc904" />

            {/* connector tube */}
            <rect x="22" y="56" width="14" height="8" fill="#5c6068" />

            {/* main dome module */}
            <rect x="34" y="48" width="90" height="16" fill="#8a8f99" />
            <rect x="30" y="62" width="98" height="6" fill="#4a4e55" />
            <path d="M40 48 A40 36 0 0 1 118 48 Z" fill="#d7dbe0" />
            <rect x="40" y="48" width="78" height="2.4" fill="#4a4e55" />

            {/* windows, warm glow — no character sprite */}
            <rect className="hab-glow" x="58" y="52" width="13" height="9" rx="1.5" fill="#ffc904" />
            <rect className="hab-glow hab-glow-b" x="82" y="52" width="13" height="9" rx="1.5" fill="#ffc904" />

            {/* exterior tank */}
            <rect x="30" y="54" width="8" height="12" rx="2" fill="#6b7078" />
            <rect x="30" y="54" width="8" height="3" fill="#ffc904" opacity="0.7" />

            {/* antenna mast + scanning dish + beacon */}
            <rect x="100" y="20" width="3" height="28" fill="#c8ccd4" />
            <g className="hab-dish">
              <ellipse cx="101.5" cy="18" rx="10" ry="4" fill="#c8ccd4" />
              <ellipse cx="101.5" cy="18" rx="6" ry="2.4" fill="#8a8f99" />
            </g>
            <circle cx="101.5" cy="12" r="2" fill="#ff4d4d" className="hab-beacon" />

            {/* solar array */}
            <rect x="137" y="54" width="3" height="10" fill="#8a8f99" />
            <rect x="124" y="40" width="26" height="14" fill="#1c3a52" stroke="#2c3e50" strokeWidth="1" />
            <line x1="132.6" y1="40" x2="132.6" y2="54" stroke="#2c3e50" strokeWidth="0.8" />
            <line x1="141.2" y1="40" x2="141.2" y2="54" stroke="#2c3e50" strokeWidth="0.8" />
          </svg>
        </div>

        {/* small comms relay tower, mid-ground */}
        <div className="comms-tower">
          <svg viewBox="0 0 20 60" className="comms-tower-svg">
            <rect x="9" y="10" width="2" height="46" fill="#8a8f99" />
            <line x1="4" y1="56" x2="10" y2="14" stroke="#5c6068" strokeWidth="1" />
            <line x1="16" y1="56" x2="10" y2="14" stroke="#5c6068" strokeWidth="1" />
            <line x1="6" y1="40" x2="14" y2="40" stroke="#5c6068" strokeWidth="1" />
            <line x1="7" y1="26" x2="13" y2="26" stroke="#5c6068" strokeWidth="1" />
            <circle cx="10" cy="8" r="2.4" fill="#ff4d4d" className="hab-beacon" />
            <ellipse cx="10" cy="14" rx="7" ry="2.6" fill="#c8ccd4" transform="rotate(20 10 14)" />
          </svg>
        </div>

        {/* greenhouse, tucked between the habitat and the comms tower */}
        <div className="greenhouse">
          <svg viewBox="0 0 90 40" className="greenhouse-svg">
            <rect x="0" y="30" width="90" height="8" fill="#5c6068" />
            <path d="M4 30 A 41 24 0 0 1 86 30 Z" fill="rgba(70,180,110,0.25)" stroke="#2f8f46" strokeWidth="1.4" />
            <line x1="18" y1="30" x2="20" y2="12" stroke="#2f8f46" strokeWidth="0.8" opacity="0.6" />
            <line x1="32" y1="30" x2="32" y2="7" stroke="#2f8f46" strokeWidth="0.8" opacity="0.6" />
            <line x1="45" y1="30" x2="45" y2="6" stroke="#2f8f46" strokeWidth="0.8" opacity="0.6" />
            <line x1="58" y1="30" x2="58" y2="7" stroke="#2f8f46" strokeWidth="0.8" opacity="0.6" />
            <line x1="72" y1="30" x2="70" y2="12" stroke="#2f8f46" strokeWidth="0.8" opacity="0.6" />
            <circle className="greenhouse-plant" cx="20" cy="27" r="3" fill="#3f9b46" />
            <circle className="greenhouse-plant" cx="34" cy="24" r="3.8" fill="#2f8f46" />
            <circle className="greenhouse-plant" cx="50" cy="25" r="3.2" fill="#3f9b46" />
            <circle className="greenhouse-plant" cx="66" cy="27" r="2.8" fill="#2f8f46" />
          </svg>
        </div>

        {/* launch pad — flat platform only */}
        <div className="idle-launch-pad">
          <svg viewBox="0 0 160 36" className="idle-pad-svg">
            <rect x="0" y="24" width="160" height="8" fill="#5c6068" />
            <rect x="0" y="20" width="160" height="4" fill="#4a4e55" />
            <rect x="12" y="30" width="10" height="4" fill="#3a3d42" />
            <rect x="138" y="30" width="10" height="4" fill="#3a3d42" />
          </svg>
        </div>

        {/* service gantry, standing beside the rocket — a lattice tower
            with two arms reaching over to actually brace the rocket body,
            not just standing decoratively next to it */}
        <div className="idle-gantry">
          <svg viewBox="0 0 30 100" className="idle-gantry-svg" preserveAspectRatio="none">
            <rect x="13" y="6" width="4" height="94" fill="#8a8f99" />
            <line x1="4" y1="100" x2="15" y2="10" stroke="#5c6068" strokeWidth="1.6" />
            <line x1="26" y1="100" x2="15" y2="10" stroke="#5c6068" strokeWidth="1.6" />
            <line x1="7" y1="78" x2="23" y2="78" stroke="#5c6068" strokeWidth="1.4" />
            <line x1="9" y1="56" x2="21" y2="56" stroke="#5c6068" strokeWidth="1.4" />
            <line x1="11" y1="34" x2="19" y2="34" stroke="#5c6068" strokeWidth="1.4" />
            {/* service arms reaching toward the rocket, ending in a clamp */}
            <line x1="17" y1="22" x2="30" y2="18" stroke="#6b7078" strokeWidth="1.8" />
            <rect x="27" y="14" width="5" height="6" fill="#8a8f99" />
            <line x1="17" y1="48" x2="30" y2="44" stroke="#6b7078" strokeWidth="1.8" />
            <rect x="27" y="40" width="5" height="6" fill="#8a8f99" />
            <circle cx="15" cy="4" r="3" fill="#ff4d4d" className="idle-gantry-light" />
          </svg>
        </div>

        {showIdleRocket && (
          /* idle rocket, steam only — no flame. viewBox is cropped tight
             to the fin tips (no wasted padding below) so it sits flush
             on the pad instead of floating above it */
          <div className="idle-rocket">
            <svg viewBox="0 0 60 98" className="idle-rocket-svg">
              <path d="M30 4 C 36 16, 39 26, 39 38 L 21 38 C 21 26, 24 16, 30 4 Z" fill="#c8ccd4" />
              <rect x="21" y="38" width="18" height="46" rx="2" fill="#e8eaee" />
              <rect x="21" y="70" width="18" height="4" fill="#ffc904" />
              <path d="M21 76 L10 96 L21 92 Z" fill="#b8410e" />
              <path d="M39 76 L50 96 L39 92 Z" fill="#b8410e" />
              <path d="M25 86 L23 94 L37 94 L35 86 Z" fill="#8a8f99" />
            </svg>
            <div className="idle-nozzle-glow" />
            <div className="idle-smoke">
              {Array.from({ length: 9 }).map((_, i) => (
                <span
                  key={i}
                  className={i % 2 === 0 ? 'smoke-left' : 'smoke-right'}
                  style={{ animationDelay: `${i * 0.24}s`, width: `${13 - i * 0.7}px`, height: `${13 - i * 0.7}px` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* rover: chassis, rocker-bogie wheels, camera mast, small arm —
            drives back and forth across the foreground */}
        <div className="rover-track">
          <div className="rover">
            <svg viewBox="0 0 60 34" className="rover-svg">
              {/* suspension arms */}
              <line x1="18" y1="18" x2="12" y2="26" stroke="#5c6068" strokeWidth="2" />
              <line x1="30" y1="20" x2="30" y2="26" stroke="#5c6068" strokeWidth="2" />
              <line x1="42" y1="18" x2="48" y2="26" stroke="#5c6068" strokeWidth="2" />
              {/* robotic arm reaching forward */}
              <polyline points="14,18 4,16 2,26" stroke="#8a8f99" strokeWidth="2" fill="none" strokeLinecap="round" />
              <rect x="0" y="24" width="4" height="4" fill="#5c6068" />
              {/* chassis */}
              <rect x="10" y="14" width="40" height="10" fill="#b8bec9" />
              <rect x="12" y="10" width="36" height="4" fill="#2c3e50" />
              <rect x="12" y="20" width="36" height="1.6" fill="#ffc904" opacity="0.85" />
              {/* mast + camera head */}
              <rect x="28" y="2" width="2.4" height="12" fill="#8a8f99" />
              <rect x="22" y="0" width="16" height="5" rx="1" fill="#d7dbe0" />
              <circle cx="26" cy="2.5" r="1.3" fill="#20232a" />
              <circle cx="34" cy="2.5" r="1.3" fill="#20232a" />
              {/* wheels */}
              <circle className="rover-wheel w1" cx="12" cy="27" r="4.4" fill="#20232a" />
              <circle className="rover-wheel w2" cx="30" cy="28" r="4.8" fill="#20232a" />
              <circle className="rover-wheel w3" cx="48" cy="27" r="4.4" fill="#20232a" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
