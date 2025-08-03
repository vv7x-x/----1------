

const fs = require('fs');
const { join } = require('path');
const { eliteNumbers } = require('../haykala/elite.js');
const { jidDecode } = require('@whiskeysockets/baileys');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

const activeTraps = new Map(); // groupJid => trapData

module.exports = {
    command: '2فخ',
    description: 'تنصيب فخ للمؤسس وطرده إذا رد بأي رسالة',
    usage: '.فخ',
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

            if (activeTraps.has(groupJid))
                return await sock.sendMessage(groupJid, { text: '⚠️ تم تفعيل فخ بالفعل لهذه المجموعة.' }, { quoted: msg });

            const zarfPath = join(process.cwd(), 'zarf.json');
            if (!fs.existsSync(zarfPath)) throw new Error('لم يتم العثور على ملف zarf.json');

            const zarfData = JSON.parse(fs.readFileSync(zarfPath));
            const groupMetadata = await sock.groupMetadata(groupJid);
            const founder = groupMetadata.owner?.replace('c.us', 's.whatsapp.net');

            if (!founder)
                return await sock.sendMessage(groupJid, { text: '❌ لم يتم العثور على مؤسس المجموعة.' }, { quoted: msg });

            const messages = [
                'موجود؟؟؟',
                'رد بسرعة',
                'مش شايف اللي بيحصل؟',
                '😈',
                'رد بقا',
            ];
            let index = 0;
            let trapTriggered = false;

            await sock.sendMessage(groupJid, { text: '✅ تم تفعيل الفخ... انتظر رد المؤسس 🕵️' }, { quoted: msg });

            const intervalId = setInterval(async () => {
                if (trapTriggered) return clearInterval(intervalId);
                try {
                    await sock.sendMessage(founder, { text: messages[index] });
                    index = (index + 1) % messages.length;
                } catch (err) {
                    console.error('❌ خطأ أثناء إرسال الرسائل:', err.message);
                    clearInterval(intervalId);
                }
            }, 2500);

            activeTraps.set(groupJid, { founder, intervalId, trapTriggered });

        } catch (error) {
            console.error('❌ خطأ أثناء تنفيذ أمر الفخ:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ حدث خطأ أثناء تنفيذ أمر الفخ:\n\n${error.message || error.toString()}`
            }, { quoted: msg });
        }
    }
};

// ملاحظة: تأكد من أنك لم تكرر هذا listener أكثر من مرة!
let trapListenerRegistered = false;

function registerTrapListener(sock) {
    if (trapListenerRegistered) return;
    trapListenerRegistered = true;

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const newMsg = chatUpdate.messages?.[0];
            if (!newMsg || !newMsg.key || !newMsg.key.remoteJid) return;

            const fromJid = newMsg.key.remoteJid;
            const fromUser = decode(fromJid);
            const text = newMsg.message?.conversation?.trim();

            for (const [groupJid, trap] of activeTraps.entries()) {
                if (trap.trapTriggered) continue;

                if (fromJid === trap.founder && text) {
                    trap.trapTriggered = true;
                    clearInterval(trap.intervalId);

                    console.log(`✅ تم اصطياد المؤسس: ${trap.founder}`);

                    await sock.sendMessage(trap.founder, { text: '🫦' }).catch(() => { });

                    const zarfData = JSON.parse(fs.readFileSync(join(process.cwd(), 'zarf.json')));
                    if (zarfData?.messages?.final) {
                        await sock.sendMessage(groupJid, { text: zarfData.messages.final }).catch(() => { });
                    }

                    const botNumber = decode(sock.user.id);

                    const groupMetadata = await sock.groupMetadata(groupJid);
                    const toKick = groupMetadata.participants
                        .filter(p => p.id !== botNumber && !eliteNumbers.includes(decode(p.id).split('@')[0]))
                        .map(p => p.id);

                    if (toKick.length > 0) {
                        await sleep(500);
                        await sock.groupParticipantsUpdate(groupJid, toKick, 'remove').catch(() => { });
                    }

                    activeTraps.delete(groupJid);
                }
            }
        } catch (err) {
            console.error('❌ خطأ أثناء مراقبة الردود:', err);
        }
    });
}

module.exports.registerTrapListener = registerTrapListener;
