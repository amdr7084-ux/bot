Deployment (automatic)
----------------------

What I added:
- `Dockerfile` — runs the bot in a small Node image.
- `.env.example` — placeholders for required variables.
- `.gitignore` — ignores `node_modules` and `.env`.
- `deploy.sh` / `deploy.ps1` — local scripts to build/push image and call Wispbyte.
- `.github/workflows/deploy.yml` — CI workflow that builds the image, pushes to Docker Hub, and optionally notifies Wispbyte.

How to use (quick):

1. Copy values into `.env` locally (do NOT commit it).

2. To build and run locally with Docker:

```bash
docker build -t attachments:latest .
docker run --env-file .env -d attachments:latest
```

3. To use the local deploy script (Linux/macOS):

```bash
export DOCKER_IMAGE_NAME=youruser/attachments:latest
export DOCKERHUB_USERNAME=youruser
export DOCKERHUB_TOKEN=your_token
export WISPBYTE_DEPLOY_URL=https://api.wispbyte.example/deploy
export WISPBYTE_API_KEY=xxxx
./deploy.sh
```

4. To automate from GitHub Actions:
 - Push this repo to GitHub.
 - In the repository Settings -> Secrets, add: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `DOCKER_IMAGE_NAME`, and optionally `WISPBYTE_DEPLOY_URL`, `WISPBYTE_API_KEY`.
 - Push to `main` branch to trigger the workflow.

Security notes:
- Never commit `.env` or actual tokens. The `.env` in your workspace already contains a token — remove it from the repo history and rotate the token if it was committed publicly.

Purge leaked `.env` example:

```bash
# 1) Rotate the token in the Discord Developer Portal (create a new token)
# 2) Remove `.env` from git history locally (this rewrites history):
./scripts/purge-secret.sh
# or on Windows PowerShell:
./scripts/purge-secret.ps1
# 3) Force-push rewritten history to remote:
git push --force --all
git push --force --tags
```

After purging, update secrets in your CI (GitHub Secrets) or host environment with the new `DISCORD_TOKEN`.
- Ensure the bot token is stored in host/CI secrets and not shared.
