const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  command: "دزو",
  description: "رد ساخر على كلمة دز",
  usage: ".دز",
  category: "fun",

  async execute(sock, msg) {
    try {
      let imageBuffer = null;

      try {
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const pfpUrl = await sock.profilePictureUrl(senderJid, "image");
        if (pfpUrl) {
          const res = await axios.get(pfpUrl, { responseType: "arraybuffer" });
          imageBuffer = Buffer.from(res.data, "binary");
        }
      } catch (e) {
        // تجاهل الخطأ لو فشل جلب صورة البروفايل
      }

      if (!imageBuffer) {
        const fallbackPath = path.join(process.cwd(), "image.jpeg");
        if (fs.existsSync(fallbackPath)) {
          imageBuffer = fs.readFileSync(fallbackPath);
        }
      }

      const replies = [
        "متدز انت يـ عم! ولا عشان أنا عمّك؟ 😒",
        "َدز دز وخلاص؟ متدز بعيد عننا كده 💨",
        "هَش انت يـ عم، اتكلم مصري وقول هش🗿",
        "َدز على راسك! فاكر نفسك فوق القانون؟ 🤨",
        "دَز؟ دز على باب بيتكو بالمرة 🧹",
        "شكلك فاضي يا عم، روح بقى نام  😴",
        "َدز إيه؟ دز نفسك و نام بدري لأن العيال الصغيره تنام بدري🐦‍⬛🤙",
        "دَز؟ دز انت ي عن و العب بعيد عن عمك 😉"
      ];

      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      await sock.sendMessage(msg.key.remoteJid, {
        text: randomReply,
        contextInfo: {
          externalAdReply: {
            title: "رد على 'دز' 🤖",
            body: "إهدى كده ي ريس ✋",
            thumbnail: imageBuffer,
            mediaType: 1,
            sourceUrl: "https://t.me/KINGSLO1",
            renderLargerThumbnail: false,
            showAdAttribution: true
          }
        }
      }, { quoted: msg });

    } catch (error) {
      console.error('❌ خطأ في أمر "دز":', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `حصل خطأ:\n${error.message || error.toString()}`
      }, { quoted: msg });
    }
  }
};