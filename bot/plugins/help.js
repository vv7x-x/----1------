const { getPlugins } = require('../handlers/plugins');

module.exports = {
  command: 'help',
  elite: false,
  group: false,
  desc: 'عرض قائمة الأوامر والمساعدة لكل أمر',
  usage: '.help أو .help <الأمر>',
  async execute(sock, message) {
    try {
      const jid = message.key.remoteJid;
      const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
      const parts = text.split(/\s+/).filter(Boolean);
      const arg = parts.length > 1 ? parts[1].toLowerCase() : '';

      const plugins = getPlugins();
      if (!plugins || Object.keys(plugins).length === 0) {
        await sock.sendMessage(jid, { text: 'لا توجد أوامر محملة حالياً.' });
        return;
      }

      if (arg && plugins[arg]) {
        const p = plugins[arg];
        const lines = [];
        lines.push(`الأمر: ${p.command}`);
        if (p.desc) lines.push(`الوصف: ${p.desc}`);
        if (p.usage) lines.push(`الاستخدام: ${p.usage}`);
        lines.push(`صلاحية النخبة: ${p.elite ? 'نعم' : 'لا'}`);
        lines.push(`للمجموعات فقط: ${p.group ? 'نعم' : 'لا'}`);
        await sock.sendMessage(jid, { text: lines.join('\n') });
        return;
      }

      const list = Object.values(plugins)
        .map((p) => `• ${p.command}${p.desc ? ' — ' + p.desc : ''}`)
        .sort()
        .join('\n');

      const msg = `قائمة الأوامر:\n${list}\n\nاستخدم .help <الأمر> للتفاصيل.`;
      await sock.sendMessage(jid, { text: msg });
    } catch (e) {
      try { await sock.sendMessage(message.key.remoteJid, { text: 'حدث خطأ أثناء عرض المساعدة.' }); } catch {}
    }
  },
};
