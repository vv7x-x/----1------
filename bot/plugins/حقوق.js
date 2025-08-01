const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const decorate = (text) => `╭──⪧\n🍷 *${كيساكي المز}*\n╰──⪦`;

module.exports = {
  command: 'حقوقي',
  async execute(sock, m) {
    try {
      const contextInfo = m.message?.extendedTextMessage?.contextInfo;
      const quoted = contextInfo?.quotedMessage;
      const sticker = quoted?.stickerMessage;

      if (!quoted || !sticker) {
        return await sock.sendMessage(m.key.remoteJid, {
          text: decorate('🧷 من فضلك رد على ملصق لاستخدام هذا الأمر.'),
        }, { quoted: m });
      }

      const stream = await downloadContentFromMessage(sticker, 'sticker');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      const inputWebp = path.join(__dirname, 'sticker_input.webp');
      const tempPng = path.join(__dirname, 'sticker_temp.png');
      const outputWebp = path.join(__dirname, 'sticker_output.webp');

      fs.writeFileSync(inputWebp, buffer);

      const ffmpegCmd = `
        ffmpeg -y -i "${inputWebp}" -vf "drawtext=text='KING':fontcolor=white:fontsize=32:x=w-text_w-10:y=h-text_h-10" "${tempPng}" &&
        ffmpeg -y -i "${tempPng}" -vcodec libwebp -lossless 1 -q:v 80 -preset default -loop 0 -an -vsync 0 "${outputWebp}"
      `;

      exec(ffmpegCmd, async (err) => {
        if (err || !fs.existsSync(outputWebp)) {
          console.error('FFmpeg error:', err);
          return await sock.sendMessage(m.key.remoteJid, {
            text: decorate('❌ فشل في إضافة الحقوق إلى الملصق.'),
          }, { quoted: m });
        }

        const webp = fs.readFileSync(outputWebp);
        await sock.sendMessage(m.key.remoteJid, { sticker: webp }, { quoted: m });

        // تنظيف الملفات
        fs.unlinkSync(inputWebp);
        fs.unlinkSync(tempPng);
        fs.unlinkSync(outputWebp);
      });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.key.remoteJid, {
        text: decorate('⚠️ حدث خطأ أثناء المعالجة.'),
      }, { quoted: m });
    }
  }
};