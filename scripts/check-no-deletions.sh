#!/usr/bin/env sh
# Deletion contract (plan §3.0, user constraint 2).
#
# Nothing may delete a file, and nothing may rename one EXCEPT the 2026-09-09
# rebrand. A rename breaks a URL just as surely as a deletion, so both
# --diff-filter=D and --diff-filter=R are gates.
#
# Never use `git diff --stat` for this: --stat has no removed-files field, so a
# deleted route (`app/terms/page.tsx | 56 --`) is visually identical to a heavily
# edited one and a reviewer following a --stat instruction would pass the gate on
# a branch that dropped a preserved route.
#
# THE ONE PERMITTED RENAME, AND WHY IT IS A SHAPE RATHER THAN A LIST.
#
# Ben, 2026-09-09: "we need a serious rebrand: change everything deeply from
# Trust Forward to Developer Forward … this includes urls and do not need to
# permalink old ones." That is a deliberate instruction to break URLs, which is
# exactly what this gate exists to prevent by accident — so the exception is
# defined by the TRANSFORMATION and not by a hand-kept list of paths.
#
# A rename passes only if replacing `trust-forward` with `developer-forward` in
# the old path yields the new path exactly. Nothing else can ride along: a file
# renamed for any other reason, or a rebrand rename that also moves a file to a
# different directory, still fails. The exception cannot be widened without
# editing this rule, and it disappears on its own once the rebrand commit is on
# `main` and there is nothing left to rename.
#
# Usage: scripts/check-no-deletions.sh [base-ref]   (base-ref defaults to main)
set -eu

base="${1:-main}"
found=0

# Print only the renames that are NOT the rebrand, as "old -> new".
unexpected_renames() {
  # $1 = a `git diff --name-status -M` invocation's output
  printf '%s\n' "$1" | awk -F'\t' '
    /^R/ {
      old = $2; new = $3
      want = old
      gsub(/trust-forward/, "developer-forward", want)
      if (want != new) print old " -> " new
    }'
}

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
  report "Files RENAMED for something other than the rebrand, between $base and HEAD:" \
    "$(unexpected_renames "$(git diff --name-status -M --diff-filter=R "$base"...HEAD)")"
else
  printf 'note: ref "%s" not found; skipping the committed-range check.\n' "$base" >&2
fi

# Also catch deletions that exist only in the working tree or the index, so the
# gate is useful before the phase commit lands, not only after it.
report "Files DELETED in the working tree / index (vs HEAD):" \
  "$(git diff --name-only -M --diff-filter=D HEAD)"
report "Files RENAMED for something other than the rebrand, in the working tree / index (vs HEAD):" \
  "$(unexpected_renames "$(git diff --name-status -M --diff-filter=R HEAD)")"

if [ "$found" -ne 0 ]; then
  printf 'Deletion contract FAILED. Nothing is deleted or renamed on this branch.\n' >&2
  exit 1
fi

printf 'Deletion contract OK: nothing deleted, and every rename is the rebrand.\n'
