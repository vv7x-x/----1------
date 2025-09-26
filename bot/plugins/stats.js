const { getStats } = require('../utils/stats');

module.exports = {
  command: 'stats',
  elite: false,
  group: false,
  desc: 'عرض إحصائيات استخدام البوت',
  usage: '.stats',
  async execute(sock, message) {
    try {
      const jid = message.key.remoteJid;
      const stats = await getStats();
      const top = Object.entries(stats.commands || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([cmd, count], i) => `${i + 1}. ${cmd}: ${count}`)
        .join('\n');

      const text = [
        'إحصائيات البوت:',
        `• إجمالي الرسائل: ${stats.totalMessages || 0}`,
        `• إجمالي الأوامر: ${stats.totalCommands || 0}`,
        top ? '\nالأوامر الأكثر استخداماً:\n' + top : ''
      ].filter(Boolean).join('\n');

      await sock.sendMessage(jid, { text });
    } catch (e) {
      try { await sock.sendMessage(message.key.remoteJid, { text: 'تعذر جلب الإحصائيات.' }); } catch {}
    }
  },
};
