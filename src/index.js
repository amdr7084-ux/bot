const config = require('./config');
const client = require('./client');
const { initializeLogger } = require('./services/logger');
const { registerMemberHandlers } = require('./handlers/members');
const { registerMessageHandlers } = require('./handlers/messages');

registerMemberHandlers(client);
registerMessageHandlers(client);

client.once('clientReady', async () => {
  await initializeLogger(client);
  console.log(`تم تشغيل البوت: ${client.user.tag}`);
  console.log(`الروم المحمي: ${config.protectedChannelId}`);
  console.log(`روم اللوق: ${config.logChannelId || 'غير محدد'}`);
});

client.on('error', (error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

process.on('SIGINT', () => {
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  client.destroy();
  process.exit(0);
});

client.login(config.token);
