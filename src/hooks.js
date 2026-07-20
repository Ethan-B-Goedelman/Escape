import { useEffect, useState } from 'react';

// Re-render on a fixed interval while `active` — used to tick clocks and
// drive time-based animation stages without syncing every tick across windows.
export function useNow(active = true, interval = 200) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return undefined;
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [active, interval]);
  return now;
}
