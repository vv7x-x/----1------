const { eliteNumbers } = require('../haykala/elite.js');
const { jidDecode } = require('@whiskeysockets/baileys');

const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

module.exports = {
  command: 'سب',
  description: 'يرد برسالة مع منشن الشخص المستهدف (خاص للنخبة فقط)',
  usage: 'سب @الشخص',
  category: 'إدارة',

  async execute(sock, msg) {
    try {
      const chatId = msg.key.remoteJid;
      const sender = decode(msg.key.participant || chatId);
      const senderLid = sender.split('@')[0];

      // تحقق من النخبة
      if (!eliteNumbers.includes(senderLid)) {
        return await sock.sendMessage(chatId, { text: '❌ هذا الأمر خاص فقط للنخبة.' }, { quoted: msg });
      }

      // تحقق من وجود منشن
      const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      if (mentions.length === 0) {
        return await sock.sendMessage(chatId, { text: '❌ الرجاء منشن شخص للرد عليه.' }, { quoted: msg });
      }

      const target = mentions[0];
      const targetName = target.split('@')[0];

      // الرسالة مع المنشن
      const replyText = `@${targetName} مانسيت كسمك يالحوثي يبنت قحبه خير زكمك ولي تب حد نيكلك امك ولا شني را نركب ع طيزمك يبنت لقحاب يلهن طيزمك تي حشم حال ثواني زكمك يبنت بزعتي منويه ونحشي لطيزمك شحمه ولحمه ونيكمك فزحمه يلعن زقاقات زكمك يبنت هلقحيبه يلعن فراعي امك يلعن تديان امك يلعن مهبل زكمك تحبي مني نيكلك زكمك ولاشني صوت زكمك يجيب قداد لزب را يبنت كلبتي يلهن فشلوخ زكمك يعني لزم نهزب فزكمك صح تيوربي لما نشرد طيزمك يبنت قحبه تي حشم حال فراعي امك تيشن لقحبه هيا نكت عار لزب را انبد نجلد ف تديان امك يبنت بغوله ي عابده ذكوره يلعن شراف زكمك ولي جاب زكمك يبنت قحبه ختفي عا صريم اختمكك يلهن بزوال امكك تيواكك نضحك ع شقمك ءني را يلهن تشاشت زكمك لزم نيكلك امك فقروب يعني ببنت قحبه راك ببنت قحبه تقحبي لزب ونيكمك فتسجيلات و سطور وكصر ورا خلي فرعت امك طير يلهن مخريق زكمك يبنت قحبه تيوربي لما نشردك هي يبنت قحبيبه`;

      await sock.sendMessage(chatId, {
        text: replyText,
        mentions: [target],
      }, { quoted: msg });

    } catch (error) {
      console.error('❌ خطأ في أمر سب:', error);
      await sock.sendMessage(msg.key.remoteJid, { text: '⚠️ حدث خطأ أثناء تنفيذ الأمر.' }, { quoted: msg });
    }
  }
};