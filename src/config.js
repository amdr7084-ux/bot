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
};

if (!config.token || !config.protectedChannelId) {
  throw new Error('ضع DISCORD_TOKEN و PROTECTED_CHANNEL_ID في ملف .env أولًا.');
}

module.exports = config;
