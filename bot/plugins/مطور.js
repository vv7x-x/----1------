const path = require('path');
const fs = require('fs');

module.exports = {
  name: 'مطور',
  command: ['مطور'],
  category: 'خاص',
  description: 'إرسال معلومات المطور وتعليمات التواصل.',
  args: [],
  hidden: false,

  async execute(sock, msg) {
    try {
      const developerNumber1 = '201505217591@s.whatsapp.net';
      const developerEmail = '';

      const vcard1 = `BEGIN:VCARD
VERSION:3.0
FN:❃𝑲𝑰𝑺𝑨𝑲𝑰
TEL;waid=201507093714:+201505217591
END:VCARD`;

      const vcard2 = `BEGIN:VCARD
VERSION:3.0
FN:𝑲𝑰𝑺𝑨𝑲𝑰
TEL;waid=201507093714:+201505217591
EMAIL:${developerEmail}
NOTE:الرقم ليس بوت، لو كتبت أوامر بيعطيك بلوك 🦈
END:VCARD`;

      // إرسال جهتي الاتصال دفعة واحدة
      await sock.sendMessage(msg.key.remoteJid, {
        contacts: {
          displayName: "𝑲𝑰𝑺𝑨𝑲𝑰",
          contacts: [
            { vcard: vcard1 },
            { vcard: vcard2 }
          ]
        }
      }, { quoted: msg });

      const instructionsText = `┃ مرحباً بك، هذا هو كيساكي مطوري ↯↯

> *تعليمات قبل الدخول إليه لتجنب الحظر منه، الرجاء قراءتها قبل الدخول إليه*

> \`1 - لا يمكنك الدخول لتسأل عن شئ غير مهم\`
> \`2 - اذا دخلت لتقول خطأ في البوت تفضل\`
> \`3 - لا تدخل لاسباب تافهه\``;

      const thumbnailPath = path.join(__dirname, 'image.jpeg');
      const thumbnailBuffer = fs.existsSync(thumbnailPath) ? fs.readFileSync(thumbnailPath) : null;

      await sock.sendMessage(msg.key.remoteJid, {
        text: instructionsText,
        contextInfo: {
          externalAdReply: {
            title: 'مطور البوت',
            body: 'رابط مجموعه الدعم',
            thumbnail: thumbnailBuffer,
            mediaUrl: 'https://chat.whatsapp.com/KQS2w3iFt286pROPUiSZnV?mode=ac_t',
          }
        }
      }, { quoted: msg });

    } catch (error) {
      console.error('❌ خطأ أثناء تنفيذ أمر مطور:', error);
    }
  }
};