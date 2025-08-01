const fs = require('fs');
const path = require('path');
const { jidDecode, isJidGroup } = require('@whiskeysockets/baileys');
const { isElite } = require('../haykala/elite.js');

const emojisMokhla = [
  '🍆', '🍑', '💦', '😈', '👅', '👙', '🩲', '🍌', '🔥', '💋', '👠', '👄'
];

let handlerAttached = false;

const attachReactionHandler = (sock) => {
  if (handlerAttached) return;

  sock.ev.on('messages.reaction', async (reactionMsg) => {
    try {
      const { key, reaction } = reactionMsg;
      const chatId = key.remoteJid;
      const senderJid = reactionMsg.participant || key.participant;

      if (!isJidGroup(chatId)) return;
      if (!emojisMokhla.includes(reaction)) return;
      if (isElite(senderJid)) return;

      try {
        await sock.groupParticipantsUpdate(chatId, [senderJid], 'remove');
      } catch (err) {
        console.error("❌ فشل في الطرد:", err);
        await sock.sendMessage(chatId, {
          text: '⚠️ لم أتمكن من طرد العضو. تأكد أن لدي صلاحية مشرف.'
        });
        return;
      }

      const decoded = jidDecode(senderJid);
      const number = decoded?.user || senderJid.split('@')[0];

      await sock.sendMessage(chatId, {
        text: `شوف تحت يعبد 👇\n@${number}`,
        mentions: [senderJid]
      });

    } catch (err) {
      console.error('⚠️ خطأ أثناء مراقبة التفاعل:', err);
    }
  });

  handlerAttached = true;
};

const detachReactionHandler = () => {
  handlerAttached = false;
};

module.exports = {
  command: ['فعل', 'وقف'],
  description: 'فعل: لتفعيل طرد من يتفاعل بإيموجي مخلّ\nوقف: لإيقافه. لا يطرد النخبة.',
  category: 'zarf',

  async execute(sock, m, args, commandName) {
    const groupId = m.key.remoteJid;
    const sender = m.key.participant || m.participant;

    if (!groupId.endsWith('@g.us')) {
      return sock.sendMessage(groupId, {
        text: '❌ هذا الأمر يعمل فقط داخل المجموعات.'
      }, { quoted: m });
    }

    if (!isElite(sender)) {
      return sock.sendMessage(groupId, {
        text: '⚠️ هذا الأمر مخصص فقط للنخبة.'
      }, { quoted: m });
    }

    if (commandName === 'فعل') {
      if (handlerAttached) {
        return sock.sendMessage(groupId, {
          text: '✅ النظام مفعل مسبقًا.'
        }, { quoted: m });
      }

      attachReactionHandler(sock);
      return sock.sendMessage(groupId, {
        text: '✅ تم تفعيل نظام الطرد للتفاعلات المخلّة.'
      }, { quoted: m });
    }

    if (commandName === 'وقف') {
      if (!handlerAttached) {
        return sock.sendMessage(groupId, {
          text: '🛑 النظام غير مفعل حالياً.'
        }, { quoted: m });
      }

      detachReactionHandler();
      return sock.sendMessage(groupId, {
        text: '🛑 تم إيقاف نظام الطرد التلقائي للتفاعلات المخلّة.'
      }, { quoted: m });
    }
  }
};