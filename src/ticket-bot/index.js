const {
  Client,
  GatewayIntentBits,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require('discord.js');

const cfg = require('./config');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent],
});

client.once('ready', () => {
  console.log(`Ticket bot ready as ${client.user.tag}`);
  console.log(`Prefix: ${cfg.prefix}`);
});

// Simple text command to create a ticket: `!ticket <reason>`
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (!message.content.startsWith(cfg.prefix)) return;

  const args = message.content.slice(cfg.prefix.length).trim();
  const subject = args || 'بدون عنوان';

  try {
    const nameSafe = `ticket-${message.author.username.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now() % 10000}`;
    const channel = await message.guild.channels.create({
      name: nameSafe,
      type: ChannelType.GuildText,
      parent: cfg.categoryId || undefined,
      permissionOverwrites: [
        { id: message.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: message.author.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
        ...(cfg.staffRoleId ? [{ id: cfg.staffRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] }] : []),
        { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      ],
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`close_ticket:${message.author.id}`).setLabel('Close Ticket').setStyle(ButtonStyle.Danger),
    );

    await channel.send({ content: `تم فتح تذكرة من ${message.author} — الموضوع: ${subject}`, components: [row] });
    await message.reply({ content: `تم فتح تذكرتك: ${channel}`, allowedMentions: { users: [] } });
  } catch (err) {
    console.error('تعذر فتح التذكرة:', err);
    message.reply('تعذر فتح تذكرتك. تواصل مع الإدارة.').catch(() => {});
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  const [action, ownerId] = interaction.customId.split(':');
  if (action !== 'close_ticket') return;

  const member = interaction.member;
  const isOwner = interaction.user.id === ownerId;
  const isStaff = cfg.staffRoleId && member.roles.cache.has(cfg.staffRoleId);

  if (!isOwner && !isStaff) {
    await interaction.reply({ content: 'لا تملك صلاحية إغلاق هذه التذكرة.', ephemeral: true });
    return;
  }

  await interaction.reply({ content: 'جاري إغلاق التذكرة...', ephemeral: true });
  try {
    // Option: archive by locking channel or delete
    await interaction.channel.delete(`Ticket closed by ${interaction.user.tag}`);
  } catch (err) {
    console.error('تعذر حذف قناة التذكرة:', err);
    try {
      await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { ViewChannel: false, SendMessages: false });
      await interaction.channel.send('تم إغلاق التذكرة (تعذر حذف القناة).');
    } catch (e) {
      console.error('تعذر تعطيل القناة بعد الفشل في الحذف:', e);
    }
  }
});

// Start the bot
client.login(process.env.DISCORD_TOKEN).catch((err) => console.error('Ticket bot login failed:', err));
