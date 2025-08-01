const config = require('../config');
const logger = require('../utils/console');
const { loadPlugins } = require('./plugins');
const crypto = require('crypto');


const fs = require('fs');
const path = require('path');
const spamMap = new Map();

async function handleMessages(sock, { messages }) {
    if (!messages || !messages[0]) return;
    const msg = messages[0];
    try {
        // استخراج نص الرسالة أو الكابتشن أو الملصق
        const messageText = msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption ||
            msg.message?.stickerMessage ? '[Sticker]' : '';

        msg.isGroup = msg.key.remoteJid.endsWith('@g.us');
        msg.sender = msg.key.participant || msg.key.remoteJid;
        msg.chat = msg.key.remoteJid;

        // تسجيل كل رسالة في ملف لوج
        try {
            const logPath = path.join(__dirname, '../data/messages.log');
            const logLine = `[${new Date().toISOString()}] ${msg.sender} -> ${msg.chat}: ${messageText}\n`;
            fs.appendFileSync(logPath, logLine);
        } catch (e) {}

        // حماية من السبام: منع نفس المستخدم من إرسال أوامر متتالية بسرعة
        const spamKey = `${msg.sender}:${msg.chat}`;
        const now = Date.now();
        if (spamMap.has(spamKey) && now - spamMap.get(spamKey) < 1000) {
            return; // تجاهل الرسالة إذا أرسل أمر خلال ثانية
        }
        spamMap.set(spamKey, now);

        msg.reply = async (text) => {
            try {
                await sock.sendMessage(msg.chat, { text }, { quoted: msg });
            } catch (error) {
                logger.error('خطأ في إرسال الرد:', error);
            }
        };

        // دعم الأوامر بدون بادئة في الخاص
        let isCommand = false;
        let args = [];
        let command = '';
        if (messageText.startsWith(config.prefix)) {
            isCommand = true;
            args = messageText.slice(config.prefix.length).trim().split(/\s+/);
            command = args.shift()?.toLowerCase();
        } else if (!msg.isGroup && messageText) {
            isCommand = true;
            args = messageText.trim().split(/\s+/);
            command = args.shift()?.toLowerCase();
        }
        if (!isCommand) return;

        const plugins = await loadPlugins();
        const plugin = plugins[command];

        if (plugin) {
            logger.info(`تنفيذ الأمر: ${command} من ${msg.sender}`);
            try {
                await plugin.execute(sock, msg, args);
            } catch (error) {
                logger.error(`خطأ في تنفيذ الأمر ${command}:`, error);
                await sock.sendMessage(msg.chat, {
                    text: config.messages.error
                }, { quoted: msg });
            }
        } else {
            logger.warn(`أمر غير معروف: ${command}`);
        }
    } catch (error) {
        logger.error('خطأ في معالجة الرسالة:', error);
        try {
            await sock.sendMessage(msg.key.remoteJid, {
                text: config.messages.error
            });
        } catch (sendError) {
            logger.error('فشل في إرسال رسالة الخطأ:', sendError);
        }
    }
}

module.exports = {
    handleMessages
};