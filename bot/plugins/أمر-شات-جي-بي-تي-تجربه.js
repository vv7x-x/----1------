const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

module.exports = {
  command: ['gpt'],
  description: 'رد ذكي باستخدام نموذج Meta LLaMA 3',
  category: 'ai',
  async execute(sock, msg, args) {
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    const body = text.trim().split(/ +/).slice(1).join(' ');

    if (!body) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: `*مثال الاستخدام:*\n.metaai ما هو الذكاء الاصطناعي؟`,
      }, { quoted: msg });
    }

    // إرسال رد فعل موقت ⏱️
    await sock.sendMessage(msg.key.remoteJid, {
      react: {
        text: '⏱️',
        key: msg.key,
      }
    });

    try {
      const apiRes = await fetch(`https://api.siputzx.my.id/api/ai/meta-llama-33-70B-instruct-turbo?content=${encodeURIComponent(body)}`);
      const apiData = await apiRes.json();

      if (!apiData.status || !apiData.data) {
        throw new Error('الرد من الذكاء الاصطناعي غير صالح.');
      }

      const response = apiData.data;

      await sock.sendMessage(msg.key.remoteJid, {
        text: response,
        contextInfo: {
          externalAdReply: {
            title: "Meta AI",
            body: "رد ذكي باستخدام LLaMA 3",
            thumbnail: fs.readFileSync(path.join(__dirname, '../image.jpeg')),
            mediaType: 1,
            renderLargerThumbnail: true,
            showAdAttribution: true,
            sourceUrl: 'https://github.com/VynaaValerie',
          }
        }
      }, { quoted: msg });
    } catch (err) {
      console.error('خطأ في metaai:', err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `حدث خطأ أثناء المعالجة: ${err.message || err}`,
      }, { quoted: msg });
    }
  }
};