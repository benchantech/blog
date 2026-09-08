#!/usr/bin/env sh
# Typecheck immediately after a write to governed content (ADR 0006).
#
# Three separate regex-scripted edits corrupted TypeScript in one session — an
# over-greedy match that ate a string literal, a comment rewrite that swallowed
# a `const`, and a replace that silently matched nothing. Two produced PARSE
# failures, which look nothing like the thing being checked for, and all three
# were found only because `tsc` happened to run soon afterwards.
#
# This makes "soon afterwards" immediate. It reports and does not block: a
# failing typecheck mid-refactor is normal, and a hook that blocked would be
# turned off within a day. Being unmissable is enough.
set -eu
case "${CLAUDE_TOOL_FILE_PATHS:-}" in
  *content/*|*lib/*|*tests/*) ;;
  *) exit 0 ;;
esac
cd "$(dirname "$0")/.." || exit 0
if ! out=$(npx tsc --noEmit 2>&1); then
  printf 'tsc FAILED after this edit (ADR 0006 — scripted edits corrupt TypeScript silently):\n%s\n' \
    "$(printf '%s' "$out" | grep 'error TS' | head -5)"
fi
exit 0
