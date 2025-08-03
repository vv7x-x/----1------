const fetch = require('node-fetch');
const fs = require('fs');
function to12HourFormat(time) {
  const [hourStr, minute] = time.split(':');
  let hour = parseInt(hourStr);
  const ampm = hour >= 12 ? 'م' : 'ص';
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

module.exports = {
  command: ['اذان'],
  description: 'عرض أوقات الصلاة لمرسين أو أي مدينة أخرى.',
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

      const cityMap = {
        'اسطنبول': 'Istanbul',
        'مرسين': 'Mersin',
        'أنقرة': 'Ankara',
        'الرياض': 'Riyadh',
        'القاهرة': 'Cairo',
        'الاسكندرية': 'Alexandria',
        'دبي': 'Dubai',
        'الدوحة': 'Doha',
        'الجزائر': 'Algiers',
        'تونس': 'Tunis',
        'دمشق': 'Damascus'
        // أضف المزيد حسب الحاجة
      };

      let city = 'Mersin';
      let country = 'Turkey';
      let prayerName = null;

      if (args.length > 0) {
        const firstArg = args[0].toLowerCase();
        const secondArg = args[1]?.toLowerCase() || '';

        const matchedPrayer = Object.keys(prayers).find(p => firstArg.includes(p));
        if (matchedPrayer) {
          prayerName = prayers[matchedPrayer];
          city = secondArg || 'Mersin';
        } else {
          city = firstArg;
          country = secondArg || 'Turkey';
        }

        // تحويل أسماء المدن العربية إلى إنجليزية
        city = cityMap[city] || city;
        country = country.charAt(0).toUpperCase() + country.slice(1);
      }

      const apiUrl = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=2&school=1`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!data?.data?.timings) throw new Error('فشل جلب البيانات');

      const timings = data.data.timings;
      const date = new Date();

      let responseMessage = `📅 التاريخ: ﹝${date.toLocaleDateString('ar-EG')}﹞\n\n`;

      if (prayerName) {
     responseMessage += `🕌 *وقت ${args[0]} في ${city}, ${country}:*\n\n⏰ ${to12HourFormat(timings[prayerName])}\n`;
      } else {
        responseMessage += `🕌 *أوقات الصلاة في ${city}, ${country}:*\n\n`
  + `🌅 *الفجر* : ${to12HourFormat(timings.Fajr)}\n`
  + `☀️ *الشروق* : ${to12HourFormat(timings.Sunrise)}\n`
  + `🕛 *الظهر* : ${to12HourFormat(timings.Dhuhr)}\n`
  + `🌇 *العصر* : ${to12HourFormat(timings.Asr)}\n`
  + `🌆 *المغرب* : ${to12HourFormat(timings.Maghrib)}\n`
  + `🌌 *العشاء* : ${to12HourFormat(timings.Isha)}\n`;
      }

      responseMessage += `\n✨┋*𝑰𝑻𝑨𝑪𝑯𝑰❄︎_𝑩𝑶𝑻*┋✨`;

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
