const fetch = require('node-fetch');
const fs = require('fs');

module.exports = {
  command: ['اذان'],
  description: 'عرض أوقات الصلاة لمرسين، تركيا أو حسب المدينة المطلوبة.',
  category: 'أدوات',

  async execute(sock, msg, args = []) {
    try {
      const chatId = msg.key.remoteJid;
      await sock.sendMessage(chatId, { react: { text: '🕌', key: msg.key } });

      const prayers = {
        'الفجر': 'Fajr',
        'الشروق': 'Sunrise',
        'الظهر': 'Dhuhr',
        'العصر': 'Asr',
        'المغرب': 'Maghrib',
        'العشاء': 'Isha'
      };

      let city = 'Mersin';
      let country = 'Turkey';
      let timezone = 'Europe/Istanbul';
      let prayerName = null;

      if (args.length > 0) {
        const firstArg = args[0].toLowerCase();
        const secondArg = args[1] ? args[1].toLowerCase() : '';

        if (prayers[firstArg]) {
          prayerName = prayers[firstArg];
          city = secondArg || 'Mersin';
        } else {
          city = firstArg;
          country = secondArg || 'Turkey';
        }

        // تأكيد تنسيق الحروف الكبيرة للاستخدام في API
        city = city.charAt(0).toUpperCase() + city.slice(1);
        country = country.charAt(0).toUpperCase() + country.slice(1);
      }

      const apiUrl = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=2&timezone=${encodeURIComponent(timezone)}`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!data || !data.data || !data.data.timings) throw new Error('فشل جلب البيانات');

      const timings = data.data.timings;
      const date = new Date();

      let responseMessage = `📅 التاريخ: ﹝${date.toLocaleDateString('ar-EG')}﹞\n`;

      if (prayerName) {
        responseMessage += `🕌 *وقت ${args[0]} في ${city}, ${country}:*\n\n⏰ ${timings[prayerName]}\n`;
      } else {
        responseMessage += `🕌 *أوقات الصلاة في ${city}, ${country}:*\n\n`
          + `🌅 الفجر : ﹝${timings.Fajr}﹞\n`
          + `☀️ الشروق : ﹝${timings.Sunrise}﹞\n`
          + `🕛 الظهر : ﹝${timings.Dhuhr}﹞\n`
          + `🌇 العصر : ﹝${timings.Asr}﹞\n`
          + `🌆 المغرب : ﹝${timings.Maghrib}﹞\n`
          + `🌌 العشاء : ﹝${timings.Isha}﹞\n`;
      }

      responseMessage += `\n*✨┋𝑰𝑻𝑨𝑪𝑯𝑰❄︎_𝑩𝑶𝑻 ┋✨*`;

      const imagePath = 'image.jpeg';
      const hasImage = fs.existsSync(imagePath);
      const imageBuffer = hasImage ? fs.readFileSync(imagePath) : null;

      await sock.sendMessage(chatId, {
        text: responseMessage,
        contextInfo: {
          externalAdReply: {
            title: '𝑲𝑰𝑵𝑮 ⚡',
            body: 'البوت يعمل الآن ✅',
            thumbnail: imageBuffer,
            mediaType: 1,
            sourceUrl: 'https://t.me/Sanji_Bot_Channel',
            renderLargerThumbnail: false,
            showAdAttribution: true
          }
        }
      }, { quoted: msg });

    } catch (error) {
      console.error('❌ حدث خطأ أثناء تنفيذ أمر الأذان:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ حدث خطأ أثناء حساب أوقات الصلاة!',
      }, { quoted: msg });
    }
  }
};