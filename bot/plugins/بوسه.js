module.exports = {
    command: 'بوسه',
    description: 'ارسل رسالة بوسة رومانسية مع منشن وصورة GIF في نفس الرسالة',
    usage: 'بوسة (رد على رسالة أو منشن لشخص)',
    category: 'fun',

    async execute(sock, msg) {
        try {
            const chatId = msg.key.remoteJid;

            // استخرج الmentions من الرسالة (لو فيه)
            const mentionedJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

            // إذا الرد على رسالة
            let targetJid = null;
            if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
                targetJid = msg.message.extendedTextMessage.contextInfo.participant;
            }
            // إذا ما رديت بس عملت منشن في نفس الرسالة
            if (!targetJid && mentionedJids.length > 0) {
                targetJid = mentionedJids[0];
            }

            if (!targetJid) {
                return await sock.sendMessage(chatId, { text: '❗ يرجى الرد على رسالة الشخص أو منشنه لاستخدام هذا الأمر.' }, { quoted: msg });
            }

            const mentionText = `💕 أرسل لك بوسة ساخنة يا ${targetJid.split('@')[0]} 💕\n\n✨ من منظمة أتوميك واللورد شادو ✨`;

            await sock.sendMessage(chatId, {
                video: { url: 'https://files.catbox.moe/w6dt51.gif' },
                caption: mentionText,
                gifPlayback: true,
                mentions: [targetJid]
            }, { quoted: msg });

        } catch (error) {
            console.error('خطأ في تنفيذ أمر بوسة:', error);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ حدث خطأ أثناء تنفيذ الأمر.' }, { quoted: msg });
        }
    }
};