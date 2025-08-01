import pkg from 'google-libphonenumber';
const { PhoneNumberUtil, PhoneNumberFormat } = pkg;

// دالة للحصول على اسم الدولة ورمز البلد
function getCountryByPhoneNumber(phoneNumber) {
  const phoneUtil = PhoneNumberUtil.getInstance();

  try {
    // إضافة "+" إذا لم يكن الرقم يحتوي عليها
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }

    // تأكد من أن الرقم يحتوي على رمز الدولة بشكل صحيح
    const number = phoneUtil.parseAndKeepRawInput(phoneNumber, 'ZZ');
    const regionCode = phoneUtil.getRegionCodeForNumber(number);
    
    return regionCode;
  } catch (error) {
    console.error('Invalid phone number:', error);
    return null;
  }
}

// دالة للحصول على اسم العاصمة بناءً على رمز البلد
function getCapitalCityByCountry(countryCode) {
  const capitals = {
    'MA': 'الرباط',  // المغرب
    'EG': 'القاهرة', // مصر
    'US': 'واشنطن',  // الولايات المتحدة
    'FR': 'باريس',    // فرنسا
    'DE': 'برلين',    // ألمانيا
    'IT': 'روما',     // إيطاليا
    // أضف المزيد من الدول حسب الحاجة
  };

  return capitals[countryCode] || 'غير معروف';
}

// دالة للحصول على اسم الدولة باللغة العربية بناءً على رمز البلد
function getCountryNameInArabic(countryCode) {
  const countries = {
    'MA': 'المغرب',
    'EG': 'مصر',
    'US': 'الولايات المتحدة',
    'FR': 'فرنسا',
    'DE': 'ألمانيا',
    'IT': 'إيطاليا',
    // أضف المزيد من الدول حسب الحاجة
  };

  return countries[countryCode] || 'دولة غير معروفة';
}

export default {
  name: 'تهكير',
  command: ['تهكير'],
  description: 'يُظهر معلومات الجهاز  للمستخدم المشار إلي "مجرد مزحة"',
  execution: async ({ sock, m }) => {
    try {
      const mentionedJid = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!mentionedJid) {
        return await sock.sendMessage(m.key.remoteJid, {
          text: "❌ يرجى منشنة الرقم للحصول على معلوماته.",
        });
      }

      const phoneNumber = mentionedJid.split('@')[0];
      const countryCode = getCountryByPhoneNumber(phoneNumber);
      if (!countryCode) {
        return await sock.sendMessage(m.key.remoteJid, {
          text: "❌ الرقم المدخل غير صالح.",
        });
      }

      const capitalCity = getCapitalCityByCountry(countryCode);
      const countryName = getCountryNameInArabic(countryCode);

      const language = countryCode === 'MA' ? 'الفرنسية' : 'العربية';
      const generateRandomIpSegment = () => Math.floor(Math.random() * 256);
      const ip = `192.${generateRandomIpSegment()}.${generateRandomIpSegment()}.${generateRandomIpSegment()}`;

      const batteryStatus = "غير معروف";

      let message = `
🔍 **معلومات الجهاز:**
-----------------------------
`;

      const countdownMessage = await sock.sendMessage(m.key.remoteJid, {
        text: "_جارِ جمع معلومات الجهاز..._",
      });

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
      const interval = setInterval(() => {
        if (index < lines.length) {
          currentMessage += `\n${lines[index]}`;
          sock.sendMessage(m.key.remoteJid, {
            edit: countdownMessage.key,
            text: currentMessage,
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
      });
    }
  },
};