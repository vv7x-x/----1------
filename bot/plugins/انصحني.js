const animes = [
  {
    title: 'Vivy: Fluorite Eye’s Song',
    mood: ['كئيب', 'حزين', 'دراما', 'موسيقى'],
    genre: 'دراما، خيال علمي',
    episodes: 13,
    reason: 'عميق، حزين، موسيقى رائعة، ورسم مبهر.',
    trailer: 'https://www.youtube.com/watch?v=1HAGuju_yKY'
  },
  {
    title: 'Gintama',
    mood: ['مضحك', 'كوميدي', 'ساخر', 'ضحك'],
    genre: 'كوميدي، أكشن، ساخر',
    episodes: 'كثير 😅',
    reason: 'أكثر أنمي يضحكك، شخصيات مجنونة، نكت بدون فلتر.',
    trailer: 'https://www.youtube.com/watch?v=FoBfXvlOR6M'
  },
  {
    title: 'Made in Abyss',
    mood: ['غامض', 'دموي', 'كئيب', 'خيال مظلم'],
    genre: 'مغامرة، فانتازيا، دراما',
    episodes: 13,
    reason: 'أنمي غامض وظاهره لطيف لكنه صادم جداً.',
    trailer: 'https://www.youtube.com/watch?v=6k0JuZei5_4'
  },
  {
    title: 'Horimiya',
    mood: ['رومانسي', 'مدرسي', 'خفة', 'لطيف'],
    genre: 'رومانسي، كوميدي، مدرسي',
    episodes: 13,
    reason: 'أنمي لطيف وسريع يخليك تبتسم طول الوقت.',
    trailer: 'https://www.youtube.com/watch?v=IYHz0VuwuF0'
  },
  {
    title: 'Chainsaw Man',
    mood: ['دموي', 'اكشن', 'جنون', 'ساخر'],
    genre: 'أكشن، رعب، دموي، خيال',
    episodes: 12,
    reason: 'دم، وحوش، جنون... وأكثر! لمحبي الأكشن الصادم.',
    trailer: 'https://www.youtube.com/watch?v=eyonP1AgC0k'
  }
];

module.exports = {
  command: ['انصحني'],
  category: 'anime',
  description: 'اقتراح أنمي بناءً على حالتك أو مزاجك!',
  usage: '.انصحني [مودك - مثال: كئيب، ضحك، دموي...]',

  async execute(sock, msg, args = []) {
    // تأكد من وجود args كمصفوفة حتى لا يحدث خطأ
    const mood = args.length ? args.join(' ').toLowerCase() : '';
    if (!mood) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: '🧠 اكتب مزاجك بعد الأمر\nمثال:\n`.انصحني ضحك`\n`.انصحني رومانسي كئيب`',
      }, { quoted: msg });
      return;
    }

    const results = animes.filter(anime =>
      anime.mood.some(m => mood.includes(m))
    );

    if (results.length === 0) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ لم أجد أنمي يناسب هذا المزاج.\nجرب كلمات مثل: كئيب، ضحك، دموي، رومانسي، ساخر...',
      }, { quoted: msg });
      return;
    }

    const pick = results[Math.floor(Math.random() * results.length)];

    const reply = `🎬 *أنمي مقترح لك: ${pick.title}*\n\n` +
      `🎭 التصنيف: ${pick.genre}\n` +
      `📺 عدد الحلقات: ${pick.episodes}\n` +
      `✨ لماذا؟ ${pick.reason}\n` +
      `🎥 التريلر: ${pick.trailer}`;

    await sock.sendMessage(msg.key.remoteJid, { text: reply }, { quoted: msg });
  }
};