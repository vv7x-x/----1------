const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

module.exports = {
  command: 'جوده',
  description: 'رفع جودة الصورة بدون تغيير حجمها.',
  usage: '.جوده (بالرد على صورة)',
  category: 'الوسائط',
  async execute(sock, m) {
    try {
      const contextInfo = m.message?.extendedTextMessage?.contextInfo;

      if (!contextInfo || !contextInfo.quotedMessage || !contextInfo.quotedMessage.imageMessage) {
        return await sock.sendMessage(m.key.remoteJid, {
          text: '🖼️ يرجى الرد على صورة لتحسين جودتها.'
        }, { quoted: m });
      }

      const imageMsg = contextInfo.quotedMessage.imageMessage;
      const stream = await downloadContentFromMessage(imageMsg, 'image');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      if (!buffer.length) {
        return await sock.sendMessage(m.key.remoteJid, {
          text: '⚠️ فشل تحميل الصورة، حاول مرة أخرى.'
        }, { quoted: m });
      }

      const timestamp = Date.now();
      const inputPath = path.join(__dirname, `../temp-input-${timestamp}.jpg`);
      const outputPath = path.join(__dirname, `../temp-hq-${timestamp}.jpg`);
      fs.writeFileSync(inputPath, buffer);

      // فقط تحسين الجودة دون تغيير الحجم
      const ffmpegCommand = `ffmpeg -i "${inputPath}" -vf "unsharp=7:7:1.5" -q:v 1 "${outputPath}"`;

      exec(ffmpegCommand, async (error) => {
        if (error) {
          console.error('FFmpeg Error:', error);
          return await sock.sendMessage(m.key.remoteJid, {
            text: '❌ فشل في تحسين جودة الصورة.'
          }, { quoted: m });
        }

        const resultBuffer = fs.readFileSync(outputPath);
        await sock.sendMessage(m.key.remoteJid, {
          image: resultBuffer,
          caption: '✅ تم تحسين جودة الصورة إلى أعلى درجة بدون تغيير الأبعاد.\nبواسطة: شادو / أتوميك.'
        }, { quoted: m });

        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });

    } catch (err) {
      console.error('Unexpected Error:', err);
      await sock.sendMessage(m.key.remoteJid, {
        text: '❌ حدث خطأ أثناء المعالجة، حاول مرة أخرى.'
      }, { quoted: m });
    }
  }
};