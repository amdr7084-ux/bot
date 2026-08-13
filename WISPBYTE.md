Deploying the Discord bot to Wispbyte
-----------------------------------

This document explains how to prepare and deploy the bot to Wispbyte using a Docker image.

Prerequisites:
- A Wispbyte account and API endpoint for deployments (or use their web UI to deploy an image).
- Docker installed locally (for building/testing).
- Repository has secrets stored in Wispbyte or GitHub Actions (do NOT commit `.env`).

1) Build the Docker image locally (from repo root):

```bash
docker build -t youruser/attachments:latest .
```

2) Test the container locally (uses `.env` file for secrets):

```bash
docker run --env-file .env -d --name attachments-bot youruser/attachments:latest
docker logs -f attachments-bot
```

3) Push the image to a Docker registry (Docker Hub):

```bash
docker login
docker push youruser/attachments:latest
```

4) Deploy on Wispbyte:
- Option A: Using Wispbyte web UI: create a new app/service and point it to the image `youruser/attachments:latest`. Set environment variables in Wispbyte (e.g., `DISCORD_TOKEN`, `PROTECTED_CHANNEL_ID`, `LOG_CHANNEL_ID`, `EXEMPT_USER_IDS`).
- Option B: Using Wispbyte API: call their deploy endpoint with JSON `{ "image": "youruser/attachments:latest" }` and include your API key. The included `deploy.sh` script can call this endpoint when `WISPBYTE_*` env vars are set.

5) Runtime considerations:
- Ensure your container has outgoing network access for Discord (port 443) and the bot token is provided via environment variables.
- Ensure the bot has the correct Gateway Intents and permissions in the Discord Developer Portal and in the server (delete messages, ban members, view audit logs).
- Set `NODE_ENV=production` in Wispbyte environment variables.

6) Logs and restarts:
- Use Wispbyte's logs view to monitor the bot output. Configure automatic restarts on failures if available.

Security:
- Never store `DISCORD_TOKEN` in repository; use Wispbyte secrets or GitHub Secrets for CI.
- If a token was leaked, rotate it immediately and purge it from repo history (see `scripts/purge-secret.sh`).

Questions? I can (pick one):
- a) Add a `wispbyte.json` manifest if you want to automate API-based deploys. 
- b) Build and push the Docker image from this environment (needs Docker credentials).
