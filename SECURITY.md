Security and secret rotation
---------------------------

1. Immediately rotate the Discord bot token:
   - Open the Discord Developer Portal for your application and regenerate the bot token.
   - Update any host/CI secrets with the new token (do NOT commit it).

2. Remove the leaked `.env` from git history (run locally):

```bash
# Ensure a clean working tree:
git status --porcelain
# Run the provided purge script (recommended):
./scripts/purge-secret.sh
# Or on Windows PowerShell:
./scripts/purge-secret.ps1
# After rewriting history, force-push to remote:
git push --force --all
git push --force --tags
```

3. Replace the token in the repository with secrets:
   - Locally keep `.env` (added to `.gitignore`) and do not commit.
   - For CI (GitHub Actions), add the token as `DISCORD_TOKEN` in repository Secrets.

4. If this repo was public before removing the token, assume compromise and rotate other related credentials if needed.
