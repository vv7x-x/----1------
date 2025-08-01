const { isElite } = require('../haykala/elite');

module.exports = {
  command: 'اخرج',
  category: 'admin',
  description: 'يخرج البوت من المجموعة (للمطور فقط)',

  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;

    if (!chatId.endsWith('@g.us')) {
      return sock.sendMessage(chatId, { text: '❌ هذا الأمر يعمل فقط في المجموعات.' }, { quoted: msg });
    }

    const sender = msg.key.participant || msg.participant || msg.key.remoteJid;
    if (!isElite(sender)) {
      return sock.sendMessage(chatId, { text: '🚫 ليس لديك صلاحية لاستخدام هذا الأمر.' }, { quoted: msg });
    }

    await sock.sendMessage(chatId, {
      text: '🤖  اهلا تشرفت بكم انني ساخرج الان... معا السلامه!',
    }, { quoted: msg });

    await sock.groupLeave(chatId);
  }
};