const { AuditLogEvent, EmbedBuilder } = require('discord.js');
const config = require('../config');
const { findRecentAuditEntry } = require('../services/audit');
const { createLogEmbed, sendLog } = require('../services/logger');

const recentBanIds = new Set();

function memberEmbed(title, color, description, member, fields) {
  return createLogEmbed(
    title,
    color,
    description,
    member.user.displayAvatarURL({ size: 256 }),
    fields,
  );
}

function registerMemberHandlers(client) {
  client.on('guildMemberAdd', async (member) => {
    await sendLog(
      member.guild,
      memberEmbed(
        'دخول عضو',
        0x2ecc71,
        `${member.user} دخل السيرفر`,
        member,
        [{ name: 'العضو', value: `${member.user} \`${member.user.tag}\`` }],
      ),
      [member.id],
    );
  });

  client.on('guildMemberRemove', async (member) => {
    if (recentBanIds.has(member.id)) return;

    const banEntry = await findRecentAuditEntry(
      member.guild,
      AuditLogEvent.MemberBanAdd,
      member.id,
    );
    if (banEntry) return;

    const kickEntry = await findRecentAuditEntry(
      member.guild,
      AuditLogEvent.MemberKick,
      member.id,
    );
    if (kickEntry) {
      await sendLog(
        member.guild,
        memberEmbed(
          'طرد عضو',
          0xe67e22,
          `${member.user} تم طرده بواسطة ${kickEntry.executor || 'غير معروف'}`,
          member,
          [
            { name: 'العضو', value: `${member.user} \`${member.user.tag}\`` },
            { name: 'السبب', value: kickEntry.reason || 'غير محدد' },
          ],
        ),
        [member.id, kickEntry.executor?.id].filter(Boolean),
      );
      return;
    }

    await sendLog(
      member.guild,
      memberEmbed(
        'خروج عضو',
        0x95a5a6,
        `${member.user} غادر السيرفر`,
        member,
        [{ name: 'العضو', value: `${member.user} \`${member.user.tag}\`` }],
      ),
      [member.id],
    );
  });

  client.on('guildBanAdd', async (ban) => {
    if (recentBanIds.has(ban.user.id)) return;
    recentBanIds.add(ban.user.id);
    setTimeout(() => recentBanIds.delete(ban.user.id), 15_000);

    const banEntry = await findRecentAuditEntry(
      ban.guild,
      AuditLogEvent.MemberBanAdd,
      ban.user.id,
    );
    const executorId = banEntry?.executor?.id;
    const executor = executorId ? `<@${executorId}>` : 'غير معروف';

    await sendLog(
      ban.guild,
      createLogEmbed(
        'حظر عضو',
        0xe74c3c,
        `${ban.user} تم حظره بواسطة ${executor}`,
        ban.user.displayAvatarURL({ size: 256 }),
        [
          { name: 'العضو', value: `${ban.user} \`${ban.user.tag}\`` },
          { name: 'المنفذ', value: executor },
          { name: 'السبب', value: banEntry?.reason || 'غير محدد' },
        ],
      ),
      [ban.user.id, executorId].filter(Boolean),
    );
  });
}

module.exports = { registerMemberHandlers };
