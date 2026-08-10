const {
  ActionRowBuilder,
  EmbedBuilder,
  InteractionResponseFlags,
  ModalBuilder,
  TextInputStyle,
} = require('discord.js');
const { createRatingPanel, createSuggestionPanel, textInput, stars } = require('./panels');
const { ownerId } = require('./config');

async function resultChannel(interaction, configuredId) {
  if (!configuredId) return interaction.channel;
  const channel = await interaction.guild.channels.fetch(configuredId).catch(() => null);
  return channel ?? interaction.channel;
}

async function handleSetup(interaction, type, selectedChannelId, state, saveConfig) {
  if (interaction.user.id !== ownerId) {
    console.log('Owner-only command rejected:', {
      userId: interaction.user.id,
      ownerId,
      command: interaction.commandName,
      userTag: interaction.user.tag,
    });
    await interaction.reply({ content: 'هذا الأمر مخصّص للمالِك فقط.', flags: InteractionResponseFlags.Ephemeral });
    return;
  }

  await interaction.deferReply({ flags: InteractionResponseFlags.Ephemeral });

  let selectedChannel = null;
  if (selectedChannelId) {
    if (type === 'rating') {
      state.currentRatingChannelId = selectedChannelId;
      state.botConfig.ratingChannelId = selectedChannelId;
    } else {
      state.currentSuggestionChannelId = selectedChannelId;
      state.botConfig.suggestionChannelId = selectedChannelId;
    }

    saveConfig(state.botConfig);
    selectedChannel = await interaction.guild.channels.fetch(selectedChannelId).catch(() => null);
  }

  const payload = type === 'rating' ? createRatingPanel(interaction.client) : createSuggestionPanel(interaction.client);
  await interaction.channel.send(payload);

  const targetChannelLabel = selectedChannel
    ? `<#${selectedChannel.id}>`
    : type === 'rating'
      ? (state.currentRatingChannelId ? `<#${state.currentRatingChannelId}>` : 'الروم الحالي')
      : (state.currentSuggestionChannelId ? `<#${state.currentSuggestionChannelId}>` : 'الروم الحالي');

  await interaction.editReply({ content: `تم إنشاء اللوحة بنجاح. سيتم إرسال النتائج إلى ${targetChannelLabel}.` });
}

async function handleRatingButton(interaction, amount) {
  const modal = new ModalBuilder()
    .setCustomId(`rating-modal:${amount}`)
    .setTitle(`تقييمك: ${stars(amount)}`)
    .addComponents(new ActionRowBuilder().addComponents(
      textInput('reason', 'سبب التقييم', 'اكتب رأيك بالتفصيل...', TextInputStyle.Paragraph),
    ));
  await interaction.showModal(modal);
}

async function showSuggestionModal(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('suggestion-modal')
    .setTitle('إرسال اقتراح')
    .addComponents(
      new ActionRowBuilder().addComponents(textInput('name', 'اكتب اسمك', 'اسمك أو لقبك')),
      new ActionRowBuilder().addComponents(textInput('suggestion', 'اقتراحك', 'اكتب اقتراحك بالتفصيل...', TextInputStyle.Paragraph)),
      new ActionRowBuilder().addComponents(textInput('platform', 'لأي منصة؟', 'Discord، الموقع، التطبيق...')),
      new ActionRowBuilder().addComponents(textInput('benefit', 'وش بتفيدها؟', 'ما الفائدة للعملاء أو الأعضاء؟', TextInputStyle.Paragraph)),
    );
  await interaction.showModal(modal);
}

async function handleRatingModal(interaction, amount, currentRatingChannelId) {
  const reason = interaction.fields.getTextInputValue('reason');
  const channel = await resultChannel(interaction, currentRatingChannelId);
  const embed = new EmbedBuilder()
    .setColor(0xf1c40f)
    .setTitle('⭐ تقييم جديد للسيرفر')
    .setDescription(reason)
    .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: 'التقييم', value: `${stars(amount)} (${amount}/5)`, inline: true },
      { name: 'العضو', value: `${interaction.user} (${interaction.user.tag})`, inline: true },
    )
    .setTimestamp()
    .setFooter({ text: 'AERIX Feedback • تقييمات المجتمع' });

  await channel.send({ embeds: [embed], allowedMentions: { users: [interaction.user.id] } });
  await interaction.reply({ content: 'تم إرسال تقييمك، شكرًا لرأيك ⭐', flags: InteractionResponseFlags.Ephemeral });
}

async function handleSuggestionModal(interaction, currentSuggestionChannelId) {
  const name = interaction.fields.getTextInputValue('name');
  const suggestion = interaction.fields.getTextInputValue('suggestion');
  const platform = interaction.fields.getTextInputValue('platform');
  const benefit = interaction.fields.getTextInputValue('benefit');
  const channel = await resultChannel(interaction, currentSuggestionChannelId);
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('💡 اقتراح جديد')
    .setDescription(suggestion)
    .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: '👤 الاسم', value: name, inline: true },
      { name: '🌐 المنصة المستفيدة', value: platform, inline: true },
      { name: '📈 الفائدة المتوقعة', value: benefit },
      { name: '📨 المرسل', value: `${interaction.user} (${interaction.user.tag})` },
    )
    .setTimestamp()
    .setFooter({ text: 'AERIX Feedback • اقتراحات المجتمع' });

  await channel.send({ embeds: [embed], allowedMentions: { users: [interaction.user.id] } });
  await interaction.reply({ content: 'تم إرسال اقتراحك للفريق، شكرًا لك 💡', flags: InteractionResponseFlags.Ephemeral });
}

module.exports = {
  handleSetup,
  handleRatingButton,
  showSuggestionModal,
  handleRatingModal,
  handleSuggestionModal,
};
