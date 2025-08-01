const fs = require('fs');
const path = require('path');
const { eliteNumbers } = require('../haykala/elite.js'); // ✅ قائمة النخبة

// تحديد المسار
const dataDir = path.join(__dirname, '..', 'data');
const filePath = path.join(dataDir, 'bannedWords.json');

// إنشاء الملف والمجلد إذا لم يكونا موجودين
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify([]));

module.exports = {
  category: 'tools',
  command: "حظر",
  description: "🔒 فقط أعضاء النخبة يمكنهم حظر كلمات.",
  usage: ".حظر [كلمة]",

  async execute(sock, msg) {
    try {
      const chatId = msg.key.remoteJid;
      const senderJid = msg.key.participant || msg.key.remoteJid;
      const senderNumber = senderJid.split('@')[0];

      // التحقق من صلاحيات النخبة
      if (!eliteNumbers.includes(senderNumber)) {
        return await sock.sendMessage(chatId, {
          text: "🚫 هذا الأمر مخصص فقط لأعضاء النخبة.",
        }, { quoted: msg });
      }

      // استخراج الكلمة من الرسالة
      const body = msg.message?.extendedTextMessage?.text || msg.message?.conversation || '';
      const wordToBan = body.replace(/^\.(النخبه|حظر)/, '').trim();

      if (!wordToBan) {
        return await sock.sendMessage(chatId, {
          text: "❌ يجب كتابة الكلمة التي تريد حظرها بعد الأمر."
        }, { quoted: msg });
      }

      let bannedWords = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      if (bannedWords.includes(wordToBan)) {
        return await sock.sendMessage(chatId, {
          text: `⚠️ الكلمة "${wordToBan}" محظورة مسبقًا.`
        }, { quoted: msg });
      }

      // إضافة الكلمة
      bannedWords.push(wordToBan);
      fs.writeFileSync(filePath, JSON.stringify(bannedWords, null, 2), 'utf8');

      await sock.sendMessage(chatId, {
        text: `✅ تم حظر الكلمة: "${wordToBan}".`
      }, { quoted: msg });

    } catch (err) {
      console.error('✗ خطأ في أمر النخبة:', err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ حدث خطأ:\n\n${err.message || err.toString()}`
      }, { quoted: msg });
    }
  }
};