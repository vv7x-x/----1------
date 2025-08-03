const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const decorate = (text) => `╭──⪧\n🍷 *${"يحيى المز"}*\n╰──⪦ ${text}`;

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

      // تحميل الملصق
      const stream = await downloadContentFromMessage(sticker, 'sticker');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      // إنشاء الملفات المؤقتة
      const tmpDir = path.join(__dirname, 'tmp');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

      const inputWebp = path.join(tmpDir, `input_${Date.now()}.webp`);
      const tempPng = path.join(tmpDir, `temp_${Date.now()}.png`);
      const outputWebp = path.join(tmpDir, `output_${Date.now()}.webp`);

      fs.writeFileSync(inputWebp, buffer);

      // أمر FFmpeg لإضافة الحقوق
      const ffmpegCmd = `
        ffmpeg -y -i "${inputWebp}" -vf "drawtext=text='KING':fontcolor=white:fontsize=30:box=1:boxcolor=black@0.5:boxborderw=5:x=w-tw-10:y=h-th-10" "${tempPng}" &&
        ffmpeg -y -i "${tempPng}" -vcodec libwebp -lossless 1 -q:v 80 -preset default -loop 0 -an -vsync 0 -s 512:512 "${outputWebp}"
      `;

      exec(ffmpegCmd, async (err) => {
        if (err || !fs.existsSync(outputWebp)) {
          console.error('FFmpeg error:', err);
          return await sock.sendMessage(m.key.remoteJid, {
            text: decorate('❌ فشل في إضافة الحقوق إلى الملصق.'),
          }, { quoted: m });
        }

        const finalSticker = fs.readFileSync(outputWebp);
        await sock.sendMessage(m.key.remoteJid, { sticker: finalSticker }, { quoted: m });

        // تنظيف الملفات
        [inputWebp, tempPng, outputWebp].forEach(file => {
          if (fs.existsSync(file)) fs.unlinkSync(file);
        });
      });

    } catch (err) {
      console.error(err);
      await sock.sendMessage(m.key.remoteJid, {
        text: decorate('⚠️ حدث خطأ أثناء المعالجة.'),
      }, { quoted: m });
    }
  }
};
