Simple Ticket Bot

Usage
- Set environment variables (in Wispbyte or .env):
  - `DISCORD_TOKEN` — bot token
  - `TICKET_CATEGORY_ID` — category ID where tickets will be created (optional)
  - `TICKET_STAFF_ROLE_ID` — role ID that can see and close tickets (optional)
  - `TICKET_PREFIX` — command prefix (default: `!ticket`)

- Run: `node src/ticket-bot/index.js`

Commands
- `!ticket <reason>` — opens a private ticket channel for the user.
