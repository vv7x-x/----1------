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
      const developerNumber1 = '201155528093@s.whatsapp.net';
      const developerEmail = '';

      const vcard1 = `BEGIN:VCARD
VERSION:3.0
FN:❃يحيى رضا❃
TEL;waid=201155528093
EMAIL:${developerEmail}
NOTE:الرقم ليس بوت، لو كتبت أوامر بيعطيك بلوك 🦈
END:VCARD`;

      const vcard2 = `BEGIN:VCARD
VERSION:3.0
FN:❃يحيى رضا❃   
TEL;waid=201155528093@s.whatsapp.net
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
┃ مرحباً بك، هذا هو يحيى مطوري ↯↯

╔══════════════════════════════════════════╗
║   ▂ ▃ ▅ ▆ █  𝕐𝕒𝕙𝕪𝕒 𝔻𝕖𝕧 𝕆𝕡𝕤  █ ▆ ▅ ▃ ▂   ║
╠══════════════════════════════════════════╣
║  ╭─❖  𝙼𝚎𝚗𝚞 𝙸𝚗𝚜𝚝𝚛𝚞𝚌𝚝𝚒𝚘𝚗𝚜 ❖─╮                ║
║  │                                       │
║  │ ⚠️  𝙿𝚕𝚎𝚊𝚜𝚎 𝚛𝚎𝚊𝚍 𝚋𝚎𝚏𝚘𝚛𝚎 𝚎𝚗𝚝𝚎𝚛𝚒𝚗𝚐 ⚠️  │
║  │                                       │
║  │ ① - 𝙽𝚘 𝚒𝚛𝚛𝚎𝚕𝚎𝚟𝚊𝚗𝚝 𝚚𝚞𝚎𝚛𝚒𝚎𝚜.            │
║  │ ② - 𝙵𝚘𝚛 𝚋𝚘𝚝 𝚒𝚜𝚜𝚞𝚎𝚜, 𝚛𝚎𝚙𝚘𝚛𝚝 𝚑𝚎𝚛𝚎.           │
║  │ ③ - 𝙰𝚟𝚘𝚒𝚍 𝚜𝚝𝚞𝚙𝚒𝚍 𝚛𝚎𝚙𝚘𝚛𝚝𝚜.               │
║  ╰─────────────────────────────╯                ║
║                                              ║
║  ▶  𝙷𝚊𝚌𝚔𝚎𝚛 𝚃𝚢𝚙𝚎𝚍 𝙼𝚎𝚜𝚜𝚊𝚐𝚎  ◀                ║
║                                              ║
║      𝓦𝓮𝓵𝓬𝓸𝓶𝓮 𝓽𝓸 𝓨𝓪𝓱𝔂𝓪 𝓓𝓮𝓿  🛡️               ║
║                                              ║
╚══════════════════════════════════════════╝
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