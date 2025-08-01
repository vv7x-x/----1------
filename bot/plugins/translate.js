const axios = require('axios');
const { getAudioUrl } = require('google-tts-api');
const franc = require('franc-min');
const translate = require('translate');

translate.engine = 'google';

module.exports = {
  command: 'ترجم',
  async execute(sock, msg) {
    const reply = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                  msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text;

    if (!reply) return sock.sendMessage(msg.key.remoteJid, { text: '↯ قم بالرد على رسالة نصية للترجمة' });

    const langs = {
      en: '🇺🇸 English',
      fr: '🇫🇷 Français',
      de: '🇩🇪 Deutsch',
      es: '🇪🇸 Español',
      ja: '🇯🇵 日本語',
      zh: '🇨🇳 中文',
      ru: '🇷🇺 Русский',
      tr: '🇹🇷 Türkçe',
      it: '🇮🇹 Italiano',
      ko: '🇰🇷 한국어',
    };

    let resultText = '📌 تمّت الترجمة بواسطة كيساكي\n\n';

    for (const [code, label] of Object.entries(langs)) {
      try {
        const translated = await translate(reply, { to: code });
        resultText += `${label}: ${translated}\n`;
        const url = getAudioUrl(translated, { lang: code, slow: false });
        await sock.sendMessage(msg.key.remoteJid, {
          audio: { url },
          mimetype: 'audio/mp4',
          ptt: true,
        });
      } catch (err) {
        resultText += `${label}: ⚠️ خطأ في الترجمة\n`;
      }
    }

    await sock.sendMessage(msg.key.remoteJid, { text: resultText });
  }
};
