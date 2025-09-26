const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function bufferFromStream(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

module.exports = {
  command: 'شفر',
  elite: false,
  group: false,
  desc: 'قراءة محتوى QR من صورة مرسلة أو مقتبسة',
  usage: '.qrdecode (أرسلها مع صورة أو رد على صورة تحتوي QR)',
  async execute(sock, message) {
    const jid = message.key.remoteJid;
    try {
      // ابحث عن صورة في الرسالة أو الرد المقتبس
      const msg = message.message || {};
      const img = msg.imageMessage || msg?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
      if (!img) {
        await sock.sendMessage(jid, { text: 'أرسل الأمر مع صورة، أو رد على صورة تحتوي QR.' });
        return;
      }

      const stream = await downloadContentFromMessage(img, 'image');
      const buffer = await bufferFromStream(stream);

      // استخدم خدمة قراءة QR العامة
      const form = new FormData();
      form.append('file', buffer, { filename: 'qr.png', contentType: 'image/png' });

      const res = await fetch('https://api.qrserver.com/v1/read-qr-code/', {
        method: 'POST',
        body: form,
        headers: form.getHeaders(),
      });
      if (!res.ok) throw new Error(`QR read API HTTP ${res.status}`);
      const json = await res.json();
      const result = json?.[0]?.symbol?.[0];
      const data = result?.data;
      const error = result?.error;

      if (error || !data) {
        await sock.sendMessage(jid, { text: 'لم أستطع قراءة QR من هذه الصورة.' });
        return;
      }

      await sock.sendMessage(jid, { text: `محتوى QR:\n${data}` });
    } catch (e) {
      try { await sock.sendMessage(jid, { text: 'تعذر قراءة QR حالياً.' }); } catch {}
    }
  },
};
