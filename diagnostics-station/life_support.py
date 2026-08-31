"""
CITRONAUTS ESCAPE — LIFE SUPPORT DIAGNOSTIC TERMINAL
=====================================================
Station: Task 4 — System Diagnostics (Life Support)

Citronaut's CO2 scrubber has ONE bug in its control logic below. Find it,
fix it, save this file, and run the script again:

    python life_support.py

If the logic is correct, the scrubber simulation stabilizes and this
terminal reveals a DIAGNOSTIC CODE. Report that number to Mission Control.

If it's still broken, the simulation will flag the fault and NO code will
be shown — keep looking.

This file is completely standalone: plain Python 3, standard library only,
no installs required.
"""

import sys
import time

# ---------------------------------------------------------------------------
# Mission parameters — do not change these.
# ---------------------------------------------------------------------------
CO2_SAFE_MAX = 8.0  # percent — above this, the cabin MUST vent
READINGS = [3.1, 4.8, 6.5, 7.9, 9.4, 11.2, 9.8, 6.0, 4.2, 3.0]

# There is no separate "answer" constant on purpose — the diagnostic code is
# computed from the simulation itself (how many cycles actually vented), so
# it only exists once the logic genuinely runs correctly. Reading this file
# top to bottom won't hand you the number; running it will.

# ---------------------------------------------------------------------------

def check_co2(level):
    """Decide whether the scrubber should VENT or HOLD this cycle."""
    # Vent whenever CO2 climbs above the safe threshold.
    if level < CO2_SAFE_MAX:
        return "VENT"
    return "HOLD"

# ---------------------------------------------------------------------------

def run_simulation():
    peak = 0.0
    faulted = False
    log = []
    for level in READINGS:
        action = check_co2(level)
        peak = max(peak, level)
        log.append((level, action))
        if level > CO2_SAFE_MAX and action != "VENT":
            faulted = True
    vent_count = sum(1 for _, action in log if action == "VENT")
    return log, peak, faulted, vent_count


def type_out(line, delay=0.02):
    for ch in line:
        sys.stdout.write(ch)
        sys.stdout.flush()
        time.sleep(delay)
    print()


def play_success(diagnostic_code):
    print()
    type_out("> LIFE SUPPORT SCRUBBER ........... RECALIBRATING")
    time.sleep(0.4)
    for pct in (20, 45, 68, 84, 100):
        print(f"  [{'#' * (pct // 5):<20}] {pct}%")
        time.sleep(0.25)
    type_out("> CO2 LEVELS ....................... STABLE")
    type_out("> LIFE SUPPORT ...................... ONLINE")
    time.sleep(0.3)
    print()
    print("=" * 44)
    print(f"   DIAGNOSTIC CODE: {diagnostic_code}")
    print("=" * 44)
    print()
    print("Report this number to Mission Control.")


def play_fault(peak):
    print()
    type_out("> LIFE SUPPORT SCRUBBER ........... RECALIBRATING")
    time.sleep(0.3)
    type_out("! WARNING: CO2 EXCEEDED SAFE THRESHOLD")
    type_out(f"! PEAK CO2 READING: {peak:.1f}%  (SAFE MAX: {CO2_SAFE_MAX:.1f}%)")
    time.sleep(0.2)
    type_out("! SCRUBBER FAILED TO VENT IN TIME")
    print()
    print("*" * 44)
    print("   DIAGNOSTIC FAILED -- LIFE SUPPORT UNSTABLE")
    print("*" * 44)
    print()
    print("check_co2() isn't venting when it should be.")
    print("Re-read the comparison. Fix it, save, and run again.")


def main():
    print("CITRONAUTS ESCAPE -- LIFE SUPPORT DIAGNOSTIC")
    print("Running scrubber simulation across 10 telemetry cycles...")
    time.sleep(0.5)
    log, peak, faulted, vent_count = run_simulation()
    for level, action in log:
        type_out(f"  CO2 {level:>4.1f}%  ->  {action}", delay=0.01)
        time.sleep(0.08)

    if faulted:
        play_fault(peak)
    else:
        play_success(vent_count)


if __name__ == "__main__":
    main()
