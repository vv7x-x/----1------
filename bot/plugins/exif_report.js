const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const exifr = require('exifr');

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
    if (m.videoMessage) return m.videoMessage; // قد يحتوي على بعض الميتاداتا أيضاً
  }
  return null;
}

module.exports = {
  command: 'exif',
  elite: false,
  group: false,
  desc: 'عرض بيانات EXIF للصورة/الفيديو (أرسل الأمر مع الوسائط أو رد على الرسالة)',
  usage: '.exif (أرسلها مع صورة/فيديو أو رد على الوسائط)'
  ,async execute(sock, message) {
    const jid = message.key.remoteJid;
    try {
      const media = findImage(message.message || {});
      if (!media) {
        await sock.sendMessage(jid, { text: 'أرسل الأمر مع صورة/فيديو أو قم بالرد على الوسائط.' });
        return;
      }

      const kind = media.mimetype?.startsWith('video') ? 'video' : 'image';
      const stream = await downloadContentFromMessage(media, kind);
      const buffer = await bufferFromStream(stream);

      let data = {};
      try {
        data = await exifr.parse(buffer) || {};
      } catch (_) {}

      if (!data || Object.keys(data).length === 0) {
        await sock.sendMessage(jid, { text: 'لا توجد بيانات EXIF ذات صلة في هذا الملف.' });
        return;
      }

      // حقول مفيدة مختصرة
      const fields = [
        ['Make', data.Make],
        ['Model', data.Model],
        ['LensModel', data.LensModel],
        ['Software', data.Software],
        ['Orientation', data.Orientation],
        ['DateTimeOriginal', data.DateTimeOriginal?.toISOString?.() || String(data.DateTimeOriginal || '')],
        ['GPSLatitude', data.GPSLatitude],
        ['GPSLongitude', data.GPSLongitude],
      ].filter(([, v]) => v !== undefined && v !== null);

      const lines = fields.map(([k, v]) => `${k}: ${v}`);
      const text = lines.length ? `EXIF المختصر:\n${lines.join('\n')}` : 'لا توجد بيانات EXIF قابلة للعرض.';
      await sock.sendMessage(jid, { text });
    } catch (e) {
      try { await sock.sendMessage(jid, { text: 'تعذر قراءة EXIF حالياً.' }); } catch {}
    }
  },
};
