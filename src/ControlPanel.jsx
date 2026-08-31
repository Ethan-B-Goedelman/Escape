import React, { useState } from 'react';
import { CONFIG } from './config.js';
import {
  useGameState,
  actions,
  remainingMs,
  formatClock,
  collectedSegments,
  onlineCount,
  useLeaderboard,
  sortedLeaderboard,
  leaderboardActions,
} from './store.js';
import { useNow } from './hooks.js';
import Citronaut from './Citronaut.jsx';
import { isMuted, setMuted } from './sound.js';

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
      {task.correctAnswer == null && (
        <div className="task-unconfigured">
          ⚠ correctAnswer not set in config.js yet — this task can't be marked correct until it is.
        </div>
      )}
      {st.status === 'correct' ? (
        <div className="task-result">
          RESULT: <strong>{st.value}{task.unit}</strong> → DECODED:{' '}
          <strong className="decoded">{task.letterPair}</strong>
          <button className="btn btn-ghost btn-tiny" onClick={() => actions.clearTask(task.id)}>
            undo
          </button>
        </div>
      ) : (
        <form className="task-form" onSubmit={submit}>
          <input
            className="num-input"
            type="number"
            step="any"
            inputMode="decimal"
            placeholder={task.unit || '#'}
            value={value}
            disabled={locked}
            onChange={(e) => setValue(e.target.value)}
            aria-label={`Measured value for ${task.name}${task.unit ? ` (${task.unit})` : ''}`}
          />
          <button className="btn" type="submit" disabled={locked || value === ''}>
            SUBMIT
          </button>
          {task.tolerance > 0 && (
            <span className="task-tolerance">accepts ±{task.tolerance}{task.unit}</span>
          )}
          {st.status === 'incorrect' && (
            <span className="task-retry">
              team entered {st.value}{task.unit} — wrong, retry when they have a new number
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
      <div className="pw-hint">
        Facilitator answer key (NOT shown to the team) — the segments below spell
        the password. The Mission Display instead shows the team a cipher built
        from these same letters, which they decode by hand using their four
        recovered codes.
      </div>
      <div className="pw-letters">
        {segments.map((seg, i) => (
          <span key={i} className="pw-segment">{seg}</span>
        ))}
      </div>
      <div className="pw-hint">
        Once the team reports the decoded password, enter it here — the result
        plays on the Mission Display.
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

// One editable row: name commits on blur/Enter (so mid-typing doesn't get
// clobbered by the store's controlled value); delete removes it outright.
function LeaderboardRow({ entry, rank }) {
  const [name, setName] = useState(entry.name);

  const commit = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== entry.name) {
      leaderboardActions.renameEntry(entry.id, trimmed);
    } else {
      setName(entry.name); // revert if left blank/unchanged
    }
  };

  return (
    <div className="lb-row">
      <span className="lb-rank">#{rank}</span>
      <input
        className="lb-name-input"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
        }}
        aria-label={`Rename entry ${rank}`}
      />
      <span className="lb-time">{formatClock(entry.timeUsedMs)}</span>
      <button
        className="btn btn-ghost btn-tiny"
        onClick={() => leaderboardActions.deleteEntry(entry.id)}
      >
        delete
      </button>
    </div>
  );
}

function LeaderboardPanel() {
  const lb = useLeaderboard();
  const sorted = sortedLeaderboard(lb);

  const clearAll = () => {
    if (window.confirm('Delete the ENTIRE leaderboard? This cannot be undone.')) {
      leaderboardActions.clearAll();
    }
  };

  return (
    <div className="hud-panel lb-panel">
      <div className="section-title">LEADERBOARD</div>
      {sorted.length === 0 ? (
        <div className="pw-hint">No completed runs yet — the fastest launch shows up here first.</div>
      ) : (
        <>
          <div className="pw-hint">
            Fastest time wins. Rename or delete entries here — e.g. to clear out test runs before
            the event starts. This list is separate from the game state and survives “Reset for
            Next Group”.
          </div>
          <div className="lb-list">
            {sorted.map((entry, i) => (
              <LeaderboardRow key={entry.id} entry={entry} rank={i + 1} />
            ))}
          </div>
          <button className="btn btn-ghost btn-tiny" onClick={clearAll}>
            clear entire leaderboard
          </button>
        </>
      )}
    </div>
  );
}

export default function ControlPanel() {
  const state = useGameState();
  const now = useNow(true, 250);
  const left = remainingMs(state.timer, now);
  const online = onlineCount(state);
  const [muted, setMutedState] = useState(isMuted());

  const toggleMuted = () => {
    setMuted(!muted);
    setMutedState(!muted);
  };

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
        <button className="btn btn-mute" onClick={toggleMuted} title="Mutes/unmutes sound on the Mission Display">
          {muted ? '🔇 SOUND OFF' : '🔊 SOUND ON'}
        </button>
      </header>

      <div className="hud-panel group-name-bar">
        <label className="group-name-label" htmlFor="group-name-input">GROUP NAME</label>
        <input
          id="group-name-input"
          className="group-name-input"
          type="text"
          placeholder="e.g. Team Falcon — shown on the leaderboard after launch"
          value={state.groupName}
          onChange={(e) => actions.setGroupName(e.target.value)}
          disabled={state.phase === 'launch'}
          autoComplete="off"
        />
      </div>

      <div className="hud-panel control-bar">
        {state.phase === 'idle' ? (
          <button className="btn btn-primary btn-big" onClick={actions.startTransmission}>
            ▶ START
            <span className="btn-note">plays Citronaut's distress call</span>
          </button>
        ) : state.phase === 'intro' ? (
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

      <LeaderboardPanel />

      <footer className="control-footer">
        Mission Display not open? Visit <code>/display</code> in another window.
        Correct answers &amp; decode legend live in <code>src/config.js</code>.
      </footer>
    </div>
  );
}
