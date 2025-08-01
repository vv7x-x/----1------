const fs = require('fs');
const path = require('path');
const { eliteNumbers } = require('../haykala/elite.js');

module.exports = {
  command: ['وصف'],
  description: 'تغيير وصف الجروب (للنخبة فقط).',
  category: 'tools',

  async execute(sock, msg, args = []) {
    try {
      // التحقق من النخبة
      const sender = msg.key.participant || msg.key.remoteJid;
      const senderNumber = sender.split('@')[0];

      if (!eliteNumbers.includes(senderNumber)) {
        return await sock.sendMessage(msg.key.remoteJid, {
          text: '❌ هذا الأمر مخصص للنخبة فقط.',
        }, { quoted: msg });
      }

      // التحقق من أن الرسالة داخل مجموعة
      if (!msg.key.remoteJid.endsWith('@g.us')) {
        return await sock.sendMessage(msg.key.remoteJid, {
          text: '🚫 هذا الأمر يعمل داخل المجموعات فقط.',
        }, { quoted: msg });
      }

      // قراءة الرسالة النصية الكاملة كما في كود "إضافة"
      const fullText =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        '';

      // محاولة قراءة الرد على الرسالة (الوصف الجديد)
      const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      let newDescription = '';

      if (quotedMessage?.conversation) {
        newDescription = quotedMessage.conversation.trim();
      } else if (quotedMessage?.extendedTextMessage?.text) {
        newDescription = quotedMessage.extendedTextMessage.text.trim();
      }

      // إذا لم يتم الرد على رسالة، نأخذ الوصف من نص الرسالة
      if (!newDescription && fullText) {
        const parts = fullText.trim().split(/\s+/);
        if (parts.length > 1) {
          newDescription = parts.slice(1).join(' ');
        }
      }

      if (!newDescription) {
        return await sock.sendMessage(msg.key.remoteJid, {
          text: '⚠️ يرجى الرد على رسالة أو كتابة الوصف الجديد بعد الأمر.',
        }, { quoted: msg });
      }

      // تحديث الوصف
      const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
      const oldDescription = groupMetadata.desc || 'لا يوجد وصف حالي.';

      await sock.groupUpdateDescription(msg.key.remoteJid, newDescription);

      const messageText = `> ✅ تم تغيير وصف الجروب بنجاح\n\n— الوصف القديم:\n*${oldDescription}*\n\n— الوصف الجديد:\n*${newDescription}*`;

      const thumbnail = fs.readFileSync(path.resolve('./image.jpeg'));

      await sock.sendMessage(msg.key.remoteJid, {
        text: messageText,
        contextInfo: {
          externalAdReply: {
            title: 'تم تعديل وصف المجموعة',
            body: 'بواسطة أحد أعضاء النخبة',
            mediaType: 2,
            thumbnail,
            sourceUrl: 'https://github.com/medo-ayano'
          }
        }
      }, { quoted: msg });

    } catch (error) {
      console.error('❌ خطأ في أمر تغيير الوصف:', error);
      return await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ حدث خطأ أثناء تنفيذ الأمر، يرجى المحاولة لاحقاً.',
      }, { quoted: msg });
    }
  }
};