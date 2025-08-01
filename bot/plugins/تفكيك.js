const words = [
  "أتوميك",
  "ناروتو",
  "ون بيس",
  "ديث نوت",
  "كيميتسو",
  "بليتش",
  "ديث",
  "ساي",
  "غوكو",
  "ساكورا",
  "هجوم العمالقة",
  "ديث",
  "يوغي",
  "شيروكو",
  "أنمي",
  "ساموراي",
  "نينجا",
  "شينوبي",
  "بوكيمون",
  "دراجون بول"
  // أضف كلمات أكثر إذا تحب
];

const decodingGames = {};

module.exports = {
  command: 'تفكيك',
  description: 'لعبة تفكيك كلمة، ارسل الكلمة مفككة صح خلال 20 ثانية!',
  usage: 'تفكيك',
  category: 'تفاعلي',

  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;

    if (decodingGames[chatId]) {
      return await sock.sendMessage(chatId, {
        text: 'اللعبة شغالة حالياً، خلصوها قبل ما تبدأ واحدة جديدة!\n\n- أتوميك'
      }, { quoted: msg });
    }

    // اختيار كلمة عشوائية من القائمة
    const randomWord = words[Math.floor(Math.random() * words.length)];

    // نحول الكلمة للتفكيك (كل حرف مفصول بمسافة)
    const splitted = randomWord.split('').join(' ');

    decodingGames[chatId] = {
      answer: randomWord.replace(/\s+/g, '').toLowerCase(), // نزيل الفراغات ونحولها لصغيرة للمقارنة
      finished: false
    };

    await sock.sendMessage(chatId, {
      text: `🧩 فكك الكلمة التالية:\n\n${randomWord}\n\nلديك 20 ثانية لإرسال الكلمة مفككة صحيحة (بالحروف مفصولة بمسافة)\n\nمثال: ${splitted}\n\n- أتوميك`
    }, { quoted: msg });

    // مستمع الردود
    const handler = async ({ messages }) => {
      const reply = messages[0];
      if (!reply.message) return;

      const from = reply.key.remoteJid;
      if (from !== chatId) return; // فقط نفس الشات
      if (reply.key.fromMe) return; // تجاهل رسائل البوت نفسه

      // نص الرد
      const text = (reply.message.conversation || reply.message.extendedTextMessage?.text || '').trim().toLowerCase();

      // نحول رد المستخدم بحذف الفراغات عشان نقارن صح
      const cleaned = text.replace(/\s+/g, '');

      if (cleaned === decodingGames[chatId].answer) {
        decodingGames[chatId].finished = true;
        await sock.sendMessage(chatId, {
          text: `✅ إجابة صحيحة! مبروك @${reply.key.participant?.split('@')[0]}!\n\n- أتوميك`,
          mentions: [reply.key.participant]
        }, { quoted: reply });

        delete decodingGames[chatId];
        sock.ev.off('messages.upsert', handler);
      }
    };

    sock.ev.on('messages.upsert', handler);

    // انتهاء الوقت
    setTimeout(() => {
      if (decodingGames[chatId] && !decodingGames[chatId].finished) {
        sock.sendMessage(chatId, {
          text: `⏰ انتهى الوقت! الإجابة الصحيحة هي: *${randomWord}*\n\n- أتوميك`
        }, { quoted: msg });

        delete decodingGames[chatId];
        sock.ev.off('messages.upsert', handler);
      }
    }, 20000);
  }
};