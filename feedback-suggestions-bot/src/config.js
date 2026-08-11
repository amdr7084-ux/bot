const path = require('path');
require('dotenv').config({ override: true });

const token = process.env.DISCORD_TOKEN || process.env.BOT_TOKEN || process.env.TOKEN;
const guildId = process.env.GUILD_ID;
const ownerId = process.env.OWNER_ID?.replace(/\D/g, '');
const defaultRatingChannelId = process.env.RATING_CHANNEL_ID || null;
const defaultSuggestionChannelId = process.env.SUGGESTION_CHANNEL_ID || null;

if (!token) {
  throw new Error('ضع DISCORD_TOKEN أو BOT_TOKEN أو TOKEN في Environment Variables.');
}

if (!ownerId) {
  throw new Error('ضع OWNER_ID في Environment Variables.');
}

module.exports = {
  token,
  guildId,
  ownerId,
  defaultRatingChannelId,
  defaultSuggestionChannelId,
};
