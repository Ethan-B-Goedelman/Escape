import React from 'react';
import { createRoot } from 'react-dom/client';
import ControlPanel from './ControlPanel.jsx';
import MissionDisplay from './MissionDisplay.jsx';
import './styles.css';

// Tiny router: /display and /control (path or hash form, so it also works
// behind static servers without SPA fallback, e.g. /#/display).
function currentRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  return hash || path;
}

function Launcher() {
  const open = (route) =>
    window.open(`${window.location.origin}/${route}`, `citronauts-${route}`);
  return (
    <div className="launcher crt">
      <div className="launcher-box hud-panel">
        <div className="launcher-title">CITRONAUTS ESCAPE</div>
        <div className="launcher-sub">MISSION CONTROL BOOT MENU</div>
        <button className="btn btn-big" onClick={() => open('display')}>
          OPEN MISSION DISPLAY
          <span className="btn-note">project this one · press F11 for fullscreen</span>
        </button>
        <button className="btn btn-big" onClick={() => open('control')}>
          OPEN CONTROL PANEL
          <span className="btn-note">facilitator only · keep on the laptop screen</span>
        </button>
        <div className="launcher-hint">
          Open both windows, drag the Mission Display to the projector, then run
          the game entirely from the Control Panel. The two stay in sync
          automatically.
        </div>
      </div>
    </div>
  );
}

function App() {
  const route = currentRoute();
  if (route === 'display') return <MissionDisplay />;
  if (route === 'control') return <ControlPanel />;
  return <Launcher />;
}

createRoot(document.getElementById('root')).render(<App />);
