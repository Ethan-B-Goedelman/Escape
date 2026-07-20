import React, { useState } from 'react';
import { CONFIG } from './config.js';
import {
  useGameState,
  actions,
  remainingMs,
  formatClock,
  collectedSegments,
  onlineCount,
} from './store.js';
import { useNow } from './hooks.js';
import Citronaut from './Citronaut.jsx';

function StatusChip({ status }) {
  const label = { pending: 'PENDING', correct: 'ONLINE', incorrect: 'INCORRECT' }[status];
  return <span className={`chip chip-${status}`}>{label}</span>;
}

function TaskCard({ task, state }) {
  const [value, setValue] = useState('');
  const st = state.tasks[task.id];
  const locked = st.status === 'correct' || state.phase === 'launch';

  const submit = (e) => {
    e.preventDefault();
    if (value === '' || locked) return;
    actions.submitTask(task.id, value);
    setValue('');
  };

  return (
    <div className={`hud-panel task-card task-${st.status}`}>
      <div className="task-head">
        <span className="task-name">{task.name}</span>
        <StatusChip status={st.status} />
      </div>
      <div className="task-desc">{task.description}</div>
      {st.status === 'correct' ? (
        <div className="task-result">
          RESULT: <strong>{st.value}</strong> → DECODED:{' '}
          <strong className="decoded">{task.decode[st.value]}</strong>
          <button className="btn btn-ghost btn-tiny" onClick={() => actions.clearTask(task.id)}>
            undo
          </button>
        </div>
      ) : (
        <form className="task-form" onSubmit={submit}>
          <input
            className="num-input"
            type="number"
            inputMode="numeric"
            placeholder="#"
            value={value}
            disabled={locked}
            onChange={(e) => setValue(e.target.value)}
            aria-label={`Result number for ${task.name}`}
          />
          <button className="btn" type="submit" disabled={locked || value === ''}>
            SUBMIT
          </button>
          {st.status === 'incorrect' && (
            <span className="task-retry">
              team entered {st.value} — wrong, retry when they have a new number
            </span>
          )}
        </form>
      )}
    </div>
  );
}

function PasswordSection({ state }) {
  const [pw, setPw] = useState('');
  const segments = collectedSegments(state);
  const denied =
    state.deniedAt && Date.now() - state.deniedAt < 4000 ? true : state.deniedAt && state.phase === 'final';

  if (state.phase === 'launch') {
    return (
      <div className="hud-panel pw-section pw-launched">
        <div className="section-title">LAUNCH SEQUENCE INITIATED ✓</div>
        <div className="pw-hint">
          The Mission Display is playing the launch sequence. When the group clears
          out, hit “Reset for Next Group”.
        </div>
      </div>
    );
  }

  return (
    <div className="hud-panel pw-section">
      <div className="section-title">FINAL LAUNCH AUTHORIZATION</div>
      <div className="pw-letters">
        {segments.map((seg, i) => (
          <span key={i} className="pw-segment">{seg}</span>
        ))}
      </div>
      <div className="pw-hint">
        All systems online. Ask the team for the launch password, then enter it
        here — the result plays on the Mission Display.
      </div>
      <form
        className="task-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (pw.trim() === '') return;
          actions.submitPassword(pw);
          setPw('');
        }}
      >
        <input
          className="pw-input"
          type="text"
          placeholder="LAUNCH PASSWORD"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoComplete="off"
        />
        <button className="btn btn-primary" type="submit" disabled={pw.trim() === ''}>
          AUTHORIZE LAUNCH
        </button>
      </form>
      {denied && <div className="pw-denied">LAST ATTEMPT DENIED — they can try again</div>}
    </div>
  );
}

export default function ControlPanel() {
  const state = useGameState();
  const now = useNow(true, 250);
  const left = remainingMs(state.timer, now);
  const online = onlineCount(state);

  const resetAll = () => {
    if (window.confirm('Reset ALL progress and the timer for the next group?')) {
      actions.resetAll();
    }
  };

  return (
    <div className="control crt">
      <div className="facilitator-banner">
        ⚠ FACILITATOR ONLY — DO NOT PROJECT THIS WINDOW ⚠
      </div>

      <header className="control-header">
        <div className="control-brand">
          <Citronaut size={44} />
          <div>
            <div className="control-title">CITRONAUTS ESCAPE · CONTROL PANEL</div>
            <div className="control-sub">
              PHASE: <strong>{state.phase.toUpperCase()}</strong> · SYSTEMS ONLINE:{' '}
              <strong>{online}/{CONFIG.tasks.length}</strong> · KNIGHTS MC
            </div>
          </div>
        </div>
        <div className={`control-clock ${left === 0 ? 'clock-expired' : ''}`}>
          {formatClock(left)}
        </div>
      </header>

      <div className="hud-panel control-bar">
        {state.phase === 'intro' ? (
          <button className="btn btn-primary btn-big" onClick={actions.beginMission}>
            ▶ BEGIN MISSION
            {CONFIG.autoStartTimerOnBegin && <span className="btn-note">starts the clock</span>}
          </button>
        ) : (
          <>
            {state.timer.running ? (
              <button className="btn" onClick={actions.pauseTimer}>⏸ PAUSE CLOCK</button>
            ) : (
              <button className="btn" onClick={actions.startTimer} disabled={left === 0}>
                ▶ START CLOCK
              </button>
            )}
            <button className="btn" onClick={actions.resetTimer}>↺ RESET CLOCK</button>
          </>
        )}
        <div className="control-bar-spacer" />
        <button className="btn btn-danger" onClick={resetAll}>
          ⟲ RESET FOR NEXT GROUP
        </button>
      </div>

      <div className="task-grid">
        {CONFIG.tasks.map((t) => (
          <TaskCard key={t.id} task={t} state={state} />
        ))}
      </div>

      {(state.phase === 'final' || state.phase === 'launch') && (
        <PasswordSection state={state} />
      )}

      <footer className="control-footer">
        Mission Display not open? Visit <code>/display</code> in another window.
        Correct answers &amp; decode legend live in <code>src/config.js</code>.
      </footer>
    </div>
  );
}
