#!/usr/bin/env sh
# Deletion contract (plan §3.0, user constraint 2).
#
# Nothing on this branch may delete or rename a file. A rename breaks a URL just
# as surely as a deletion, so both --diff-filter=D and --diff-filter=R are gates.
#
# Never use `git diff --stat` for this: --stat has no removed-files field, so a
# deleted route (`app/terms/page.tsx | 56 --`) is visually identical to a heavily
# edited one and a reviewer following a --stat instruction would pass the gate on
# a branch that dropped a preserved route.
#
# Usage: scripts/check-no-deletions.sh [base-ref]   (base-ref defaults to main)
set -eu

base="${1:-main}"
found=0

report() {
  # $1 = label, $2 = newline-separated paths (possibly empty)
  if [ -n "$2" ]; then
    printf '%s\n' "$1" >&2
    printf '%s\n' "$2" | sed 's/^/  /' >&2
    found=1
  fi
}

if git rev-parse --verify --quiet "$base" >/dev/null; then
  report "Files DELETED between $base and HEAD:" \
    "$(git diff --name-only -M --diff-filter=D "$base"...HEAD)"
  report "Files RENAMED between $base and HEAD:" \
    "$(git diff --name-only -M --diff-filter=R "$base"...HEAD)"
else
  printf 'note: ref "%s" not found; skipping the committed-range check.\n' "$base" >&2
fi

# Also catch deletions that exist only in the working tree or the index, so the
# gate is useful before the phase commit lands, not only after it.
report "Files DELETED or RENAMED in the working tree / index (vs HEAD):" \
  "$(git diff --name-only -M --diff-filter=DR HEAD)"

if [ "$found" -ne 0 ]; then
  printf 'Deletion contract FAILED. Nothing is deleted or renamed on this branch.\n' >&2
  exit 1
fi

printf 'Deletion contract OK: no files deleted or renamed.\n'
