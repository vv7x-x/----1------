const { getProfilePicture } = require('@whiskeysockets/baileys'); // لو عندك دالة مخصصة للصورة

const decorate = (text) => `╭──⪧\n🍷 *${text}*\n╰──⪦`;

module.exports = {
  command: 'معلومات',
  async execute(sock, m) {
    try {
      const jid = m.key.remoteJid;

      // تأكد إن الأمر في جروب
      if (!jid.endsWith('@g.us')) {
        return await sock.sendMessage(jid, {
          text: decorate('❌ هذا الأمر يعمل فقط داخل المجموعات.'),
        }, { quoted: m });
      }

      // جلب معلومات الجروب
      const metadata = await sock.groupMetadata(jid);
      const name = metadata.subject || 'بدون اسم';
      const description = metadata.desc || 'لا يوجد وصف.';
      const picture = await sock.profilePictureUrl(jid, 'image').catch(() => null);

      // إرسال النص
      await sock.sendMessage(jid, {
        text: `📛 *اسم الجروب:* ${name}\n📄 *الوصف:* ${description}`,
      }, { quoted: m });

      // إرسال الصورة لو موجودة
      if (picture) {
        await sock.sendMessage(jid, {
          image: { url: picture },
          caption: `🖼️ *صورة الجروب*`,
        }, { quoted: m });
      }

    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.key.remoteJid, {
        text: decorate('⚠️ حدث خطأ أثناء جلب معلومات الجروب.'),
      }, { quoted: m });
    }
  }
};