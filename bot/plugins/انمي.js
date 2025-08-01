module.exports = {
  command: 'تخمين',
  category: 'games',
  description: 'تخمين شخصية أنمي من التلميحات فقط (بدون صور)',

  async execute(sock, msg, args = []) {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.participant || msg.key.remoteJid;

    // قاعدة بيانات الشخصيات
    const characters = [
      {
        name: 'ناروتو',
        hints: ['شعره أصفر', 'يحب الرامن 🍜', 'هو جينشوريكي الكيوبي 🦊']
      },
      {
        name: 'لوفي',
        hints: ['يرتدي قبعة قش', 'يحب اللحم 🍖', 'يحلم أن يصبح ملك القراصنة ☠️']
      },
      {
        name: 'زورو',
        hints: ['سياف بثلاث سيوف ⚔️', 'يضيع كثيرًا 😂', 'شعره أخضر']
      },
      {
        name: 'ايتاتشي',
        hints: ['عيونه شارينغان 🔴', 'من عشيرة اليوتشيها', 'ضحى بعشيرته 🥀']
      },
      {
        name: 'إيرين',
        hints: ['تحول إلى عملاق 🧟', 'من هجوم العمالقة', 'يصرخ "حرية!"']
      },
      {
        name: 'جوكو',
        hints: ['يقود سحابًا طائرًا ☁️', 'يقاتل فضائيين', 'شعره يتحول للأصفر ⚡']
      },
      {
        name: 'لايت',
        hints: ['يملك مذكرة الموت 📓', 'خصمه المحقق L', 'ذكي جدًا وبارد']
      },
      {
        name: 'كينتوكي',
        hints: ['فضي الشعر', 'كسول ويحب الحلوى 🍬', 'يعيش في عصر الساموراي']
      },
      {
        name: 'ريوك',
        hints: ['شينيغامي', 'يعشق التفاح 🍎', 'يراقب لايت']
      },
      {
        name: 'ناتسو',
        hints: ['ينتمي إلى فيري تيل', 'يستخدم نار 🔥', 'صديق هابي 😺']
      },
      // يمكنك إضافة المزيد (وأنصحك تحفظ القائمة في ملف منفصل لو كبرت)
    ];

    // نختار شخصية عشوائية
    const character = characters[Math.floor(Math.random() * characters.length)];

    await sock.sendMessage(chatId, {
      text: `🤔 خمن شخصية الأنمي من التلميحات التالية:\n\n- ${character.hints.join('\n- ')}\n\n🕒 لديك 20 ثانية للإجابة!`
    }, { quoted: msg });

    let answered = false;

    const handler = async ({ messages }) => {
      const reply = messages[0];
      const replyFrom = reply.key.remoteJid;

      if (
        replyFrom === chatId &&
        !reply.key.fromMe &&
        (reply.key.participant || reply.participant || reply.key.remoteJid) === sender
      ) {
        const body = reply.message?.conversation || reply.message?.extendedTextMessage?.text || '';
        if (body.toLowerCase().includes(character.name.toLowerCase())) {
          answered = true;
          await sock.sendMessage(chatId, {
            text: `🎉 إجابة صحيحة! الشخصية هي *${character.name}*`
          }, { quoted: reply });
        } else {
          await sock.sendMessage(chatId, {
            text: `❌ خطأ! جرب مرة أخرى خلال الوقت المحدد.`
          }, { quoted: reply });
        }
      }
    };

    sock.ev.on('messages.upsert', handler);

    setTimeout(() => {
      if (!answered) {
        sock.sendMessage(chatId, {
          text: `⏱️ انتهى الوقت! الشخصية كانت: *${character.name}*`
        }, { quoted: msg });
      }
      sock.ev.off('messages.upsert', handler);
    }, 20000);
  }
};