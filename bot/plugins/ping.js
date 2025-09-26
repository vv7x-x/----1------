module.exports = {
  command: 'ping',
  elite: false,
  group: false,
  desc: 'اختبار سرعة استجابة البوت',
  usage: '.ping',
  async execute(sock, message) {
    const jid = message.key.remoteJid;
    const start = Date.now();
    try {
      await sock.sendMessage(jid, { text: 'pong!' });
      const latency = Date.now() - start;
      await sock.sendMessage(jid, { text: `latency: ${latency}ms` });
    } catch (e) {
      try { await sock.sendMessage(jid, { text: 'تعذر تنفيذ ping حالياً.' }); } catch {}
    }
  },
};
