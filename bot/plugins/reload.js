const { loadPlugins } = require('../handlers/plugins');
const config = require('../config');

module.exports = {
  command: 'reload',
  elite: true,
  group: false,
  desc: 'إعادة تحميل جميع الإضافات بدون إعادة تشغيل البوت',
  usage: '.reload',
  async execute(sock, message) {
    try {
      const jid = message.key.remoteJid;
      // تحقق الصلاحيات (مضاعف للحماية بجانب handler)
      const sender = message.key.participant
        ? message.key.participant.split('@')[0]
        : message.key.remoteJid.split('@')[0];
      if (!config.owners.includes(sender)) {
        await sock.sendMessage(jid, { text: config.messages.ownerOnly });
        return;
      }

      await loadPlugins();
      await sock.sendMessage(jid, { text: 'تم إعادة تحميل الإضافات بنجاح ✔️' });
    } catch (e) {
      try {
        await sock.sendMessage(message.key.remoteJid, { text: 'تعذر إعادة التحميل.' });
      } catch {}
    }
  },
};
