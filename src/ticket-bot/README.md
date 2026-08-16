Simple Ticket Bot

Usage
- Set environment variables (in Wispbyte or .env):
  - `DISCORD_TOKEN` — bot token
  - `TICKET_CATEGORY_ID` — category ID where tickets will be created (optional)
  - `TICKET_STAFF_ROLE_ID` — role ID that can see and close tickets (optional)
  - `TICKET_PREFIX` — command prefix (default: `!ticket`)

- Run: `node src/ticket-bot/index.js`

Slash Commands
- `/ticket create [reason]` — opens a private ticket channel for the user.
- `/ticket config-category <category>` — set category for new tickets (Manage Server or allowed role required).
- `/ticket config-staff <role>` — set staff role that can manage/close tickets.
- `/ticket config-mention-role <role>` — set role to mention when ticket opens.
- `/ticket config-allowed <role>` — set role allowed to run config commands.
- `/call user:<user> channel:<channel> message:<text>` — send a mention to a user in a specified channel (Manage Server or allowed role required).

Run
```bash
# install
npm install discord.js@14

# run
DISCORD_TOKEN=your_token node src/ticket-bot/index.js
```
