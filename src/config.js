require('dotenv').config({ override: true });

function parseIds(value) {
  return new Set(
    (value || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean),
  );
}

const config = {
  token: process.env.DISCORD_TOKEN,
  protectedChannelId: process.env.PROTECTED_CHANNEL_ID,
  logChannelId: process.env.LOG_CHANNEL_ID,
  exemptUserIds: parseIds(process.env.EXEMPT_USER_IDS),
  // Comma-separated patterns (strings or regexes) to detect forbidden commands/messages in the protected channel.
  // Examples: "^!eval", "/sudo\\s+rm\\s+-rf/"
  forbiddenPatterns: (process.env.FORBIDDEN_PATTERNS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  // Action to take when a forbidden pattern is detected. Allowed: 'warn' | 'ban'. Default to 'warn' to avoid accidental mass bans.
  protectedAction: (process.env.PROTECTED_ACTION || 'warn').toLowerCase(),
};

if (!config.token || !config.protectedChannelId) {
  throw new Error('ضع DISCORD_TOKEN و PROTECTED_CHANNEL_ID في ملف .env أولًا.');
}

module.exports = config;
