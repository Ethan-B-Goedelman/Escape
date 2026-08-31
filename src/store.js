// Shared game state, synchronized across browser windows/tabs on the same
// machine via BroadcastChannel, with a localStorage 'storage'-event fallback.
// State is also persisted to localStorage so a refresh mid-game recovers.
// Only the Control Panel mutates state; the Mission Display just renders it.
import { useSyncExternalStore } from 'react';
import { CONFIG } from './config.js';

// Bumped to v2 with the idle-screen phase: any state saved by an older
// build (which defaulted to phase 'intro') is discarded on load so every
// fresh page load lands on the calm idle screen, not a stale mid-mission
// or MAYDAY-phase save from before this schema existed.
const STORAGE_KEY = 'citronauts-escape-state-v2';
const CHANNEL_NAME = 'citronauts-escape-sync-v2';

// Leaderboard is a SEPARATE store from game state on purpose: it must
// survive "Reset for Next Group" (which wipes game state back to
// initialState()), and it accumulates across the whole event.
const LB_STORAGE_KEY = 'citronauts-escape-leaderboard-v1';
const LB_CHANNEL_NAME = 'citronauts-escape-leaderboard-sync-v1';

export function initialState() {
  const tasks = {};
  for (const t of CONFIG.tasks) tasks[t.id] = { status: 'pending', value: null, attempts: 0, lastAttemptAt: null };
  return {
    rev: 0,
    // idle (calm surface cam) -> intro (distress call) -> active ->
    // final (all systems online) -> launch (password accepted)
    phase: 'idle',
    tasks, // { [taskId]: { status: 'pending'|'correct'|'incorrect', value } }
    timer: {
      running: false,
      endsAt: null, // epoch ms when clock hits 0 (while running)
      remainingMs: CONFIG.timerMinutes * 60 * 1000, // frozen remainder (while paused)
    },
    lastEvent: null, // { type, taskId?, at } — drives Mission Display animations
    deniedAt: null, // timestamp of last failed password attempt
    launchAt: null, // timestamp the launch sequence started
    timeUsedMs: null, // clock time consumed, captured at launch
    groupName: '', // this run's group name, editable until launch
    leaderboardEntryId: null, // set at launch — lets the display highlight "this is us"
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && typeof s.rev === 'number' && s.tasks) return s;
    }
  } catch {
    /* corrupted state — start fresh */
  }
  return null;
}

let state = load() || initialState();
const listeners = new Set();

let channel = null;
try {
  channel = new BroadcastChannel(CHANNEL_NAME);
  channel.onmessage = (e) => acceptRemote(e.data);
} catch {
  /* BroadcastChannel unavailable — the storage event below still syncs */
}

window.addEventListener('storage', (e) => {
  if (e.key !== STORAGE_KEY || !e.newValue) return;
  try {
    acceptRemote(JSON.parse(e.newValue));
  } catch {
    /* ignore malformed payloads */
  }
});

function acceptRemote(next) {
  if (!next || typeof next.rev !== 'number' || next.rev === state.rev) return;
  state = next;
  listeners.forEach((l) => l());
}

function commit(next) {
  state = { ...next, rev: state.rev + 1 };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full/blocked — BroadcastChannel still syncs live windows */
  }
  if (channel) channel.postMessage(state);
  listeners.forEach((l) => l());
}

function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useGameState() {
  return useSyncExternalStore(subscribe, () => state);
}

// ---------------------------------------------------------------------------
// Leaderboard — persists across "Reset for Next Group", synced the same way
// as game state (BroadcastChannel + localStorage fallback) so entries added
// from the Control Panel show up on the Mission Display's success screen.
// ---------------------------------------------------------------------------
function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(LB_STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch {
    /* corrupted — start fresh */
  }
  return [];
}

let leaderboard = loadLeaderboard();
const lbListeners = new Set();

let lbChannel = null;
try {
  lbChannel = new BroadcastChannel(LB_CHANNEL_NAME);
  lbChannel.onmessage = (e) => acceptRemoteLeaderboard(e.data);
} catch {
  /* BroadcastChannel unavailable — the storage event below still syncs */
}

window.addEventListener('storage', (e) => {
  if (e.key !== LB_STORAGE_KEY || !e.newValue) return;
  try {
    acceptRemoteLeaderboard(JSON.parse(e.newValue));
  } catch {
    /* ignore malformed payloads */
  }
});

function acceptRemoteLeaderboard(next) {
  if (!Array.isArray(next)) return;
  leaderboard = next;
  lbListeners.forEach((l) => l());
}

function commitLeaderboard(next) {
  leaderboard = next;
  try {
    localStorage.setItem(LB_STORAGE_KEY, JSON.stringify(leaderboard));
  } catch {
    /* storage full/blocked — BroadcastChannel still syncs live windows */
  }
  if (lbChannel) lbChannel.postMessage(leaderboard);
  lbListeners.forEach((l) => l());
}

function lbSubscribe(l) {
  lbListeners.add(l);
  return () => lbListeners.delete(l);
}

export function useLeaderboard() {
  return useSyncExternalStore(lbSubscribe, () => leaderboard);
}

// Fastest time first.
export function sortedLeaderboard(lb) {
  return [...lb].sort((a, b) => a.timeUsedMs - b.timeUsedMs);
}

export const leaderboardActions = {
  addEntry(name, timeUsedMs) {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: String(name ?? '').trim() || 'UNNAMED CREW',
      timeUsedMs,
      completedAt: Date.now(),
    };
    commitLeaderboard([...leaderboard, entry]);
    return entry.id;
  },
  renameEntry(id, name) {
    const trimmed = String(name ?? '').trim();
    if (!trimmed) return;
    commitLeaderboard(leaderboard.map((e) => (e.id === id ? { ...e, name: trimmed } : e)));
  },
  // Facilitator cleanup — remove a single run (e.g. a test run).
  deleteEntry(id) {
    commitLeaderboard(leaderboard.filter((e) => e.id !== id));
  },
  // Full wipe — used sparingly, e.g. clearing test data before doors open.
  clearAll() {
    commitLeaderboard([]);
  },
};

// ---------------------------------------------------------------------------
// Derived helpers
// ---------------------------------------------------------------------------
export function remainingMs(timer, now = Date.now()) {
  return timer.running ? Math.max(0, timer.endsAt - now) : timer.remainingMs;
}

export function formatClock(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function taskConfig(id) {
  return CONFIG.tasks.find((t) => t.id === id);
}

export function onlineCount(s) {
  return CONFIG.tasks.filter((t) => s.tasks[t.id].status === 'correct').length;
}

// Letter pair for each task, in order; null where not yet solved correctly.
// Each task always contributes the same fixed letterPair once solved — it's
// no longer looked up by the submitted value (see config.js).
export function collectedSegments(s) {
  return CONFIG.tasks.map((t) => (s.tasks[t.id].status === 'correct' ? t.letterPair : null));
}

const normalize = (str) => String(str ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');

// ---------------------------------------------------------------------------
// Persistent Citronaut hints — most-recently-failed, still-unsolved task
// wins. Hint text escalates from gentle (1st wrong try) to obvious (3rd+).
// ---------------------------------------------------------------------------
export function currentHint(s) {
  const candidates = CONFIG.tasks
    .filter((t) => s.tasks[t.id].status === 'incorrect' && s.tasks[t.id].attempts > 0 && t.hints?.length)
    .sort((a, b) => (s.tasks[b.id].lastAttemptAt ?? 0) - (s.tasks[a.id].lastAttemptAt ?? 0));
  const task = candidates[0];
  if (!task) return null;
  const attempts = s.tasks[task.id].attempts;
  const level = Math.min(attempts, task.hints.length);
  return { task, text: task.hints[level - 1], level };
}

// ---------------------------------------------------------------------------
// Final cipher — the Mission Display never shows the password directly.
// Instead it shows each task's fixed cipherDigit (in task order) as a
// repeating Caesar shift key, and finalPassword run through that shift.
// The team decodes it by hand by shifting each letter back. cipherDigit is
// deliberately independent of correctAnswer — the real measured value
// (2000Ω, 27.933g, ...) is often too large or non-integer to use as a
// hand-computable shift, so each task carries its own small 1-9 digit for
// this purpose instead.
// ---------------------------------------------------------------------------
const A_CODE = 'A'.charCodeAt(0);

function shiftLetter(ch, shift) {
  if (ch < 'A' || ch > 'Z') return ch;
  return String.fromCharCode(((ch.charCodeAt(0) - A_CODE + shift) % 26 + 26) % 26 + A_CODE);
}

export function cipherKey() {
  return CONFIG.tasks.map((t) => t.cipherDigit);
}

export function finalCipherLetters() {
  const key = cipherKey();
  const letters = CONFIG.finalPassword.toUpperCase().replace(/[^A-Z]/g, '').split('');
  return letters.map((ch, i) => shiftLetter(ch, key[i % key.length]));
}

// ---------------------------------------------------------------------------
// Actions — invoked from the Control Panel only
// ---------------------------------------------------------------------------
export const actions = {
  // Wake the idle surface-cam screen into Citronaut's distress call.
  startTransmission() {
    const s = state;
    if (s.phase !== 'idle') return;
    commit({ ...s, phase: 'intro', lastEvent: { type: 'transmission-start', at: Date.now() } });
  },

  beginMission() {
    const s = state;
    if (s.phase !== 'intro') return;
    const timer = CONFIG.autoStartTimerOnBegin
      ? { running: true, endsAt: Date.now() + s.timer.remainingMs, remainingMs: s.timer.remainingMs }
      : s.timer;
    commit({ ...s, phase: 'active', timer, lastEvent: { type: 'mission-start', at: Date.now() } });
  },

  submitTask(id, value) {
    const s = state;
    const cfg = taskConfig(id);
    if (!cfg || s.phase === 'launch') return;
    const num = Number(value);
    if (!Number.isFinite(num)) return;
    // correctAnswer can be null while a task's real value is still TBD
    // (see config.js) — treat every submission as wrong rather than
    // comparing against a coerced 0.
    const correct = cfg.correctAnswer != null && Math.abs(num - cfg.correctAnswer) <= (cfg.tolerance ?? 0);
    const prev = s.tasks[id];
    const prevAttempts = prev.attempts ?? 0;
    const tasks = {
      ...s.tasks,
      [id]: {
        status: correct ? 'correct' : 'incorrect',
        value: num,
        attempts: correct ? prevAttempts : prevAttempts + 1,
        lastAttemptAt: correct ? (prev.lastAttemptAt ?? null) : Date.now(),
      },
    };
    const next = {
      ...s,
      tasks,
      lastEvent: { type: correct ? 'task-online' : 'task-failed', taskId: id, at: Date.now() },
    };
    if (correct && CONFIG.tasks.every((t) => tasks[t.id].status === 'correct')) {
      next.phase = 'final';
      next.lastEvent = { type: 'all-online', taskId: id, at: Date.now() };
    }
    commit(next);
  },

  // Facilitator undo (typo recovery): put a task back to pending. Attempt
  // history is preserved so hint escalation doesn't reset on an undo.
  clearTask(id) {
    const s = state;
    if (!s.tasks[id] || s.phase === 'launch') return;
    const tasks = { ...s.tasks, [id]: { ...s.tasks[id], status: 'pending', value: null } };
    const phase = s.phase === 'final' ? 'active' : s.phase;
    commit({ ...s, tasks, phase });
  },

  startTimer() {
    const s = state;
    if (s.timer.running || s.timer.remainingMs <= 0) return;
    commit({ ...s, timer: { ...s.timer, running: true, endsAt: Date.now() + s.timer.remainingMs } });
  },

  pauseTimer() {
    const s = state;
    if (!s.timer.running) return;
    commit({ ...s, timer: { running: false, endsAt: null, remainingMs: remainingMs(s.timer) } });
  },

  resetTimer() {
    const s = state;
    commit({ ...s, timer: { running: false, endsAt: null, remainingMs: CONFIG.timerMinutes * 60 * 1000 } });
  },

  submitPassword(text) {
    const s = state;
    if (s.phase !== 'final') return;
    if (normalize(text) === normalize(CONFIG.finalPassword)) {
      const left = remainingMs(s.timer);
      const timeUsedMs = CONFIG.timerMinutes * 60 * 1000 - left;
      const entryId = leaderboardActions.addEntry(s.groupName, timeUsedMs);
      commit({
        ...s,
        phase: 'launch',
        launchAt: Date.now(),
        timeUsedMs,
        timer: { running: false, endsAt: null, remainingMs: left }, // freeze the clock
        deniedAt: null,
        leaderboardEntryId: entryId,
      });
    } else {
      commit({ ...s, deniedAt: Date.now(), lastEvent: { type: 'denied', at: Date.now() } });
    }
  },

  // Group name is editable any time before launch; recorded onto the
  // leaderboard entry created at launch.
  setGroupName(name) {
    const s = state;
    if (s.phase === 'launch') return;
    commit({ ...s, groupName: name });
  },

  // Full wipe between groups.
  resetAll() {
    commit(initialState());
  },
};
