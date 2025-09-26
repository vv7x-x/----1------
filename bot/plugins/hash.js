const crypto = require('crypto');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function bufferFromStream(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function findMediaMessage(msg) {
  // search in current message or quoted message
  const quoted = msg?.extendedTextMessage?.contextInfo?.quotedMessage;
  const cand = [msg, quoted].filter(Boolean);
  for (const m of cand) {
    if (m.imageMessage) return { kind: 'image', data: m.imageMessage };
    if (m.videoMessage) return { kind: 'video', data: m.videoMessage };
    if (m.audioMessage) return { kind: 'audio', data: m.audioMessage };
    if (m.documentMessage) return { kind: 'document', data: m.documentMessage };
    if (m.stickerMessage) return { kind: 'sticker', data: m.stickerMessage };
  }
  return null;
}

module.exports = {
  command: 'hash',
  elite: false,
  group: false,
  desc: 'حساب بصمة الملف (MD5 أو SHA256). استخدمها مع ملف/صورة/فيديو أو بالرد على رسالة تحتوي ملف.',
  usage: '.hash md5 | .hash sha256 (أرسلها مع ملف أو رد على الملف)',
  async execute(sock, message) {
    const jid = message.key.remoteJid;
    try {
      const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
      const parts = text.split(/\s+/).filter(Boolean);
      const algo = (parts[1] || 'sha256').toLowerCase();
      if (!['md5', 'sha256'].includes(algo)) {
        await sock.sendMessage(jid, { text: 'الرجاء تحديد الخوارزمية: md5 أو sha256' });
        return;
      }

      const mm = findMediaMessage(message.message || {});
      if (!mm) {
        await sock.sendMessage(jid, { text: 'أرسل الأمر مع ملف/صورة/فيديو أو قم بالرد على رسالة تحتوي ملف.' });
        return;
      }

      const stream = await downloadContentFromMessage(mm.data, mm.kind);
      const buffer = await bufferFromStream(stream);
      const hash = crypto.createHash(algo).update(buffer).digest('hex');

      const sizeKB = (buffer.length / 1024).toFixed(1);
      const reply = [
        `الملف: ${mm.kind}`,
        `الحجم التقريبي: ${sizeKB}KB`,
        `الخوارزمية: ${algo.toUpperCase()}`,
        `البصمة: ${hash}`
      ].join('\n');

      await sock.sendMessage(jid, { text: reply });
    } catch (e) {
      try { await sock.sendMessage(jid, { text: 'تعذر حساب بصمة الملف حالياً.' }); } catch {}
    }
  },
};
