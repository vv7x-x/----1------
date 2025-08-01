const { getUniqueKicked } = require('../haykala/dataUtils');
const { extractPureNumber } = require('../haykala/elite');

module.exports = {
  command: 'عدد',
  description: 'يعرض عدد الأعضاء الذين تم طردهم والتصنيف الأسطوري',
  category: 'zarf',
  usage: '.عدد',

  async execute(sock, msg) {
    const kickedSet = getUniqueKicked();
    const total = kickedSet.size;

    const ranks = [
      { threshold: 0, title: 'مبتدئ', emoji: '🪶' },
      { threshold: 25, title: 'جندي', emoji: '🪖' },
      { threshold: 75, title: 'مقاتل', emoji: '⚔️' },
      { threshold: 150, title: 'قناص', emoji: '🎯' },
      { threshold: 300, title: 'قائد', emoji: '🦾' },
      { threshold: 600, title: 'نقيب', emoji: '🧠' },
      { threshold: 1200, title: 'زعيم', emoji: '👑' },
      { threshold: 2400, title: 'ملك', emoji: '🏰' },
      { threshold: 4800, title: 'أسطورة', emoji: '🔥' },
      { threshold: 9600, title: 'أسطورة خارقة', emoji: '⚡' },
      { threshold: 19200, title: 'كيان مظلم', emoji: '🌑' },
      { threshold: 38400, title: 'خالِد', emoji: '🌀' },
      { threshold: 76800, title: 'فوق الطبيعة', emoji: '🌌' },
      { threshold: 153600, title: 'سيد الأكوان', emoji: '👽' },
      { threshold: 307200, title: 'مجهول الهوية', emoji: '🧿' },
      { threshold: 614400, title: 'نهاية كل شيء', emoji: '💀' },
      { threshold: 1228800, title: '∞ نهاية الزرف', emoji: '♾️' }
    ];

    let rank = ranks[0];

    for (let i = ranks.length - 1; i >= 0; i--) {
      if (total >= ranks[i].threshold) {
        rank = ranks[i];
        break;
      }
    }

    const message = `الرتبة : ${rank.title} ${rank.emoji}\nعدد الزرف : ${total} 🧨`;

    await sock.sendMessage(msg.key.remoteJid, {
      text: message
    }, { quoted: msg });
  }
};