const config = require('./config');
const client = require('./client');
const dns = require('dns').promises;
const fs = require('fs').promises;
const { initializeLogger } = require('./services/logger');
const { registerMemberHandlers } = require('./handlers/members');
const { registerMessageHandlers } = require('./handlers/messages');

registerMemberHandlers(client);
registerMessageHandlers(client);

client.once('ready', async () => {
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

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  try {
    client.destroy();
  } catch (err) {
    // ignore
  }
  // Exit with non-zero code so external orchestrators can restart the process
  process.exit(1);
});

process.on('SIGINT', () => {
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  client.destroy();
  process.exit(0);
});

async function loginWithRetry() {
  let attempt = 0;
  while (true) {
    try {
      // Before attempting Discord login, ensure DNS for discord.com resolves to avoid immediate EAI_AGAIN failures
      let dnsOk = false;
      try {
        // Try resolving A/AAAA records
        await dns.resolve('discord.com');
        dnsOk = true;
      } catch (dnsErr) {
        try { await dns.resolve4('discord.com'); dnsOk = true; } catch (e) { /* ignore */ }
        try { await dns.resolve6('discord.com'); dnsOk = true; } catch (e) { /* ignore */ }
      }

      if (!dnsOk) {
        // Helpful debug: show resolv.conf if available
        try {
          const resolv = await fs.readFile('/etc/resolv.conf', 'utf8');
          console.error('DNS lookup failed for discord.com. /etc/resolv.conf:\n', resolv);
        } catch (fsErr) {
          console.error('DNS lookup failed for discord.com and /etc/resolv.conf could not be read');
        }
        attempt += 1;
        const waitMs = Math.min(300_000, 5000 * Math.min(attempt, 60));
        console.error(`DNS غير متوفر الآن — إعادة المحاولة بعد ${Math.round(waitMs / 1000)} ثانية (محاولة ${attempt})`);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }

      await client.login(config.token);
      return;
    } catch (error) {
      attempt += 1;
      console.error(`تعذر تسجيل الدخول (محاولة ${attempt}):`, error.message || error);
      // Exponential backoff with cap (max 5 minutes)
      const waitMs = Math.min(300_000, 1000 * Math.pow(2, Math.min(attempt, 9)));
      console.log(`إعادة المحاولة بعد ${Math.round(waitMs / 1000)} ثانية...`);
      // Wait before next attempt
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
}

// Start login with automatic retries to handle transient DNS/network failures
loginWithRetry().catch((err) => {
  console.error('فشل نهائي في عملية تسجيل الدخول:', err);
});
