#!/bin/sh
set -eu

PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export PATH

repository_url="https://github.com/benchantech/blog.git"
vercel_project_file="/Users/benchan/yy/benchantech/.vercel/project.json"
temporary_parent="${TMPDIR:-/tmp}"
work_directory=$(mktemp -d "${temporary_parent%/}/benchantech-gpt-usage.XXXXXX")

cleanup() {
  case "$work_directory" in
    "${temporary_parent%/}"/benchantech-gpt-usage.*) /bin/rm -rf -- "$work_directory" ;;
    *) printf '%s\n' "Refusing to remove unexpected temporary path" >&2 ;;
  esac
}
trap cleanup EXIT HUP INT TERM

git clone --quiet --branch main --single-branch "$repository_url" "$work_directory/repo"
cd "$work_directory/repo"

usage_json=$(scripts/read-codex-usage.sh)
remaining=$(printf '%s' "$usage_json" | node -e '
  let input = "";
  process.stdin.on("data", (chunk) => input += chunk);
  process.stdin.on("end", () => {
    const value = JSON.parse(input);
    if (!Number.isInteger(value.remainingPercent)) process.exit(1);
    process.stdout.write(String(value.remainingPercent));
  });
')
reset_at=$(printf '%s' "$usage_json" | node -e '
  let input = "";
  process.stdin.on("data", (chunk) => input += chunk);
  process.stdin.on("end", () => {
    const value = JSON.parse(input);
    if (typeof value.resetAt !== "string") process.exit(1);
    process.stdout.write(value.resetAt);
  });
')

node scripts/update-gpt-usage.mjs --remaining "$remaining" --reset-at "$reset_at"

git add -- content/company/gpt-usage.json content/company/gpt-usage-history.json
if git diff --cached --quiet; then
  printf '%s\n' "Codex usage did not change; nothing to publish"
  exit 0
fi

git commit --quiet -m "Update Codex usage observation"
git push --quiet origin HEAD:main

if [ ! -f "$vercel_project_file" ]; then
  printf '%s\n' "Missing linked Vercel project configuration: $vercel_project_file" >&2
  exit 1
fi
mkdir -p .vercel
cp "$vercel_project_file" .vercel/project.json
deployment_url=$(vercel deploy --prod --yes 2>/dev/null | tail -n 1)

printf '%s\n' "Published Codex usage observation: ${remaining}% remaining, reset ${reset_at}"
printf '%s\n' "Production deployment: ${deployment_url}"
