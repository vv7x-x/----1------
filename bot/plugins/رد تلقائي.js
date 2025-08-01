const axios = require('axios');

module.exports = {
  status: "on",
  name: 'Auto AI',
  command: ['autoai'],
  category: 'ai',
  description: 'تفعيل أو إيقاف الرد التلقائي بالذكاء الاصطناعي',
  version: '1.0',

  async execute(sock, msg) {
    const sender = msg.key.participant || msg.key.remoteJid;
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

    const args = text.trim().split(/\s+/);
    const cmdArg = args[1]?.toLowerCase();

    sock.vynaGPT = sock.vynaGPT || {};

    if (!cmdArg || (cmdArg !== 'on' && cmdArg !== 'off')) {
      return await sock.sendMessage(msg.key.remoteJid, {
        text: `✴️ الاستخدام:\n.autoai on - لتفعيل\n.autoai off - لإيقاف`,
      }, { quoted: msg });
    }

    if (cmdArg === 'on') {
      sock.vynaGPT[sender] = { messages: [] };
      await sock.sendMessage(msg.key.remoteJid, {
        text: `✅ تم تفعيل وضع الرد التلقائي بالذكاء الاصطناعي.`,
      }, { quoted: msg });
    } else if (cmdArg === 'off') {
      delete sock.vynaGPT[sender];
      await sock.sendMessage(msg.key.remoteJid, {
        text: `🛑 تم إيقاف وضع الرد التلقائي.`,
      }, { quoted: msg });
    }
  }
};

// الجزء الخاص بالرد التلقائي
module.exports.before = async (msg, { conn }) => {
  conn.vynaGPT = conn.vynaGPT || {};
  if (msg.isBaileys && msg.fromMe) return;
  if (!msg.text || !conn.vynaGPT[msg.sender]) return;

  const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
  if (/^[.#/!]/.test(text)) return;

  await conn.sendMessage(msg.key.remoteJid, { react: { text: '⏱️', key: msg.key } });

  const apiUrl = `https://api.siputzx.my.id/api/ai/meta-llama-33-70B-instruct-turbo?content=${encodeURIComponent(text)}`;

  try {
    const res = await axios.get(apiUrl);
    const answer = res.data?.data || '❌ لم يتم الحصول على رد.';

    await conn.sendMessage(msg.key.remoteJid, { react: { text: '✅', key: msg.key } });
    await conn.sendMessage(msg.key.remoteJid, { text: answer }, { quoted: msg });
  } catch (err) {
    console.error('AI Error:', err);
    await conn.sendMessage(msg.key.remoteJid, { text: '❌ حدث خطأ أثناء المعالجة.' }, { quoted: msg });
  }
};