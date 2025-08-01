const { isElite } = require('../haykala/elite'); // عدل حسب مكان ملف الصلاحيات عندك

module.exports = {
  command: 'طرد',
  category: 'admin',
  description: 'طرد عضو بالرد على رسالته أو بالمنشن (حصري للنخبة).',

  async execute(sock, msg, args = []) {
    const chatId = msg.key.remoteJid;

    if (!chatId.endsWith('@g.us')) {
      return sock.sendMessage(chatId, { text: '❌ هذا الأمر فقط في المجموعات.' }, { quoted: msg });
    }

    const sender = msg.key.participant || msg.participant || msg.key.remoteJid;
    if (!isElite(sender)) {
      return sock.sendMessage(chatId, { text: '❌ ليس لديك صلاحية لاستخدام الأمر.' }, { quoted: msg });
    }

    const groupMetadata = await sock.groupMetadata(chatId);

    let target;

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;

    if (mentioned?.length) {
      target = mentioned[0];
    } else if (quotedParticipant) {
      target = quotedParticipant;
    } else {
      return sock.sendMessage(chatId, { text: '❌ يرجى الرد على رسالة العضو أو منشنه للطرد.' }, { quoted: msg });
    }

    const isMember = groupMetadata.participants.some(p => p.id === target);
    if (!isMember) {
      return sock.sendMessage(chatId, { text: '❌ العضو غير موجود في المجموعة.' }, { quoted: msg });
    }

    if (target === sock.user.id) {
      return sock.sendMessage(chatId, { text: '❌ لا يمكنني طرد نفسي.' }, { quoted: msg });
    }

    try {
      await sock.groupParticipantsUpdate(chatId, [target], 'remove');
      return sock.sendMessage(chatId, {
        text: `✅ تم طرد العاق هاد💃 @${target.split('@')[0]}!`,
        mentions: [target]
      }, { quoted: msg });
    } catch (error) {
      return sock.sendMessage(chatId, { text: `❌ فشل الطرد: ${error.message}` }, { quoted: msg });
    }
  }
};