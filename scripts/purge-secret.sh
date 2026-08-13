#!/usr/bin/env bash
set -euo pipefail

echo "This script removes the file .env from git history (local repo)."
echo "It requires a clean working tree and will rewrite history."

if [ -n "$(git status --porcelain)" ]; then
  echo "Please commit or stash changes before running this script." >&2
  exit 1
fi

if command -v git-filter-repo >/dev/null 2>&1; then
  echo "Using git-filter-repo to remove .env from history..."
  git filter-repo --path .env --invert-paths
  echo "Done. Review the repo, then force-push: git push --force --all && git push --force --tags"
else
  echo "git-filter-repo not found. You can install it from https://github.com/newren/git-filter-repo"
  echo "Fallback: run the following (slower) git filter-branch alternative if you understand the risks:"
  echo
  echo "git filter-branch --force --index-filter \"git rm --cached --ignore-unmatch .env\" --prune-empty --tag-name-filter cat -- --all"
  echo
  echo "After running filter-branch, run: git push --force --all && git push --force --tags"
  exit 2
fi
