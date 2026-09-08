#!/usr/bin/env sh
# Surface the ADR register at session start (ADR 0008).
#
# AGENTS.md carries the instruction to read these, which covers any agent that
# reads it. This hook covers the case AGENTS.md cannot: an agent that starts
# work without reading it. The register is small enough to print in full, and an
# ADR nobody opens is indistinguishable from one that was never written.
#
# Prints Status and Stale-when only. A future session needs those two fields to
# decide whether an ADR is guidance or history; the body can be read on demand.
set -eu
dir="$(cd "$(dirname "$0")/.." && pwd)/docs/adr"
[ -d "$dir" ] || exit 0
printf 'Architecture Decision Records — docs/adr/ (read Status and Stale-when before relying on one)\n\n'
for f in "$dir"/[0-9]*.md; do
  [ -e "$f" ] || continue
  title=$(sed -n '1s/^# //p' "$f")
  status=$(sed -n 's/^\*\*Status:\*\* //p' "$f" | head -1)
  decided=$(sed -n 's/^\*\*Decided:\*\* //p' "$f" | head -1)
  stale=$(sed -n 's/^\*\*Stale when:\*\* //p' "$f" | head -1)
  printf '  [%s] %s\n' "$status" "$title"
  printf '        decided %s · stale when: %s\n' "$decided" "$stale"
done
printf '\nAn ADR whose Stale-when condition has been met is history, not guidance.\n'
