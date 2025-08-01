const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys'); // تأكد من الاستيراد الصحيح

module.exports = {
    command: 'mp3',
    description: 'تحويل فيديو إلى تسجيل صوتي (Voice note)',

    async execute(sock, msg) {
        const chatId = msg.key.remoteJid;
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quoted || !quoted.videoMessage) {
            return await sock.sendMessage(chatId, {
                text: '❌ يجب الرد على فيديو بكلمة mp3 لتحويله إلى صوت.'
            }, { quoted: msg });
        }

        try {
            const timestamp = Date.now();
            const tempDir = './temp';
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const videoPath = path.join(tempDir, `${timestamp}.mp4`);
            const audioPath = path.join(tempDir, `${timestamp}.opus`);

            // 🧠 تحميل الفيديو من الرسالة المقتبسة
            const stream = await downloadContentFromMessage(quoted.videoMessage, 'video');
            const bufferArray = [];
            for await (const chunk of stream) {
                bufferArray.push(chunk);
            }
            const videoBuffer = Buffer.concat(bufferArray);
            fs.writeFileSync(videoPath, videoBuffer);

            await sock.sendMessage(chatId, { text: '🎧 جاري استخراج الصوت...' }, { quoted: msg });

            // 🎙️ تحويل الفيديو إلى صوت
            exec(`ffmpeg -i "${videoPath}" -vn -c:a libopus -b:a 128k "${audioPath}"`, async (err) => {
                if (err || !fs.existsSync(audioPath)) {
                    console.error('❌ فشل تحويل الفيديو إلى صوت:', err?.message);
                    fs.existsSync(videoPath) && fs.unlinkSync(videoPath);
                    return await sock.sendMessage(chatId, { text: '❌ تعذر تحويل الفيديو إلى تسجيل صوتي.' }, { quoted: msg });
                }

                try {
                    await sock.sendMessage(chatId, {
                        audio: { url: audioPath },
                        mimetype: 'audio/ogg; codecs=opus',
                        ptt: true
                    }, { quoted: msg });
                } catch (sendErr) {
                    console.error('❌ خطأ أثناء إرسال التسجيل الصوتي:', sendErr.message);
                } finally {
                    fs.unlinkSync(videoPath);
                    fs.unlinkSync(audioPath);
                }
            });

        } catch (err) {
            console.error('❌ خطأ عام:', err.message);
            await sock.sendMessage(chatId, {
                text: `❌ حصل خطأ أثناء المعالجة:\n${err.message}`
            }, { quoted: msg });
        }
    }
};