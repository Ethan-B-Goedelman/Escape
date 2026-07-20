// Shared game state, synchronized across browser windows/tabs on the same
// machine via BroadcastChannel, with a localStorage 'storage'-event fallback.
// State is also persisted to localStorage so a refresh mid-game recovers.
// Only the Control Panel mutates state; the Mission Display just renders it.
import { useSyncExternalStore } from 'react';
import { CONFIG } from './config.js';

const STORAGE_KEY = 'citronauts-escape-state-v1';
const CHANNEL_NAME = 'citronauts-escape-sync-v1';

export function initialState() {
  const tasks = {};
  for (const t of CONFIG.tasks) tasks[t.id] = { status: 'pending', value: null };
  return {
    rev: 0,
    // intro -> active -> final (all systems online) -> launch (password accepted)
    phase: 'intro',
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
export function collectedSegments(s) {
  return CONFIG.tasks.map((t) => {
    const st = s.tasks[t.id];
    return st.status === 'correct' ? (t.decode[st.value] ?? '??') : null;
  });
}

const normalize = (str) => String(str ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');

// ---------------------------------------------------------------------------
// Actions — invoked from the Control Panel only
// ---------------------------------------------------------------------------
export const actions = {
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
    const correct = num === cfg.correctAnswer;
    const tasks = { ...s.tasks, [id]: { status: correct ? 'correct' : 'incorrect', value: num } };
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

  // Facilitator undo (typo recovery): put a task back to pending.
  clearTask(id) {
    const s = state;
    if (!s.tasks[id] || s.phase === 'launch') return;
    const tasks = { ...s.tasks, [id]: { status: 'pending', value: null } };
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
      commit({
        ...s,
        phase: 'launch',
        launchAt: Date.now(),
        timeUsedMs: CONFIG.timerMinutes * 60 * 1000 - left,
        timer: { running: false, endsAt: null, remainingMs: left }, // freeze the clock
        deniedAt: null,
      });
    } else {
      commit({ ...s, deniedAt: Date.now(), lastEvent: { type: 'denied', at: Date.now() } });
    }
  },

  // Full wipe between groups.
  resetAll() {
    commit(initialState());
  },
};
