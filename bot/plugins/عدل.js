const fs = require('fs');
const path = require('path');
const { eliteNumbers } = require('../haykala/elite'); // لو تستخدم نظام النخبة

module.exports = {
  category: 'tools',
  command: ['عدل'],
  description: 'تعديل كود ملف أمر بالرد على رسالة تحتوي الكود الجديد',
  usage: '.عدل [اسم_الملف] (مع الرد على رسالة تحتوي الكود)',
  elite: true, // لو تريد تقيد للأوامر للنخبة

  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || from;
    const senderNumber = sender.split('@')[0];

    // تحقق من النخبة لو مفعّل
    if (this.elite && !eliteNumbers.includes(senderNumber)) {
      return await sock.sendMessage(from, { text: '❌ هذا الأمر للنخبة فقط.' }, { quoted: msg });
    }

    // تحقق من وجود الرد على رسالة
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) {
      return await sock.sendMessage(from, { text: '⚠️ يجب الرد على رسالة تحتوي الكود الجديد.' }, { quoted: msg });
    }

    // الحصول على الكود الجديد
    let newCode = '';
    if (quoted.conversation) {
      newCode = quoted.conversation;
    } else if (quoted.extendedTextMessage?.text) {
      newCode = quoted.extendedTextMessage.text;
    } else {
      return await sock.sendMessage(from, { text: '⚠️ لم أتمكن من قراءة محتوى الرسالة التي رُدّت عليها.' }, { quoted: msg });
    }

    // تحقق من اسم الملف في args
    const args = msg.args || [];
    if (args.length === 0) {
      return await sock.sendMessage(from, { text: '⚠️ يرجى كتابة اسم ملف الأمر المراد تعديله بعد الأمر.' }, { quoted: msg });
    }

    let fileName = args[0];
    if (!fileName.endsWith('.js')) fileName += '.js';

    const pluginsDir = path.resolve(__dirname, '../plugins');
    const filePath = path.join(pluginsDir, fileName);

    if (!fs.existsSync(filePath)) {
      return await sock.sendMessage(from, { text: `⚠️ الملف ${fileName} غير موجود في مجلد الإضافات.` }, { quoted: msg });
    }

    try {
      fs.writeFileSync(filePath, newCode, 'utf8');
      await sock.sendMessage(from, { text: `✅ تم تعديل الملف ${fileName} بنجاح!` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(from, { text: `❌ حدث خطأ أثناء تعديل الملف:\n${error.message}` }, { quoted: msg });
    }
  }
};