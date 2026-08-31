# Diagnostics Station — Task 4

This is the "computer science" station: a second laptop, separate from the
Mission Display / Control Panel laptop, running only this folder.

## Setup

1. Copy this `diagnostics-station` folder (or the whole repo — this folder
   works fine on its own) onto the station laptop.
2. Make sure Python 3 is installed (`python --version` or `python3 --version`).
   No `pip install` is needed — standard library only.
3. Before the event, run it once to confirm it works, then **re-break it**
   by changing `if level > CO2_SAFE_MAX:` back to `if level < CO2_SAFE_MAX:`
   in `check_co2()` so the team has something to fix.

## Running it

```bash
python life_support.py
```

or on some systems:

```bash
python3 life_support.py
```

## What the team needs to do

`life_support.py` simulates Citronaut's CO2 scrubber. As written (broken),
`check_co2()` vents when CO2 is *low* and holds when it's *high* — backwards.
The team needs to read the code, spot the flipped comparison operator in
`check_co2()`, fix it (`<` → `>`), save the file, and run the script again.

- **Still broken:** prints a `DIAGNOSTIC FAILED` message and peak CO2 reading
  — no code number is shown.
- **Fixed:** plays a short recalibration animation and prints a
  `DIAGNOSTIC CODE`, which the team reports to Mission Control on the
  Control Panel.

## Keeping it in sync with the main app

There's no `DIAGNOSTIC_CODE` constant on purpose — it used to be a literal
`= 3` sitting right in the file, which meant a team could just open the
script and read off the answer without ever running it. Now the printed
code is *computed* from the simulation (`vent_count` in `run_simulation()`
— how many of the 10 readings actually got vented), so it only exists once
the logic genuinely runs correctly.

With the current `READINGS`/`CO2_SAFE_MAX` values, the fixed script prints
`DIAGNOSTIC CODE: 3` (3 of the 10 readings exceed the safe threshold), which
must match `tasks.diagnostics.correctAnswer` in
[`../src/config.js`](../src/config.js). If you change `READINGS`,
`CO2_SAFE_MAX`, or the password, re-run the fixed script and update
`correctAnswer` to match whatever it actually prints — don't just guess.
