const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { Buffer } = require('buffer');

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
      // تنزيل الاستيكر من الرسالة المقتبسة
      const mediaMessage = quoted.stickerMessage;
      const stream = await downloadContentFromMessage(mediaMessage, 'webp');

      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      if (!buffer || buffer.length === 0) {
        return sock.sendMessage(jid, { text: '❌ لم أستطع تحميل الاستيكر.' }, { quoted: msg });
      }

      // حفظ الاستيكر مؤقتاً
      const tempInput = path.join(__dirname, 'temp.webp');
      const tempOutput = path.join(__dirname, 'output.webp');
      fs.writeFileSync(tempInput, buffer);

      // تعديل الصورة بإضافة النص
      const pngBuffer = await sharp(tempInput).png().toBuffer();
      const svgText = `
        <svg width="512" height="512">
          <style>
            .title { fill: white; font-size: 40px; font-weight: bold; font-family: Arial, sans-serif; }
          </style>
          <text x="10" y="50" class="title">${caption}</text>
        </svg>`;

      const imageWithText = await sharp(pngBuffer)
        .composite([{ input: Buffer.from(svgText), top: 0, left: 0 }])
        .webp()
        .toBuffer();

      // إرسال الاستيكر المعدل
      await sock.sendMessage(jid, {
        sticker: imageWithText
      }, { quoted: msg });

      // حذف الملفات المؤقتة
      fs.unlinkSync(tempInput);

    } catch (err) {
      console.error('🛑 خطأ في أمر حقوق:', err);
      return sock.sendMessage(jid, {
        text: `❌ حدث خطأ أثناء تنفيذ الأمر:\n\n${err.message || err.toString()}`
      }, { quoted: msg });
    }
  }
};
