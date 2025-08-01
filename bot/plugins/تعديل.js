const fs = require('fs').promises;
const path = require('path');
const { isElite } = require('../haykala/elite'); // ✅ تم إضافته

module.exports = {
    command: 'تعديل',
    category: 'ادارة',
    description: 'يعدل محتوى سكريبت موجود في ملفات البوت.',

    async execute(sock, msg, args = []) {
        const { remoteJid } = msg.key;
        const sender = msg.key.participant || msg.key.remoteJid;

        // ✅ التحقق من النخبة فقط
        if (!(await isElite(sender))) {
            return sock.sendMessage(remoteJid, {
                text: '❌ هذا الأمر مخصص للنخبة فقط.'
            }, { quoted: msg });
        }

        try {
            let messageText = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

            if (messageText && messageText.startsWith('.تعديل')) {
                messageText = messageText.substring('.تعديل'.length).trim();
                args = messageText.split(/\s+/).filter(Boolean);
            }

            let fileName = args[0];

            if (!fileName) {
                return sock.sendMessage(remoteJid, { text: 'الرجاء تحديد اسم الملف المراد تعديله. مثال: `.تعديل اسم_الملف`' }, { quoted: msg });
            }

            const fullFileName = fileName.endsWith('.js') ? fileName : `${fileName}.js`;
            const filePath = path.join(__dirname, fullFileName); 

            try {
                await fs.access(filePath);
            } catch (err) {
                if (err.code === 'ENOENT') {
                    return sock.sendMessage(remoteJid, { text: `عذراً، لا يوجد سكريبت باسم \`\`\`${fullFileName}\`\`\` في مجلد الأوامر لتعديله.` }, { quoted: msg });
                }
                throw err;
            }

            if (!msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                return sock.sendMessage(remoteJid, { text: 'الرجاء الرد على رسالة تحتوي على الكود الجديد الذي تريد وضعه بدلاً من الكود الحالي.' }, { quoted: msg });
            }

            const quotedMessage = msg.message.extendedTextMessage.contextInfo.quotedMessage;
            const newScriptContent = quotedMessage.conversation || quotedMessage.extendedTextMessage?.text;

            if (!newScriptContent) {
                return sock.sendMessage(remoteJid, { text: 'الرسالة التي رددت عليها لا تحتوي على نص الكود الجديد.' }, { quoted: msg });
            }

            await fs.writeFile(filePath, newScriptContent);

            return sock.sendMessage(remoteJid, { text: `تم تعديل السكريبت \`\`\`${fullFileName}\`\`\` بنجاح!` }, { quoted: msg });

        } catch (error) {
            console.error('حدث خطأ أثناء تنفيذ أمر "تعديل":', error);
            return sock.sendMessage(remoteJid, { text: 'عذراً، حدث خطأ أثناء محاولة تعديل السكريبت. الرجاء المحاولة مرة أخرى.' }, { quoted: msg });
        }
    }
};