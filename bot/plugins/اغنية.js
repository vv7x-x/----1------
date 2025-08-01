const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
    command: 'بحث',
    description: 'البحث وتحميل أغنية MP3 من يوتيوب',
    usage: '.اغنية [اسم الأغنية]',

    async execute(sock, msg) {
        const from = msg.key.remoteJid;
        const body = msg.message?.extendedTextMessage?.text || msg.message?.conversation || '';
        const args = body.trim().split(/\s+/).slice(1);
        const query = args.join(' ');

        if (!query) {
            return await sock.sendMessage(from, {
                text: '❗ اكتب اسم الأغنية. مثال:\n.اغنية Despacito'
            }, { quoted: msg });
        }

        const tempFile = path.join(__dirname, 'temp_song.mp3');
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);

        try {
            await sock.sendMessage(from, { text: `🔎 جاري البحث عن "${query}"...` }, { quoted: msg });

            const ytdlpPath = '/data/data/com.termux/files/usr/bin/yt-dlp'; // تأكد منه بwhich
            const ytdlp = spawn(ytdlpPath, [
                '-x', '--audio-format', 'mp3',
                '--output', tempFile,
                `ytsearch1:${query}`
            ]);

            ytdlp.stderr.on('data', data => {
                console.error(`stderr: ${data}`);
            });

            ytdlp.on('close', async code => {
                if (code !== 0) {
                    return await sock.sendMessage(from, {
                        text: '❌ حدث خطأ أثناء تحميل الصوت. تأكد أن yt-dlp مثبت ويعمل بشكل صحيح.'
                    }, { quoted: msg });
                }

                if (fs.existsSync(tempFile)) {
                    await sock.sendMessage(from, {
                        audio: fs.readFileSync(tempFile),
                        mimetype: 'audio/mp4'
                    }, { quoted: msg });
                    fs.unlinkSync(tempFile); // حذف بعد الإرسال
                } else {
                    await sock.sendMessage(from, {
                        text: '❌ لم يتم العثور على الملف الصوتي.'
                    }, { quoted: msg });
                }
            });

        } catch (err) {
            console.error('خطأ:', err);
            await sock.sendMessage(from, {
                text: `❌ فشل التحميل:\n${err.message}`
            }, { quoted: msg });
        }
    }
};