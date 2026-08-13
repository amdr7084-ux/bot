Param()

Write-Host "This script removes the file .env from git history (local repo)." -ForegroundColor Yellow
if ((git status --porcelain) -ne '') {
  Write-Host "Please commit or stash changes before running this script." -ForegroundColor Red
  exit 1
}

try {
  git-filter-repo --version > $null 2>&1
  $hasFilterRepo = $true
} catch {
  $hasFilterRepo = $false
}

if ($hasFilterRepo) {
  Write-Host "Using git-filter-repo to remove .env from history..."
  git filter-repo --path .env --invert-paths
  Write-Host "Done. Review the repo, then force-push: git push --force --all && git push --force --tags"
} else {
  Write-Host "git-filter-repo not found. Install it from https://github.com/newren/git-filter-repo" -ForegroundColor Yellow
  Write-Host "Fallback (dangerous) command using filter-branch:" -ForegroundColor Yellow
  Write-Host "git filter-branch --force --index-filter \"git rm --cached --ignore-unmatch .env\" --prune-empty --tag-name-filter cat -- --all" -ForegroundColor Cyan
  exit 2
}
