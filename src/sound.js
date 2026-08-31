// Lightweight synthesized sound effects — pure Web Audio API oscillators
// and noise, no audio files. Keeps the app's "no external assets, fully
// offline" property intact. Only the Mission Display plays these (it's
// what the room actually hears); the Control Panel just has a mute toggle
// that writes the same localStorage flag, read fresh on every play() call
// so muting takes effect immediately across windows with no extra sync.

const MUTE_KEY = 'citronauts-escape-muted';

let ctx = null;
function getCtx() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null; // Web Audio unsupported — sounds just silently no-op
    }
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function isMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setMuted(muted) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    /* storage blocked — mute toggle just won't persist */
  }
}

function tone(freq, start, duration, type = 'sine', gainPeak = 0.2) {
  const c = getCtx();
  if (!c || isMuted()) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + start);
  gain.gain.setValueAtTime(0, c.currentTime + start);
  gain.gain.linearRampToValueAtTime(gainPeak, c.currentTime + start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + duration + 0.02);
}

function sweep(freqFrom, freqTo, start, duration, type = 'sawtooth', gainPeak = 0.15) {
  const c = getCtx();
  if (!c || isMuted()) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqFrom, c.currentTime + start);
  osc.frequency.exponentialRampToValueAtTime(freqTo, c.currentTime + start + duration);
  gain.gain.setValueAtTime(0, c.currentTime + start);
  gain.gain.linearRampToValueAtTime(gainPeak, c.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + duration + 0.02);
}

function noiseBurst(start, duration, gainPeak = 0.12) {
  const c = getCtx();
  if (!c || isMuted()) return;
  const bufferSize = Math.max(1, Math.floor(c.sampleRate * duration));
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0, c.currentTime + start);
  gain.gain.linearRampToValueAtTime(gainPeak, c.currentTime + start + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + duration);
  src.connect(filter).connect(gain).connect(c.destination);
  src.start(c.currentTime + start);
}

export const sfx = {
  taskCorrect() {
    tone(660, 0, 0.12, 'sine', 0.2);
    tone(880, 0.1, 0.2, 'sine', 0.2);
  },
  taskWrong() {
    tone(180, 0, 0.18, 'square', 0.15);
    tone(140, 0.15, 0.22, 'square', 0.15);
  },
  hint() {
    tone(520, 0, 0.1, 'triangle', 0.1);
  },
  alert() {
    for (let i = 0; i < 3; i++) {
      tone(880, i * 0.35, 0.18, 'square', 0.18);
      tone(660, i * 0.35 + 0.18, 0.15, 'square', 0.15);
    }
  },
  countdownBeep(isFinal) {
    tone(isFinal ? 880 : 520, 0, isFinal ? 0.3 : 0.12, 'square', 0.2);
  },
  liftoff() {
    noiseBurst(0, 2.5, 0.18);
    sweep(80, 40, 0, 2.5, 'sawtooth', 0.12);
  },
  denied() {
    tone(160, 0, 0.15, 'square', 0.18);
    tone(120, 0.12, 0.2, 'square', 0.18);
  },
  fanfare() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.14, 0.35, 'triangle', 0.18));
  },
};
