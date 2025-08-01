const { eliteNumbers } = require('../haykala/elite.js');
const { jidDecode } = require('@whiskeysockets/baileys');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

module.exports = {
    command: 'منبوذ',
    description: 'يمنع شخصًا معينًا من الكتابة، وإذا كتب يتم طرده.',
    usage: '.منبوذ @المستخدم',
    category: 'إدارة',

    async execute(sock, msg) {
        try {
            const groupJid = msg.key.remoteJid;
            const sender = decode(msg.key.participant || groupJid);
            const senderLid = sender.split('@')[0];

            if (!groupJid.endsWith('@g.us'))
                return await sock.sendMessage(groupJid, { text: '❗ هذا الأمر يعمل فقط داخل المجموعات.' }, { quoted: msg });

            if (!eliteNumbers.includes(senderLid))
                return await sock.sendMessage(groupJid, { text: '❗ لا تملك صلاحية استخدام هذا الأمر.' }, { quoted: msg });

            const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
            const mentioned = contextInfo?.mentionedJid;

            if (!mentioned || mentioned.length === 0)
                return await sock.sendMessage(groupJid, { text: '❗ يرجى الإشارة إلى شخص لاستخدام هذا الأمر.' }, { quoted: msg });

            const target = mentioned[0];
            const groupMetadata = await sock.groupMetadata(groupJid);
            const isAdmin = groupMetadata.participants.some(p => p.id === target && p.admin);

            if (isAdmin)
                return await sock.sendMessage(groupJid, { text: '❗ لا يمكنك منع مسؤول من الكتابة!' }, { quoted: msg });

            await sock.sendMessage(groupJid, {
                text: `🚫 <@${target.split('@')[0]}> ممنوع من الكتابة لمدة 5 دقائق! إذا كتب أي شيء، سيتم طرده!`,
                mentions: [target]
            }, { quoted: msg });

            const bannedUser = target;
            const startTime = Date.now();

            const listener = async (msgUpdate) => {
                const msgEvent = msgUpdate.messages?.[0];
                if (!msgEvent || msgEvent.key.remoteJid !== groupJid) return;
                if (!msgEvent.key.participant.includes(bannedUser)) return;
                if (Date.now() - startTime > 300000) return; // 5 دقائق

                sock.ev.off('messages.upsert', listener); // أزل المستمع لتجنب التكرار

                await sock.sendMessage(groupJid, {
                    text: `🚨 <@${bannedUser.split('@')[0]}> كتب رسالة أثناء الحظر! سيتم طرده الآن!`,
                    mentions: [bannedUser]
                });

                await sock.groupParticipantsUpdate(groupJid, [bannedUser], 'remove').catch(() => {});
            };

            sock.ev.on('messages.upsert', listener);

            // بعد 5 دقائق، أزل المستمع حتى لو لم يكتب شيئًا
            setTimeout(() => {
                sock.ev.off('messages.upsert', listener);
            }, 300000);

        } catch (error) {
            console.error('❌ حدث خطأ في أمر المنبوذ:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ حدث خطأ أثناء تنفيذ الأمر:\n\n${error.message || error.toString()}`
            }, { quoted: msg });
        }
    }
};