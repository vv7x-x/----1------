const fs = require('fs-extra');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const statsFile = path.join(dataDir, 'stats.json');

async function ensureFile() {
  await fs.ensureDir(dataDir);
  if (!(await fs.pathExists(statsFile))) {
    await fs.writeJson(statsFile, { totalMessages: 0, totalCommands: 0, commands: {} }, { spaces: 2 });
  }
}

async function incrementMessage() {
  await ensureFile();
  const stats = await fs.readJson(statsFile);
  stats.totalMessages = (stats.totalMessages || 0) + 1;
  await fs.writeJson(statsFile, stats, { spaces: 2 });
}

async function incrementCommand(command) {
  await ensureFile();
  const stats = await fs.readJson(statsFile);
  stats.totalCommands = (stats.totalCommands || 0) + 1;
  stats.commands = stats.commands || {};
  stats.commands[command] = (stats.commands[command] || 0) + 1;
  await fs.writeJson(statsFile, stats, { spaces: 2 });
}

async function getStats() {
  await ensureFile();
  return fs.readJson(statsFile);
}

module.exports = { incrementMessage, incrementCommand, getStats };
