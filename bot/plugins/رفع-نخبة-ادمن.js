const { eliteNumbers } = require('../haykala/elite.js');
const { jidDecode } = require('@whiskeysockets/baileys');

const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

module.exports = {
    command: 'ارفعه',
    description: 'يرفع أعضاء النخبة فقط إلى مشرفين في المجموعة',
    usage: '.ارفعه',
    category: 'zarf',

    async execute(sock, msg) {
        try {
            const groupJid = msg.key.remoteJid;
            const sender = decode(msg.key.participant || groupJid);
            const senderLid = sender.split('@')[0];

            if (!groupJid.endsWith('@g.us'))
                return await sock.sendMessage(groupJid, { text: '❗ هذا الأمر يعمل فقط داخل المجموعات.' }, { quoted: msg });

            if (!eliteNumbers.includes(senderLid))
                return await sock.sendMessage(groupJid, { text: '❗ لا تملك صلاحية استخدام هذا الأمر.' }, { quoted: msg });

            const groupMetadata = await sock.groupMetadata(groupJid);
            const botNumber = decode(sock.user.id);

            // تحديد أعضاء النخبة الموجودين فعلاً في المجموعة واللي مش مشرفين
            const toPromote = groupMetadata.participants
                .filter(p => {
                    const number = p.id.split('@')[0];
                    return eliteNumbers.includes(number) && !p.admin && p.id !== botNumber;
                })
                .map(p => p.id);

            if (toPromote.length === 0) {
                return await sock.sendMessage(groupJid, {
                    text: '⚠️ لا يوجد أعضاء نخبة يمكن ترقيتهم.'
                }, { quoted: msg });
            }

            await sock.groupParticipantsUpdate(groupJid, toPromote, 'promote');
            await sock.sendMessage(groupJid, {
                text: '✅ تم ترقية أعضاء النخبة إلى مشرفين.'
            }, { quoted: msg });

        } catch (err) {
            console.error('❌ خطأ في أمر ارفعه:', err);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ حدث خطأ أثناء تنفيذ الأمر:\n\n${err.message || err.toString()}`
            }, { quoted: msg });
        }
    }
};