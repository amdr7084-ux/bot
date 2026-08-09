const config = require('../config');
const { findMessageDeleteEntry } = require('../services/audit');
const { createLogEmbed, sendLog } = require('../services/logger');

const botDeletedMessageIds = new Set();
const messageCache = new Map();

function rememberMessage(message) {
  if (!message.guild) return;

  messageCache.set(message.id, {
    authorId: message.author?.id,
    authorTag: message.author?.tag,
    avatarUrl: message.author?.displayAvatarURL({ size: 256 }),
    channelId: message.channelId,
    content: message.content || '',
    attachments: [...(message.attachments?.values() || [])].map((attachment) => attachment.url),
  });

  if (messageCache.size > 5000) {
    messageCache.delete(messageCache.keys().next().value);
  }
}

function registerMessageHandlers(client) {
  client.on('messageDelete', async (message) => {
    if (!message.guild) return;

    const cachedMessage = messageCache.get(message.id);
    messageCache.delete(message.id);
    const authorId = message.author?.id || cachedMessage?.authorId;
    const authorTag = message.author?.tag || cachedMessage?.authorTag || 'غير معروف';
    const avatarUrl = message.author?.displayAvatarURL({ size: 256 }) || cachedMessage?.avatarUrl;
    const channelId = message.channelId || cachedMessage?.channelId;
    const botDeletedMessage = botDeletedMessageIds.delete(message.id)
      || message.channelId === config.protectedChannelId;
    const deletedById = botDeletedMessage ? client.user.id : authorId;
    const deletedBy = deletedById ? `<@${deletedById}>` : 'غير معروف';
    const author = authorId ? `<@${authorId}>` : authorTag;
    const channel = channelId ? `<#${channelId}>` : 'روم غير معروف';
    const fullContent = message.content || cachedMessage?.content || '[محتوى الرسالة غير متاح]';
    const content = fullContent.length > 1200 ? `${fullContent.slice(0, 1200)}...` : fullContent;
    const attachments = cachedMessage?.attachments?.length
      ? `\nالمرفقات: ${cachedMessage.attachments.join('\n')}`
      : '';

    const buildEmbed = (executorId) => createLogEmbed(
      'حذف رسالة',
      0xf1c40f,
      `تم حذف رسالة من ${author} في ${channel}`,
      avatarUrl,
      [
        { name: 'الحاذف', value: executorId ? `<@${executorId}>` : 'غير معروف' },
        { name: 'صاحب الرسالة', value: author },
        { name: 'الروم', value: channel },
        { name: 'المحتوى', value: `${content}${attachments}`.slice(0, 1024) },
      ],
    );

    const logMessage = await sendLog(
      message.guild,
      buildEmbed(deletedById),
      [deletedById, authorId].filter(Boolean),
    );

    if (!botDeletedMessage) {
      void findMessageDeleteEntry(message.guild, authorId, channelId).then(async (deleteEntry) => {
        const executorId = deleteEntry?.executor?.id;
        if (!executorId || executorId === authorId || !logMessage) return;
        await logMessage.edit({
          embeds: [buildEmbed(executorId)],
          allowedMentions: {
            users: [executorId, authorId].filter(Boolean),
            roles: [],
            repliedUser: false,
          },
        }).catch((error) => console.error('تعذر تحديث لوق حذف الرسالة:', error.message));
      }).catch((error) => console.error('تعذر قراءة منفذ حذف الرسالة:', error.message));
    }
  });

  client.on('messageCreate', async (message) => {
    rememberMessage(message);
    if (message.channelId !== config.protectedChannelId || !message.guild || message.author.bot) return;
    if (config.exemptUserIds.has(message.author.id)) return;

    try {
      botDeletedMessageIds.add(message.id);
      void message.delete().catch((error) => {
        console.error(`تعذر حذف رسالة ${message.id}:`, error.message);
      });
      void message.guild.members.ban(message.author.id, {
        deleteMessageSeconds: 24 * 60 * 60,
        reason: 'رسالة في الروم المحمي',
      }).catch((error) => {
        console.error(`تعذر حظر ${message.author.tag}:`, error.message);
      });
      console.log(`تم حظر ${message.author.tag} (${message.author.id})`);
    } catch (error) {
      console.error(`تعذر تنفيذ حماية ${message.author.tag}:`, error.message);
    }
  });
}

module.exports = { registerMessageHandlers };
