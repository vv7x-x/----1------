const fetch = require('node-fetch');

module.exports = {
  command: 'qrencode',
  elite: false,
  group: false,
  desc: 'توليد صورة QR لأي نص أو رابط',
  usage: '.qrencode <نص/رابط>',
  async execute(sock, message) {
    const jid = message.key.remoteJid;
    try {
      const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
      const parts = text.split(/\s+/).filter(Boolean);
      const arg = parts.slice(1).join(' ');
      if (!arg) {
        await sock.sendMessage(jid, { text: 'الاستخدام: .qrencode <نص/رابط>' });
        return;
      }
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(arg)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`QR API HTTP ${res.status}`);
      const buffer = await res.buffer();
      await sock.sendMessage(jid, { image: buffer, caption: 'تم توليد QR بنجاح ✔️' });
    } catch (e) {
      try { await sock.sendMessage(jid, { text: 'تعذر توليد QR حالياً.' }); } catch {}
    }
  },
};
