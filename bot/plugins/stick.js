const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
  command: 'ملصق',
  async execute(sock, m) {
    let inputPath = ''; // متغير لتخزين مسار ملف الإدخال المؤقت
    let outputPath = ''; // متغير لتخزين مسار ملف الإخراج المؤقت

    try {
      const contextInfo = m.message?.extendedTextMessage?.contextInfo;

      // 1. التحقق مما إذا كانت هناك صورة مقتبسة (تم الرد عليها)
      if (!contextInfo || !contextInfo.quotedMessage || !contextInfo.quotedMessage.imageMessage) {
        console.log('[Sticker Command] No quoted image found. Sending user instructions.');
        return await sock.sendMessage(m.key.remoteJid, {
          text: '⚠️ *لتحويل صورة إلى ملصق، يرجى الرد على الصورة التي تريد تحويلها.*'
        }, { quoted: m });
      }

      const quotedMsg = contextInfo.quotedMessage.imageMessage;

      // 2. إعلام المستخدم بأن العملية بدأت
      await sock.sendMessage(m.key.remoteJid, {
        text: '⏳ *جاري تحويل الصورة إلى ملصق، يرجى الانتظار...*'
      }, { quoted: m });
      console.log('[Sticker Command] Conversion process initiated.');

      // 3. تنزيل محتوى الصورة
      const stream = await downloadContentFromMessage(quotedMsg, 'image');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // 4. التحقق مما إذا كان مخزن الصورة مؤقتًا فارغًا بعد التنزيل
      if (!buffer.length) {
        console.error('[Sticker Command] Downloaded image buffer is empty.');
        return await sock.sendMessage(m.key.remoteJid, {
          text: '⚠️ *فشل في تحميل الصورة. يرجى التأكد من أن الصورة متاحة وحاول مجددًا.*'
        }, { quoted: m });
      }
      console.log(`[Sticker Command] Image downloaded. Buffer size: ${buffer.length} bytes.`);

      // 5. تحديد مسارات الملفات المؤقتة
      inputPath = path.join(process.cwd(), `temp_input_${m.key.id}.jpg`);
      outputPath = path.join(process.cwd(), `temp_output_${m.key.id}.webp`);

      // 6. كتابة الصورة التي تم تنزيلها إلى ملف مؤقت
      fs.writeFileSync(inputPath, buffer);
      console.log(`[Sticker Command] Image saved to temporary file: ${inputPath}`);

      // 7. تنفيذ أمر FFmpeg لتحويل الصورة إلى ملصق WebP
      // استخدام علامات اقتباس حول المسارات للتأكد من التعامل الصحيح مع المسافات في أسماء الملفات
      const ffmpegCommand = `ffmpeg -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,setsar=1" -c:v libwebp -preset default -quality 100 -compression_level 6 -qscale 50 "${outputPath}"`;
      console.log(`[Sticker Command] Executing FFmpeg command: ${ffmpegCommand}`);

      exec(ffmpegCommand, async (error, stdout, stderr) => {
        if (error) {
          // خطأ في تنفيذ FFmpeg
          console.error('❌ [Sticker Command] FFmpeg command execution failed:');
          console.error(`   Error Message: ${error.message}`);
          console.error(`   Exit Code: ${error.code}`);
          if (stdout) console.error('   FFmpeg STDOUT:', stdout); // مخرجات FFmpeg العادية (قد تحتوي على معلومات مفيدة)
          if (stderr) console.error('   FFmpeg STDERR:', stderr); // مخرجات الخطأ من FFmpeg

          await sock.sendMessage(m.key.remoteJid, {
            text: '❌ *حدث خطأ أثناء معالجة الصورة باستخدام FFmpeg. قد تكون الصورة تالفة أو هناك مشكلة في الإعدادات أو FFmpeg غير مثبت بشكل صحيح على الخادم.*'
          }, { quoted: m });

          // التأكد من تنظيف الملفات المؤقتة حتى عند حدوث خطأ في FFmpeg
          try {
            if (fs.existsSync(inputPath)) {
              fs.unlinkSync(inputPath);
              console.log(`[Sticker Command] Cleaned up input file after FFmpeg error: ${inputPath}`);
            }
            if (fs.existsSync(outputPath)) {
              fs.unlinkSync(outputPath);
              console.log(`[Sticker Command] Cleaned up output file after FFmpeg error: ${outputPath}`);
            }
          } catch (cleanupError) {
            console.error('[Sticker Command] Cleanup error after FFmpeg failure:', cleanupError);
          }
          return;
        }

        // FFmpeg نفذ بنجاح (يمكن أن يكون هناك تحذيرات في stderr)
        if (stdout) console.log('[Sticker Command] FFmpeg STDOUT (success):', stdout);
        if (stderr) console.log('[Sticker Command] FFmpeg STDERR (success, usually progress/warnings):', stderr);

        try {
          // 8. التحقق مما إذا كان ملف الإخراج قد تم إنشاؤه وحجمه غير صفر
          if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
            console.error(`❌ [Sticker Command] Output WebP file not found or is empty: ${outputPath}`);
            await sock.sendMessage(m.key.remoteJid, {
              text: '❌ *فشل في إنشاء الملصق. قد تكون الصورة غير صالحة أو حدث خطأ أثناء التحويل.*'
            }, { quoted: m });
            return; // إنهاء العملية إذا كان ملف الإخراج مفقودًا/فارغًا
          }

          // 9. قراءة الملصق WebP الذي تم إنشاؤه وإرساله
          const webpBuffer = fs.readFileSync(outputPath);
          await sock.sendMessage(m.key.remoteJid, {
            sticker: webpBuffer
          }, { quoted: m });
          console.log('[Sticker Command] Sticker sent successfully.');
        } catch (sendError) {
          // خطأ أثناء قراءة أو إرسال الملصق
          console.error('❌ [Sticker Command] Error reading or sending sticker:', sendError);
          await sock.sendMessage(m.key.remoteJid, {
            text: '❌ *حدث خطأ أثناء إرسال الملصق. يرجى المحاولة مرة أخرى.*'
          }, { quoted: m });
        } finally {
          // 10. تنظيف الملفات المؤقتة (دائمًا يتم تنفيذ هذا الجزء)
          try {
            if (fs.existsSync(inputPath)) {
              fs.unlinkSync(inputPath);
              console.log(`[Sticker Command] Cleaned up input file: ${inputPath}`);
            }
            if (fs.existsSync(outputPath)) {
              fs.unlinkSync(outputPath);
              console.log(`[Sticker Command] Cleaned up output file: ${outputPath}`);
            }
          } catch (cleanupError) {
            console.error('[Sticker Command] Error during final cleanup:', cleanupError);
          }
        }
      });

    } catch (error) {
      // خطأ عام غير متوقع في وظيفة التنفيذ
      console.error('❌ [Sticker Command] General error in execute function:', error);
      // محاولة تنظيف الملفات المؤقتة حتى لو فشلت الخطوات الأولية
      try {
        if (inputPath && fs.existsSync(inputPath)) {
          fs.unlinkSync(inputPath);
          console.log(`[Sticker Command] Cleaned up input file in general error handler: ${inputPath}`);
        }
        if (outputPath && fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
          console.log(`[Sticker Command] Cleaned up output file in general error handler: ${outputPath}`);
        }
      } catch (cleanupError) {
        console.error('[Sticker Command] Cleanup error in general catch block:', cleanupError);
      }
      await sock.sendMessage(m.key.remoteJid, {
        text: '❌ *حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقًا.*'
      }, { quoted: m });
    }
  }
};