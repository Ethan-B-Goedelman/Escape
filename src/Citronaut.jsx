import React from 'react';

// Hand-drawn SVG recreation of UCF's Citronaut mascot (orange body, citrus
// head, retro space helmet). Inline SVG keeps the app 100% offline and crisp
// at projector scale. To use official artwork instead, replace the body of
// this component with an <img> pointing at a file in /public.
export default function Citronaut({ size = 160, className = '' }) {
  return (
    <svg
      className={`citronaut ${className}`}
      width={size}
      viewBox="0 0 200 270"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Citronaut"
    >
      {/* legs + boots */}
      <rect x="87" y="200" width="8" height="38" rx="4" fill="#15181c" />
      <rect x="105" y="200" width="8" height="38" rx="4" fill="#15181c" />
      <ellipse cx="84" cy="245" rx="17" ry="8" fill="#15181c" />
      <ellipse cx="116" cy="245" rx="17" ry="8" fill="#15181c" />

      {/* glove hands on hips */}
      <path d="M52 140 Q 36 158 50 176" stroke="#eef1f4" strokeWidth="11" fill="none" strokeLinecap="round" />
      <path d="M148 140 Q 164 158 150 176" stroke="#eef1f4" strokeWidth="11" fill="none" strokeLinecap="round" />
      <circle cx="52" cy="178" r="11" fill="#eef1f4" />
      <circle cx="148" cy="178" r="11" fill="#eef1f4" />

      {/* orange body */}
      <circle cx="100" cy="158" r="55" fill="#f47321" />
      <path d="M100 104 C 88 130, 88 186, 100 212" stroke="#d95f12" strokeWidth="2.5" fill="none" opacity="0.55" />
      <path d="M78 110 C 62 136, 62 180, 78 206" stroke="#d95f12" strokeWidth="2.5" fill="none" opacity="0.45" />
      <path d="M122 110 C 138 136, 138 180, 122 206" stroke="#d95f12" strokeWidth="2.5" fill="none" opacity="0.45" />
      <ellipse cx="82" cy="132" rx="14" ry="8" fill="#ff9d55" opacity="0.5" transform="rotate(-30 82 132)" />
      <circle cx="100" cy="210" r="3.5" fill="#c1520c" />

      {/* leaf collar */}
      <path
        d="M64 112 L76 92 L86 110 L96 90 L104 110 L114 90 L124 110 L136 92 L142 114 Q 100 130 58 114 Z"
        fill="#3f9b46"
      />

      {/* citrus head */}
      <circle cx="100" cy="76" r="33" fill="#ccd94e" />
      <ellipse cx="90" cy="74" rx="3" ry="4.6" fill="#20232a" />
      <ellipse cx="110" cy="74" rx="3" ry="4.6" fill="#20232a" />
      <path d="M88 88 Q 100 97 112 88" stroke="#20232a" strokeWidth="2.6" fill="none" strokeLinecap="round" />

      {/* helmet: white dome, green brim + top curl */}
      <path d="M66 62 A 34 34 0 0 1 134 62 L 134 64 L 66 64 Z" fill="#f2f5f7" />
      <rect x="60" y="59" width="80" height="9" rx="4.5" fill="#2f8f46" />
      <path d="M100 30 C 94 14, 112 10, 118 20 C 112 18, 104 20, 103 30 Z" fill="#2f8f46" />
    </svg>
  );
}

// Tiny helmeted face used inside the rocket porthole during launch.
export function CitronautFace({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="20" cy="22" r="14" fill="#ccd94e" />
      <ellipse cx="15.5" cy="21" rx="1.5" ry="2.3" fill="#20232a" />
      <ellipse cx="24.5" cy="21" rx="1.5" ry="2.3" fill="#20232a" />
      <path d="M15 27 Q 20 31 25 27" stroke="#20232a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M6 15 A 14 14 0 0 1 34 15 L 34 16 L 6 16 Z" fill="#f2f5f7" />
      <rect x="4" y="13.5" width="32" height="4" rx="2" fill="#2f8f46" />
    </svg>
  );
}
