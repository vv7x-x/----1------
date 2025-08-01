const { isElite } = require('../haykala/elite.js'); 
const { jidDecode } = require('@whiskeysockets/baileys');

// **التعديل هنا في دالة decode**
// جعلها تنتهي بـ @lid بدلاً من @s.whatsapp.net لتطابق قائمة المشاركين
const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@lid';

module.exports = {
  category: 'tools',
  command: "انتر",
  description: "طرد عضو من المجموعة مع إغلاق مؤقت ورسالة منشن قبل الطرد.",
  usage: ".طير",

  async execute(sock, msg) {
    try {
      const chatId = msg.key.remoteJid;
      const sender = decode(msg.key.participant || chatId);
      const senderLid = sender.split('@')[0];

      if (!chatId.endsWith('@g.us')) {
        return; 
      }

      if (!(await isElite(senderLid))) {
        return await sock.sendMessage(chatId, {
          text: '❌ هذا الأمر مخصص فقط للنخبة!'
        }, { quoted: msg });
      }

      const metadata = await sock.groupMetadata(chatId); 
      
      let target = null;

      // أزل أسطر الطباعة (console.log) الآن بعد التشخيص، أو اتركها إذا كنت تفضل ذلك للمراقبة.
      // console.log('--- Debugging "طير" Command ---');
      // console.log('msg.message?.extendedTextMessage?.contextInfo:', msg.message?.extendedTextMessage?.contextInfo);
      // console.log('Mentioned JID (raw):', msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]);
      // console.log('Participant JID (raw, from reply):', msg.message?.extendedTextMessage?.contextInfo?.participant);


      // التحقق أولاً من وجود منشن
      if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
          target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
          // console.log('Target identified as: Mention');
      } 
      // إذا لم يكن هناك منشن، تحقق من الرد على رسالة
      else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
          target = msg.message.extendedTextMessage.contextInfo.participant;
          // console.log('Target identified as: Reply');
      } else {
          // console.log('No target (mention or reply) found in message context.');
      }

      let decodedTarget = null;
      if (target) {
        decodedTarget = decode(target); // سيتم الآن تحويله إلى @lid
        // console.log('Raw target JID:', target);
        // console.log('Decoded target JID:', decodedTarget);
      }

      // const participantIds = metadata.participants.map(p => p.id);
      // console.log('Group Participants IDs:', participantIds);
      // console.log('Does decodedTarget exist in participants list?', participantIds.includes(decodedTarget));


      // تأكد أننا نستخدم decodedTarget هنا
      if (decodedTarget && metadata.participants.find(p => p.id === decodedTarget)) {
        await sock.groupSettingUpdate(chatId, 'announcement'); 

        await sock.sendMessage(chatId, { 
          text: `@${decodedTarget.split('@')[0]} شوف تحت 👇👇`,
          mentions: [decodedTarget] 
        });

        await new Promise(resolve => setTimeout(resolve, 1000)); 

        await sock.groupParticipantsUpdate(chatId, [decodedTarget], 'remove');

        await sock.sendMessage(chatId, { text: `منغولي` });

        await sock.groupSettingUpdate(chatId, 'not_announcement'); 

      } else if (target) { 
          await sock.sendMessage(chatId, { text: '❌ لم أتمكن من العثور على العضو المحدد في هذه المجموعة.' }, { quoted: msg });
      } else {
        await sock.sendMessage(chatId, { text: 'ℹ️ الرجاء الرد على رسالة العضو أو منشنته لطرده.' }, { quoted: msg });
      }

    } catch (error) {
      console.error('✗ خطأ في أمر الطرد:', error);
      try {
          await sock.groupSettingUpdate(msg.key.remoteJid, 'not_announcement');
      } catch (err) {
          console.error('✗ خطأ في محاولة فتح المجموعة بعد الخطأ:', err);
      }
      await sock.sendMessage(msg.key.remoteJid, { text: 'حدث خطأ أثناء تنفيذ الأمر.' }, { quoted: msg });
    }
  }
};