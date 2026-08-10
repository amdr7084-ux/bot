const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'bot-config.json');

function loadConfig() {
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return { ratingChannelId: null, suggestionChannelId: null };
  }
}

function saveConfig(config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to save bot-config.json:', error);
  }
}

module.exports = { loadConfig, saveConfig };
