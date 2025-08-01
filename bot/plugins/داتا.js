const fs = require('fs');
const path = require('path');
const { isElite } = require('../haykala/elite');

module.exports = {
  command: 'داتا',
  description: 'عرض ملفات data أو حذفها باستخدام .داتا كنس [رقم/اسم]',
  usage: '.داتا  |  .داتا كنس 1',
  category: 'tools',

  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || chatId;
    const senderLid = sender.split('@')[0];

    if (!isElite(senderLid)) {
      return sock.sendMessage(chatId, {
        text: '🚫 هذا الأمر مخصص للنخبة فقط.'
      }, { quoted: msg });
    }

    const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    const args = body.trim().split(/\s+/).slice(1);

    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      return sock.sendMessage(chatId, {
        text: '📁 مجلد data غير موجود.'
      }, { quoted: msg });
    }

    const files = fs.readdirSync(dataDir);
    if (files.length === 0) {
      return sock.sendMessage(chatId, {
        text: '📂 لا توجد ملفات حالياً داخل مجلد data.'
      }, { quoted: msg });
    }

    // كنس: حذف ملف
    if (args[0] === 'كنس') {
      const target = args.slice(1).join(' ');
      if (!target) {
        return sock.sendMessage(chatId, {
          text: '❗ استخدم: .داتا كنس 1 أو .داتا كنس اسم.json'
        }, { quoted: msg });
      }

      let fileName = target;

      if (/^\d+$/.test(target)) {
        const index = parseInt(target) - 1;
        if (index < 0 || index >= files.length) {
          return sock.sendMessage(chatId, {
            text: '⚠️ الرقم خارج نطاق الملفات الموجودة.'
          }, { quoted: msg });
        }
        fileName = files[index];
      }

      const filePath = path.join(dataDir, fileName);
      if (!fs.existsSync(filePath)) {
        return sock.sendMessage(chatId, {
          text: `❌ الملف غير موجود: \`${fileName}\``
        }, { quoted: msg });
      }

      fs.unlinkSync(filePath);
      return sock.sendMessage(chatId, {
        text: `✅ تم حذف الملف: \`${fileName}\``
      }, { quoted: msg });
    }

    // عرض الملفات
    const list = files.map((file, i) => `*${i + 1}.* \`${file}\``).join('\n');
    const msgText = `📂 الملفات داخل مجلد data:\n\n${list}\n\n❒ لحذف ملف: \`.داتا كنس [رقم/اسم]\``;

    return sock.sendMessage(chatId, {
      text: msgText
    }, { quoted: msg });
  }
};