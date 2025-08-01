const { isElite } = require('../haykala/elite');

module.exports = {
    command: 'سبام',
    category: 'ادارة',
    description: 'يرسل رسالة مكررة لرقم معين حسب العدد المطلوب (بصيغة 50/كلمة/رقم)',

    async execute(sock, msg, args = []) {
        const { remoteJid } = msg.key;
        const sender = msg.key.participant || msg.key.remoteJid;

        // ✅ تحقق من الصلاحية
        if (!(await isElite(sender))) {
            return sock.sendMessage(remoteJid, {
                text: '❌ هذا الأمر مخصص للنخبة فقط.'
            }, { quoted: msg });
        }

        try {
            const messageText = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

            if (!messageText || !messageText.includes('/')) {
                return sock.sendMessage(remoteJid, {
                    text: '⚠️ الصيغة الصحيحة:\n.سبام 50/كلمة/رقم_واتساب',
                }, { quoted: msg });
            }

            const [_, data] = messageText.split('.سبام'); // عزل الأمر
            const [countStr, spamText, numberRaw] = data.trim().split('/');

            const count = parseInt(countStr);
            const targetNumber = numberRaw.replace(/\D/g, '') + '@s.whatsapp.net'; // تنظيف الرقم

            if (!count || !spamText || !targetNumber.includes('@s.whatsapp.net')) {
                return sock.sendMessage(remoteJid, {
                    text: '❌ تحقق من أن الصيغة كالتالي:\n.سبام 10/رسالة/212xxxxxxxx',
                }, { quoted: msg });
            }

            // ✅ إرسال الرسائل بتأخير
            for (let i = 0; i < count; i++) {
                await sock.sendMessage(targetNumber, { text: spamText });
                await new Promise(res => setTimeout(res, 1000)); // ⏱️ تأخير 1 ثانية
            }

            return sock.sendMessage(remoteJid, {
                text: `✅ تم إرسال "${spamText}" عدد ${count} مرة إلى ${numberRaw}`,
            }, { quoted: msg });

        } catch (error) {
            console.error('🚫 خطأ في أمر السبام:', error);
            return sock.sendMessage(remoteJid, {
                text: '❌ حدث خطأ أثناء تنفيذ الأمر. حاول لاحقًا.',
            }, { quoted: msg });
        }
    }
};