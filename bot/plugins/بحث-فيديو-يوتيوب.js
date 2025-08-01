const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
  category: 'tools',
  command: 'vid',
  description: 'البحث عن فيديو من يوتيوب',
  async execute(sock, message) {
    const chatId = message.key.remoteJid;
    const args = message.args || [];
    const query = args.join(' ');

    if (!query) {
      return await sock.sendMessage(chatId, { text: '❌ الرجاء كتابة اسم الفيديو مثل: فيديو ون بيس' }, { quoted: message });
    }

    try {
      const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      const { data } = await axios.get(url);
      const videoIds = [...data.matchAll(/"videoId":"(.*?)"/g)].map(m => m[1]);
      const seen = new Set();
      const links = videoIds.filter(id => !seen.has(id) && seen.add(id)).slice(0, 3);

      if (links.length === 0) {
        return await sock.sendMessage(chatId, { text: '❌ لم يتم العثور على فيديوهات.' }, { quoted: message });
      }

      for (const id of links) {
        await sock.sendMessage(chatId, {
          text: `📹 https://www.youtube.com/watch?v=${id}`
        }, { quoted: message });
      }
    } catch (err) {
      console.error(err);
      await sock.sendMessage(chatId, { text: '❌ حدث خطأ أثناء البحث.' }, { quoted: message });
    }
  }
};