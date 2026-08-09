const { EmbedBuilder } = require('discord.js');
const config = require('../config');

let cachedLogChannel;

function createLogEmbed(title, color, description, thumbnailUrl, fields = []) {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setColor(color)
    .setTimestamp()
    .setFooter({ text: 'AERIX Security' });

  if (description) embed.setDescription(description);
  if (thumbnailUrl) embed.setThumbnail(thumbnailUrl);
  if (fields.length) embed.addFields(fields);
  return embed;
}

async function initializeLogger(client) {
  cachedLogChannel = config.logChannelId
    ? await client.channels.fetch(config.logChannelId).catch(() => null)
    : null;
}

async function sendLog(guild, embed, allowedUserIds = []) {
  if (!config.logChannelId) return null;

  const uniqueAllowedUserIds = [...new Set(allowedUserIds.filter(Boolean))];
  const logChannel = cachedLogChannel?.id === config.logChannelId
    ? cachedLogChannel
    : await guild.channels.fetch(config.logChannelId).catch(() => null);
  cachedLogChannel = logChannel;

  if (!logChannel?.isTextBased()) return null;

  return logChannel.send({
    embeds: [embed],
    allowedMentions: { users: uniqueAllowedUserIds, roles: [], repliedUser: false },
  }).catch((error) => {
    console.error('تعذر إرسال اللوق:', error.message);
    return null;
  });
}

module.exports = { createLogEmbed, initializeLogger, sendLog };
