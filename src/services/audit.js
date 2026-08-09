const { AuditLogEvent } = require('discord.js');

async function findRecentAuditEntry(guild, type, targetId, attempts = 2) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const auditLogs = await guild.fetchAuditLogs({ type, limit: 10 }).catch(() => null);
    const entry = auditLogs?.entries.find(
      (auditEntry) => auditEntry.target?.id === targetId
        && Date.now() - auditEntry.createdTimestamp < 15_000,
    );

    if (entry) return entry;
    if (attempt < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
  return null;
}

async function findMessageDeleteEntry(guild, authorId, channelId) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const auditLogs = await guild.fetchAuditLogs({
      type: AuditLogEvent.MessageDelete,
      limit: 10,
    }).catch(() => null);
    const entry = auditLogs?.entries.find(
      (auditEntry) => auditEntry.target?.id === authorId
        && auditEntry.extra?.channel?.id === channelId
        && Date.now() - auditEntry.createdTimestamp < 15_000,
    );

    if (entry) return entry;
    if (attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  return null;
}

module.exports = { AuditLogEvent, findMessageDeleteEntry, findRecentAuditEntry };
