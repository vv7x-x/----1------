const { extractPureNumber } = require('../haykala/elite');

module.exports = {
  command: ['شخره'],
  description: '😂 يرسل شخرة طويلة مضحكة جدًا',
  category: 'مضحك',

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;
    const isQuoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    let targetMention = '';

    if (mentionedJid.length > 0) {
      targetMention = `@${extractPureNumber(mentionedJid[0])}`;
    } else if (isQuoted) {
      targetMention = `@${extractPureNumber(isQuoted)}`;
    }

    const shkhra = `
${targetMention}

خخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخخ
    `.trim();

    await sock.sendMessage(jid, {
      text: shkhra,
      mentions: mentionedJid.length > 0 ? mentionedJid : isQuoted ? [isQuoted] : [],
    }, {
      quoted: msg,
    });
  }
};