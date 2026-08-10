const { Client, GatewayIntentBits } = require('discord.js');
const { token, guildId, defaultRatingChannelId, defaultSuggestionChannelId } = require('./src/config');
const { loadConfig, saveConfig } = require('./src/persistentConfig');
const { registerCommands } = require('./src/commands');
const { handleSetup, handleRatingButton, handleRatingModal, handleSuggestionModal, showSuggestionModal } = require('./src/handlers');

const botConfig = loadConfig();
const state = {
  botConfig,
  currentRatingChannelId: botConfig.ratingChannelId || defaultRatingChannelId,
  currentSuggestionChannelId: botConfig.suggestionChannelId || defaultSuggestionChannelId,
};

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('error', console.error);
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));
process.on('uncaughtException', (error) => console.error('Uncaught Exception:', error));

client.once('ready', async () => {
  await registerCommands(client, guildId);
  console.log(`تم تشغيل بوت التقييم والاقتراحات: ${client.user.tag}`);
  console.log(`Commands registered for guild: ${guildId || 'global'}`);
});

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === 'setup-rating') {
        const channel = interaction.options.getChannel('ratingchannel');
        await handleSetup(interaction, 'rating', channel?.id, state, saveConfig);
      }

      if (interaction.commandName === 'setup-suggestions') {
        const channel = interaction.options.getChannel('suggestionchannel');
        await handleSetup(interaction, 'suggestion', channel?.id, state, saveConfig);
      }
      return;
    }

    if (interaction.isButton()) {
      if (interaction.customId.startsWith('rating:')) {
        await handleRatingButton(interaction, Number(interaction.customId.split(':')[1]));
      } else if (interaction.customId === 'suggestion:open') {
        await showSuggestionModal(interaction);
      }
      return;
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith('rating-modal:')) {
        await handleRatingModal(interaction, Number(interaction.customId.split(':')[1]), state.currentRatingChannelId);
      } else if (interaction.customId === 'suggestion-modal') {
        await handleSuggestionModal(interaction, state.currentSuggestionChannelId);
      }
    }
  } catch (error) {
    console.error('Interaction error:', error);
    const reply = { content: 'حدث خطأ أثناء تنفيذ الطلب.', flags: 64 };
    if (interaction.replied || interaction.deferred) await interaction.followUp(reply).catch(() => {});
    else await interaction.reply(reply).catch(() => {});
  }
});

client.login(token).catch(console.error);
