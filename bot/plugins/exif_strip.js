const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');

async function bufferFromStream(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function findImage(msg) {
  const quoted = msg?.extendedTextMessage?.contextInfo?.quotedMessage;
  const cand = [msg, quoted].filter(Boolean);
  for (const m of cand) {
    if (m.imageMessage) return m.imageMessage;
  }
  return null;
}

module.exports = {
  command: 'exifstrip',
  elite: false,
  group: false,
  desc: 'إزالة بيانات EXIF من الصورة وإعادة إرسال نسخة منزوعة البيانات',
  usage: '.exifstrip (أرسلها مع صورة أو رد على صورة)'
  ,async execute(sock, message) {
    const jid = message.key.remoteJid;
    try {
      const media = findImage(message.message || {});
      if (!media) {
        await sock.sendMessage(jid, { text: 'أرسل الأمر مع صورة أو قم بالرد على صورة.' });
        return;
      }

      const stream = await downloadContentFromMessage(media, 'image');
      const buffer = await bufferFromStream(stream);

      // إعادة ترميز بدون نسخ الميتاداتا
      const mime = media.mimetype || '';
      let out;
      if (mime.includes('png')) {
        out = await sharp(buffer).png({ compressionLevel: 9 }).toBuffer();
      } else if (mime.includes('webp')) {
        out = await sharp(buffer).webp({ quality: 90 }).toBuffer();
      } else {
        // افتراضي JPEG
        out = await sharp(buffer).jpeg({ quality: 90 }).toBuffer();
      }

      await sock.sendMessage(jid, { image: out, caption: 'تم إنشاء نسخة منزوعة EXIF ✔️' });
    } catch (e) {
      try { await sock.sendMessage(jid, { text: 'تعذر إزالة EXIF حالياً.' }); } catch {}
    }
  },
};
