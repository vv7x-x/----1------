const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { isElite } = require('../haykala/elite.js');

module.exports = {
  command: 'تيك',
  description: 'تحميل فيديوهات من TikTok بدون علامة مائية (مخصص للنخبة)',
  usage: '.تيك [عدد] [كلمة]',
  category: 'elite',

  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const senderNumber = sender.split('@')[0];

    if (!isElite(senderNumber)) {
      return await sock.sendMessage(chatId, {
        text: '❌ هذا الأمر مخصص للنخبة فقط.',
      }, { quoted: msg });
    }

    const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    const args = body.replace(/^([.\/!#])?تيك\s*/i, '').trim().split(' ');

    let count = parseInt(args[0]);
    if (isNaN(count)) {
      count = 1;
    } else {
      args.shift();
    }
    count = Math.min(count, 10);

    const query = args.join(' ').trim();
    if (!query) {
      return await sock.sendMessage(chatId, {
        text: '❌ اكتب الكلمة بعد العدد\nمثال: .تيك 3 عبارات',
      }, { quoted: msg });
    }

    await sock.sendMessage(chatId, {
      text: `🔍 جاري البحث عن *${count}* فيديو تيك توك لـ: *${query}* ...`,
    }, { quoted: msg });

    try {
      // ✅ Step 1: نجيب روابط TikTok من Google API
      const searchUrl = `https://ddg-api.herokuapp.com/search?query=site:tiktok.com ${encodeURIComponent(query)}`;
      const { data: searchResults } = await axios.get(searchUrl);
      const tiktokLinks = searchResults.results
        .map(r => r.link)
        .filter(link => link.includes('tiktok.com/@') && link.includes('/video/'));

      const links = [...new Set(tiktokLinks)].slice(0, count);
      if (links.length === 0) {
        return await sock.sendMessage(chatId, {
          text: '❌ لم يتم العثور على فيديوهات مناسبة.',
        }, { quoted: msg });
      }

      for (const [i, link] of links.entries()) {
        try {
          // ✅ Step 2: نحصل على token من Snaptik
          const snaptikPage = await axios.get('https://snaptik.app/', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });

          const $ = cheerio.load(snaptikPage.data);
          const token = $('input[name="token"]').attr('value');
          if (!token) throw new Error('فشل الحصول على توكن Snaptik');

          const form = new URLSearchParams();
          form.append('url', link);
          form.append('token', token);

          const response = await axios.post('https://snaptik.app/abc2.php', form.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          });

          const $$ = cheerio.load(response.data);
          const videoUrl = $$('a.download-link').attr('href');
          if (!videoUrl) throw new Error('لم يتم العثور على رابط تحميل للفيديو.');

          // ✅ Step 3: نحمل الفيديو
          const tmpFile = path.join(os.tmpdir(), `tik-${Date.now()}-${i}.mp4`);
          const writer = fs.createWriteStream(tmpFile);
          const videoStream = await axios({
            method: 'GET',
            url: videoUrl,
            responseType: 'stream',
          });

          await new Promise((resolve, reject) => {
            videoStream.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
          });

          await sock.sendMessage(chatId, {
            video: fs.readFileSync(tmpFile),
            caption: `🎬 *TikTok:* ${query}`,
          }, { quoted: msg });

          fs.unlinkSync(tmpFile);
        } catch (err) {
          console.error(`❌ خطأ في فيديو ${i + 1}:`, err.message);
        }
      }

    } catch (err) {
      console.error('❌ خطأ عام:', err.message);
      await sock.sendMessage(chatId, {
        text: '❌ حدث خطأ أثناء تحميل الفيديوهات.',
      }, { quoted: msg });
    }
  }
};