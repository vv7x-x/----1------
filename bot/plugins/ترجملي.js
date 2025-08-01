const fs = require('fs');
const path = require('path');
const axios = require('axios');

// معلومات اللغات المحدثة مع اللغات الجديدة ومعلومات القنوات والمميزات
const langsInfo = {
  عربي: { code: 'ar', features: 'لغة القرآن الكريم 🌙 وتُستخدم في 22 دولة!', channel: 'https://www.youtube.com/channel/UC8milMuf2zdy1_G3ZIM2ovg' },
  انجليزي: { code: 'en', features: 'أكثر لغة انتشاراً في العالم 🌍 وتُستخدم دولياً، ضرورية للسفر والدراسة والعمل، غنية بالموارد.', channel: 'https://www.youtube.com/c/EnglishwithLucy' },
  فرنسي: { code: 'fr', features: 'لغة الأناقة والثقافة في أوروبا 🎨، مفيدة في السفر والدبلوماسية، منتشرة في إفريقيا وأوروبا.', channel: 'https://www.youtube.com/user/learnfrenchwithalexa' },
  ألماني: { code: 'de', features: 'لغة الصناعة والعلوم في أوروبا 🔧، لغة اقتصادية وعلمية قوية، مفيدة للعمل والدراسة في ألمانيا.', channel: 'https://www.youtube.com/channel/EasyGerman' },
  إسباني: { code: 'es', features: 'اللغة الثانية في أمريكا 🌎، لغة حيوية وممتعة، مفيدة للسفر والتواصل في أمريكا اللاتينية وإسبانيا.', channel: 'https://youtube.com/@ButterflySpanish' },
  روسي: { code: 'ru', features: 'لغة قوية في السياسة والعلم، مفيدة للعمل في روسيا والدول السوفيتية السابقة.', channel: 'https://www.youtube.com/@RealRussianClub' },
  هندي: { code: 'hi', features: 'منتشرة في الهند، مفيدة لفهم الثقافة الهندية والأفلام (بوليوود).', channel: 'https://www.youtube.com/user/HindiPod101dotcom' },
  إيطالي: { code: 'it', features: 'لغة رومانسية، مفيدة لمحبي الفن والموسيقى والطبخ والسفر.', channel: 'https://www.youtube.com/user/ItalianPod101' },
  صيني: { code: 'zh-CN', features: 'أكثر لغة نُطقًا في العالم، مفيدة للتجارة والسفر والتكنولوجيا.', channel: 'https://www.youtube.com/user/ChineseClass101' },
  ياباني: { code: 'ja', features: 'لغة تكنولوجية وثقافية، مفيدة لعشاق الأنمي والتكنولوجيا والسفر لليابان.', channel: 'https://www.youtube.com/user/JapanesePod101' }
};

async function googleTranslate(text, targetLang) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await axios.get(url);
    if (res.data && Array.isArray(res.data)) {
      // التعامل مع التنسيقات المختلفة لـ API، يفضل الاحتفاظ بما كان يعمل
      return res.data[0].map(item => item[0]).join('');
    }
    return null;
  } catch (error) {
    console.error('Error in googleTranslate:', error.message);
    return null;
  }
}

async function textToSpeech(text, langCode, outFile) {
  return new Promise((resolve, reject) => {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${langCode}&client=tw-ob`;
    axios({
      method: 'get',
      url,
      responseType: 'stream',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }).then(response => {
      const writer = fs.createWriteStream(outFile);
      response.data.pipe(writer);
      writer.on('finish', () => resolve());
      writer.on('error', reject);
    }).catch(reject);
  });
}

module.exports = {
  command: ['ترجملي'], // تم إرجاع الأمر الوحيد كما كان في السكريبت الأصلي
  description: 'ترجمة نص مع صوت ومعلومات وقنوات تعليمية.',
  category: 'tools',

  async execute(sock, msg, args) {
    try {
      const repliedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const inputText = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
      const params = inputText.trim().split(/ +/).slice(1); // تم إرجاع slice(1)
      const targetLangInput = params.join('');

      if (targetLangInput === 'وصف') {
        const langs = Object.keys(langsInfo).map(l => `- ${l}`).join('\n');
        const description = 
`✨ *أمر الترجمة* ✨

قم بالرد على رسالة واكتب الأمر مع اسم اللغة:
مثال: \`.ترجملي انجليزي\`

سيقوم البوت بترجمة النص، وإرسال ملف صوتي، ومميزات اللغة، ورابط قناة تعليمية.

🌍 اللغات المدعومة:
${langs}

استمتع بالترجمة وتعلم اللغات! 🎉`;
        return sock.sendMessage(msg.key.remoteJid, { text: description }, { quoted: msg });
      }

      if (!repliedMsg) {
        return sock.sendMessage(msg.key.remoteJid, { text: '⚠️ يرجى الرد على رسالة تحتوي على نص للترجمة.' }, { quoted: msg });
      }

      // البحث عن اللغة بغض النظر عن حالة الأحرف
      const lang = Object.keys(langsInfo).find(l => l.toLowerCase() === targetLangInput.toLowerCase());
      
      if (!lang) {
        return sock.sendMessage(msg.key.remoteJid, { text: '❗️ اللغة غير مدعومة. استخدم `.ترجملي وصف` لمعرفة اللغات المدعومة.' }, { quoted: msg });
      }

      const textToTranslate = repliedMsg.conversation || repliedMsg.extendedTextMessage?.text || '';
      if (!textToTranslate) {
        return sock.sendMessage(msg.key.remoteJid, { text: '⚠️ لا يمكن استخراج نص من الرسالة المردودة.' }, { quoted: msg });
      }

      await sock.sendMessage(msg.key.remoteJid, { text: '⏳ جاري الترجمة...' }, { quoted: msg });

      // استخدام `langsInfo[lang]` مباشرة بعد التأكد من وجود `lang`
      const translatedText = await googleTranslate(textToTranslate, langsInfo[lang].code);
      if (!translatedText) {
        return sock.sendMessage(msg.key.remoteJid, { text: '❌ فشل في الترجمة.' }, { quoted: msg });
      }

      const tempAudioPath = path.join(__dirname, `temp_${msg.key.id}.mp3`);
      await textToSpeech(translatedText, langsInfo[lang].code, tempAudioPath);

      const finalMessage = 
`*الترجمة إلى ${lang}:*\n\n${translatedText}\n\n🎯 مميزات اللغة:\n${langsInfo[lang].features}\n\n📺 قناة تعليمية:\n${langsInfo[lang].channel}`;

      await sock.sendMessage(msg.key.remoteJid, { text: finalMessage }, { quoted: msg });
      await sock.sendMessage(msg.key.remoteJid, { audio: fs.readFileSync(tempAudioPath), mimetype: 'audio/mpeg' }); // تم إرجاعها إلى حالتها الأصلية بدون ptt: true

      await sock.sendMessage(msg.key.remoteJid, { text: 'تم الترجمة.. ' });

      fs.unlinkSync(tempAudioPath);

    } catch (error) {
      console.error('Error in translate command:', error);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ حدث خطأ أثناء الترجمة. حاول لاحقاً.' }, { quoted: msg });
    }
  }
};