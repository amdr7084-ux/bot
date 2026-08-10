const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

function stars(amount) {
  return '⭐'.repeat(amount) + '☆'.repeat(5 - amount);
}

function textInput(customId, label, placeholder, style = TextInputStyle.Short, required = true) {
  return new TextInputBuilder()
    .setCustomId(customId)
    .setLabel(label)
    .setPlaceholder(placeholder)
    .setStyle(style)
    .setRequired(required)
    .setMaxLength(style === TextInputStyle.Paragraph ? 1000 : 100);
}

function createRatingPanel(client) {
  const buttons = [1, 2, 3, 4, 5].map((amount) => new ButtonBuilder()
    .setCustomId(`rating:${amount}`)
    .setLabel(`${amount} ${amount === 1 ? 'نجمة' : 'نجوم'}`)
    .setStyle(amount <= 2 ? ButtonStyle.Secondary : amount === 3 ? ButtonStyle.Primary : ButtonStyle.Success));

  return {
    embeds: [new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle('⭐ قيّم السيرفر')
      .setDescription('رأيك يهمنا. اختر عدد النجوم، ثم اكتب سبب تقييمك في النافذة.')
      .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
      .setFooter({ text: 'AERIX Feedback • تقييمات المجتمع' })],
    components: [new ActionRowBuilder().addComponents(buttons)],
  };
}

function createSuggestionPanel(client) {
  return {
    embeds: [new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('💡 صندوق الاقتراحات')
      .setDescription('عندك فكرة تطور السيرفر؟ اضغط الزر واكتب التفاصيل. اقتراحك يصل للفريق بشكل مرتب.')
      .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: '📝 المطلوب', value: 'اسمك، اقتراحك، المنصة المستفيدة، والفائدة المتوقعة.' },
        { name: '🔒 الخصوصية', value: 'لن تظهر نافذة الكتابة إلا لك، ثم يُنشر الاقتراح في روم النتائج.' },
      )
      .setFooter({ text: 'AERIX Feedback • اقتراحات المجتمع' })],
    components: [new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('suggestion:open')
        .setLabel('اكتب اقتراحك')
        .setEmoji('💡')
        .setStyle(ButtonStyle.Primary),
    )],
  };
}

module.exports = {
  stars,
  textInput,
  createRatingPanel,
  createSuggestionPanel,
};
