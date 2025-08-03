const pkg = require('google-libphonenumber');
const { PhoneNumberUtil } = pkg;

function getCountryByPhoneNumber(phoneNumber) {
  const phoneUtil = PhoneNumberUtil.getInstance();

  try {
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }
    const number = phoneUtil.parseAndKeepRawInput(phoneNumber, 'ZZ');
    const regionCode = phoneUtil.getRegionCodeForNumber(number);
    return regionCode;
  } catch (error) {
    console.error('Invalid phone number:', error);
    return null;
  }
}

function getCapitalCityByCountry(countryCode) {
  const capitals = {
    'MA': 'الرباط',
    'EG': 'القاهرة',
    'US': 'واشنطن',
    'FR': 'باريس',
    'DE': 'برلين',
    'IT': 'روما',
  };
  return capitals[countryCode] || 'غير معروف';
}

function getCountryNameInArabic(countryCode) {
  const countries = {
    'MA': 'المغرب',
    'EG': 'مصر',
    'US': 'الولايات المتحدة',
    'FR': 'فرنسا',
    'DE': 'ألمانيا',
    'IT': 'إيطاليا',
  };
  return countries[countryCode] || 'دولة غير معروفة';
}

module.exports = {
  name: 'تهكير',
  command: ['تهكير'],
  description: 'يُظهر معلومات الجهاز للمستخدم المشار إليه (مجرد مزحة)',
  async execute(sock, m) {
    try {
      const contextInfo = m.message?.extendedTextMessage?.contextInfo;
      const mentionedJid = contextInfo?.mentionedJid?.[0];

      if (!mentionedJid) {
        return await sock.sendMessage(m.key.remoteJid, {
          text: "❌ يرجى منشن الرقم للحصول على معلوماته.",
        }, { quoted: m });
      }

      const phoneNumber = mentionedJid.split('@')[0];
      const countryCode = getCountryByPhoneNumber(phoneNumber);
      if (!countryCode) {
        return await sock.sendMessage(m.key.remoteJid, {
          text: "❌ الرقم المدخل غير صالح.",
        }, { quoted: m });
      }

      const capitalCity = getCapitalCityByCountry(countryCode);
      const countryName = getCountryNameInArabic(countryCode);
      const language = countryCode === 'MA' ? 'الفرنسية' : 'العربية';
      const generateRandomIpSegment = () => Math.floor(Math.random() * 256);
      const ip = `192.${generateRandomIpSegment()}.${generateRandomIpSegment()}.${generateRandomIpSegment()}`;
      const batteryStatus = "غير معروف";

      let message = `🔍 **معلومات الجهاز:**\n-----------------------------\n`;

      const countdownMessage = await sock.sendMessage(m.key.remoteJid, {
        text: "_جارِ جمع معلومات الجهاز..._",
      }, { quoted: m });

      const lines = [
        "📱 **نوع الجهاز:** اندرويد",
        `🔋 **حالة البطارية:** ${batteryStatus}`,
        `🌐 **عنوان الـIP:** ${ip}`,
        `📡 **الموقع:** ${countryName}, ${capitalCity}`,
        `🌍 **لغة الجهاز:** ${language}`,
        "⚙️ **مواصفات إضافية:**",
        "🧠 **المعالج:** Snapdragon 888",
        "💾 **الرام:** 6GB",
        "📸 **الكاميرا:** 108MP",
        "📲 **رقم IMEI:** 357462081234567",
        "📡 **MAC Address:** 00:1A:79:00:34:BC",
        "🌐 **DNS Server:** 8.8.8.8 / 8.8.4.4",
        "📤 **آخر نشاط:**",
        "- تم الدخول إلى التطبيق في الساعة: 12:00",
        "- تم إرسال بيانات الجهاز إلى السيرفر 🚀",
        "⚠️ **تحذير:**",
        "هذا الجهاز قد يكون مستهدفًا بمراقبة الشبكة. يرجى التحقق من الإعدادات لضمان الأمان."
      ];

      let currentMessage = "_جارِ جمع معلومات الجهاز..._";
      let index = 0;

      const interval = setInterval(async () => {
        if (index < lines.length) {
          currentMessage += `\n${lines[index]}`;
          await sock.sendMessage(m.key.remoteJid, {
            text: currentMessage,
            edit: countdownMessage.key,
          });
          index++;
        } else {
          clearInterval(interval);
        }
      }, 500);

    } catch (error) {
      console.error(error);
      await sock.sendMessage(m.key.remoteJid, {
        text: "❌ حدث خطأ أثناء جلب معلومات الرقم.",
      }, { quoted: m });
    }
  },
};
