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
      const developerNumber1 = '+201155528093@s.whatsapp.net';
      const developerEmail = '';

      const vcard1 = `BEGIN:VCARD
VERSION:3.0
FN:❃يحيى رضا❃
TEL;waid=+201155528093@s.whatsapp.net
EMAIL:${developerEmail}
NOTE:الرقم ليس بوت، لو كتبت أوامر بيعطيك بلوك 🦈
END:VCARD`;

      const vcard2 = `BEGIN:VCARD
VERSION:3.0
FN:❃يحيى رضا❃   
TEL;waid=+201155528093@s.whatsapp.net
EMAIL:${developerEmail}
NOTE:الرقم ليس بوت، لو كتبت أوامر بيعطيك بلوك 🦈
END:VCARD`;

      // إرسال جهتي الاتصال دفعة واحدة
      await sock.sendMessage(msg.key.remoteJid, {
        contacts: {
          displayName: "❃ يحيى رضا ❃",
          contacts: [
            { vcard: vcard1 },
            { vcard: vcard2 }
          ]
        }
      }, { quoted: msg });

     const instructionsText = `
╔═══════════════════╗
║ 👑 DEVELOPER CARD 👑 ║
╚═══════════════════╝

🧾 Name     : 𓆩yahya𓆪  
🎭 Alias    : 『• الكويتي ⁞🦦』⚔  
🎂 Age      : 16  
📱 Number   : ‪+201155528093‬  
🗣 Quote    : EL PATRÓN DEL MAL 🕶  
💻 Hobby    : Programming 👨‍💻  

━━━━━━━━━━━━━━━━━━━━━━
🔰 للتواصل أو الدعم:
🌐 https://wa.me/201155528093?text=انا+جاي+من+طرف+الكود+⚙
━━━━━━━━━━━━━━━━━━━━━━

🛡 هٰـذا هُـوَ 『 مُـطَـوِّرِ الْـبُـوت 』وَالْـقَـائِـد الْأَعْـلَـى لِـلنِّـظَـام 👨‍💻  
📞 لِـلـتَّـوَاصُـل وَالـدَّعْـم: اِسْـتَـخْـدِمْ الْـرَّقَـم أَعْـلَاه ☎
`;



      const thumbnailPath = path.join(__dirname, 'image.jpeg');
      const thumbnailBuffer = fs.existsSync(thumbnailPath) ? fs.readFileSync(thumbnailPath) : null;

      await sock.sendMessage(msg.key.remoteJid, {
        text: instructionsText,
        contextInfo: {
          externalAdReply: {
            title: 'مطور البوت',
            body: 'رابط مجموعه الدعم',
            thumbnail: thumbnailBuffer,
            mediaUrl: 'مفيش لسه يقلبي🌹',
          }
        }
      }, { quoted: msg });

    } catch (error) {
      console.error('❌ خطأ أثناء تنفيذ أمر مطور:', error);
    }
  }
};