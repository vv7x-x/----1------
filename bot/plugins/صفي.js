const { jidDecode } = require('@whiskeysockets/baileys');
const { eliteNumbers } = require('../haykala/elite.js');
const { addKicked } = require('../haykala/dataUtils.js');

const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

module.exports = {
  command: 'صفي',
  description: 'طرد جميع أعضاء الجروب فورًا (ماعدا البوت وصاحب الأمر)',
  usage: '.صفي',
  category: 'admin',

  async execute(sock, msg) {
    try {
      const groupJid = msg.key.remoteJid;
      const sender = decode(msg.key.participant || groupJid);
      const senderLid = sender.split('@')[0];

      if (!groupJid.endsWith('@g.us')) {
        return await sock.sendMessage(groupJid, { text: '❌ هذا الأمر يعمل فقط داخل المجموعات.' }, { quoted: msg });
      }

      if (!eliteNumbers.includes(senderLid)) {
        return await sock.sendMessage(groupJid, { text: '🚫 هذا الأمر للنخبة فقط.' }, { quoted: msg });
      }

      const groupMetadata = await sock.groupMetadata(groupJid);
      const botNumber = decode(sock.user.id);

      const toKick = groupMetadata.participants
        .map(p => p.id)
        .filter(id => id !== botNumber && id !== sender);

      if (toKick.length === 0) {
        return await sock.sendMessage(groupJid, { text: '⚠️ لا يوجد أعضاء يمكن طردهم.' }, { quoted: msg });
      }

      await sock.sendMessage(groupJid, { text: '🧨 يتم تصفية الجروب الآن...' }, { quoted: msg });

      await sock.groupParticipantsUpdate(groupJid, toKick, 'remove');
      addKicked(toKick.map(jid => jid.split('@')[0]));

    } catch (err) {
      console.error('❌ خطأ في أمر صفي:', err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ حدث خطأ أثناء تصفية الجروب:\n\n${err.message || err.toString()}`
      }, { quoted: msg });
    }
  }
};