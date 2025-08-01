// plugins/sonic.js
module.exports = {
  category: 'tools',
  command: 'تكلم',
  description: 'سونيك يظهر بصوت ورسالة فخمة',
  async execute(sock, msg) {
    const jid = msg.key.remoteJid;

    // إرسال المقطع الصوتي
    await sock.sendMessage(jid, {
      audio: { url: 'https://files.catbox.moe/nnq6h6.mp3' }, // تقدر تغير الرابط لصوت سونيك حقيقي
      mimetype: 'audio/mp4',
      ptt: true
    }, { quoted: msg });

    // الرسالة النصية بعد الصوت
    setTimeout(async () => {
      await sock.sendMessage(jid, {
        text: `💙⚡ ━━━━━━━━━━━
*『 𝐼 𝑎𝑚 yahya』*
━━━━━━━━━━━ ⚡💙

👟 *أنا اقوى من الكل...*
🔥 *أنا البرق الذي لا يُلحق...*
🚀 *أنا من لا يتوقف أبدًا، لأني صُنعِت لأتقدّم!*

🎯 *تظن إنك تقدر تسبقني؟*
⏱️ *معك وقت طويل... بس ما تلومش إلا نفسك!*

🏁 *أنا المستقل الذي لا يُدفّق... والباقي مجرد ظلال خلفي.*`,
      }, { quoted: msg });
    }, 1800);
  }
};