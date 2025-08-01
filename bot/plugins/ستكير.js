const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

module.exports = {
  command: 'حقوق',
  description: 'أضف حقوق إلى استيكر عند الرد عليه',
  usage: '.حقوق <نص الحقوق>',
  category: 'tools',

  async execute(sock, msg) {
    const jid = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted || !quoted.stickerMessage) {
      return sock.sendMessage(jid, { text: '❌ من فضلك رد على استيكر لإضافة الحقوق.' }, { quoted: msg });
    }

    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    const caption = text.replace(/^\.?حقوق\s+/i, '').trim();
    if (!caption) {
      return sock.sendMessage(jid, { text: '❌ يرجى كتابة نص الحقوق بعد الأمر.' }, { quoted: msg });
    }

    try {
      const buffer = await sock.downloadMediaMessage({
        key: {
          remoteJid: jid,
          id: msg.message.extendedTextMessage.contextInfo.stanzaId,
          fromMe: false,
          participant: msg.message.extendedTextMessage.contextInfo.participant
        },
        message: quoted
      });

      if (!buffer) {
        return sock.sendMessage(jid, { text: '❌ لم أستطع تحميل الاستيكر.' }, { quoted: msg });
      }

      // حفظ الملف مؤقتاً
      const tempInput = path.join(__dirname, 'temp.webp');
      const tempOutput = path.join(__dirname, 'output.webp');
      fs.writeFileSync(tempInput, buffer);

      // تحويل إلى png ثم تعديل وإضافة الحقوق ثم تحويل مجددًا إلى webp
      const pngBuffer = await sharp(tempInput).png().toBuffer();
      const imageWithText = await sharp(pngBuffer)
        .composite([{
          input: Buffer.from(
            `<svg>
              <text x="10" y="20" font-size="20" fill="white">${caption}</text>
            </svg>`
          ),
          top: 5,
          left: 5
        }])
        .webp()
        .toBuffer();

      // إرسال الاستيكر الجديد
      await sock.sendMessage(jid, {
        sticker: imageWithText
      }, { quoted: msg });

      // تنظيف الملفات
      fs.unlinkSync(tempInput);
    } catch (err) {
      console.error('🛑 خطأ في أمر حقوق:', err);
      return sock.sendMessage(jid, {
        text: `❌ حدث خطأ أثناء تنفيذ الأمر:\n\n${err.message || err.toString()}`
      }, { quoted: msg });
    }
  }
};