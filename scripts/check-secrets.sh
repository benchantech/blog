#!/usr/bin/env sh
set -eu

mode="${1:-working-tree}"

case "$mode" in
  staged)
    files="$(git diff --cached --name-only --diff-filter=ACMR)"
    ;;
  working-tree)
    files="$(git ls-files --others --cached --exclude-standard)"
    ;;
  *)
    printf 'usage: %s [staged|working-tree]\n' "$0" >&2
    exit 2
    ;;
esac

[ -n "$files" ] || exit 0

tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT

printf '%s\n' "$files" | while IFS= read -r file; do
  [ -f "$file" ] || continue

  case "$file" in
    .git/*|.next/*|node_modules/*|vendor/*|scripts/check-secrets.sh)
      continue
      ;;
  esac

  grep -Iq . "$file" || continue

  case "$mode" in
    staged)
      if git ls-files --error-unmatch "$file" >/dev/null 2>&1; then
        git show ":$file" 2>/dev/null || true
      else
        cat "$file"
      fi
      ;;
    working-tree)
      cat "$file"
      ;;
  esac | awk -v file="$file" '
    BEGIN {
      patterns[1] = "(cfat_|CF_API_KEY|CLOUDFLARE_API_TOKEN|CF_API_TOKEN)[A-Za-z0-9_:=\\\"'\'' -]{20,}"
      patterns[2] = "-----BEGIN .*PRIVATE KEY-----"
      patterns[3] = "(api[_-]?key|secret|token|password)[A-Za-z0-9_ -]*[:=][[:space:]]*[\\\"'\'' ]?[A-Za-z0-9_./+=-]{24,}"
    }
    {
      for (i in patterns) {
        if ($0 ~ patterns[i]) {
          printf "%s:%d: possible secret\n", file, NR
        }
      }
    }
  ' >> "$tmp"
done

if [ -s "$tmp" ]; then
  printf 'Secret scan failed. Remove secrets or use an untracked local env file.\n' >&2
  cat "$tmp" >&2
  exit 1
fi
