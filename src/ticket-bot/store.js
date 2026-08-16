const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.json');

function loadDB() {
  try {
    if (!fs.existsSync(DB_PATH)) return {};
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (err) {
    console.error('Failed to load ticket store:', err);
    return {};
  }
}

function saveDB(db) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save ticket store:', err);
  }
}

const db = loadDB();

function getGuildConfig(guildId) {
  db[guildId] = db[guildId] || { categoryId: '', staffRoleId: '', mentionRoleId: '', allowedRoleId: '' };
  return db[guildId];
}

function setGuildConfig(guildId, patch) {
  db[guildId] = Object.assign(getGuildConfig(guildId), patch);
  saveDB(db);
  return db[guildId];
}

module.exports = { getGuildConfig, setGuildConfig };
