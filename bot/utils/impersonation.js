const fs = require('fs-extra');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const storePath = path.join(dataDir, 'impersonation.json');

async function ensureStore() {
  await fs.ensureDir(dataDir);
  if (!(await fs.pathExists(storePath))) {
    await fs.writeJson(storePath, { byChat: {} }, { spaces: 2 });
  }
}

async function readStore() {
  await ensureStore();
  return fs.readJson(storePath);
}

async function writeStore(store) {
  await fs.writeJson(storePath, store, { spaces: 2 });
}

async function setPersona(chatJid, name) {
  const store = await readStore();
  store.byChat = store.byChat || {};
  store.byChat[chatJid] = { name: String(name).trim(), enabled: true };
  await writeStore(store);
  return store.byChat[chatJid];
}

async function clearPersona(chatJid) {
  const store = await readStore();
  store.byChat = store.byChat || {};
  delete store.byChat[chatJid];
  await writeStore(store);
}

async function getPersona(chatJid) {
  const store = await readStore();
  return (store.byChat || {})[chatJid] || null;
}

async function applyPersonaText(chatJid, text) {
  const persona = await getPersona(chatJid);
  if (!persona || !persona.enabled || !persona.name) return text;
  return `[${persona.name}] ${text}`;
}

module.exports = { setPersona, clearPersona, getPersona, applyPersonaText };
