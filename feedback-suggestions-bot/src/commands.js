const { ApplicationCommandOptionType, ChannelType } = require('discord.js');

function buildCommands() {
  return [
    {
      name: 'setup-rating',
      description: 'إنشاء لوحة تقييم السيرفر',
      options: [
        {
          name: 'ratingchannel',
          description: 'اختيار روم النتائج للتقييم',
          type: ApplicationCommandOptionType.Channel,
          channel_types: [ChannelType.GuildText],
          required: false,
        },
      ],
    },
    {
      name: 'setup-suggestions',
      description: 'إنشاء لوحة الاقتراحات',
      options: [
        {
          name: 'suggestionchannel',
          description: 'اختيار روم النتائج للاقتراحات',
          type: ApplicationCommandOptionType.Channel,
          channel_types: [ChannelType.GuildText],
          required: false,
        },
      ],
    },
  ];
}

async function registerCommands(client, guildId) {
  const commands = buildCommands();
  const target = guildId ? await client.guilds.fetch(guildId) : client.application;
  await target.commands.set(commands);
}

module.exports = { registerCommands };
