const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { writeFile, mkdir } = require('fs/promises');

module.exports = {
    command: 'صوره',
    description: 'تحويل الملصق المرسل إلى صورة.',
    usage: '.صوره (رد على الملصق)',

    async execute(sock, msg) {
        const chatId = msg.key.remoteJid;

        try {
            // محاولة استخراج الملصق من الرسالة الأصلية أو المقتبسة
            const sticker = msg.message?.stickerMessage || 
                msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage;

            if (!sticker) {
                return sock.sendMessage(chatId, { 
                    text: '❌ أرسل هذا الأمر كـ *رد على ملصق* فقط!' 
                }, { quoted: msg });
            }

            // تحميل محتوى الملصق
            const stream = await downloadContentFromMessage(sticker, 'sticker');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // التأكد من وجود مجلد التخزين المؤقت
            const tempDir = '/sdcard/.bot/bot/temp';
            if (!fs.existsSync(tempDir)) {
                await mkdir(tempDir, { recursive: true });
            }

            const filePath = path.join(tempDir, `sticker_${Date.now()}.jpg`);
            await writeFile(filePath, buffer);

            // إرسال الصورة
            await sock.sendMessage(chatId, {
                image: buffer,
                caption: "🖼️ تم تحويل الملصق إلى صورة."
            }, { quoted: msg });

            // حذف الملف المؤقت
            fs.unlinkSync(filePath);

        } catch (error) {
            console.error('❌ خطأ أثناء تحويل الملصق إلى صورة:', error);
            await sock.sendMessage(chatId, {
                text: '❌ حدث خطأ أثناء التحويل، حاول مرة أخرى لاحقًا.'
            }, { quoted: msg });
        }
    }
};