const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
  command: 'حقوق',
  description: 'إضافة حقوق نص على الاستيكر',
  usage: '.حقوق [نص الحقوق] (يجب الرد على استيكر)',

  async execute(sock, m, args) {
    try {
      // تحقق من وجود رد على رسالة استيكر
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted || !quoted.stickerMessage) {
        return await sock.sendMessage(m.key.remoteJid, {
          text: '⚠️ يرجى الرد على استيكر لإضافة الحقوق عليه.'
        }, { quoted: m });
      }

      // نص الحقوق من المستخدم أو نص افتراضي
      const watermarkText = args.join(' ') || 'حقوق ملكية';

      // تحميل الاستيكر كملف webp
      const stream = await downloadContentFromMessage(quoted.stickerMessage, 'sticker');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      if (!buffer.length) {
        return await sock.sendMessage(m.key.remoteJid, {
          text: '⚠️ فشل تحميل الاستيكر، حاول مجدداً.'
        }, { quoted: m });
      }

      // حفظ الاستيكر مؤقتًا
      const inputPath = path.join(process.cwd(), 'temp-input.webp');
      const outputPath = path.join(process.cwd(), 'temp-output.webp');
      fs.writeFileSync(inputPath, buffer);

      // أمر ffmpeg لإضافة نص الحقوق على الملصق
      // تعديله ليناسب الخط والحجم والمكان حسب الحاجة
      const ffmpegCmd = `ffmpeg -i ${inputPath} -vf "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='${watermarkText}':fontcolor=white:fontsize=30:borderw=2:x=(w-text_w)/2:y=h-40" -loop 0 -preset default -an -vsync 0 -s 512x512 ${outputPath}`;

      exec(ffmpegCmd, async (error) => {
        if (error) {
          console.error('FFmpeg error:', error);
          return await sock.sendMessage(m.key.remoteJid, {
            text: '❌ حدث خطأ أثناء معالجة الاستيكر.'
          }, { quoted: m });
        }

        try {
          const webpBuffer = fs.readFileSync(outputPath);
          await sock.sendMessage(m.key.remoteJid, {
            sticker: webpBuffer
          }, { quoted: m });
        } catch (sendError) {
          console.error('Send error:', sendError);
          await sock.sendMessage(m.key.remoteJid, {
            text: '❌ حدث خطأ أثناء إرسال الاستيكر.'
          }, { quoted: m });
        }

        // حذف الملفات المؤقتة
        try {
          fs.unlinkSync(inputPath);
          fs.unlinkSync(outputPath);
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
      });

    } catch (error) {
      console.error('General error:', error);
      await sock.sendMessage(m.key.remoteJid, {
        text: '❌ حدث خطأ أثناء معالجة الحقوق، تأكد من الرد على استيكر وإدخال نص الحقوق بشكل صحيح.'
      }, { quoted: m });
    }
  }
};