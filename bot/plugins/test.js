const fs = require('fs');
const path = require('path');

module.exports = {
  command: 'تست',
  description: 'اختبار البوت',
  usage: '.تست',
  category: 'tools',

  async execute(sock, msg) {
    try {
      const fancyText = `yahya 𝑷𝒂𝒔𝒔𝒆𝒅 𝑩𝒚 𝑯𝒆𝒓𝒆 🍷`;

      const imagePath = path.join(__dirname, '../media/image.jpeg');
      const hasImage = fs.existsSync(imagePath);
      const imageBuffer = hasImage ? fs.readFileSync(imagePath) : null;

      await sock.sendMessage(
        msg.key.remoteJid,
        {
          text: fancyText,
          contextInfo: {
            externalAdReply: {
              title: "yahya 𝐌𝐍1🪽",
              body: "جرب تلعب معا MN1 و نشوف اخرتها 💀🔥",
              thumbnail: imageBuffer,
              mediaType: 1,
              sourceUrl: "لسه يقلبي",
              renderLargerThumbnail: false,
              showAdAttribution: true
            }
          }
        },
        { quoted: msg }
      );

    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: `⚠️ حدث خطأ: ${err.message || err.toString()}`
      }, { quoted: msg });
    }
  }
};