const fs = require('fs');
const path = require('path');
const { owner: ALLOWED_ADMINS } = require(path.join(process.cwd(), 'config.js'));

const dataDir = path.join(__dirname, '..', 'data');
const blockFile = path.join(dataDir, 'blockedUsers.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(blockFile)) fs.writeFileSync(blockFile, JSON.stringify([]));

const loadBlockedUsers = () => {
    try {
        return JSON.parse(fs.readFileSync(blockFile));
    } catch {
        return [];
    }
};

const saveBlockedUsers = (data) => {
    try {
        fs.writeFileSync(blockFile, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("خطأ في حفظ ملف الحظر:", err);
    }
};

module.exports = {
    command: '،حظر',
    description: 'حظر أو إلغاء حظر شخص عند الرد على رسالته (لن يتلقى أي رد من البوت).',
    category: 'عام',
    async execute(sock, m) {
        const sender = m.key.participant || m.participant || m.key.remoteJid;
        const senderNumber = (sender || '').split('@')[0];

        if (!ALLOWED_ADMINS.includes(senderNumber)) {
            return sock.sendMessage(m.key.remoteJid, { text: '⚠️ هذا الأمر مخصص فقط للمطورين.' }, { quoted: m });
        }

        const reply = m.message?.extendedTextMessage?.contextInfo?.participant;

        if (!reply) {
            return sock.sendMessage(m.key.remoteJid, { text: '❗ يجب الرد على رسالة الشخص المراد حظره أو إلغاء حظره.' }, { quoted: m });
        }

        const blockedUsers = loadBlockedUsers();
        const jid = reply;

        if (blockedUsers.includes(jid)) {
            const updated = blockedUsers.filter(u => u !== jid);
            saveBlockedUsers(updated);
            return sock.sendMessage(m.key.remoteJid, { text: '✅ تم إلغاء الحظر عن هذا المستخدم.' }, { quoted: m });
        } else {
            blockedUsers.push(jid);
            saveBlockedUsers(blockedUsers);
            return sock.sendMessage(m.key.remoteJid, { text: '🚫 تم حظر هذا المستخدم. لن يستجيب له البوت بعد الآن.' }, { quoted: m });
        }
    }
};