const {
  Client,
  GatewayIntentBits,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  REST,
  Routes,
  SlashCommandBuilder,
} = require('discord.js');

const cfg = require('./config');
const store = require('./store');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers],
});

const commands = [
  new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Ticket commands')
    .addSubcommand((s) => s.setName('create').setDescription('Create a ticket').addStringOption((o) => o.setName('reason').setDescription('Reason or subject').setRequired(false)))
    .addSubcommand((s) => s.setName('config-category').setDescription('Set ticket category').addChannelOption((o) => o.setName('category').setDescription('Category for tickets').setRequired(true)))
    .addSubcommand((s) => s.setName('config-staff').setDescription('Set staff role').addRoleOption((o) => o.setName('role').setDescription('Role that can manage tickets').setRequired(true)))
    .addSubcommand((s) => s.setName('config-mention-role').setDescription('Set role to mention when ticket opens').addRoleOption((o) => o.setName('role').setDescription('Role to mention on ticket open').setRequired(false)))
    .addSubcommand((s) => s.setName('config-allowed').setDescription('Set role allowed to use admin commands').addRoleOption((o) => o.setName('role').setDescription('Role allowed to run config commands').setRequired(true))),

  new SlashCommandBuilder().setName('call').setDescription('Call/announce to a user in a channel')
    .addUserOption((o) => o.setName('user').setDescription('User to mention').setRequired(true))
    .addChannelOption((o) => o.setName('channel').setDescription('Channel to send the message to').setRequired(true))
    .addStringOption((o) => o.setName('message').setDescription('Message content').setRequired(true)),
].map((c) => c.toJSON());

client.once('ready', async () => {
  console.log(`Ticket bot ready as ${client.user.tag}`);

  // Register guild commands for each guild the bot is in (quick for development)
  try {
    for (const guild of client.guilds.cache.values()) {
      await guild.commands.set(commands);
      console.log(`Registered slash commands for guild ${guild.id}`);
    }
  } catch (err) {
    console.error('Failed to register commands per-guild:', err);
  }
});

function makeCloseButton(ownerId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`close_ticket:${ownerId}`).setLabel('Close Ticket').setStyle(ButtonStyle.Danger),
  );
}

async function createTicket(interaction, subject) {
  const guildId = interaction.guildId;
  const gcfg = store.getGuildConfig(guildId);
  const nameSafe = `ticket-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now() % 10000}`;

  const permissionOverwrites = [
    { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
    { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
  ];

  if (gcfg.staffRoleId) {
    permissionOverwrites.push({ id: gcfg.staffRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] });
  }

  const channel = await interaction.guild.channels.create({
    name: nameSafe,
    type: ChannelType.GuildText,
    parent: gcfg.categoryId || undefined,
    permissionOverwrites,
  });

  const mentions = [];
  if (gcfg.mentionRoleId) mentions.push(`<@&${gcfg.mentionRoleId}>`);
  mentions.push(`<@${interaction.user.id}>`);

  await channel.send({ content: `تذكرة جديدة ${mentions.join(' ')}
الموضوع: ${subject || 'بدون عنوان'}`, components: [makeCloseButton(interaction.user.id)] });
  await interaction.reply({ content: `تم فتح تذكرتك: ${channel}`, ephemeral: true });
}

client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;
    if (commandName === 'ticket') {
      const sub = interaction.options.getSubcommand();
      if (sub === 'create') {
        await createTicket(interaction, interaction.options.getString('reason'));
        return;
      }

      // Config commands: only the server owner may run these commands
      if (interaction.user.id !== interaction.guild.ownerId) {
        await interaction.reply({ content: 'هذه الأوامر مقصورة على Owner السيرفر فقط.', ephemeral: true });
        return;
      }

      if (sub === 'config-category') {
        const ch = interaction.options.getChannel('category');
        store.setGuildConfig(interaction.guildId, { categoryId: ch.id });
        await interaction.reply({ content: `تم تحديد فئة التذاكر: ${ch}`, ephemeral: true });
        return;
      }
      if (sub === 'config-staff') {
        const role = interaction.options.getRole('role');
        store.setGuildConfig(interaction.guildId, { staffRoleId: role.id });
        await interaction.reply({ content: `تم تحديد دور الموظفين: ${role}`, ephemeral: true });
        return;
      }
      if (sub === 'config-mention-role') {
        const role = interaction.options.getRole('role');
        store.setGuildConfig(interaction.guildId, { mentionRoleId: role ? role.id : '' });
        await interaction.reply({ content: `تم تحديث دور المنشن عند فتح التذكرة: ${role || 'لا يوجد'}`, ephemeral: true });
        return;
      }
      if (sub === 'config-allowed') {
        const role = interaction.options.getRole('role');
        store.setGuildConfig(interaction.guildId, { allowedRoleId: role.id });
        await interaction.reply({ content: `تم تحديد الدور المسموح لأوامر الإعداد: ${role}`, ephemeral: true });
        return;
      }
    } else if (commandName === 'call') {
      // /call is restricted to server owner
      if (interaction.user.id !== interaction.guild.ownerId) {
        await interaction.reply({ content: 'هذا الأمر مقصور على Owner السيرفر فقط.', ephemeral: true });
        return;
      }
      const target = interaction.options.getUser('user');
      const channel = interaction.options.getChannel('channel');
      const message = interaction.options.getString('message');
      try {
        await channel.send({ content: `<@${target.id}> ${message}` });
        await interaction.reply({ content: 'تم الإرسال.', ephemeral: true });
      } catch (err) {
        console.error('Failed to send call message:', err);
        await interaction.reply({ content: 'تعذر إرسال الرسالة إلى القناة المحددة.', ephemeral: true });
      }
    }
    } else if (interaction.isButton()) {
    const [action, ownerId] = interaction.customId.split(':');
    if (action !== 'close_ticket') return;
    const guildCfg = store.getGuildConfig(interaction.guildId);
    // Only the server owner may close tickets
    if (interaction.user.id !== interaction.guild.ownerId) {
      await interaction.reply({ content: 'فقط Owner السيرفر يمكنه إغلاق التذاكر.', ephemeral: true });
      return;
    }
    await interaction.reply({ content: 'جاري إغلاق التذكرة...', ephemeral: true });
    try {
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
  }
});

// Start the bot
client.login(process.env.DISCORD_TOKEN).catch((err) => console.error('Ticket bot login failed:', err));
